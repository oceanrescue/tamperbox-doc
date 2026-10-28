// Kept identical in toolkit-apps and tamperbox-doc; no cross-repository runtime dependency.
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname } from 'node:path';

const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export function canonical(url, origin) {
  const parsed = new URL(url);
  if (parsed.origin !== origin || parsed.href !== url || parsed.search || parsed.hash || parsed.username || parsed.password ||
      !/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]*\/?$/.test(parsed.pathname))
    throw Error('Noncanonical IndexNow URL');
  return url;
}
export function validateSnapshot(snapshot, origin) {
  if (!snapshot || !digest(snapshot.release) || !Array.isArray(snapshot.pages)) throw Error('Invalid content snapshot');
  const seen = new Set();
  for (const page of snapshot.pages) {
    canonical(page.url, origin);
    if (!digest(page.fingerprint) || seen.has(page.url)) throw Error('Invalid content fingerprint');
    seen.add(page.url);
  }
  return snapshot;
}
export async function readState(file, origin) {
  let value;
  try { value = JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return { version: 1, pending: [], ready: false, retryAt: 0 }; throw error; }
  if (value.version !== 1 || !Array.isArray(value.pending) || typeof value.ready !== 'boolean' ||
      !Number.isFinite(value.retryAt) || value.retryAt < 0) throw Error('Invalid IndexNow state');
  value.pending.forEach(url => canonical(url, origin));
  if (value.target) validateSnapshot(value.target, origin);
  if (value.ready && !value.target) throw Error('Missing IndexNow target');
  return value;
}
export async function saveState(file, state) {
  await mkdir(dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(state, null, 2) + '\n', { mode: 0o600 });
  await rename(temporary, file);
}
export async function getText(url, transport = fetch) {
  const response = await transport(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw Error(`Cannot read ${url}: HTTP ${response.status}`);
  return response.text();
}
export async function liveRelease(origin, transport = fetch) {
  const value = JSON.parse(await getText(`${origin}/release.json`, transport));
  if (!digest(value.release)) throw Error('Invalid live release');
  return value.release;
}
export async function sitemapUrls(origin, path, transport = fetch, visited = new Set()) {
  if (visited.has(path) || visited.size >= 100) throw Error('Recursive or oversized sitemap index');
  visited.add(path);
  const xml = await getText(`${origin}${path}`, transport);
  const locations = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&'));
  if (xml.includes('<sitemapindex')) {
    const pages = [];
    for (const url of locations) {
      const parsed = new URL(url);
      if (parsed.origin !== origin || parsed.search || parsed.hash || parsed.username || parsed.password || !/^\/sitemap[\w-]*\.xml$/.test(parsed.pathname)) throw Error('Foreign sitemap');
      pages.push(...await sitemapUrls(origin, parsed.pathname, transport, visited));
    }
    return pages;
  }
  if (!xml.includes('<urlset')) throw Error('Invalid sitemap');
  return locations.map(url => canonical(url, origin));
}
export async function plan(state, target, { origin, sitemap }, transport = fetch) {
  validateSnapshot(target, origin);
  let previous = [];
  // Only use saved fingerprints when they describe the site being replaced.
  let matches = false;
  try { matches = !!state.target && state.target.release === await liveRelease(origin, transport); } catch {}
  if (matches) previous = state.target.pages;
  else {
    try { previous = (await sitemapUrls(origin, sitemap, transport)).map(url => ({ url })); }
    catch { console.warn('IndexNow: live baseline unavailable; queuing the complete current sitemap.'); }
  }
  const old = new Map(previous.map(page => [page.url, page.fingerprint]));
  const next = new Map(target.pages.map(page => [page.url, page.fingerprint]));
  return {
    version: 1, ready: false, target, retryAt: state.retryAt,
    pending: [...new Set([...state.pending,
      ...target.pages.filter(page => old.get(page.url) !== page.fingerprint).map(page => page.url),
      ...previous.filter(page => !next.has(page.url)).map(page => page.url)])],
  };
}
export function retryDeadline(value, now) {
  const parsed = /^\d+$/.test(value || '') ? now + Number(value) * 1000 : Date.parse(value);
  return Math.max(now + 600000, Number.isFinite(parsed) ? parsed : 0);
}
export async function flush(state, { origin, key }, save, transport = fetch, now = Date.now()) {
  if (!/^[a-f0-9]{32}$/.test(key)) throw Error('Invalid IndexNow key');
  state.pending.forEach(url => canonical(url, origin));
  if (!state.ready || !state.pending.length || state.retryAt > now) return;
  try {
    if ((await getText(`${origin}/${key}.txt`, transport)).trim() !== key) throw Error('Live IndexNow key mismatch');
    while (state.pending.length) {
      if (await liveRelease(origin, transport) !== state.target.release) throw Error('Target release is no longer live');
      const batch = state.pending.slice(0, 10000);
      const response = await transport('https://api.indexnow.org/indexnow', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: new URL(origin).host, key, keyLocation: `${origin}/${key}.txt`, urlList: batch }),
      });
      await response.body?.cancel();
      console.log(`IndexNow: HTTP ${response.status}, ${batch.length} URL(s). Receipt does not mean indexed.`);
      if (![200, 202].includes(response.status)) {
        state.retryAt = retryDeadline(response.headers.get('retry-after'), now);
        await save(state);
        return;
      }
      state.pending.splice(0, batch.length);
      state.retryAt = 0;
      await save(state);
    }
  } catch (error) {
    state.retryAt = now + 600000;
    await save(state);
    console.warn(`IndexNow: ${error.message}; pending URLs retained.`);
  }
}

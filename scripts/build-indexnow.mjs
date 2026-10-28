import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { canonical, validateSnapshot } from './lib/indexnow-deploy.mjs';
const root = resolve(import.meta.dirname, '..');
const origin = 'https://docs.tamperbox.dev';
const hash = value => createHash('sha256').update(value).digest('hex');
const index = await readFile(resolve(root, 'dist/sitemap-index.xml'), 'utf8');
const pages = [];
for (const [, location] of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(location);
  if (url.origin !== origin || !/^\/sitemap-\d+\.xml$/.test(url.pathname)) throw Error('Unexpected sitemap');
  const xml = await readFile(resolve(root, `dist${url.pathname}`), 'utf8');
  for (const [, location] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    canonical(location, origin);
    const path = new URL(location).pathname;
    const html = await readFile(resolve(root, `dist${path}`, 'index.html'), 'utf8');
    pages.push({ url: location, fingerprint: hash(html) });
  }
}
pages.sort((a, b) => a.url.localeCompare(b.url));
const snapshot = validateSnapshot({ release: hash(JSON.stringify(pages)), pages }, origin);
if (!pages.length) throw Error('Empty documentation sitemap');
const key = (await readFile(resolve(root, 'site/indexnow-key.txt'), 'utf8')).trim();
if (!/^[a-f0-9]{32}$/.test(key) || (await readFile(resolve(root, `dist/${key}.txt`), 'utf8')).trim() !== key) throw Error('Missing public IndexNow key');
await mkdir(resolve(root, '.artifacts'), { recursive: true });
await writeFile(resolve(root, '.artifacts/content-manifest.json'), JSON.stringify(snapshot, null, 2) + '\n');
await writeFile(resolve(root, 'dist/release.json'), JSON.stringify({ release: snapshot.release }) + '\n');
console.log(`IndexNow: built ${pages.length} documentation fingerprints.`);

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { plan, flush, canonical, retryDeadline, readState, saveState, sitemapUrls } from '../scripts/lib/indexnow-deploy.mjs';
const origin = 'https://tamperbox.dev', key = 'a'.repeat(32);
const config = { origin, key, sitemap: '/sitemap.xml' };
const page = (path, fingerprint = 'a') => ({ url: origin + path, fingerprint: fingerprint.repeat(64) });
const snapshot = (pages, release = 'a') => ({ pages, release: release.repeat(64) });
const state = target => ({ version: 1, pending: [], ready: true, retryAt: 0, target });
const live = release => async () => Response.json({ release: release.repeat(64) });

test('content diffs include additions, edits, deletions, rollbacks and existing pending URLs', async () => {
  const previous = state(snapshot([page('/same'), page('/edit'), page('/deleted')]));
  previous.pending = [origin + '/pending'];
  const next = snapshot([page('/same'), page('/edit', 'b'), page('/new')], 'b');
  const planned = await plan(previous, next, config, live('a'));
  assert.deepEqual(planned.pending, ['/pending', '/edit', '/new', '/deleted'].map(p => origin + p));
  assert.equal(planned.ready, false);
  assert.deepEqual((await plan(state(next), previous.target, config, live('b'))).pending,
    ['/edit', '/deleted', '/new'].map(p => origin + p));
});

test('no-op deployment is empty; bootstrap queues current sitemap and removed live URLs', async () => {
  const target = snapshot([page('/same')]);
  assert.deepEqual((await plan(state(target), target, config, live('a'))).pending, []);
  const transport = async url => {
    if (url.endsWith('/release.json')) throw Error('No metadata yet');
    return new Response('<urlset><url><loc>' + origin + '/removed</loc></url></urlset>');
  };
  // Metadata failure still attempts to discover deleted URLs from the sitemap.
  const planned = await plan({ pending: [], retryAt: 0 }, target, config, transport);
  assert.deepEqual(planned.pending, [origin + '/same', origin + '/removed']);
});

test('failed deployment and cooldown cannot send; stale release or invalid key retains queue', async () => {
  for (const override of [{ ready: false }, { retryAt: 1001 }]) {
    await flush({ ...state(snapshot([])), pending: [origin + '/x'], ...override }, config, async () => {}, async () => { throw Error('Must not fetch'); }, 1000);
  }
  for (const mismatch of ['key', 'release']) {
    const queued = { ...state(snapshot([page('/x')])), pending: [origin + '/x'] };
    let submissions = 0;
    await flush(queued, config, async () => {}, async (url, options) => {
      if (options.method === 'POST') { submissions++; return new Response(); }
      return url.endsWith('.txt') ? new Response(mismatch === 'key' ? 'wrong' : key) : Response.json({ release: 'b'.repeat(64) });
    }, 1000);
    assert.equal(submissions, 0);
    assert.equal(queued.pending.length, 1);
    assert.equal(queued.retryAt, 601000);
  }
});

test('batch acceptance is persisted; 429 retains only unsent URLs and honors Retry-After', async () => {
  const pending = Array.from({ length: 10001 }, (_, i) => origin + '/p' + i);
  const queued = { ...state(snapshot([])), pending };
  const saved = [], payloads = [];
  await flush(queued, config, async s => saved.push(structuredClone(s)), async (url, options) => {
    if (options.method === 'POST') {
      payloads.push(JSON.parse(options.body));
      return payloads.length === 1 ? new Response(null, { status: 202 }) : new Response(null, { status: 429, headers: { 'retry-after': '3600' } });
    }
    return url.endsWith('.txt') ? new Response(key) : Response.json({ release: 'a'.repeat(64) });
  }, 1000);
  assert.equal(payloads[0].urlList.length, 10000);
  assert.equal(payloads[0].host, 'tamperbox.dev');
  assert.equal(payloads[0].keyLocation, origin + '/' + key + '.txt');
  assert.equal(saved[0].pending.length, 1);
  assert.equal(queued.pending.length, 1);
  assert.equal(queued.retryAt, 3601000);
});

test('network errors retain URLs; accepted retry drains the queue', async () => {
  const queued = { ...state(snapshot([page('/x')])), pending: [origin + '/x'] };
  await flush(queued, config, async () => {}, async () => { throw Error('network'); }, 1000);
  assert.equal(queued.pending.length, 1);
  await flush(queued, config, async () => {}, async (url, options) => {
    if (options.method === 'POST') return new Response(null, { status: 200 });
    return url.endsWith('.txt') ? new Response(key) : Response.json({ release: 'a'.repeat(64) });
  }, 601001);
  assert.equal(queued.pending.length, 0);
  assert.equal(queued.retryAt, 0);
});

test('state round-trip and canonical boundaries reject foreign and input-state URLs', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'indexnow-test-'));
  try {
    const file = join(directory, 'state.json');
    const queued = { ...state(snapshot([page('/x')])), pending: [origin + '/x'] };
    await saveState(file, queued);
    assert.deepEqual(await readState(file, origin), queued);
    for (const url of ['https://evil.test/x', origin + '/x?q=secret', origin + '/x#input', origin + '/x/../y', origin + '/UPPER', 'https://u:p@tamperbox.dev/x'])
      assert.throws(() => canonical(url, origin));
    await saveState(file, { ...queued, pending: ['https://evil.test/x'] });
    await assert.rejects(readState(file, origin));
  } finally { await rm(directory, { recursive: true, force: true }); }
  assert.equal(retryDeadline('Wed, 28 Oct 2026 12:00:00 GMT', 0), Date.parse('2026-10-28T12:00:00Z'));
  await assert.rejects(sitemapUrls(origin, '/sitemap.xml', async () => new Response('<sitemapindex><loc>https://evil.test/sitemap.xml</loc></sitemapindex>')));
});

test('production CLI orders cutover before submission; failed deploy and dry run send nothing', async () => {
  const { cp, mkdir, writeFile, readFile, access } = await import('node:fs/promises');
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execute = promisify(execFile);
  const directory = await mkdtemp(join(tmpdir(), 'indexnow-cli-'));
  try {
    await mkdir(join(directory, 'scripts/lib'), { recursive: true });
    await mkdir(join(directory, 'site'));
    await mkdir(join(directory, '.artifacts'));
    await mkdir(join(directory, 'bin'));
    await cp(new URL('../scripts/deploy-production.mjs', import.meta.url), join(directory, 'scripts/deploy-production.mjs'));
    await cp(new URL('../scripts/lib/indexnow-deploy.mjs', import.meta.url), join(directory, 'scripts/lib/indexnow-deploy.mjs'));
    const cli = await readFile(join(directory, 'scripts/deploy-production.mjs'), 'utf8');
    const actualOrigin = cli.includes('https://docs.tamperbox.dev') ? 'https://docs.tamperbox.dev' : origin;
    const target = snapshot([{ url: actualOrigin + '/', fingerprint: 'a'.repeat(64) }]);
    await writeFile(join(directory, '.artifacts/content-manifest.json'), JSON.stringify(target));
    await writeFile(join(directory, 'site/indexnow-key.txt'), key);
    await writeFile(join(directory, 'bin/npm'), '#!/bin/sh\nexit 0\n', { mode: 0o700 });
    await writeFile(join(directory, 'bin/npx'), '#!/bin/sh\nif [ "$FAKE_FAIL" = "1" ]; then exit 1; fi\ntouch "$FAKE_ROOT/deployed"\n', { mode: 0o700 });
    await writeFile(join(directory, 'transport.mjs'), `
      import { access, appendFile } from 'node:fs/promises';
      const root = process.env.FAKE_ROOT;
      globalThis.fetch = async (url, options = {}) => {
        if (options.method === 'POST') {
          await access(root + '/deployed');
          await appendFile(root + '/submitted', options.body);
          return new Response(null, { status: 200 });
        }
        if (url.endsWith('.txt')) return new Response('${key}');
        if (url.endsWith('/release.json')) return Response.json({ release: '${'a'.repeat(64)}' });
        return new Response('<urlset><url><loc>${actualOrigin}/</loc></url></urlset>');
      };
    `);
    const options = { cwd: directory, env: { ...process.env, FAKE_ROOT: directory, GITHUB_STEP_SUMMARY: '', PATH: join(directory, 'bin') + ':' + process.env.PATH, NODE_OPTIONS: '--import=' + join(directory, 'transport.mjs') } };
    const script = join(directory, 'scripts/deploy-production.mjs');
    await execute(process.execPath, [script, 'deploy', '--dry-run'], options);
    await assert.rejects(access(join(directory, '.indexnow/state.json')));
    await assert.rejects(access(join(directory, 'submitted')));
    await rm(join(directory, 'deployed'), { force: true });
    await assert.rejects(execute(process.execPath, [script, 'deploy'], { ...options, env: { ...options.env, FAKE_FAIL: '1' } }));
    assert.equal(JSON.parse(await readFile(join(directory, '.indexnow/state.json'))).ready, false);
    await assert.rejects(access(join(directory, 'submitted')));
    await execute(process.execPath, [script, 'deploy'], options);
    const result = JSON.parse(await readFile(join(directory, '.indexnow/state.json')));
    assert.equal(result.ready, true);
    assert.deepEqual(result.pending, []);
    assert.equal(JSON.parse(await readFile(join(directory, 'submitted'))).urlList[0], actualOrigin + '/');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

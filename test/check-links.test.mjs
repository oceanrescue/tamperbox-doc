import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkLinks } from '../scripts/check-links.mjs';

test('guides may precede landing conversion, but landing metadata and declared URLs stay checked', async () => {
  const root = await mkdtemp(join(tmpdir(), 'docs-links-'));
  try {
    for (const dir of ['src/content/docs/tools', 'dist/tools/example', 'website/site']) await mkdir(join(root, dir), { recursive: true });
    const text = 'https://tamperbox.dev/example\n## Method\n## Finding reference\n## Guide';
    await writeFile(join(root, 'src/content/docs/tools/example.mdx'), text);
    await writeFile(join(root, 'dist/tools/example.md'), text);
    await writeFile(join(root, 'dist/tools/example/index.html'), '<a href="https://tamperbox.dev/example">Tool</a><h2 id="method">Method</h2><h2 id="finding-reference">Findings</h2><h2 id="guide">Guide</h2>');
    const page = { id: 'example', path: '/example', published: true, visibility: 'public', kind: 'tool' };
    const run = async pages => {
      await writeFile(join(root, 'website/site/pages.json'), JSON.stringify(pages));
      return (await checkLinks({ root, siteRoot: join(root, 'website') })).errors;
    };
    assert.deepEqual(await run([page]), []);
    assert.match((await run([{ ...page, layout: 'landing' }])).join(), /website docs declaration/);
    assert.match((await run([{ ...page, docs: 'https://docs.tamperbox.dev/wrong/' }])).join(), /website docs declaration/);
    assert.deepEqual(await run([{ ...page, layout: 'landing', docs: 'https://docs.tamperbox.dev/tools/example/' }]), []);
    assert.match((await run([])).join(), /no published website tool/);
    assert.match((await run([page, { ...page, id: 'missing', docs: 'https://docs.tamperbox.dev/tools/missing/' }])).join(), /MDX page is missing/);
    await writeFile(join(root, 'dist/tools/example/index.html'), '<a href="/missing/">Broken</a>');
    assert.match((await run([page])).join(), /missing|does not link/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

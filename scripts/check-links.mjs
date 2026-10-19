import { access, readFile, readdir } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = resolve(import.meta.dirname, '..');
const defaultSiteRoot = resolve(defaultRoot, '../toolkit-apps');
const exists = path => access(path).then(() => true, () => false);

async function filesBelow(directory) {
  const files = [];
  async function visit(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const child = resolve(path, entry.name);
      if (entry.isDirectory()) await visit(child);
      else files.push(child);
    }
  }
  await visit(directory);
  return files;
}

const values = (html, name) => [...html.matchAll(/<[^>]+>/g)]
  .flatMap(tag => [...tag[0].matchAll(new RegExp(`(?:^|\\s)${name}=["']([^"']*)["']`, 'gi'))].map(match => match[1]));
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&#x2F;', '/').replaceAll('&#47;', '/');

function targetFile(dist, pathname) {
  let clean;
  try { clean = decodeURIComponent(pathname); } catch { return undefined; }
  if (clean.endsWith('/')) return resolve(dist, `.${clean}index.html`);
  if (extname(clean)) return resolve(dist, `.${clean}`);
  return resolve(dist, `.${clean}/index.html`);
}

export async function checkLinks({ root = defaultRoot, siteRoot = defaultSiteRoot } = {}) {
  const errors = [], dist = resolve(root, 'dist');
  const allFiles = await filesBelow(dist);
  const htmlFiles = allFiles.filter(path => path.endsWith('.html'));
  const fileSet = new Set(allFiles);
  const idsByFile = new Map();
  for (const path of htmlFiles) {
    const html = await readFile(path, 'utf8');
    idsByFile.set(path, new Set(values(html, 'id').map(decode)));
  }

  let linkCount = 0;
  for (const sourcePath of htmlFiles) {
    const html = await readFile(sourcePath, 'utf8');
    const sourceUrl = new URL(relative(dist, sourcePath).replace(/index\.html$/, ''), 'https://docs.tamperbox.dev/');
    for (const raw of values(html, 'href').map(decode)) {
      if (!raw || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) continue;
      let url;
      try { url = new URL(raw, sourceUrl); } catch { errors.push(`${relative(dist, sourcePath)}: invalid href ${raw}`); continue; }
      if (url.origin !== 'https://docs.tamperbox.dev') continue;
      linkCount++;
      const target = targetFile(dist, url.pathname);
      if (!target || !fileSet.has(target)) {
        errors.push(`${relative(dist, sourcePath)}: broken link ${raw}`);
        continue;
      }
      if (url.hash && url.hash !== '#_top' && target.endsWith('.html')) {
        let fragment;
        try { fragment = decodeURIComponent(url.hash.slice(1)); } catch { fragment = url.hash.slice(1); }
        if (!idsByFile.get(target)?.has(fragment)) errors.push(`${relative(dist, sourcePath)}: missing fragment ${raw}`);
      }
    }
  }

  const docsSource = resolve(root, 'src/content/docs/tools');
  const docsIds = (await readdir(docsSource)).filter(name => name.endsWith('.mdx') && name !== 'index.mdx').map(name => name.slice(0, -4));
  let websitePages = [], websiteById = new Map();
  const pagesPath = resolve(siteRoot, 'site/pages.json');
  if (await exists(pagesPath)) {
    websitePages = JSON.parse(await readFile(pagesPath, 'utf8')).filter(page => page.published === true && page.visibility === 'public');
    websiteById = new Map(websitePages.map(page => [page.id, page]));
    const docsSet = new Set(docsIds);
    for (const id of docsIds) {
      const page = websiteById.get(id), expected = `https://docs.tamperbox.dev/tools/${id}/`;
      if (!page || page.kind !== 'tool') errors.push(`${id}: no published website tool exists`);
      else if (page.docs !== expected) errors.push(`${id}: website docs declaration must be ${expected}`);
    }
    for (const page of websitePages.filter(page => page.docs)) {
      if (!docsSet.has(page.id)) errors.push(`${page.id}: website declares docs but the MDX page is missing`);
    }
  }

  for (const id of docsIds) {
    const source = await readFile(resolve(docsSource, `${id}.mdx`), 'utf8');
    const websitePage = websiteById.get(id);
    const toolUrl = websitePage ? `https://tamperbox.dev${websitePage.path}` : `https://tamperbox.dev/${id}`;
    if (!source.includes(toolUrl)) errors.push(`${id}: MDX source does not link back to ${toolUrl}`);
    for (const heading of ['## Method', '## Finding reference', '## Guide']) {
      if (!source.includes(heading)) errors.push(`${id}: MDX source is missing ${heading}`);
    }
    const htmlPath = resolve(dist, `tools/${id}/index.html`), markdownPath = resolve(dist, `tools/${id}.md`);
    if (!fileSet.has(htmlPath)) errors.push(`${id}: generated HTML page is missing`);
    if (!fileSet.has(markdownPath)) errors.push(`${id}: generated Markdown mirror is missing`);
    if (fileSet.has(htmlPath)) {
      const html = await readFile(htmlPath, 'utf8'), ids = idsByFile.get(htmlPath) || new Set();
      if (!values(html, 'href').map(decode).includes(toolUrl)) errors.push(`${id}: generated HTML does not link back to the tool`);
      for (const anchor of ['method', 'finding-reference', 'guide']) if (!ids.has(anchor)) errors.push(`${id}: generated HTML is missing #${anchor}`);
    }
    if (fileSet.has(markdownPath) && !(await readFile(markdownPath, 'utf8')).includes(toolUrl)) errors.push(`${id}: generated Markdown does not link back to the tool`);
  }

  return { errors, pages: htmlFiles.length, links: linkCount, toolPairs: docsIds.length, checkedSibling: websitePages.length > 0 };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await checkLinks();
  if (result.errors.length) {
    console.error(`Documentation link check failed (${result.errors.length}):\n- ${result.errors.join('\n- ')}`);
    process.exitCode = 1;
  } else {
    console.log(`Documentation links OK: ${result.links} links across ${result.pages} HTML pages and ${result.toolPairs} tool pairs${result.checkedSibling ? ', including sibling website metadata' : ''}.`);
  }
}

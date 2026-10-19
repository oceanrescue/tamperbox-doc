import type { CollectionEntry } from 'astro:content';

export const siteUrl = 'https://docs.tamperbox.dev';
export const repositoryUrl = 'https://github.com/oceanrescue/tamperbox-doc';

export function isPublished(entry: CollectionEntry<'docs'>): boolean {
  return entry.data.visibility === 'public' && entry.data.publicationState === 'published';
}

export function pagePath(entry: CollectionEntry<'docs'>): string {
  if (entry.id === 'index') return '/';
  return `/${entry.id.replace(/\/index$/, '')}/`;
}

export function markdownPath(entry: CollectionEntry<'docs'>): string {
  const path = pagePath(entry);
  return path === '/' ? '/index.md' : `${path.replace(/\/$/, '')}.md`;
}

export function absoluteLinks(markdown: string): string {
  let fence: string | undefined;
  return markdown.split('\n').map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (marker) {
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = undefined;
      return line;
    }
    if (fence) return line;
    return line
      .replace(/\]\((\/(?!\/)[^\s)]*)\)/g, (_, path) => `](${new URL(path, siteUrl).href})`)
      .replace(/href="(\/(?!\/)[^"]*)"/g, (_, path) => `href="${new URL(path, siteUrl).href}"`);
  }).join('\n');
}

export function agentMarkdown(entry: CollectionEntry<'docs'>): string {
  const canonical = new URL(pagePath(entry), siteUrl).href;
  const contract = [
    `Canonical: ${canonical}`,
    `Updated: ${entry.data.updated.toISOString().slice(0, 10)}`,
    `Applies to: ${entry.data.productVersion}`,
    entry.data.prerequisites.length ? `Prerequisites: ${entry.data.prerequisites.join('; ')}` : undefined,
    entry.data.outputs.length ? `Outputs: ${entry.data.outputs.join('; ')}` : undefined,
    entry.data.limitations.length ? `Limitations: ${entry.data.limitations.join('; ')}` : undefined,
  ].filter(Boolean).join('\n');
  return `${absoluteLinks(`# ${entry.data.title}\n\n${entry.data.description ?? ''}\n\n${contract}\n\n${entry.body ?? ''}`)}\n`;
}

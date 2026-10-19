import { getCollection } from 'astro:content';
import { isPublished, markdownPath, siteUrl } from '@/lib/docs';

export const prerender = true;

export async function GET() {
  const docs = (await getCollection('docs', isPublished)).sort((a, b) => a.data.title.localeCompare(b.data.title));
  const absolute = (path: string) => new URL(path, siteUrl).href;
  const lines = [
    '# Tamperbox documentation',
    '',
    '> Documentation for Tamperbox browser tools, the public API, and the Tamperbox MCP server.',
    '',
    'Tamperbox provides browser-local developer utilities and clearly labelled server-side diagnostics. The MCP server exposes two code-mode tools over a documented operation catalog.',
    '',
    '## Documentation',
    '',
    ...docs.map((entry) => `- [${entry.data.title}](${absolute(markdownPath(entry))}): ${entry.data.agentSummary}`),
    '',
    '## Primary interfaces',
    '',
    '- [Tamperbox tools](https://tamperbox.dev): Browser tools and diagnostic checks.',
    '- [Tamperbox MCP](https://github.com/oceanrescue/tamperbox-mcp): Public MCP server source, examples, and release information.',
    '- [Documentation repository](https://github.com/oceanrescue/tamperbox-doc): Source and issue tracking for this site.',
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

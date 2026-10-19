import { getCollection } from 'astro:content';
import { agentMarkdown, isPublished } from '@/lib/docs';

export const prerender = true;

export async function GET() {
  const docs = (await getCollection('docs', isPublished)).sort((a, b) => a.data.title.localeCompare(b.data.title));
  return new Response(docs.map(agentMarkdown).join('\n\n---\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

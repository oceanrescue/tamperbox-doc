import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';
import { agentMarkdown, isPublished } from '@/lib/docs';

export const prerender = true;

export const getStaticPaths = (async () => {
  const docs = await getCollection('docs', isPublished);
  return docs.map((entry) => ({
    params: { slug: entry.id === 'index' ? 'index' : entry.id.replace(/\/index$/, '') },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => new Response(agentMarkdown(props.entry), {
  headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
});

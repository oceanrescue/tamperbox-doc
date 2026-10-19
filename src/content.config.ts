import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: z.object({
      visibility: z.enum(['public', 'private']).default('public'),
      publicationState: z.enum(['draft', 'review', 'published']).default('published'),
      updated: z.coerce.date(),
      productVersion: z.string(),
      agentSummary: z.string().min(20),
      prerequisites: z.array(z.string()).default([]),
      outputs: z.array(z.string()).default([]),
      limitations: z.array(z.string()).default([]),
    }),
  }),
});

const i18n = defineCollection({ loader: i18nLoader(), schema: i18nSchema() });

export const collections = { docs, i18n };

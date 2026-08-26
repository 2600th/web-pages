import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { noteSchema, workSchema } from './content/schemas';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: workSchema,
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: noteSchema,
});

export const collections = { work, notes };

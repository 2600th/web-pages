import { getCollection } from 'astro:content';
import { buildLlmsTxt } from '../data/llms';

export async function GET() {
  const [work, notes] = await Promise.all([getCollection('work'), getCollection('notes')]);
  return new Response(buildLlmsTxt(work.map(entry => entry.data), notes.map(entry => entry.data)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

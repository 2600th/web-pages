import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../data/site';

export async function GET(context: APIContext) {
  const notes = (await getCollection('notes', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );

  return rss({
    title: 'Pranshul Chandhok — Notes',
    description: 'Field notes on production AI, real-time 3D, browser-native systems, and product reliability.',
    site: context.site ?? SITE.url,
    customData: '<language>en-IN</language>',
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.summary,
      pubDate: note.data.publishedAt,
      link: `/notes/${note.data.slug}/`,
      categories: note.data.topics,
      author: 'Pranshul Chandhok',
    })),
  });
}

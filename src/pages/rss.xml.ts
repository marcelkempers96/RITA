// RSS feed for Policy Insights.
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { load, url, PROGRAMMES, type Code } from '../lib/content';

export const GET: APIRoute = async ({ site }) => {
  const d = await load();
  return rss({
    title: 'RITA Policy Insights',
    description: 'Short arguments on Africa’s green industrialisation. One idea per issue.',
    site: site!,
    customData: '<language>en-gb</language>',
    items: d.insights.map((i) => ({
      title: `No. ${i.data.number}: ${i.data.title}`,
      link: url.insight(i.id),
      // Issue dates are not yet recorded; fall back to the year so feed readers can still order them.
      pubDate: new Date(i.data.date ?? `${i.data.year}-01-01`),
      description: i.data.series ? `${i.data.series}${i.data.part ? `, part ${i.data.part}` : ''}` : undefined,
      categories: [PROGRAMMES[i.data.programme as Code].name, ...i.data.topics],
    })),
  });
};

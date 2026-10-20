// RSS feed of RITA research publications (newest first).
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { load, url, TYPE_LABEL, authorLine, fullName } from '../../lib/content';
import { SITE } from '../../lib/site';

export async function GET(context: APIContext) {
  const d = await load();
  const items = d.publications.filter((p) => !p.data.archive).map((p) => ({
    title: p.data.title,
    link: url.publication(p.id),
    // Publications only carry a year; feed readers need a date, so use 1 January of that year.
    ...(p.data.year ? { pubDate: new Date(Date.UTC(p.data.year, 0, 1)) } : {}),
    description: `${TYPE_LABEL[p.data.type]} · ${p.data.publisher}${p.data.year ? ` · ${p.data.year}` : ''}. ${authorLine(p.data.authors.map(fullName))}.${p.data.summary ? ` ${p.data.summary}` : ''}`,
    categories: [TYPE_LABEL[p.data.type]],
  }));
  return rss({
    title: `${SITE.name} Research`,
    description: 'Publications from RITA and its team.',
    site: context.site!,
    items,
    customData: '<language>en-gb</language>',
  });
}

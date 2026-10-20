// Content helpers shared by all pages: programme lookup, author formatting, URLs and the unified library index.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Code = 'IND' | 'MIN' | 'EN' | 'INN';
export type Publication = CollectionEntry<'publications'>;
export type Insight = CollectionEntry<'insights'>;
export type OpEd = CollectionEntry<'opeds'>;
export type Brief = CollectionEntry<'briefs'>;
export type Project = CollectionEntry<'projects'>;
export type Person = CollectionEntry<'people'>;
export type Programme = CollectionEntry<'programmes'>;

export const PROGRAMMES: Record<Code, { slug: string; number: string; name: string; short: string }> = {
  IND: { slug: 'green-industrialisation', number: '01', name: 'Green industrialisation & policy', short: 'Industrialisation' },
  MIN: { slug: 'transition-minerals', number: '02', name: 'Transition minerals & value chains', short: 'Minerals' },
  EN: { slug: 'energy-and-industry', number: '03', name: 'Energy & industry', short: 'Energy' },
  INN: { slug: 'innovation-firms-work', number: '04', name: 'Innovation, firms & work', short: 'Innovation' },
};
export const CODES = Object.keys(PROGRAMMES) as Code[];

export const TYPE_LABEL: Record<string, string> = {
  journal: 'Journal',
  report: 'Report',
  'working-paper': 'Working paper',
  'policy-paper': 'Policy paper',
  'book-chapter': 'Book chapter',
  'background-paper': 'Background paper',
  'policy-brief': 'Policy brief',
  'op-ed': 'Op-ed',
  'research-blog': 'Blog',
  'rita-brief': 'Policy brief',
  insight: 'Policy Insight',
};

// Library type chips (WEBSITE-CONTENT §02) and which item types each one covers.
export const TYPE_CHIPS: { key: string; label: string; types: string[] }[] = [
  { key: 'journal', label: 'Journal', types: ['journal'] },
  { key: 'report', label: 'Report', types: ['report', 'background-paper', 'book-chapter'] },
  { key: 'working-paper', label: 'Working paper', types: ['working-paper', 'policy-paper'] },
  { key: 'policy-brief', label: 'Policy brief', types: ['policy-brief', 'rita-brief'] },
  { key: 'op-ed', label: 'Op-ed', types: ['op-ed', 'research-blog'] },
];

const FULL: Record<string, string> = {
  Ndubuisi: 'Gideon Ndubuisi', Avenyo: 'Elvis Korku Avenyo', Owusu: 'Solomon Owusu', Kassa: 'Woubet Kassa',
  Mensah: 'Emmanuel B. Mensah', Urom: 'Christian Urom', Konte: 'Maty Konte', Tregenna: 'Fiona Tregenna',
  Andreoni: 'Antonio Andreoni', Chisoro: 'Shingie Chisoro', Bell: 'Jason Bell', Nyamwena: 'Julius Nyamwena',
  Tang: 'Keyi Tang', Fu: 'Xiaolan Fu', 'Kraemer-Mbula': 'Erika Kraemer-Mbula',
};
export const PERSON_BY_SURNAME: Record<string, string> = { Ndubuisi: 'gideon-ndubuisi', Avenyo: 'elvis-korku-avenyo' };

export const fullName = (surname: string) => FULL[surname] ?? surname;
export function initialsName(surname: string) {
  const full = FULL[surname];
  if (!full) return surname;
  const parts = full.split(' ');
  return `${surname}, ${parts.slice(0, -1).map((p) => p[0] + '.').join(' ')}`;
}
/** "Ndubuisi, Avenyo, Owusu & Kassa" */
export function authorLine(authors: string[]) {
  const a = authors.filter(Boolean);
  if (a.length <= 1) return a.join('');
  return `${a.slice(0, -1).join(', ')} & ${a[a.length - 1]}`;
}
export const personNames = (ids: string[], people: Person[]) =>
  ids.map((id) => people.find((p) => p.id === id)?.data.name ?? id);

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function monthYear(ym?: string) {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

export const url = {
  programme: (c: Code) => `/research/${PROGRAMMES[c].slug}`,
  publication: (id: string) => `/research/publications/${id}`,
  insight: (id: string) => `/insights/${id}`,
  brief: (id: string) => `/policy/briefs/${id}`,
  project: (id: string) => `/research/projects/${id}`,
  person: (id: string) => `/fellows/${id}`,
  event: (id: string) => `/insights/events/${id}`,
  job: (id: string) => `/about/opportunities/${id}`,
};

const isLive = <T extends { data: { status?: string } }>(e: T) => e.data.status !== 'draft';

export async function load() {
  const [programmes, people, publications, insights, opeds, briefs, projects, partners, events, jobs] = await Promise.all([
    getCollection('programmes'), getCollection('people'), getCollection('publications', isLive), getCollection('insights', isLive),
    getCollection('opeds', isLive), getCollection('briefs', isLive), getCollection('projects', isLive), getCollection('partners'),
    getCollection('events', isLive), getCollection('jobs', isLive),
  ]);
  programmes.sort((a, b) => a.data.number.localeCompare(b.data.number));
  publications.sort(byYearDesc);
  insights.sort((a, b) => b.data.number - a.data.number);
  opeds.sort((a, b) => b.data.date.localeCompare(a.data.date));
  briefs.sort((a, b) => a.data.number - b.data.number);
  partners.sort((a, b) => a.data.order - b.data.order);
  return { programmes, people: people.filter((p) => p.data.consentToList), publications, insights, opeds, briefs, projects, partners, events, jobs };
}
const byYearDesc = (a: Publication, b: Publication) => (b.data.year ?? 0) - (a.data.year ?? 0) || a.data.title.localeCompare(b.data.title);

/** One row in the research library / search / programme "latest" lists. */
export interface Item {
  id: string;
  kind: 'publication' | 'oped' | 'brief';
  type: string; // key of TYPE_LABEL
  title: string;
  href: string;
  external: boolean;
  outlet: string;
  year: number | null;
  date: string; // sortable: YYYY-MM or YYYY
  authors: string[];
  programmes: Code[];
  regions: string[];
  archive: boolean;
}

export function libraryItems(d: Awaited<ReturnType<typeof load>>): Item[] {
  const items: Item[] = [
    ...d.publications.map((p): Item => ({
      id: p.id, kind: 'publication', type: p.data.type, title: p.data.title, href: url.publication(p.id), external: false,
      outlet: p.data.publisher, year: p.data.year, date: p.data.year ? String(p.data.year) : '0000', authors: p.data.authors,
      programmes: p.data.programmes as Code[], regions: p.data.regions, archive: p.data.archive,
    })),
    ...d.opeds.map((o): Item => ({
      id: `opeds:${o.id}`, kind: 'oped', type: o.data.kind, title: o.data.title, href: o.data.outletUrl ?? '/insights/op-eds',
      external: Boolean(o.data.outletUrl), outlet: o.data.outlet, year: Number(o.data.date.slice(0, 4)), date: o.data.date,
      authors: o.data.authors, programmes: o.data.programme ? [o.data.programme as Code] : [], regions: [], archive: !o.data.programme,
    })),
    ...d.briefs.map((b): Item => ({
      id: `briefs:${b.id}`, kind: 'brief', type: 'rita-brief', title: b.data.title, href: url.brief(b.id), external: false,
      outlet: `RITA Policy Brief No. ${b.data.number}`, year: b.data.date ? Number(b.data.date.slice(0, 4)) : null, date: b.data.date ?? '0000',
      authors: b.data.authors, programmes: [b.data.programme as Code], regions: [], archive: false,
    })),
  ];
  return items.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

/** Resolve a reference like "some-publication" or "opeds:some-op-ed" into a link. */
export function resolveRef(ref: string, d: Awaited<ReturnType<typeof load>>) {
  const [col, id] = ref.includes(':') ? ref.split(':') : ['publications', ref];
  if (col === 'opeds') {
    const o = d.opeds.find((x) => x.id === id);
    return o && { title: o.data.title, href: o.data.outletUrl ?? '/insights/op-eds', external: Boolean(o.data.outletUrl), meta: `${o.data.outlet} · ${monthYear(o.data.date)}`, type: o.data.kind };
  }
  const p = d.publications.find((x) => x.id === id);
  return p && { title: p.data.title, href: url.publication(p.id), external: false, meta: `${p.data.publisher}${p.data.year ? ` · ${p.data.year}` : ''}`, type: p.data.type };
}

export const programmeOf = (codes: string[] | undefined): Code | undefined => (codes?.[0] as Code | undefined);

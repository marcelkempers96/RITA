// Citation strings for the Cite modal (APA / Harvard / BibTeX).
import { initialsName } from './content';

export interface CiteInput {
  title: string;
  authors: string[];
  year: number | null;
  outlet: string;
  doi?: string;
  url?: string;
  type: string;
  id: string;
}

const yr = (y: number | null) => (y ? String(y) : 'n.d.');
const link = (c: CiteInput) => (c.doi ? `https://doi.org/${c.doi}` : c.url ?? '');

function apaAuthors(a: string[]) {
  const n = a.map(initialsName);
  if (n.length === 1) return n[0];
  return `${n.slice(0, -1).join(', ')}, & ${n[n.length - 1]}`;
}
function harvardAuthors(a: string[]) {
  const n = a.map(initialsName);
  if (n.length === 1) return n[0];
  return `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
}

export function cite(c: CiteInput) {
  const l = link(c);
  const apa = `${apaAuthors(c.authors)} (${yr(c.year)}). ${c.title}. ${c.outlet}.${l ? ` ${l}` : ''}`;
  const harvard = `${harvardAuthors(c.authors)} (${yr(c.year)}) '${c.title}', ${c.outlet}.${l ? ` Available at: ${l}.` : ''}`;
  const key = `${(c.authors[0] ?? 'rita').toLowerCase().replace(/[^a-z]/g, '')}${c.year ?? ''}${c.title.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '')}`;
  const entry = c.type === 'journal' ? 'article' : c.type === 'book-chapter' ? 'incollection' : c.type === 'working-paper' ? 'techreport' : 'misc';
  const fields = [
    ['title', `{${c.title}}`],
    ['author', `{${c.authors.join(' and ')}}`],
    [entry === 'article' ? 'journal' : entry === 'techreport' ? 'institution' : 'publisher', `{${c.outlet}}`],
    ...(c.year ? [['year', `{${c.year}}`]] : []),
    ...(c.doi ? [['doi', `{${c.doi}}`]] : []),
    ...(!c.doi && c.url ? [['url', `{${c.url}}`]] : []),
  ];
  const bibtex = `@${entry}{${key},\n${fields.map(([k, v]) => `  ${k} = ${v}`).join(',\n')}\n}`;
  return { apa, harvard, bibtex };
}

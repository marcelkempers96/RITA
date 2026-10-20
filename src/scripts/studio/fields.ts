// Editing forms for each content type in /studio. Field keys match src/content.config.ts.
// Keys not listed here are kept untouched when an item is saved (and editable under "Advanced").

export type FieldType = 'text' | 'textarea' | 'markdown' | 'list' | 'number' | 'select' | 'bool' | 'url' | 'image' | 'pairs';
export interface Field { key: string; label: string; type: FieldType; options?: string[]; help?: string; required?: boolean }

const PROG = ['IND', 'MIN', 'EN', 'INN'];
const title: Field = { key: 'title', label: 'Title', type: 'text', required: true };

export const COLLECTIONS: Record<string, { label: string; singular: string; titleKey: string; fields: Field[] }> = {
  publications: {
    label: 'Publications', singular: 'publication', titleKey: 'title', fields: [
      title,
      { key: 'type', label: 'Type', type: 'select', options: ['journal', 'report', 'working-paper', 'policy-paper', 'book-chapter', 'background-paper', 'thesis'], required: true },
      { key: 'programmes', label: 'Programmes', type: 'list', help: 'One per line: IND, MIN, EN or INN.' },
      { key: 'authors', label: 'Authors', type: 'list', help: 'Surnames, one per line, in published order.', required: true },
      { key: 'publisher', label: 'Outlet / publisher', type: 'text', required: true },
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'doi', label: 'DOI', type: 'text', help: 'e.g. 10.1016/j.enpol.2025.114534' },
      { key: 'externalUrl', label: 'Publisher link', type: 'url' },
      { key: 'pdf', label: 'Full text / PDF link', type: 'url' },
      { key: 'summary', label: 'In brief', type: 'textarea', help: '2–3 plain sentences.' },
      { key: 'whyItMatters', label: 'Why it matters', type: 'textarea' },
      { key: 'keyFindings', label: 'Key findings', type: 'list', help: 'Up to three, one per line.' },
      { key: 'methods', label: 'Data & methods', type: 'textarea' },
      { key: 'regions', label: 'Regions', type: 'list', help: 'Southern Africa, West Africa, East Africa, North Africa, Africa-wide or Global.' },
      { key: 'project', label: 'Project (slug)', type: 'text' },
      { key: 'award', label: 'Award', type: 'text' },
      { key: 'note', label: 'Note shown on the page', type: 'text' },
      { key: 'featured', label: 'Featured on the home page', type: 'bool' },
      { key: 'archive', label: 'Archive (hidden from the default library view)', type: 'bool' },
    ],
  },
  insights: {
    label: 'Policy Insights', singular: 'Policy Insight', titleKey: 'title', fields: [
      { key: 'number', label: 'Issue number', type: 'number', required: true },
      title,
      { key: 'programme', label: 'Programme', type: 'select', options: PROG, required: true },
      { key: 'series', label: 'Series', type: 'text' },
      { key: 'part', label: 'Part', type: 'number' },
      { key: 'of', label: 'Of (parts in series)', type: 'number' },
      { key: 'topics', label: 'Topics', type: 'list' },
      { key: 'year', label: 'Year', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'text', help: 'YYYY-MM-DD' },
      { key: 'byline', label: 'Byline (if not a RITA person)', type: 'text' },
      { key: 'authors', label: 'Authors (people slugs)', type: 'list', help: 'e.g. gideon-ndubuisi' },
      { key: 'body', label: 'Full text', type: 'markdown', help: 'Blank line between paragraphs. Start a line with ## for a heading.' },
      { key: 'pullQuote', label: 'Pull quote', type: 'text' },
      { key: 'originalUrl', label: 'Original (LinkedIn) link', type: 'url' },
      { key: 'heroImage', label: 'Header image', type: 'image' },
    ],
  },
  opeds: {
    label: 'Op-eds & blogs', singular: 'op-ed or blog', titleKey: 'title', fields: [
      title,
      { key: 'kind', label: 'Kind', type: 'select', options: ['op-ed', 'research-blog', 'policy-brief'], required: true },
      { key: 'outlet', label: 'Outlet', type: 'text', required: true, help: '“RITA” for pieces published on this site.' },
      { key: 'outletUrl', label: 'Link (if published elsewhere)', type: 'url' },
      { key: 'date', label: 'Date', type: 'text', required: true, help: 'YYYY-MM' },
      { key: 'authors', label: 'Authors', type: 'list', required: true },
      { key: 'programme', label: 'Programme', type: 'select', options: ['', ...PROG] },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'keyPoints', label: 'Key points', type: 'list' },
      { key: 'body', label: 'Full text (on-site pieces)', type: 'markdown' },
    ],
  },
  briefs: {
    label: 'Policy briefs', singular: 'policy brief', titleKey: 'title', fields: [
      { key: 'number', label: 'Brief number', type: 'number', required: true },
      title,
      { key: 'programme', label: 'Programme', type: 'select', options: PROG, required: true },
      { key: 'authors', label: 'Authors', type: 'list' },
      { key: 'date', label: 'Date', type: 'text', help: 'YYYY-MM' },
      { key: 'recommendations', label: 'Recommendations', type: 'pairs', help: 'One per line: recommendation | why' },
      { key: 'issue', label: 'The issue', type: 'textarea' },
      { key: 'evidence', label: 'What the evidence shows', type: 'textarea' },
      { key: 'pdf', label: 'PDF link', type: 'url' },
      { key: 'basedOn', label: 'Based on (publication slugs, or opeds:slug)', type: 'list' },
    ],
  },
  projects: {
    label: 'Projects', singular: 'project', titleKey: 'title', fields: [
      title,
      { key: 'projectStatus', label: 'Status', type: 'select', options: ['ongoing', 'completed'], required: true },
      { key: 'startYear', label: 'Start year', type: 'number' },
      { key: 'endYear', label: 'End year', type: 'number' },
      { key: 'period', label: 'Period shown', type: 'text', help: 'e.g. 2026–2030' },
      { key: 'funder', label: 'Funder / commissioner', type: 'text', required: true },
      { key: 'partners', label: 'Partners', type: 'list' },
      { key: 'programme', label: 'Programme', type: 'select', options: ['', ...PROG] },
      { key: 'team', label: 'Team (people slugs)', type: 'list' },
      { key: 'externalTeam', label: 'Other team members', type: 'list' },
      { key: 'summary', label: 'Summary (one line)', type: 'textarea', required: true },
      { key: 'description', label: 'About the project', type: 'textarea' },
      { key: 'budget', label: 'Budget', type: 'text' },
      { key: 'photo', label: 'Photo slot', type: 'text' },
    ],
  },
  people: {
    label: 'People', singular: 'person', titleKey: 'name', fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'group', label: 'Group', type: 'select', options: ['lead', 'fellow', 'associate', 'alumni', 'staff'], required: true },
      { key: 'role', label: 'Role', type: 'text', required: true },
      { key: 'base', label: 'Base (city)', type: 'text' },
      { key: 'focus', label: 'Focus (one line)', type: 'text' },
      { key: 'bio', label: 'Bio', type: 'textarea', required: true },
      { key: 'portrait', label: 'Portrait (4:5)', type: 'image' },
      { key: 'programmes', label: 'Programmes', type: 'list' },
      { key: 'focusTags', label: 'Focus tags', type: 'list' },
      { key: 'links.email', label: 'Email', type: 'text' },
      { key: 'links.linkedin', label: 'LinkedIn', type: 'url' },
      { key: 'links.scholar', label: 'Google Scholar', type: 'url' },
      { key: 'links.orcid', label: 'ORCID', type: 'text' },
      { key: 'links.site', label: 'Personal site', type: 'url' },
      { key: 'awards', label: 'Awards', type: 'list' },
      { key: 'expertise', label: 'Topics for media comment', type: 'list' },
      { key: 'authorKey', label: 'Surname used in author lists', type: 'text', required: true },
      { key: 'consentToList', label: 'Consented to be listed', type: 'bool' },
    ],
  },
  events: {
    label: 'Events', singular: 'event', titleKey: 'title', fields: [
      title,
      { key: 'eventType', label: 'Type', type: 'text', required: true },
      { key: 'format', label: 'Format', type: 'select', options: ['online', 'in-person', 'hybrid'], required: true },
      { key: 'datetime', label: 'Date and time', type: 'text', help: 'ISO, e.g. 2026-11-20T14:00:00+02:00' },
      { key: 'timezone', label: 'Timezone', type: 'text' },
      { key: 'durationMinutes', label: 'Duration (minutes)', type: 'number' },
      { key: 'venue', label: 'Venue', type: 'text' },
      { key: 'language', label: 'Language', type: 'text' },
      { key: 'speakers', label: 'Speakers (people slugs)', type: 'list' },
      { key: 'speakersTbc', label: 'Other speakers', type: 'list' },
      { key: 'about', label: 'About', type: 'textarea', required: true },
      { key: 'registrationOpen', label: 'Registration open', type: 'bool' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'recordingUrl', label: 'Recording link', type: 'url' },
      { key: 'slidesUrl', label: 'Slides link', type: 'url' },
    ],
  },
  jobs: {
    label: 'Opportunities', singular: 'opportunity', titleKey: 'title', fields: [
      title,
      { key: 'jobType', label: 'Type', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text', required: true },
      { key: 'deadline', label: 'Deadline', type: 'text', required: true },
      { key: 'programme', label: 'Programme', type: 'select', options: ['', ...PROG] },
      { key: 'reportsTo', label: 'Reports to', type: 'text' },
      { key: 'summary', label: 'Summary', type: 'textarea', required: true },
      { key: 'body', label: 'Full description', type: 'markdown' },
      { key: 'applyUrl', label: 'Apply link', type: 'url' },
      { key: 'applyEmail', label: 'Apply email', type: 'text' },
    ],
  },
  partners: {
    label: 'Partners', singular: 'partner', titleKey: 'name', fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'kind', label: 'Kind', type: 'select', options: ['funder', 'commissioner', 'academic', 'network', 'media'], required: true },
      { key: 'relationship', label: 'Relationship', type: 'text', required: true },
      { key: 'url', label: 'Website', type: 'url' },
      { key: 'logo', label: 'Logo', type: 'image' },
      { key: 'logoPermission.granted', label: 'Logo permission granted', type: 'bool' },
      { key: 'logoPermission.date', label: 'Permission date', type: 'text' },
      { key: 'logoPermission.contact', label: 'Permission contact', type: 'text' },
      { key: 'trackRecord', label: 'Show on home page', type: 'bool' },
      { key: 'order', label: 'Order', type: 'number' },
    ],
  },
};

export function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}
export function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  let o = obj;
  keys.slice(0, -1).forEach((k) => { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; o = o[k] as Record<string, unknown>; });
  const last = keys[keys.length - 1];
  if (value === undefined || value === '' || (Array.isArray(value) && !value.length && !['authors', 'keyFindings'].includes(last))) delete o[last];
  else o[last] = value;
}
export const slugify = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’‘]/g, '')
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 72).replace(/-+$/, '');

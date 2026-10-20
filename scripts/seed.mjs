// Writes one JSON file per entry into src/content/<collection>/.
// Usage: npm run seed            (only writes missing files, so CMS edits are kept)
//        npm run seed -- --force (overwrites everything from seed-data.mjs)
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publications, opeds, opedApproxMonth, insights, projects, partners } from './seed-data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content');
const force = process.argv.includes('--force');
let written = 0, kept = 0;
// Typographic apostrophes in titles (Africa's → Africa’s).
const smart = (t) => t.replace(/(\w)'(\w)/g, '$1\u2019$2').replace(/(^|\s)'/g, '$1\u2018').replace(/'/g, '\u2019');
for (const list of [publications, opeds, insights]) for (const x of list) x.title = smart(x.title);

export function slugify(s, max = 72) {
  const slug = s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/['’‘]/g, '').replace(/₂/g, '2').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (slug.length <= max) return slug;
  return slug.slice(0, max).replace(/-[^-]*$/, '');
}

function write(collection, slug, data) {
  const dir = join(root, collection);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${slug}.json`);
  if (existsSync(file) && !force) { kept++; return; }
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  written++;
}
const unique = (seen, slug) => { let s = slug, i = 2; while (seen.has(s)) s = `${slug}-${i++}`; seen.add(s); return s; };

// Slugs for publications and op-eds, so other entries can reference them by title.
const pubSlugs = new Set(), opedSlugs = new Set();
const pubIds = publications.map((p) => unique(pubSlugs, slugify(p.title)));
const opedIds = opeds.map((o) => unique(opedSlugs, slugify(o.title)));
const find = (list, ids, prefix) => {
  const norm = (t) => t.toLowerCase().replace(/[\u2018\u2019]/g, "'");
  const i = list.findIndex((x) => norm(x.title).startsWith(norm(prefix)));
  if (i < 0) throw new Error(`seed: no entry starts with "${prefix}"`);
  return ids[i];
};
const pub = (prefix) => find(publications, pubIds, prefix);
const oped = (prefix) => `opeds:${find(opeds, opedIds, prefix)}`;

// Programmes (WEBSITE-CONTENT.md "Programmes" table + §03 featured lists).
const programmes = [
  { slug: 'green-industrialisation', code: 'IND', number: '01', colour: 'malachite', title: 'Green industrialisation & policy',
    short: 'Political economy, learning states, private sector.',
    intro: 'How African states can build the institutions, coalitions and finance to turn the green transition into manufacturing, jobs and structural change.',
    keyQuestions: ['What kind of state does green industrial policy need?', 'How should finance be structured, not just scaled?', 'How do regional markets (AfCFTA) create demand for African production?'],
    featured: [pub('Gendering structural change'), pub('Chinese economic ties'), pub('Greening manufacturing')],
    lead: 'gideon-ndubuisi', photo: 'Industrial park' },
  { slug: 'transition-minerals', code: 'MIN', number: '02', colour: 'laterite', title: 'Transition minerals & value chains',
    short: 'Processing, regional value chains, royalties.',
    intro: 'How African countries can move from extracting transition minerals to processing, manufacturing and regional value chains.',
    keyQuestions: ['What does it take to regionalise mineral value chains?', 'When does local processing pay off?', 'How should royalty and fiscal regimes adapt to volatility?'],
    featured: [pub('Regionalizing green'), pub('Critical minerals and routes to diversification in Africa: Linkages'), pub('Adaptive royalty')],
    lead: 'gideon-ndubuisi', photo: 'Copper / cobalt / lithium processing' },
  { slug: 'energy-and-industry', code: 'EN', number: '03', colour: 'sun', title: 'Energy & industry',
    short: 'Electricity and firms, solar PV, EVs, hydrogen.',
    intro: 'How electricity reliability, renewable energy and new energy technologies shape what African firms can make, and where green industries can take root.',
    keyQuestions: ['What do electricity crises cost firms in jobs, investment and exports?', 'Can Africa manufacture solar PV, batteries and EVs competitively?', 'Is green hydrogen a strategy or a distraction?'],
    featured: [pub('Jobs, investments and exporting'), pub('Dancing on the grid'), pub('Solar photovoltaic')],
    lead: 'elvis-korku-avenyo', photo: 'Power station, grid or solar farm' },
  { slug: 'innovation-firms-work', code: 'INN', number: '04', colour: 'ink', title: 'Innovation, firms & work',
    short: 'Capabilities, digital tech, informality, jobs.',
    intro: 'How African firms, formal and informal, learn, innovate, adopt digital technology and create good jobs.',
    keyQuestions: ['How do firms build technological capabilities?', 'When do value chains and digital technologies create jobs rather than destroy them?', 'What role does the informal economy play in industrial learning?'],
    featured: [pub('Global value chains and the innovativeness'), pub('Determinants of digital'), pub('The employment impact')],
    lead: 'elvis-korku-avenyo', photo: 'Workshop, maker space or informal enterprise' },
];
for (const { slug, ...p } of programmes) write('programmes', slug, p);

// People (WEBSITE-CONTENT.md §13 + §31 experts).
write('people', 'gideon-ndubuisi', {
  title: 'Gideon Ndubuisi', name: 'Gideon Ndubuisi', group: 'lead', role: 'Programme lead', base: 'Delft', authorKey: 'Ndubuisi',
  focus: 'Green industrialisation, transition minerals, industrial policy',
  bio: 'Assistant Professor of Economics at Delft University of Technology (TU Delft). His research covers the political economy of Africa’s green structural transformation, with a focus on green industrialisation, transition minerals and industrial policy, alongside trade, global value chains and productivity. He writes RITA’s weekly Policy Insights. He has worked with UNIDO, the World Bank, the African Development Bank, the European Commission, ACET, UNU-WIDER, APRI and the IFC, and was previously at the German Development Institute (IDOS), where he helped set up the Research Network Sustainable Supply Chains. PhD, UNU-MERIT / Maastricht University.',
  bioTbc: true, programmes: ['IND', 'MIN'],
  focusTags: ['Green industrialisation', 'Transition minerals', 'Industrial policy', 'Global value chains', 'Productivity'],
  links: { site: 'https://sites.google.com/view/gideonndubuisi' },
  expertise: ['Transition minerals', 'Industrial policy', 'Green hydrogen', 'AfCFTA'],
  consentToList: true,
});
write('people', 'elvis-korku-avenyo', {
  title: 'Elvis Korku Avenyo', name: 'Elvis Korku Avenyo', group: 'lead', role: 'Programme lead', base: 'Johannesburg', authorKey: 'Avenyo',
  focus: 'Innovation, industrial development, firms and labour markets',
  bio: 'Associate Professor of Development Economics at the SARChI Chair in Industrial Development, University of Johannesburg. His work spans innovation, technology adoption, industrial development, labour markets and firm behaviour, including the informal economy. He was previously a Senior Researcher at CCRED and a Research Officer at Oxford’s Technology and Management Centre for Development (TMCD). PhD, UNU-MERIT / Maastricht University.',
  programmes: ['EN', 'INN'],
  focusTags: ['Innovation', 'Industrial development', 'Digital technologies', 'Labour markets', 'Informality'],
  links: { site: 'https://sites.google.com/view/elvis-korku-avenyo' },
  awards: ['2025 Middleton Award (South African Journal of Economics)', 'Overall Best Conference Paper, African Economic Conference 2022 (Mauritius)',
    'Africa Oxford Initiative travel grant (CSAE 2019)', 'OpenAIR Queen Elizabeth Scholar', 'UJ Global Excellence and Stature award'],
  expertise: ['Electricity crises', 'Manufacturing', 'Digital technologies', 'Informal economy'],
  consentToList: true,
});

// Publications.
publications.forEach((p, i) => write('publications', pubIds[i], p));

// Op-eds, blogs, external briefs.
opeds.forEach((o, i) => {
  write('opeds', opedIds[i], { ...o, ...(opedApproxMonth.has(o.title) ? { note: 'Month to confirm; source gives the year only.' } : {}) });
});

// Policy Insights.
for (const i of insights) {
  write('insights', `no-${i.number}-${slugify(i.title, 60)}`, {
    ...i, year: 2026, authors: ['gideon-ndubuisi'],
    topics: topicsFor(i),
    originalUrl: 'https://sites.google.com/view/gideonndubuisi/policy-insights',
    ...(i.number === 29 ? { pullQuote: 'Green projects will not transform African economies. Value chains will.' } : {}),
  });
}
function topicsFor(i) {
  const t = new Set();
  if (i.programme === 'IND') t.add('Industrial policy');
  if (i.programme === 'MIN') t.add('Minerals');
  if (i.series === 'Green hydrogen' || /hydrogen/i.test(i.title)) t.add('Green hydrogen');
  if (i.series === 'Learning economy' || /learning/i.test(i.title)) t.add('Learning economy');
  if (i.series === 'EVs') t.add('EVs');
  if (i.series === 'Ground-up industrialisation') t.add('Ground-up industrialisation');
  if (/financ|capital/i.test(i.title)) t.add('Finance');
  return [...t];
}

// Projects.
for (const { slug, role, budget, photo, ...p } of projects) {
  write('projects', slug, { ...p, ...(role ? { ritaRole: role } : {}), ...(budget ? { budget } : {}), ...(photo ? { photo } : {}),
    ...(p.preRita === false ? {} : { preRita: true }) });
}

// Partners.
partners.forEach((p, order) => write('partners', slugify(p.name), { title: p.name, ...p, order, logoPermission: { granted: false } }));

// RITA policy briefs (WEBSITE-CONTENT §06): launch series, authors to write.
const briefs = [
  ['Regional mineral value chains: why Africa must coordinate', 'MIN', [pub('Regionalizing green'), oped("Africa's mineral strength")]],
  ['Keeping industry running: electricity crises and South African manufacturing', 'EN', [pub('Jobs, investments and exporting'), pub('Dancing on the grid')]],
  ['Solar PV manufacturing in Africa: opportunity or mirage?', 'EN', [pub('Solar photovoltaic')]],
  ['Gendering the green transition', 'IND', [pub('Gendering structural change'), pub('Gendering green transition')]],
  ['No chips, no power: Africa and the semiconductor value chain', 'INN', [oped('No chips, no power')]],
  ['GVCs, job creation and job destruction', 'INN', [oped('Global value chains, job creation'), pub('Global value chains, job creation')]],
];
briefs.forEach(([title, programme, basedOn], i) => write('briefs', slugify(title), {
  title, number: i + 1, programme, authors: [], basedOn,
}));

// Events (WEBSITE-CONTENT §15–16).
write('events', 'launch-rita-and-the-policy-insights-series', {
  title: 'Launch: RITA and the Policy Insights series', eventType: 'Launch', format: 'online', durationMinutes: 60, language: 'English',
  speakers: ['gideon-ndubuisi', 'elvis-korku-avenyo'], speakersTbc: ['Moderator'],
  about: 'Meet the team, hear what RITA will work on first, and put your questions to the programme leads.',
  registrationOpen: true,
});

// Jobs (WEBSITE-CONTENT §19).
write('jobs', 'call-for-contributions-policy-insights', {
  title: 'Call for contributions, Policy Insights', jobType: 'Call for contributions', location: 'Remote', deadline: 'Rolling',
  summary: 'Pitch or submit a Policy Insight: one idea in 600–900 words on Africa’s green industrialisation.',
  applyUrl: '/submit',
});

console.log(`seed: ${written} written, ${kept} kept (use --force to overwrite)`);

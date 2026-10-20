// Content model (BUILD-SPEC §5). Every entry is one JSON file under src/content/<collection>/,
// editable through Decap CMS (/admin) or by hand. Seed with `npm run seed`.
import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

const programmeCode = z.enum(['IND', 'MIN', 'EN', 'INN']);
const status = z.enum(['draft', 'published']).default('published');

const base = {
  title: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  socialImage: z.string().optional(),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  status,
};

const json = (dir: string) => glob({ pattern: '**/*.json', base: `./src/content/${dir}` });

const programmes = defineCollection({
  loader: json('programmes'),
  schema: z.object({
    ...base,
    code: programmeCode,
    number: z.string(),
    colour: z.enum(['malachite', 'laterite', 'sun', 'ink']),
    short: z.string(),
    intro: z.string(),
    keyQuestions: z.array(z.string()).length(3),
    featured: z.array(z.string()).default([]), // publication ids
    lead: reference('people'),
    photo: z.string(),
  }),
});

const people = defineCollection({
  loader: json('people'),
  schema: z.object({
    ...base,
    name: z.string(),
    group: z.enum(['lead', 'fellow', 'associate', 'alumni', 'staff']),
    role: z.string(),
    base: z.string(),
    focus: z.string(),
    bio: z.string(),
    bioTbc: z.boolean().default(false),
    portrait: z.string().optional(),
    programmes: z.array(programmeCode).default([]),
    focusTags: z.array(z.string()).default([]),
    links: z.object({
      email: z.string().optional(),
      linkedin: z.string().optional(),
      scholar: z.string().optional(),
      orcid: z.string().optional(),
      site: z.string().optional(),
    }).default({}),
    awards: z.array(z.string()).default([]),
    expertise: z.array(z.string()).default([]),
    authorKey: z.string(), // surname used in author strings
    consentToList: z.boolean(),
  }),
});

const publications = defineCollection({
  loader: json('publications'),
  schema: z.object({
    ...base,
    type: z.enum(['journal', 'report', 'working-paper', 'policy-paper', 'book-chapter', 'background-paper', 'thesis']),
    programmes: z.array(programmeCode).default([]),
    authors: z.array(z.string()),
    authorOrderConfirmed: z.boolean().default(false),
    publisher: z.string(),
    year: z.number().nullable(),
    doi: z.string().optional(),
    externalUrl: z.string().optional(),
    pdf: z.string().optional(),
    summary: z.string().optional(),
    whyItMatters: z.string().optional(),
    methods: z.string().optional(),
    keyFindings: z.array(z.string()).default([]),
    sources: z.array(z.string()).default([]),
    regions: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    project: z.string().optional(),
    featured: z.boolean().default(false),
    archive: z.boolean().default(false),
    award: z.string().optional(),
    note: z.string().optional(),
  }),
});

const insights = defineCollection({
  loader: json('insights'),
  schema: z.object({
    ...base,
    number: z.number(),
    series: z.string().optional(),
    part: z.number().optional(),
    of: z.number().optional(),
    authors: z.array(z.string()).default(['gideon-ndubuisi']),
    programme: programmeCode,
    topics: z.array(z.string()).default([]),
    year: z.number(),
    date: z.string().optional(),
    body: z.string().optional(), // markdown; empty until migrated from LinkedIn
    originalUrl: z.string().optional(),
    heroImage: z.string().optional(),
    pullQuote: z.string().optional(),
  }),
});

const opeds = defineCollection({
  loader: json('opeds'),
  schema: z.object({
    ...base,
    kind: z.enum(['op-ed', 'research-blog', 'policy-brief']),
    outlet: z.string(),
    outletUrl: z.string().optional(),
    date: z.string(), // YYYY-MM
    authors: z.array(z.string()),
    programme: programmeCode.optional(),
    summary: z.string().optional(),
    image: z.string().optional(),
    note: z.string().optional(),
    keyPoints: z.array(z.string()).default([]),
    sources: z.array(z.string()).default([]),
  }),
});

const briefs = defineCollection({
  loader: json('briefs'),
  schema: z.object({
    ...base,
    number: z.number(),
    programme: programmeCode,
    authors: z.array(z.string()),
    date: z.string().optional(),
    recommendations: z.array(z.object({ text: z.string(), why: z.string() })).default([]),
    issue: z.string().optional(),
    evidence: z.string().optional(),
    pdf: z.string().optional(),
    basedOn: z.array(z.string()).default([]), // publication / op-ed ids
    sources: z.array(z.string()).default([]),
    notes: z.string().optional(), // internal: what still needs author review
  }),
});

const projects = defineCollection({
  loader: json('projects'),
  schema: z.object({
    ...base,
    projectStatus: z.enum(['ongoing', 'completed']),
    startYear: z.number().optional(),
    endYear: z.number().optional(),
    period: z.string().optional(),
    funder: z.string(),
    partners: z.array(z.string()).default([]),
    team: z.array(z.string()).default([]), // people ids
    externalTeam: z.array(z.string()).default([]),
    programme: programmeCode.optional(),
    summary: z.string(),
    description: z.string().optional(),
    ritaRole: z.string().optional(),
    outputs: z.array(z.string()).default([]),
    preRita: z.boolean().default(true),
    sources: z.array(z.string()).default([]),
    budget: z.string().optional(),
    photo: z.string().optional(),
  }),
});

const partners = defineCollection({
  loader: json('partners'),
  schema: z.object({
    ...base,
    name: z.string(),
    kind: z.enum(['funder', 'commissioner', 'academic', 'network', 'media']),
    relationship: z.string(),
    url: z.string().optional(),
    logo: z.string().optional(),
    logoPermission: z.object({ granted: z.boolean(), date: z.string().optional(), contact: z.string().optional() }),
    trackRecord: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const events = defineCollection({
  loader: json('events'),
  schema: z.object({
    ...base,
    datetime: z.string().optional(), // ISO; undefined = date TBC
    timezone: z.string().default('Africa/Johannesburg'),
    durationMinutes: z.number().default(60),
    format: z.enum(['online', 'in-person', 'hybrid']),
    eventType: z.string(),
    venue: z.string().optional(),
    language: z.string().default('English'),
    speakers: z.array(z.string()).default([]),
    speakersTbc: z.array(z.string()).default([]),
    about: z.string(),
    capacity: z.number().optional(),
    registrationOpen: z.boolean().default(true),
    recordingUrl: z.string().optional(),
    slidesUrl: z.string().optional(),
    programme: programmeCode.optional(),
  }),
});

const jobs = defineCollection({
  loader: json('jobs'),
  schema: z.object({
    ...base,
    jobType: z.string(),
    location: z.string(),
    deadline: z.string(),
    programme: programmeCode.optional(),
    reportsTo: z.string().optional(),
    summary: z.string(),
    body: z.string().optional(),
    applyUrl: z.string().optional(),
    applyEmail: z.string().optional(),
  }),
});

export const collections = { programmes, people, publications, insights, opeds, briefs, projects, partners, events, jobs };

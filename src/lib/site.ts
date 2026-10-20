// Site-wide constants. Domain and inboxes are [TBC] until the domain is registered (ASSETS-CHECKLIST §8).
export const SITE = {
  name: 'RITA',
  fullName: 'Research Institute for Transitions in Africa',
  title: 'RITA, Research Institute for Transitions in Africa',
  motto: 'Research. Policy. Transformation.',
  description:
    'Africa-led research on how the continent can industrialise through the green transition: minerals, energy, firms and the policies that connect them.',
  domain: 'rita.africa',
  bases: ['Johannesburg', 'Delft'],
  registrationNo: '[TBC]',
  year: 2026,
  social: {
    linkedin: '', // [TBC] reserve handles (ASSETS-CHECKLIST §8)
    x: '',
    youtube: '',
  },
};

export const INBOX = {
  general: 'info@rita.africa',
  media: 'press@rita.africa',
  policy: 'policy@rita.africa',
  partnerships: 'partners@rita.africa',
  fellowship: 'fellows@rita.africa',
  events: 'events@rita.africa',
  editor: 'editor@rita.africa',
  jobs: 'jobs@rita.africa',
  privacy: 'privacy@rita.africa',
  access: 'access@rita.africa',
  website: 'web@rita.africa',
} as const;

export const NAV = [
  { href: '/research', label: 'Research', children: [
    { href: '/research', label: 'Research library' },
    { href: '/research/green-industrialisation', label: '01 Green industrialisation & policy' },
    { href: '/research/transition-minerals', label: '02 Transition minerals & value chains' },
    { href: '/research/energy-and-industry', label: '03 Energy & industry' },
    { href: '/research/innovation-firms-work', label: '04 Innovation, firms & work' },
    { href: '/research/projects', label: 'Projects' },
  ] },
  { href: '/policy', label: 'Policy', children: [
    { href: '/policy', label: 'Policy & advisory' },
    { href: '/policy/briefs', label: 'Policy briefs' },
  ] },
  { href: '/insights', label: 'Insights', children: [
    { href: '/insights', label: 'Policy Insights' },
    { href: '/insights/op-eds', label: 'Op-eds' },
    { href: '/insights/events', label: 'Events' },
    { href: '/insights/newsletter', label: 'Newsletter archive' },
  ] },
  { href: '/fellows', label: 'Fellows', children: [
    { href: '/fellows', label: 'Fellows & people' },
    { href: '/fellows/fellowship', label: 'RITA Fellowship' },
  ] },
  { href: '/about', label: 'About', children: [
    { href: '/about', label: 'About RITA' },
    { href: '/about/partners', label: 'Partners & funders' },
    { href: '/about/opportunities', label: 'Opportunities' },
    { href: '/about/media', label: 'Media' },
    { href: '/contact', label: 'Contact' },
  ] },
];

export const FOOTER = [
  { title: 'Work', links: [['/research', 'Research'], ['/policy', 'Policy'], ['/insights', 'Insights'], ['/research/projects', 'Projects']] },
  { title: 'Institute', links: [['/fellows', 'Fellows'], ['/about', 'About'], ['/about/opportunities', 'Opportunities'], ['/about/media', 'Media']] },
  { title: 'Contribute', links: [['/submit', 'Submit an article'], ['/contact', 'Contact us'], ['/subscribe', 'Newsletter']] },
] as const;

export const LEGAL = [
  ['/privacy', 'Privacy'], ['/cookies', 'Cookies'], ['/terms', 'Terms'], ['/accessibility', 'Accessibility'], ['/sitemap', 'Sitemap'],
] as const;

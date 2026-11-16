// RITA Conference 2027: every date, track and rule lives here, so the pages stay in sync.
// Dates are ISO (YYYY-MM-DD). Change them here and every page, the timeline and the banner update.

export const CONF = {
  short: 'RITA 2027',
  name: 'RITA Conference 2027',
  theme: 'Industrialising through the transition',
  strap: 'Evidence for Africa’s next economy',
  edition: 'First RITA Conference on Africa’s green industrial transformation',
  city: 'Johannesburg, South Africa',
  mode: 'In person, with online participation',
  dates: '9–10 September 2027',
  start: '2027-09-09',
  end: '2027-09-10',
  deadline: '2027-03-31',
  deadlineText: '31 March 2027, 23:59 SAST (UTC+2)',
  email: 'conference@rita.africa',
  hashtag: '#RITA2027',
};

export interface KeyDate { date: string; label: string; detail: string; milestone?: boolean }
export const KEY_DATES: KeyDate[] = [
  { date: '2026-12-01', label: 'Call for abstracts opens', detail: 'Submissions open in the RITA Studio.' },
  { date: '2027-02-15', label: 'Panel proposals close', detail: 'Organised panels of three or four papers.' },
  { date: '2027-03-31', label: 'Abstracts close', detail: 'Individual papers, posters and roundtable proposals. 23:59 SAST.', milestone: true },
  { date: '2027-05-15', label: 'Decisions sent', detail: 'Accept, accept as poster, or decline, with reviewer comments.' },
  { date: '2027-05-31', label: 'Travel support decisions', detail: 'For Africa-based early-career researchers who applied with their abstract.' },
  { date: '2027-06-30', label: 'Presenter registration closes', detail: 'At least one author of each accepted abstract registers by this date.' },
  { date: '2027-07-31', label: 'Full papers due', detail: 'Required for the Best Paper Award and the post-conference publication track.' },
  { date: '2027-08-16', label: 'Programme published', detail: 'Sessions, discussants and keynotes.' },
  { date: '2027-09-08', label: 'Early-career workshop', detail: 'Pre-conference day for PhD candidates and early-career researchers.' },
  { date: '2027-09-09', label: 'Conference', detail: 'Two days in Johannesburg, 9–10 September.', milestone: true },
  { date: '2027-11-30', label: 'Publication track deadline', detail: 'Revised papers for the RITA Working Paper Series and the planned special issue.' },
];

export interface Track { n: string; code: 'IND' | 'MIN' | 'EN' | 'INN'; title: string; summary: string; questions: string[] }
export const TRACKS: Track[] = [
  { n: '01', code: 'IND', title: 'The state and green industrial policy',
    summary: 'What kind of state can turn the green transition into manufacturing, jobs and structural change.',
    questions: ['Which institutions and coalitions make industrial policy work?', 'How do political settlements shape industrial ambition?', 'What can African states learn from each other?'] },
  { n: '02', code: 'IND', title: 'Financing industrial transformation',
    summary: 'How finance is structured, not only how much is raised.',
    questions: ['Which finance builds productive capacity rather than debt?', 'What role for development banks, DFIs and Chinese finance?', 'How does currency risk shape green investment?'] },
  { n: '03', code: 'MIN', title: 'Transition minerals and regional value chains',
    summary: 'From extracting minerals to processing, manufacturing and regional value chains.',
    questions: ['When does local processing pay off?', 'How can countries coordinate instead of compete?', 'How should royalty and fiscal regimes adapt to volatile prices?'] },
  { n: '04', code: 'EN', title: 'Electricity, reliability and firms',
    summary: 'What unreliable power costs firms, and what a greener grid could change.',
    questions: ['What do outages cost in jobs, investment and exports?', 'Do firms recover when power returns?', 'How should energy and industrial policy fit together?'] },
  { n: '05', code: 'EN', title: 'Making the transition: solar, batteries, EVs and hydrogen',
    summary: 'Whether Africa can make the technologies of the transition, not only buy them.',
    questions: ['Where can African manufacturers compete?', 'Is green hydrogen a strategy or a distraction?', 'What is driving the two- and three-wheeler EV boom?'] },
  { n: '06', code: 'INN', title: 'Firms, innovation and technological capabilities',
    summary: 'How African firms learn, innovate and adopt digital technology.',
    questions: ['How do firms build capabilities?', 'When do value chains spread knowledge?', 'What limits digital adoption?'] },
  { n: '07', code: 'INN', title: 'Work, skills and the informal economy',
    summary: 'Jobs in the transition, and the informal economy as a place of learning.',
    questions: ['Which transitions create good jobs?', 'How do informal enterprises innovate?', 'Do skills follow demand, or lead it?'] },
  { n: '08', code: 'IND', title: 'Trade, AfCFTA and global value chains',
    summary: 'Regional markets as the demand that African production needs.',
    questions: ['Is the AfCFTA a passive trade deal or an active transformer?', 'Who gains from GVC participation?', 'How do trade partners shape structural change?'] },
  { n: '09', code: 'IND', title: 'Gender and inclusive transitions',
    summary: 'Who gains and who loses as economies change, and what policy can do about it.',
    questions: ['How does structural change affect women’s work?', 'What makes a transition policy gender-transformative?', 'Who is left out of green jobs?'] },
];

export interface Format { title: string; length: string; detail: string }
export const FORMATS: Format[] = [
  { title: 'Paper', length: '15 min + discussant', detail: 'Individual research paper. Grouped by the committee into sessions of four, each with a discussant.' },
  { title: 'Organised panel', length: '90 min', detail: 'Three or four papers on one question, with a chair and discussant you propose. Closes 15 February.' },
  { title: 'Policy roundtable', length: '60 min', detail: 'Researchers and decision-makers on one policy problem. Three to five speakers, at least one from government, a DFI or business.' },
  { title: 'Poster and lightning talk', length: '5 min + poster', detail: 'Early results, work in progress or data. Posters stay up for both days.' },
];

export const ABSTRACT_RULES: [string, string][] = [
  ['Length', '300 to 500 words, plain text. No tables, figures or references.'],
  ['Structure', 'Four short parts: the question, the data and method, the findings (or expected findings), and why it matters for policy.'],
  ['Title', 'Up to 20 words. Say what you found, if you can.'],
  ['Keywords', 'Three to five, plus up to three JEL codes (optional).'],
  ['Authors', 'Every author with affiliation and country. Name one presenting author.'],
  ['Language', 'English or French. Presentations in either; slides in English help the room.'],
  ['Limits', 'Present at most one paper. Co-author as many as you like.'],
  ['Originality', 'Unpublished work, or work published in the last 12 months that you have not presented at a major conference.'],
];

export const CRITERIA: [string, string][] = [
  ['Relevance', 'Fits the conference theme and a track.'],
  ['Rigour', 'Clear question, credible data and method.'],
  ['Contribution', 'Adds something new: evidence, method, data or context.'],
  ['Policy value', 'Tells a decision-maker something they can use.'],
  ['Clarity', 'Plain, precise writing.'],
];

export const FEES: [string, string, string][] = [
  ['Africa-based students and PhD candidates', 'Reduced', 'Travel support available on application'],
  ['Africa-based researchers', 'Standard Africa rate', ''],
  ['Researchers based outside Africa', 'Standard rate', ''],
  ['Policy, DFI and business participants', 'Standard rate', 'Invited roundtable speakers attend free'],
  ['Online participation', 'Free', 'Registration required'],
];

export const FAQ: [string, string][] = [
  ['Who can submit?', 'Anyone working on Africa’s industrial and green transition: researchers at any career stage, policy analysts, and practitioners with evidence to share. We especially welcome Africa-based and early-career researchers.'],
  ['Does it cost anything to submit?', 'No. Submitting an abstract is free. Registration fees apply only to accepted presenters and attendees, and are announced with the decisions on 15 May 2027.'],
  ['Do I need a full paper to submit?', 'No. Submit an abstract by 31 March. A full paper is needed by 31 July only for the Best Paper Award and the publication track.'],
  ['Can I submit more than one abstract?', 'You can present one paper. You can co-author others, as long as a different author presents each.'],
  ['Can I present online?', 'In-person presentation is preferred. A limited number of online slots exist for presenters who cannot travel, for example because of visa delays. Say so when you submit.'],
  ['Will you help with visas?', 'Yes. Accepted presenters receive an invitation letter on request. Apply early: South African visas can take several weeks.'],
  ['Who reviews the abstracts?', 'The scientific committee, chaired by RITA’s programme leads. Each abstract gets at least two independent reviews.'],
  ['Can I change my abstract after submitting?', 'Yes, until the deadline. Open it in the RITA Studio, edit and resubmit.'],
  ['What happens to accepted papers?', 'They are presented in a themed session with a discussant. Strong full papers are invited to the RITA Working Paper Series and the planned special issue.'],
];

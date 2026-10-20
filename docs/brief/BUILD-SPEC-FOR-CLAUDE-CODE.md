# RITA website: build spec for Claude Code

Paste this file into Claude Code along with `WEBSITE-CONTENT.md`, `CONTENT-SOURCES.md`, the `assets/` folder and `RITA Website - Complete Wireframes.dc.html` (or its PDF). Together they describe the whole site. **The wireframe document is the visual source of truth for layout. This file is the source of truth for tokens, components and behaviour.**

## 0. Instructions to Claude Code
1. Build a production website for RITA (Research Institute for Transitions in Africa) with **Astro** (or Next.js App Router), TypeScript and a headless CMS (**Sanity** recommended; Payload is an alternative).
2. Recreate every page in the wireframes (pages 01–32) at the sizes shown. Wireframes are drawn at 1280px desktop width.
3. Seed the CMS from `CONTENT-SOURCES.md` (publications, insights, op-eds, projects, people, partners) and `WEBSITE-CONTENT.md` (page copy).
4. Front-end only for the contributor area (`/submit`). Build the screens and client-side validation, and stub the API calls behind `lib/api/submissions.ts` so the back-end can be connected later.
5. Meet WCAG 2.2 AA. Pages must work without JavaScript, except search, filters and forms (which progressively enhance).
6. Do not invent content. Where the wireframe shows `[TBC]`, render a visible placeholder and list it in `TODO-CONTENT.md`.

## 1. Brand
- Name: **RITA**, Research Institute for Transitions in Africa
- Motto: **Research. Policy. Transformation.**
- Home H1: **Evidence for Africa's next economy**
- Logo files: `assets/rita-logo-black.svg`, `assets/rita-logo-white.svg`, `assets/rita-symbol-black.svg`, `assets/rita-symbol-white.svg`. Clear space = the height of the "R" counter; minimum width 96px (full logo) or 24px (symbol). Never recolour, stretch or add effects.
- Voice: plain, evidence-led and direct. Short sentences, active verbs, British spelling (industrialisation, programme). No hype words ("cutting-edge", "world-class").

## 2. Design tokens
```css
:root{
  /* colour */
  --ink:#111110; --paper:#F6F5F2; --white:#FFFFFF;
  --line:#DCDAD4; --line-soft:#EBE9E3; --mute:#6B6963; --mute-2:#45433F; --sand:#E9E1D3;
  --malachite:#1D6B55;  /* Programme 01 Industrialisation · success */
  --laterite:#C2502A;   /* Programme 02 Minerals · errors · link hover */
  --sun:#E2A93B;        /* Programme 03 Energy · focus ring (text on sun = ink) */
  --ink-prog:#111110;   /* Programme 04 Innovation, firms & work */
  /* type */
  --sans:'IBM Plex Sans',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace;
  --fs-display:64px; --fs-h1:48px; --fs-h2:32px; --fs-h3:22px; --fs-body:18px; --fs-small:15px; --fs-label:13px;
  /* layout */
  --max:1280px; --pad:64px; --gutter:24px; --section-y:72px; --radius:0;
}
@media (max-width:899px){:root{--fs-display:40px;--fs-h1:34px;--fs-h2:26px;--pad:20px;--section-y:48px}}
```
- Weights: Plex Sans 400/500/600; Plex Mono 400/500. Self-host the WOFF2 files and preload 400 and 600.
- Line-height: headings 1.02–1.1, letter-spacing -0.02 to -0.03em; body 1.6; labels in mono, uppercase, letter-spacing 0.08em.
- **Square corners everywhere.** No shadows on site UI, no gradients.
- Programme colour rule: each content item carries one programme colour, shown as a 10px square before its label, a 4px bar under its image, or a tile background. Never mix two colours on one card.
- Contrast: white text on malachite, laterite and ink; ink text on sun and sand.
- Grid: 12 columns, 24px gutter, max 1280px content, 64px side padding (20px on mobile).
- Breakpoints: mobile below 600, tablet 600–899, desktop 900 and up, wide 1280 and up.

## 3. Global components
| Component | Spec |
|---|---|
| **Header** | 80px (64px on mobile), sticky, white with a bottom border on scroll. Logo 28px → `/`. Nav: Research · Policy · Insights · Fellows · About. Active item has a 2px ink underline. Right side: Search (opens overlay), EN \| FR, Subscribe (ink button, opens modal). Dark variant (ink background, white logo, sun underline) over the Policy and Insights heroes. Below 900px: logo + ⌕ + "☰ Menu" → full-screen ink menu with accordions. |
| **Footer** | Paper background. Logo, full name, motto. Columns: Work (Research, Policy, Insights, Projects) · Institute (Fellows, About, Opportunities, Media) · Contribute (Submit an article, Contact, Newsletter). Legal bar: © 2026 RITA · Privacy · Cookies · Terms · Accessibility · Sitemap · Cookie settings. Social: LinkedIn · X · YouTube · RSS. |
| **Newsletter band** | Ink background, above the footer on most pages. Email field + Subscribe + consent checkbox. Double opt-in. |
| **Buttons** | Primary: ink fill, white text. Secondary: 2px ink border. On dark backgrounds: white fill. Padding 14×22, Plex Sans 500 16px. Hover: laterite background. Focus: 3px sun outline with 2px offset. |
| **Chips / filters** | Plex Sans 500 15px, padding 9×15, 1px line border. Selected state is ink fill. Removable chips show ✕. |
| **Tabs** | 17px, 3px ink underline on the active tab. Use `role="tablist"` when tabs switch in-page content; when they change the URL, render them as links. |
| **Cards** | Optional image (4:3, with a 4px programme-colour bar), mono label with colour square, H3 title, meta line. The whole card is one link. |
| **List row** | Columns 150px type label · title · meta · year. 1px top border. |
| **Programme tiles** | Four coloured blocks, min-height 260px, 28px padding, number / title / one-line description. |
| **People card** | 4:5 portrait with a 5px programme-colour bottom bar, role label, name, focus. |
| **Logo wall** | Greyscale logos in equal boxes. Until a logo is approved, show the name and project as text (see Assets doc). |
| **Facts strip** | Label/value pairs with a 2px ink left rule. |
| **Pull quote** | 28–44px Plex Sans 600, 3px ink top rule. |
| **Image** | `<picture>` with AVIF/WebP, responsive `srcset`, lazy loading below the fold, alt text required, credit overlaid bottom-left in mono 12px. |
| **Overlays** | Search, newsletter modal, citation modal: focus trap, Esc closes, return focus to the trigger, `aria-modal`. |
| **Cookie banner** | Shown on first visit: Settings · Reject · Accept all. Analytics stay off until consent; the choice is stored for 12 months. |
| **Reading progress** | 3px sun bar under the header on article pages. |

## 4. Pages (match the wireframe numbers)
| # | Page | Route | Key behaviour |
|---|---|---|---|
| 01 | Home | `/` | Hero with pinned featured publication over a photo; Latest (3 items, any type); Programmes; Policy Insights split; quote; people; track record; newsletter |
| 02 | Research library | `/research` | Keyword search (300ms debounce) + type chips + sidebar filters (Programme, Region, Year, Author). OR within a group, AND across groups. Filter state in the URL. 12 per page. Empty state. |
| 03 | Programme | `/research/[programme]` | ×4. Coloured hero, 3 key questions, 3 featured, latest 6, people |
| 04 | Publication | `/research/publications/[slug]` | Download PDF · Read at publisher ↗ · Cite (APA/Harvard/BibTeX modal). Summary, key findings, related. JSON-LD `ScholarlyArticle`. |
| 05 | Policy | `/policy` | How we work, briefs list, track record, CTA → `/contact?type=policy` |
| 06 | Policy brief | `/policy/briefs/[slug]` | Recommendations box first; PDF; underlying research |
| 07 | Insights | `/insights` | Tabs: Policy Insights · Op-eds · Events · Newsletter archive. Topic and series chips, featured issue, list of 20 |
| 08 | Insight article | `/insights/[slug]` | 720px column, series navigation, author card, prev/next, progress bar |
| 09 | Op-eds | `/insights/op-eds` | Cards linking to the original outlet ↗ (`rel="noopener"`) |
| 10 | Projects | `/research/projects` | Ongoing (large cards) + completed list. Note "including team members' work before RITA" |
| 11 | Project | `/research/projects/[slug]` | Facts strip, description, outputs, team |
| 12 | Fellows & people | `/fellows` | Tabs by group; programme leads large; others only shown with consent |
| 13 | Profile | `/fellows/[slug]` | Portrait, bio, tags, links; tabs for Publications/Insights/Projects/Media (auto-collected by author) |
| 14 | Fellowship | `/fellows/fellowship` | Who/What/When, 4 steps, FAQ accordion, register-interest form |
| 15 | Events | `/insights/events` | Upcoming/Past, featured, list |
| 16 | Event | `/insights/events/[slug]` | Facts with timezone, speakers, registration form → confirmation email + .ics |
| 17 | About | `/about` | Mission, approach, story, people, partners |
| 18 | Partners & funders | `/about/partners` | Logo walls (approved only), independence statement, downloads |
| 19 | Opportunities | `/about/opportunities` | Positions list + register-interest form (CV PDF ≤5MB) |
| 20 | Position | `/about/opportunities/[slug]` | Facts, role, apply box |
| 21 | Contact | `/contact` | Enquiry type routes to the matching inbox; preselect with `?type=`; honeypot + invisible captcha |
| 22 | Submit landing | `/submit` | Formats, process, guidelines |
| 23 | Submit form | `/submit/new` | 4 steps (Details · Content · Images · Review). Autosave to localStorage + API stub. Rich text (TipTap) or .docx/PDF upload. Live word count against the format limit. |
| 24 | My submissions | `/submit/dashboard` | Status table + confirmation state |
| 25 | Newsletter | `/subscribe` | 3 states: form → check inbox → confirmed |
| 26 | Form states | all forms | Validation on blur and on submit, error summary at the top, sending state, success, server error that keeps the user's input |
| 27 | Search | `/search?q=` | Pagefind (static) or CMS search; type tabs; no-results state |
| 28 | 404/500/empty | — | Helpful links |
| 29 | Legal | `/privacy` `/cookies` `/terms` | Sticky contents list; POPIA + GDPR |
| 30 | Accessibility & sitemap | `/accessibility` `/sitemap` | Statement + generated sitemap |
| 31 | Media | `/about/media` | Coverage, press kit downloads, experts |
| 32 | Mobile | — | All pages responsive; menu, forms with 16px inputs and the correct `inputmode` |

## 5. Content model (CMS schemas)
Every type has: `title`, `slug`, `seoTitle`, `seoDescription`, `socialImage`, `publishedAt`, `updatedAt`, `status`.
- **Programme**: name, number, colour token, short description, intro, keyQuestions[3], featured[3] → refs, lead → Person
- **Publication**: type (journal | report | working paper | policy paper | book chapter | background paper), programmes[], authors[] (Person refs + external name strings), publisher/journal, volume/issue/pages, year, DOI, externalUrl, pdf (file, only with rights), summary, keyFindings[3], heroImage, project → ref, featured (bool)
- **Insight**: number, series → ref, part, author(s), programme, topics[], body (portable text), heroImage, readTime (auto), originalUrl (LinkedIn)
- **OpEd**: outlet, outletUrl, date, authors[], programme, summary, image
- **PolicyBrief**: number, programme, authors, recommendations[], body, pdf, basedOn[] → Publication
- **Project**: status, startYear, endYear, funder → Partner, partners[] → Partner, team[] → Person, programme, description, outputs[] (auto by ref)
- **Person**: name, group (lead | fellow | associate | alumni | staff), role, base, bio, portrait, programmes[], links {email, linkedin, scholar, orcid, site}, awards[], consentToList (bool)
- **Partner**: name, logo, url, kind (funder | commissioner | academic | network), logoPermission {granted, date, contact}
- **Event**: datetime, timezone, endTime, format (online | in-person | hybrid), venue, speakers[], capacity, registrationOpen
- **Job**: title, type, location, deadline, programme, reportsTo, body, applyUrl/email
- **Submission** (front-end shape only): format, programme, title (≤90), standfirst (≤40 words), author, coAuthors[], tags[], body | file, references, images[{file, caption, credit, alt, rightsConfirmed}], declarations{original, coi, coiText, editingConsent}, status (draft | submitted | in_review | changes_requested | scheduled | published)

## 6. Forms & email routing
| Form | Fields | Goes to |
|---|---|---|
| Contact | name, email, organisation, type, subject, message, consent | info@ / press@ / policy@ / partners@ / fellows@ / web@ by type |
| Newsletter | email, first name, lists (Policy Insights weekly, RITA News monthly, Events), consent | Email provider (Brevo / Mailchimp / Buttondown), double opt-in |
| Event registration | first, last, email, organisation, country, role, accessibility needs, consent | events@ + confirmation email with .ics |
| Register interest / Fellowship | name, email, country, programme, career stage, CV, note, consent | fellows@ |
| Submission | see the content model | API stub `POST /api/submissions` |

All forms: client and server validation, an error summary linked to each field, `aria-invalid`, a honeypot field, rate limiting, and an auto-reply email.

## 7. SEO, performance, analytics
- Lighthouse scores of 95+ on all categories; LCP under 2.5s on slow 4G; JS per page under 100KB.
- Open Graph and Twitter cards; JSON-LD for `Organization`, `ScholarlyArticle`, `Article`, `Event`, `Person`.
- `sitemap.xml`, `robots.txt`, RSS for Insights and Research; canonical URLs; 301 redirects from the founders' old LinkedIn posts where possible.
- Privacy-friendly analytics (Plausible or Fathom), loaded only after consent. Track: PDF download, publisher click, newsletter signup, contact submit, event register, submission submit.
- i18n: English at launch. Keep routes and strings ready for `/fr`.

## 8. Accessibility checklist
Skip link · landmarks · one H1 per page · visible focus (3px sun) · keyboard-reachable menus and filters · `prefers-reduced-motion` respected · alt text required in the CMS · captions on video · zoom to 400% without horizontal scroll · form labels always visible.

## 9. Deliverables from Claude Code
- Repo with README (setup, env vars, deploy to Vercel or Netlify)
- CMS schemas + seed script from `CONTENT-SOURCES.md`
- All 32 page templates + shared components (Storybook optional)
- `TODO-CONTENT.md` listing every `[TBC]`
- An accessibility and performance report

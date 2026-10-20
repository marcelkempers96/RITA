# Handoff: RITA website (Research Institute for Transitions in Africa)

## Overview
Public website for RITA, an Africa-focused research institute founded by Gideon Ndubuisi (TU Delft) and Elvis Korku Avenyo (University of Johannesburg). It publishes research, weekly "Policy Insights", policy briefs, projects, events and profiles, and collects contact, newsletter, event and fellowship-interest submissions.

## About the design files
`RITA Website - Complete Wireframes.dc.html` is a **design reference built in HTML**: one long document showing every page at real desktop size (1280px), plus mobile screens. Each page has numbered notes beside it that match the red numbers on the page. It shows intended layout, content and behaviour; it is **not production code**. Rebuild the site in a real stack (suggested: Next.js or Astro + a headless CMS; see Technical).

The document contains:
- Foundations (A–D): how to read it, sitemap & URLs, global elements & tokens, partners/funders and logo permissions.
- Pages 01–32: Home, Research library, Programme, Publication, Policy, Policy brief, Insights, Insight article, Op-eds, Projects, Project, Fellows, Profile, Fellowship, Events, Event + registration, About, Partners & funders, Opportunities, Position, Contact, **Submit landing, Submit form, My submissions**, Newsletter, Form states, Search, 404/500/empty, Legal & cookies, Accessibility & sitemap, Media, Mobile.
- Specs (E–F): content model, technical notes.

`assets/` holds the logo SVGs (full logo and R symbol, black and white).

## Contributor submission area (front-end only)
- `/submit`: landing page with formats (Policy Insight 600–900 words, blog/op-ed 800–1,200, policy brief 4 pages, working paper PDF), the process (Submit → Editorial review → Edits → Publish) and guidelines.
- `/submit/new`: 4-step form (Details · Content · Images · Review & submit). Format, programme, title (≤90 chars), standfirst (≤40 words), co-authors, tags; rich-text editor with live word count OR .docx/PDF upload; references; header image with caption, credit, alt text and a rights checkbox; declarations; Save draft · Preview · Submit for review. Autosaves.
- `/submit/dashboard`: table of the user's submissions. Statuses: Draft, Submitted, In review, Changes requested, Scheduled, Published.
- Sign-in, storage, editorial workflow and notifications are a **separate back-end build**. Only the screens and front-end behaviour are specified here.

## Fidelity
**Mid-fidelity.** Layout, hierarchy, page inventory, content model and behaviour are final intent. **Colours, typography and logo are final** (from the RITA identity). Photography is placeholder: ▣ boxes, each captioned with the shot needed. Pages are drawn at real 1280px desktop size.

---

## Design tokens
**Colours**
| Token | Hex | Use |
|---|---|---|
| ink | #111110 | text, primary buttons, dark bands, header dark variant |
| paper | #F6F5F2 | page background, footer |
| white | #FFFFFF | header, cards, content areas |
| line | #DCDAD4 | borders, dividers |
| mute | #6B6963 | secondary text, metadata |
| malachite | #1D6B55 | Programme 01 Industrialisation; success |
| laterite | #C2502A | Programme 02 Minerals; errors; button hover |
| sun | #E2A93B | Programme 03 Energy; focus ring (text on sun = ink) |
| sand | #E9E1D3 | info boxes, key-findings boxes, tints |
Programme 04 Innovation = ink.

**Type**: IBM Plex Sans (400/500/600) + IBM Plex Mono (400/500), self-hosted.
Display 64/1.04 −0.03em · H1 48/1.08 −0.02em · H2 32/1.15 · H3 22/1.25 · Body 18/1.6 (articles), 16/1.55 (UI) · Label = Mono 13 uppercase, +0.08em letter-spacing. Mobile sizes: Display 40, H1 34, H2 26.

**Spacing**: 4px base (4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Grid: 12 columns, 24px gutter, max 1280px content, 48px side padding on desktop and 20px on mobile. Reading column max 720px. Section spacing 96 / 56px.
**Shape**: border-radius 0 everywhere. Shadows only on overlays and modals.
**Breakpoints**: ≥1280, 900–1279, 600–899 (2-column cards; nav collapses below 900), <600 (1 column).

## Logo
`assets/rita-logo-black.svg` / `-white.svg` (full wordmark), `rita-symbol-*.svg` (R only: favicon, social avatar). Header height: 28px desktop, 22px mobile. Minimum size: 20px tall; below that, use the symbol. Never recolour the logo. It is black or white only.

---

## Global elements
- **Header**: logo → `/`; nav: Research · Policy · Insights · Fellows · About (active item = 2px underline); right side: Search (opens overlay), EN | FR (phase 2), Subscribe button (opens newsletter modal). Sticky; after 40px of scroll, white background + bottom border. A dark variant is used over the dark heroes on Policy and Insights. Below 900px: logo + search icon + "Menu" button → full-screen dark menu (sections expand with +, Subscribe + language at bottom, body scroll locked).
- **Footer** (paper background): logo, motto "Research. Policy. Transformation.", columns Work (Research, Policy, Insights, Projects) · Institute (Fellows, About, Opportunities, Media) · Contact (Contact us, info@rita.africa, Newsletter). Bottom bar: © year + registration no., Privacy · Cookies · Terms · Accessibility · Sitemap, social links (LinkedIn, X, YouTube, RSS), "Cookie settings".
- **Newsletter band** (ink) above the footer on most pages: email + consent + Subscribe.
- **Search overlay**: dark full-width panel, autofocused input, live suggestions after 3 characters (max 6), Enter → `/search?q=`, Esc closes.
- **Citation modal**: APA / Harvard / BibTeX tabs + Copy.
- All overlays: focus trap, Esc closes, focus returns to the trigger.
- Skip-to-content link, breadcrumbs below level 1, back-to-top after 2 screens, share bar (LinkedIn, X, Email, Copy link) on publication, insight and event pages. Reading-progress bar (2px sun) on insight articles.

## Sitemap / routes
```
/                                   Home
/research                           Research library (filters in query string)
/research/[programme]               4 programme pages
/research/publications/[slug]       Publication
/research/projects                  Projects
/research/projects/[slug]           Project
/policy                             Policy landing
/policy/briefs, /policy/briefs/[slug]
/insights                           Policy Insights series (tabs: Insights · Op-eds · Events · Newsletter archive)
/insights/[slug]                    Insight / op-ed article
/insights/events, /insights/events/[slug]
/fellows?group=leads|fellows|associates|alumni
/fellows/[slug]                     Profile
/about, /about/partners, /about/opportunities, /about/media
/contact?type=general|media|policy|partnerships|fellowship|website
/search?q=
/subscribe, /subscribe/confirm
/privacy, /cookies, /terms, /accessibility
/404, /500, /sitemap.xml, /rss.xml
```
French (phase 2): `/fr/...` mirror.

---

## Pages (see the matching slide for the wireframe)

**Home `/`**: 1 header · 2 hero: H1 "Evidence for Africa's next economy", intro, CTAs "Explore research" → /research and "Read Policy Insights" → /insights; on the right, a pinned featured publication (CMS `featured` flag) with image, type, title, authors · 3 Latest: 3 newest items of any type · 4 Programmes: 4 colour tiles · 5 Policy Insights: latest 4 · 6 Fellows & programme leads: 2 lead cards + newest fellows, “All fellows →” · 7 Track record: "Our team's work has been commissioned or published by" World Bank, AfDB, UNIDO, UNCTAD, UNU-WIDER, ACET, APRI, AERC (as text; logos only with permission) · 8 Newsletter band · 9 Footer.

**Research library `/research`**: page head with keyword search (debounce 300ms) · type chips (All, Journal, Report, Working paper, Policy brief, Op-ed) · left filter checkboxes: Programme, Region, Year, Author (OR within a group, AND across groups) · result count + sort (Newest/Oldest/A–Z) · rows: type (in programme colour), title, publisher, year → publication · 12 per page, `?page=` · all filter state lives in the URL · empty state.

**Programme `/research/[programme]`**: hero in the programme colour (number, name, description) · 3 key questions · 3 featured items · latest 6 outputs + "See all in library" (pre-filtered link) · researchers.

**Publication**: breadcrumb, programme + type tags, H1, authors (linked), publisher + year · buttons: Download PDF (if hosted), Read at publisher ↗ (new tab), Cite (modal) · optional hero image · summary (rich text) · aside: Key findings ×3 (sand), Cite, Share · related ×3 · newsletter band.

**Policy `/policy`**: dark header + hero "Evidence for the people who decide" · 3 cards: Commissioned research, Advisory & briefings, Policy dialogues · latest briefs · commissioners list · CTA "Work with us" → `/contact?type=policy`.

**Insights `/insights`**: dark hero "Policy Insights": issue count, description, Subscribe · tabs · topic chips including multi-part series (e.g. Green hydrogen, parts 1–5) · rows: No., title, read time, date, programme colour · 20 per page.

**Insight article**: tags (No., series part), H1, author, date, read time · 720px body (H2, lists, quotes, figures with captions, footnotes) · aside: series navigation, author card, share · previous/next issue · related · newsletter band.

**Projects**: filters (Ongoing/Completed/commissioner) · ongoing projects as large dark cards (status · period · funder, title, partners) · completed as rows (commissioner, title, output, year). Note on the page: includes team members' work from before RITA.

**Project**: tags, H1, summary · facts strip: Status, Period, Funder, Partners, Programme · description + outputs aside (linked publications) · team.

**People `/fellows`**: tabs (All, Programme leads, Fellows, Associates, Alumni) · programme-lead feature cards · portrait grid (4:5, programme-colour rule); only people who have given consent · Fellowship CTA band.

**Profile**: portrait + role, base, name, bio (≤120 words), focus tags, links (Email, LinkedIn, Google Scholar, ORCID, personal site) · tabs Publications / Insights / Projects / Media, built from tagged content · awards.

**Events**: tabs Upcoming / Past · rows: date, title, format + time with timezone, Register; past events show Recording / Slides · empty state.

**Event**: format tag, H1, Register + Add to calendar (.ics/Google) · facts: date, time + timezone, location (online link emailed after registration), language · about + speakers · registration form (see Forms) · form closes at capacity or once the event starts.

**About**: mission statement · image · Research. / Policy. / Transformation. columns · story + facts aside (founded, bases Johannesburg · Delft, legal status) · partners strip · sub-navigation (Partners, Opportunities, Media, Contact).

**Partners & funders**: funder logo grid (greyscale, colour on hover, permission required) · research partners · independence statement + funding breakdown · downloads (Funding policy PDF, Annual report PDF).

**Opportunities**: open positions (role, location, deadline, Apply) · fellowship description · register-interest form.

**Contact**: form + direct contacts (General info@, Media press@, Policy policy@, bases, social). Reply promise: 3 working days.

**Policy brief `/policy/briefs/[slug]`**: like Publication, but recommendations first: brief No. + programme tag, H1, authors, date · Download PDF (always), Underlying research ↗, Cite · sections The issue / What the evidence shows / Recommendations · aside with a recommendations summary, Cite, Share.

**Op-eds `/insights/op-eds`**: rows with outlet, title, date and programme colour; open the on-site copy if rights allow, otherwise the original ↗.

**Fellowship `/fellows/fellowship`**: pitch + Register interest / Apply CTA · Who / What / When (eligibility, benefits, timeline) · fellows' outputs · FAQ · current fellows grid.

**Position `/about/opportunities/[slug]`**: type tag, H1, summary · facts: Type, Location, Deadline, Reports to, Programme · role, requirements, how to apply · Apply box → form or external link · who you'll work with.

**Accessibility `/accessibility` + HTML sitemap `/sitemap`**: legal template; WCAG 2.2 AA commitment, known issues, feedback contact (access@); /sitemap lists every page as a nested list.

**Search `/search?q=`**: query box, type tabs with counts (All, Publications, Insights, Projects, People, Pages) · results: type, title, highlighted excerpt, date · 10 per page · no-results message with suggestions.

**404**: message, search box, links to Research / Insights / Contact. **500**: apology + home link. **Empty list**: one line + "Clear all filters".

**Legal**: one template for Privacy, Cookies, Terms and Accessibility: H1, last-updated date, sticky table of contents, numbered sections. Must comply with POPIA (South Africa) and GDPR (EU).

**Media `/about/media`**: press contact, "In the news" rows (outlet, headline, date, external link), press kit downloads (logo pack ZIP, brand guide PDF, bios + portraits ZIP, fact sheet PDF), experts by topic.

---

## Forms
All forms share these rules:
- Labels above fields; required fields marked with a laterite *.
- Validate on blur and on submit. Show an error summary at the top (focus moves to it, links to each field), plus a laterite 2px border and message under the field.
- Sending state: button disabled, label "Sending…", 15s timeout.
- Success: the form is replaced by a malachite confirmation, and an auto-reply email goes to the user.
- Server error: laterite banner; keep everything the user entered.
- Spam protection: honeypot + invisible Turnstile/hCaptcha.
- Consent checkbox linking to the Privacy policy.
- Store submissions in the CMS/DB and email the routed inbox.

Error copy: "Enter your [field]" · "Enter a valid email address" · "Message must be at least 20 characters" · "Tick the box to continue".

| Form | Where | Fields | Notes |
|---|---|---|---|
| Contact | /contact | Full name*, Email*, Organisation, Enquiry type* (General, Media, Policy & advisory, Partnerships, Fellowship, Website issue), Subject*, Message* (20–2000), Consent* | Routes by type to info@/press@/policy@/partners@/fellows@/web@; `?type=` preselects |
| Newsletter | footer band, header modal, /subscribe | Email*, First name, Lists (Policy Insights weekly, RITA News monthly, Events), Consent* | Double opt-in through the provider API (Brevo/Mailchimp/Buttondown); "Check your inbox" screen with resend after 60s; /subscribe/confirm |
| Event registration | event page | First name*, Last name*, Email*, Organisation*, Role, Country* (select), Attendance* (if hybrid), Accessibility needs, Consent* | Confirmation email with .ics |
| Register interest | /about/opportunities | Full name*, Email*, Country*, Programme of interest*, Career stage, CV (PDF ≤5MB), Short note (≤500), Consent* | Files stored privately, deleted after 12 months |

## Cookie consent
Bottom bar on first visit with Settings / Reject / Accept all. Essential cookies are always on; analytics are off by default. Load no analytics before consent. Store the choice for 12 months; "Cookie settings" in the footer reopens it.

---

## Content model (CMS)
Every type has: title, slug, SEO title/description, social image, published date, status.
- **Publication**: type (Journal, Report, Working paper, Policy brief, Background paper, Op-ed, Data), programmes[], authors[] (Person refs + external names), publisher/journal, year, DOI, summary (rich text), keyFindings[3], pdf, externalUrl, featured, project ref, regions[].
- **Insight**: series (Policy Insights / Op-ed), number, part/of, seriesGroup, authors[], programme, topics[], body (rich text, figures, footnotes), originalUrl, readTime (auto).
- **Event**: start/end + timezone, format, venue, city, onlineLink (private), speakers[], registrationOpen, capacity, recordingUrl, slides.
- **Project**: status, startYear, endYear, funder, partners[], programme, team[], description, outputs[] (Publication refs).
- **Person**: name, group (lead/fellow/associate/alumni), role, base, programme, bio, portrait, focusTags[], links, awards[], consent.
- **Programme**: number, name, colour, description, keyQuestions[3], featured[].
- **Partner**: name, logo, url, type (funder/partner), logoPermission.
- **Job**: title, type, location, deadline, description, applyUrl.
- **Page**: flexible blocks for About, Legal, etc.

## Seed content (real, from the team's public profiles)
- Featured: *Regionalizing Green Transition Minerals for Structural Transformation in Africa*, World Bank, 2025 (Ndubuisi, Avenyo, Owusu, Kassa).
- *Jobs, investments, and exporting: the real effects of electricity crisis in South Africa*, Energy Economics, 2026.
- *Dancing on the grid*, Energy Policy, 2025.
- *Global value chains and the innovativeness of firms in Africa*, Technovation, 2025.
- *Solar photovoltaic manufacturing in Africa: opportunity or mirage*, APRI, 2024.
- *Gendering green transition in Africa*, UNU-MERIT WP, 2026.
- UNCTAD EDAR 2023 background papers (Andreoni & Avenyo).
- Op-eds: OPEC Fund Quarterly 2026; Pan African Visions, July 2026.
- Policy Insights Nos. 1–45 (2026), currently on Gideon's LinkedIn; to be migrated.
- Projects: African Business and Society (DANIDA, 2026–2030); Critical minerals & structural transformation (Wits/SCIS/SARChI); UNU-WIDER SA-TIED electricity; APRI solar PV; ACET gender papers; UNIDO IDR 2026 background.
- Key findings, bios, portraits and legal details are [TBC] from the team.

## Technical (suggested; adapt as needed)
- Next.js (App Router) or Astro, TypeScript; headless CMS (Sanity, Payload or Decap); hosting on Vercel/Netlify; forms via serverless function + Resend.
- WCAG 2.2 AA; keyboard navigation; visible 3px sun focus ring; contrast ≥4.5:1; required alt text; respect reduced motion.
- Performance: LCP <2.5s on 3G, JS <150KB, responsive images (480/960/1600, WebP/AVIF, lazy below the fold), self-hosted fonts with `font-display: swap`.
- SEO: per-page meta + Open Graph; JSON-LD (Organization, Person, ScholarlyArticle, Event); sitemap.xml, robots.txt, canonical URLs, RSS for Insights.
- Analytics: Plausible/Fathom; events for PDF download, outbound publisher link, newsletter signup, form submit, search query.
- i18n: English at launch, French-ready.
- Favicon = R symbol; apple-touch-icon 180px.

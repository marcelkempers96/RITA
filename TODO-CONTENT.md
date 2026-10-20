# TODO-CONTENT: what the site still needs from the team

Every item here renders on the site as a visible yellow **TBC** marker, or as a ▣ photo placeholder, until it is supplied. Nothing was invented to fill these gaps. Sections follow the wireframe page numbers. See also `docs/brief/ASSETS-CHECKLIST.md`.

## Priority before launch
1. **Domain, inboxes and social handles.** All emails assume `rita.africa`. Set up info@, press@, policy@, partners@, fellows@, events@, editor@, jobs@, privacy@, access@ and web@, and reserve the LinkedIn, X and YouTube handles (then fill `SITE.social` in `src/lib/site.ts`).
2. **Legal entity, registration number and address** (footer, Privacy, Terms). Have the legal pages reviewed for POPIA and GDPR.
3. **Approval of all copy** by Gideon and Elvis (the About story, the mission, the bios marked "confirm").
4. **Author order** for every publication except the World Bank report (it drives the citations).
5. **Policy Insights texts.** Approval to migrate Nos. 1–45 from LinkedIn, then the bodies and the publication date of each issue.
6. **Portraits and bios.** Gideon and Elvis (4:5 portraits, 60- and 150-word bios, ORCID, Google Scholar, LinkedIn, email).
7. **Photo credits and licences.** 25 photos supplied by the team are now on the site (`src/assets/photos/`, listed in `scripts/photos.json`). Add the photographer `credit` (shown on the image) and `licence` for each, and confirm the right to use them, especially photos with visible brands (Coca-Cola, Kioo, KVOLT, MSC). Portraits of Gideon and Elvis and a photo of the founders together are still needed.
8. **Partner logo permissions.** Names show as text until `logoPermission.granted` is set.
9. **Key findings (3 bullets)** for the 8 flagship publications.
10. **Launch event** date, time and moderator.

## Global
- Footer: registration number.
- Footer and Contact: social handles (LinkedIn, X, YouTube).
- Form back-end: `PUBLIC_FORMS_ENDPOINT` (forms run in demo mode until it is set), the email provider for double opt-in, and the captcha (Turnstile or hCaptcha).
- Analytics: set `PUBLIC_PLAUSIBLE_DOMAIN` once the domain exists.
- Rich-text editor for submissions (TipTap) is deferred; the body field is a plain textarea that accepts Markdown.


## Research section (pages 02–04, 10–11, 27–28)


### 02 Research library `/research`
- Regions were assigned from titles/outlets during seeding; authors to confirm each publication's region tags.
- Publications without a year in CONTENT-SOURCES show "n.d." (e.g. ACET working paper, AERC GVC-11-007, STEG-CEPR WP 073, MPRA 106008, SSRN 4989817, World Bank Research Observer (forthcoming), several UNU-MERIT WPs, Centre LSD, INCLUDE, JRC). Supply years.
- Op-ed/brief months marked "Month to confirm" in the CMS (CCRED-IDTT briefs, AERC PB 2022/004).

### 03 Programme pages `/research/[programme]`
- Photography for each programme hero (ASSETS-CHECKLIST §4).
- Fellows per programme: placeholder "Fellow · TBC" cards until fellows consent to be listed.

### 04 Publication pages `/research/publications/[slug]` (every publication)
- **In brief**: plain-language summary (2–3 sentences). Present only for the World Bank minerals report and *Jobs, investments and exporting*; all others TBC.
- **Why it matters**: two paragraphs for policymakers [authors], all publications.
- **Key findings**: 3 bullets [authors], all publications (priority: the 8 flagship publications).
- **Data & methods**: one paragraph [authors], all publications.
- **Author order**: author order in the CMS follows the source tables (site owner first) and is unconfirmed (`authorOrderConfirmed: false`) for every publication except the World Bank report. It drives citations (APA/Harvard/BibTeX), so confirm before launch.
- Co-author first names/initials for citations: only known for the frequent co-authors list; others cite by surname only.
- PDFs: none hosted yet; "Download PDF" appears only when a PDF with publication rights is added.
- DOIs: only present where CONTENT-SOURCES gave a doi.org link.
- Optional hero images (16:6), e.g. "Factory during load-shedding" for *Jobs, investments and exporting*.

### 10 Projects `/research/projects`
- Year/period missing for most completed projects (shows "—").
- Project photography: "Business & society", "Mine site", others generic.
- Project summaries for projects other than ABS were drafted from their titles in the seed data; project teams to confirm.

### 11 Project pages `/research/projects/[slug]`
- **About the project** description: all projects [project team].
- **RITA's role**: all projects except the DSI STI grant (Co-PI) [TBC].
- Partners for most completed projects.

### 27 Search
- Excerpts depend on page text; insight bodies are still to be migrated, so Insights match on titles only.

### 28 Errors
- No content gaps.

## Policy & Insights pages

### /policy
- Hero photo: policy dialogue, roundtable or parliament (ASSETS-CHECKLIST §4).
- Partner logos for the track record wall (World Bank, UNCTAD, UNIDO, UNU-WIDER, ACET, APRI), only with written permission.

### /policy/briefs and /policy/briefs/[slug] (6 launch briefs)
- Authors, publication date, 3 recommendations (text + one-line why), "The issue", "What the evidence shows" and the 4-page PDF for each brief. All six render as "Forthcoming" until recommendations are added.
- Some external briefs have no link yet: "Implications of COVID-19 on digital transformation in South Africa", "Digital industrialisation of freshness", "Awakening industrial economic recovery in South Africa" (CCRED-IDTT).

### /insights and /insights/[slug] (45 issues)
- Full text of every issue, migrated from LinkedIn with Gideon's approval (body field). Read time is computed automatically once a body exists.
- Publication date of each issue (date field, YYYY-MM-DD). Until then pages show the year and the RSS feed uses 1 Jan 2026 for every item.
- Per-issue LinkedIn URLs (originalUrl currently points to the Policy Insights index on Gideon's site).
- Hero images per issue (featured block: parliament / ministry; green hydrogen: electrolyser or wind farm).

### /insights/op-eds
- Missing outlet link: "Beyond load shedding" (The Argument, Oct 2026). Link is on Gideon's site.
- Months to confirm for items where the source gives only a year (flagged in the op-ed's `note` field).
- Three topical op-ed images.

### /insights/events and /insights/events/[slug]
- Launch event: date, start time and timezone (datetime field), moderator name. Add to calendar (.ics / Google) appears once the date is set.
- Event photo.
- Later events (webinar on regional mineral value chains, Johannesburg dialogue on electricity and manufacturing, solar PV brief launch) are suggestions only: add them when confirmed.

### /insights/newsletter
- Archive links from the email provider once the first issue is sent.

### /subscribe
- Connect the email provider (double opt-in) via PUBLIC_FORMS_ENDPOINT and set its confirmation redirect to /subscribe/confirm.
- Welcome email (WEBSITE-CONTENT §25) to be set up in the provider.

## Fellows, About, Opportunities, Contact, Media

### /fellows
- Fellows, Associates and Alumni: nobody listed yet (only people with `consentToList`). Add entries in `src/content/people/` with written consent.
- Portraits for Gideon Ndubuisi and Elvis Korku Avenyo (4:5, ASSETS-CHECKLIST §3).

### /fellows/[slug] (profiles)
- Gideon Ndubuisi: bio marked **[confirm]** in WEBSITE-CONTENT §13.
- Both profiles: Email, LinkedIn, Google Scholar and ORCID links missing (only personal sites known).
- Both profiles: portrait photo.
- Author order on co-authored publications is unconfirmed (shown in the Publications tab).

### /fellows/fellowship
- Who: eligibility details **[TBC]**.
- What: stipend, mentoring and publication support package **[TBC]**.
- When: call opening date and decision date **[TBC]**.
- FAQ answers: "Can I apply from outside Africa?" and "Is the fellowship remote?" **[TBC]**; "What languages can I work in?" English and French **[confirm]**.
- Current fellows grid: first cohort **[TBC]**.
- Photo: researchers at work / seminar.

### /about
- Our story: founders to edit (WEBSITE-CONTENT §17).
- Facts: founded date and legal status **[TBC]**.
- Photos: team / fieldwork; founders together.

### /about/partners
- Independence statement: legal review.
- How we are funded: annual breakdown.
- Downloads: Funding policy PDF, Annual report PDF.
- Logos: none approved yet; names shown as text until `logoPermission.granted` (ASSETS-CHECKLIST §5). IFC relationship "Gideon to confirm".

### /about/opportunities and /about/opportunities/[slug]
- Research Associate, Transition minerals: publish only if the role is real (WEBSITE-CONTENT §19).
- Call for contributions: "Reports to" **[TBC]**.

### /contact
- Domain **[TBC]**: all inboxes (info@, press@, policy@, partners@, fellows@, web@) assume rita.africa.
- Social handles (LinkedIn, X, YouTube) **[TBC]**.

### /about/media
- Press kit downloads: Logo pack ZIP, Brand guide PDF, Bios & portraits ZIP, Fact sheet PDF.

## Contribute, legal, static assets, CMS

### /submit (22)
- Hero photo: writing / workshop shot (▣ placeholder).

### /submit/new (23)
- Sign-in, storage, editorial workflow and notifications: separate back-end. Connect `PUBLIC_SUBMISSIONS_API` (see `src/lib/api/submissions.ts` for the endpoints); until then the form runs in demo mode and stores drafts in the browser only.
- Author field: prefill from the signed-in account [TBC].
- Rich-text editor: the body is a plain textarea with markdown hints. TipTap (bold, italic, H2/H3, quote, lists, link, image, footnote, as in the wireframe) was left out to keep page JS under budget; add it if editors need it.
- Server-side validation of uploads (.docx/PDF type, image ≤10MB) and virus scanning: back-end.

### /submit/dashboard (24)
- "Signed in as {name}" [TBC]: needs sign-in.
- View / Edit actions for submitted pieces need the back-end (in demo mode only drafts can be continued).
- Confirmation email ("We've emailed you a copy"): back-end.

### /privacy (29)
- Last-updated date [TBC].
- Legal entity, registration number and address [TBC].
- Lawful bases, retention periods and processors [TBC].
- Full wording of rights under POPIA and GDPR [TBC].
- Lawyer review (POPIA + GDPR) before launch; remove the draft notice afterwards (`draftNotice={false}`).

### /cookies (29)
- Last-updated date [TBC].
- Cookie names and durations (session, consent, Plausible) [TBC].
- Lawyer review.

### /terms (29)
- Last-updated date [TBC].
- Legal entity and governing law [TBC].
- Content licence: CC BY 4.0 for RITA's own text [confirm].
- Third-party publications under the publisher's terms [confirm].
- Terms for contributions submitted through /submit [TBC].
- Lawyer review.

### /accessibility (30)
- Last-updated date [TBC].
- Known issues list [TBC] (fill in after the accessibility audit).

### Static assets
- Favicons, apple-touch-icon and `og-default.png` were rendered from the R symbol and white logo; replace with designer-exported files if available (ASSETS-CHECKLIST §1).
- `robots.txt` and `/admin` assume the domain `rita.africa` [domain TBC].

### CMS (/admin)
- Choose the auth backend: git-gateway (Netlify Identity) is configured; the GitHub backend alternative is commented in `public/admin/config.yml`. Invite editors.
- Media uploads go to `public/uploads`.

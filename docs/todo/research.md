# TODO content: Research section (pages 02–04, 10–11, 27–28)

Every item below renders as a visible `TBC` placeholder on the site until the content is supplied.

## 02 Research library `/research`
- Regions were assigned from titles/outlets during seeding; authors to confirm each publication's region tags.
- Publications without a year in CONTENT-SOURCES show "n.d." (e.g. ACET working paper, AERC GVC-11-007, STEG-CEPR WP 073, MPRA 106008, SSRN 4989817, World Bank Research Observer (forthcoming), several UNU-MERIT WPs, Centre LSD, INCLUDE, JRC). Supply years.
- Op-ed/brief months marked "Month to confirm" in the CMS (CCRED-IDTT briefs, AERC PB 2022/004).

## 03 Programme pages `/research/[programme]`
- Photography for each programme hero (ASSETS-CHECKLIST §4).
- Fellows per programme: placeholder "Fellow · TBC" cards until fellows consent to be listed.

## 04 Publication pages `/research/publications/[slug]` (every publication)
- **In brief**: plain-language summary (2–3 sentences). Present only for the World Bank minerals report and *Jobs, investments and exporting*; all others TBC.
- **Why it matters**: two paragraphs for policymakers [authors], all publications.
- **Key findings**: 3 bullets [authors], all publications (priority: the 8 flagship publications).
- **Data & methods**: one paragraph [authors], all publications.
- **Author order**: author order in the CMS follows the source tables (site owner first) and is unconfirmed (`authorOrderConfirmed: false`) for every publication except the World Bank report. It drives citations (APA/Harvard/BibTeX), so confirm before launch.
- Co-author first names/initials for citations: only known for the frequent co-authors list; others cite by surname only.
- PDFs: none hosted yet; "Download PDF" appears only when a PDF with publication rights is added.
- DOIs: only present where CONTENT-SOURCES gave a doi.org link.
- Optional hero images (16:6), e.g. "Factory during load-shedding" for *Jobs, investments and exporting*.

## 10 Projects `/research/projects`
- Year/period missing for most completed projects (shows "—").
- Project photography: "Business & society", "Mine site", others generic.
- Project summaries for projects other than ABS were drafted from their titles in the seed data; project teams to confirm.

## 11 Project pages `/research/projects/[slug]`
- **About the project** description: all projects [project team].
- **RITA's role**: all projects except the DSI STI grant (Co-PI) [TBC].
- Partners for most completed projects.

## 27 Search
- Excerpts depend on page text; insight bodies are still to be migrated, so Insights match on titles only.

## 28 Errors
- No content gaps.

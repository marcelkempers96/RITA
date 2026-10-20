# RITA website: assets checklist (what to download, request or create)

Tick each item off as it arrives. Store everything in a shared folder `RITA-website-assets/` with the subfolders below.

## 1. Brand files: `/brand` (ready, in this project)
- [x] `rita-logo-black.svg`, `rita-logo-white.svg` (full logo, with the Africa map in the R; traced to vector from the supplied artwork)
- [x] `rita-symbol-black.svg`, `rita-symbol-white.svg` (R symbol)
- [ ] Favicon set, made from the R symbol: `favicon.ico` (32), `icon.svg`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`
- [ ] Default social share image, 1200×630 PNG: ink background, white logo, motto
- [ ] Email header for the newsletter, 600×120 PNG (black logo on white)
- [ ] Logo pack ZIP for the Media page (SVG + PNG at 512/1024/2048, black + white)
- [ ] One-page brand guide PDF (logo, colours, type) for the press kit

## 2. Fonts: `/fonts` (free download)
- [ ] IBM Plex Sans 400, 500, 600 (WOFF2): https://github.com/IBM/plex/releases or https://fonts.google.com/specimen/IBM+Plex+Sans
- [ ] IBM Plex Mono 400, 500 (WOFF2): https://fonts.google.com/specimen/IBM+Plex+Mono
- License: SIL Open Font License, free for web use.

## 3. Portraits: `/people` (request from each person)
Spec: 4:5 portrait, at least 1600×2000px, JPG; natural light, plain or blurred background, shoulders up, eyes to camera. Send a signed photo release with each.
- [ ] Gideon Ndubuisi
- [ ] Elvis Korku Avenyo
- [ ] Every fellow or associate listed, but only with their written consent to appear
- [ ] Optional: a candid two-shot of Gideon and Elvis working together (About page story)

Also from each person: a 60-word and a 150-word bio, role title, ORCID, Google Scholar and LinkedIn URLs, preferred email.

## 4. Photography: `/photos`
Spec: landscape, at least 2400px wide, JPG. Must show real African places, firms and people (no generic stock "handshake" shots). Record a credit and licence for each photo.
| Where it's used (wireframe) | Shot needed | Qty |
|---|---|---|
| Home hero (01) | Mineral processing, refinery or smelter in Africa | 1 |
| Home "Latest" cards (01) | Factory floor; policymakers in discussion; solar panel assembly | 3 |
| Home Policy Insights split (01) | Port / logistics / container terminal | 1 |
| Programme heroes (03) | One each: industrial park (Industrialisation) · copper/cobalt/lithium processing (Minerals) · power station, grid or solar farm (Energy) · workshop, maker space or informal enterprise (Innovation) | 4 |
| Publication hero (04) | Factory during load-shedding / generator | 1 |
| Policy hero (05) | Policy dialogue, roundtable or parliament | 1 |
| Insight article hero (08) | Wind farm or electrolyser (green hydrogen) | 1 |
| Op-ed cards (09) | Three topical images | 3 |
| Project cards (10–11) | Business & society; mine site | 2 |
| Fellowship hero (14) | Researchers at work / seminar | 1 |
| Events (15–16) | Event or audience | 1–2 |
| About hero + story (17) | Team / fieldwork; founders together | 2 |
| Submit hero (22) | Writing / workshop | 1 |
| Mobile home (32) | Re-use the home hero crop | — |
| **Total** | | **~24** |

Free sources with African imagery (check each licence; Unsplash and Pexels need no fee, but credit is good practice):
- Unsplash / Pexels: search "Johannesburg factory", "Lagos port", "solar farm Morocco", "copper mine Zambia", "Kenya workshop"
- World Bank Flickr (CC BY-NC-ND, credit required): https://www.flickr.com/photos/worldbank/
- UN Photo, UNIDO and AfDB media libraries (ask permission)
- **Best option:** commission a photographer for one day in Johannesburg (UJ campus, a manufacturer, a SARChI seminar).

## 5. Partner / funder logos: `/partners` (permission needed)
Ask each organisation's communications team. Ask for: the official logo (SVG preferred) and written permission to show it as "organisations our team's work has been commissioned or funded by". Log the date and contact in the CMS (`logoPermission`).
| Organisation | Relationship | Contact route |
|---|---|---|
| World Bank | Commissioned minerals report 2025 | Task team leader (Woubet Kassa) → WB comms |
| UNCTAD | EDAR 2023 background papers | Report team |
| UNIDO | IDR 2026 background; industrial diagnostic; policy brief | IDR team |
| UNU-WIDER | SA-TIED research | Programme manager |
| ACET | African Transformation Report gender papers | Comms |
| APRI | Solar PV policy paper | Comms |
| AERC | GVC & digital tech grants, policy briefs | Comms |
| African Development Bank | AEO 2024 contribution | Comms |
| DANIDA | ABS project funder | Via Copenhagen Business School |
| DSI South Africa | STI research grant | Via SARChI ID |
| European Commission (JRC) | Contribution | JRC publications |
| IFC | Prior work (Gideon) | Gideon to confirm |
| OPEC Fund | Op-ed published (media, not funder: list under Media) | — |
| Academic: University of Johannesburg, TU Delft, UNU-MERIT, Copenhagen Business School, Univ. of Ghana, Univ. of Nairobi, Wits (SCIS, Mining Institute), Oxford TMCD | Affiliations / partners | University brand offices |

Until permission arrives, show **names as text** (already in the wireframes).

## 6. Documents: `/docs`
- [ ] PDFs of each publication **only where the publisher allows** (working papers usually yes; journal articles: link only, or the author's accepted manuscript where the journal policy allows; check on Sherpa Romeo https://openpolicyfinder.jisc.ac.uk)
- [ ] Policy brief PDFs (RITA's own; design a 4-page template)
- [ ] Press fact sheet (1 page)
- [ ] Funding policy + annual report (when available)
- [ ] Privacy policy, cookie policy, terms (have them reviewed for POPIA + GDPR)

## 7. Report covers & figures: `/figures`
- [ ] Cover image of the World Bank minerals report (ask WB for permission, or use a RITA-designed tile)
- [ ] 1–2 key charts per flagship paper, redrawn in RITA colours (SVG), for publication pages and social posts

## 8. Accounts & services to set up
- [ ] Domain (e.g. rita.africa / rita-institute.org) + DNS
- [ ] Email inboxes: info@, press@, policy@, partners@, fellows@, events@, editor@, jobs@, privacy@, access@
- [ ] Hosting (Vercel/Netlify), CMS (Sanity), email provider (Brevo/Mailchimp), analytics (Plausible)
- [ ] Social handles: LinkedIn page, X, YouTube (reserve the same name everywhere)
- [ ] Google Search Console + Bing Webmaster

## 9. From Gideon & Elvis (one email)
- Portraits + bios + links (above)
- Approval to migrate the 45 Policy Insights from LinkedIn
- Approval of the About copy and mission
- Key findings (3 bullets) for the 8 flagship publications
- List of co-authors to invite as associates
- Confirmation of which past funders may be named

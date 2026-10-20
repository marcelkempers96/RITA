# TODO content: Policy & Insights pages

## /policy
- Hero photo: policy dialogue, roundtable or parliament (ASSETS-CHECKLIST §4).
- Partner logos for the track record wall (World Bank, UNCTAD, UNIDO, UNU-WIDER, ACET, APRI), only with written permission.

## /policy/briefs and /policy/briefs/[slug] (6 launch briefs)
- Authors, publication date, 3 recommendations (text + one-line why), "The issue", "What the evidence shows" and the 4-page PDF for each brief. All six render as "Forthcoming" until recommendations are added.
- Some external briefs have no link yet: "Implications of COVID-19 on digital transformation in South Africa", "Digital industrialisation of freshness", "Awakening industrial economic recovery in South Africa" (CCRED-IDTT).

## /insights and /insights/[slug] (45 issues)
- Full text of every issue, migrated from LinkedIn with Gideon's approval (body field). Read time is computed automatically once a body exists.
- Publication date of each issue (date field, YYYY-MM-DD). Until then pages show the year and the RSS feed uses 1 Jan 2026 for every item.
- Per-issue LinkedIn URLs (originalUrl currently points to the Policy Insights index on Gideon's site).
- Hero images per issue (featured block: parliament / ministry; green hydrogen: electrolyser or wind farm).

## /insights/op-eds
- Missing outlet link: "Beyond load shedding" (The Argument, Oct 2026). Link is on Gideon's site.
- Months to confirm for items where the source gives only a year (flagged in the op-ed's `note` field).
- Three topical op-ed images.

## /insights/events and /insights/events/[slug]
- Launch event: date, start time and timezone (datetime field), moderator name. Add to calendar (.ics / Google) appears once the date is set.
- Event photo.
- Later events (webinar on regional mineral value chains, Johannesburg dialogue on electricity and manufacturing, solar PV brief launch) are suggestions only: add them when confirmed.

## /insights/newsletter
- Archive links from the email provider once the first issue is sent.

## /subscribe
- Connect the email provider (double opt-in) via PUBLIC_FORMS_ENDPOINT and set its confirmation redirect to /subscribe/confirm.
- Welcome email (WEBSITE-CONTENT §25) to be set up in the provider.

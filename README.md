# RITA website

Public website for **RITA, the Research Institute for Transitions in Africa**. *Research. Policy. Transformation.*

Built with [Astro](https://astro.build) and TypeScript as a static site. All content lives in the repo as JSON files (one per entry) and can be edited through Decap CMS at `/admin`. Search uses [Pagefind](https://pagefind.app), which builds a static index, so there is no server to run.

The brief this site was built from is in [`docs/brief/`](docs/brief/): build spec, page copy, content sources, assets checklist and the original handoff README. Content still needed from the team is listed in [`TODO-CONTENT.md`](TODO-CONTENT.md).

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static build to dist/, then the Pagefind index
npm run preview    # serve dist/ locally (search works here, not in dev)
npm run check      # type-check .astro and .ts files
```

Node 22 or later.

## Environment variables

Copy `.env.example` to `.env`. Every variable is optional.

| Variable | Purpose |
|---|---|
| `SITE_URL` | Canonical origin for sitemap, RSS, canonical and Open Graph URLs. Default `https://rita.africa`. |
| `PUBLIC_FORMS_ENDPOINT` | Base URL of the form back-end. Each form posts `multipart/form-data` to `${PUBLIC_FORMS_ENDPOINT}/<form>` (`contact`, `newsletter`, `event`, `interest`, `fellowship`). **When unset, forms run in demo mode**: they validate and show the success state but send nothing. Use `fail@example.com` as the email to preview the server-error state. |
| `PUBLIC_SUBMISSIONS_API` | Base URL of the contributor API (`POST /api/submissions`, see `src/lib/api/submissions.ts`). When unset, submissions are stored in the browser's localStorage. |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Enables Plausible analytics, loaded only after the visitor accepts analytics cookies. |

## Project structure

```
src/
  content/            one JSON file per entry: publications, insights, opeds, briefs, projects,
                      people, programmes, partners, events, jobs
  content.config.ts   content model (zod schemas, BUILD-SPEC §5)
  pages/              one file per route (full list at /sitemap)
  layouts/Base.astro  <head>, SEO, JSON-LD, header, newsletter band, footer, cookie banner
  components/         shared UI: Header, Footer, Card, ListRow, ProgrammeTiles, PersonCard, Photo, Tbc…
  lib/content.ts      content helpers: programme lookup, author formatting, URLs, library index
  lib/cite.ts         APA / Harvard / BibTeX
  lib/api/            form and submission transports (stubs until the back-end exists)
  scripts/site.ts     overlays (menu, search, newsletter), cookie consent, progress bar, tabs
  scripts/forms.ts    shared validation, error summary, sending/success/error states, autosave
  styles/global.css   design tokens and components
scripts/seed.mjs      writes src/content/** from scripts/seed-data.mjs
public/admin/         Decap CMS
public/brand/         logo SVGs
docs/brief/           the original brief
```

## Content

Content was seeded from `docs/brief/CONTENT-SOURCES.md` by `scripts/seed-data.mjs`:

```bash
npm run seed            # writes only missing files, so CMS edits are kept
npm run seed -- --force # overwrite everything from seed-data.mjs
```

Edit content either in `src/content/**` directly or via **Decap CMS** at `/admin` once it is connected:

- **Netlify:** enable Identity and Git Gateway; the default `backend: git-gateway` in `public/admin/config.yml` then works.
- **Elsewhere:** switch to the GitHub backend shown in the comment in `config.yml` and set up an OAuth app.

Rules the content follows:

- **Nothing is invented.** Unknown details render as a visible yellow **TBC** marker and are listed in `TODO-CONTENT.md`.
- Each item carries one programme colour: `IND` malachite, `MIN` laterite, `EN` sun, `INN` ink.
- Partner logos appear only when `logoPermission.granted` is `true` and a `logo` is set; until then the name is shown as text.
- People appear only when `consentToList` is `true`.
- Publications link to the publisher ("Read at publisher ↗"). Add a `pdf` only where the publisher allows re-hosting.
- Policy Insight bodies are empty until the texts are migrated from LinkedIn with Gideon's approval. Add them as Markdown in each insight's `body` field.

### Photography

Every photo slot renders a ▣ placeholder captioned with the shot needed (see `ASSETS-CHECKLIST.md §4`). To use a real image, pass `src`, `alt` and `credit` to `<Photo>` (or set the entry's image field), and put the files in `public/uploads/`.

## Forms

All forms share `src/scripts/forms.ts`: labels above fields, validation on blur and submit, an error summary that takes focus and links to each field, `aria-invalid`, a "Sending…" state with a 15s timeout, a success message that replaces the form, a server-error banner that keeps the user's input, and a honeypot field named `website`. They are progressively enhanced. Without JavaScript the newsletter band falls back to `/subscribe?email=…`.

The back-end (to build separately) should, for each form: validate again on the server, rate-limit, verify the invisible captcha (Turnstile/hCaptcha), store the entry, email the routed inbox and send the auto-reply. Contact routing by enquiry type is in `src/lib/api/forms.ts` (`CONTACT_ROUTES`). The newsletter uses the email provider's double opt-in API (Brevo, Mailchimp or Buttondown).

## Deploy

**Netlify:** connect the repo. `netlify.toml` sets the build command (`npm run build`), the publish directory (`dist`) and cache headers.

**Vercel:** import the repo. `vercel.json` sets the same.

Set `SITE_URL` to the live domain. After the first deploy, submit `https://<domain>/sitemap-index.xml` to Google Search Console and Bing Webmaster Tools.

## Accessibility and performance

The target is WCAG 2.2 AA and Lighthouse 95+. See [`docs/ACCESSIBILITY-PERFORMANCE.md`](docs/ACCESSIBILITY-PERFORMANCE.md) for what was checked and what remains.

## French (phase 2)

Astro i18n is configured with `en` (default, no prefix) and `fr` (`/fr/…`). The header shows EN | FR, with FR disabled until translations exist.

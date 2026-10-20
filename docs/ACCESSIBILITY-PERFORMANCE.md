# Accessibility and performance report

Tested on 20 October 2026 against a production build (`npm run build`, served with `astro preview`). Placeholders stand in for photography, so re-run these checks once the real images arrive.

## Summary

| Check | Result |
|---|---|
| axe-core 4 (WCAG 2.0/2.1/2.2 A and AA + best practice), 37 pages | **0 violations** |
| Lighthouse 12, mobile emulation, 12 pages | Performance 99–100 · Accessibility 100 · Best practices 100 · SEO 100 |
| Largest Contentful Paint (Lighthouse, slow 4G) | 0.9–1.7 s (target < 2.5 s) |
| Cumulative Layout Shift | 0–0.025 |
| JavaScript per page | 11–21 KB (minified, before gzip); target < 100 KB |
| Horizontal scroll at 390px | none, on the 22 pages swept |
| `astro check` (types) | 0 errors, 0 warnings |

`/submit/new` and `/submit/dashboard` score 69 for SEO only because they are deliberately `noindex`.

### Lighthouse by page

| Page | Perf | A11y | BP | SEO | LCP |
|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 | 1.3 s |
| `/research` | 100 | 100 | 100 | 100 | 1.5 s |
| `/research/projects` | 100 | 100 | 100 | 100 | — |
| `/research/publications/jobs-investments-…` | 100 | 100 | 100 | 100 | 1.3 s |
| `/insights` | 100 | 100 | 100 | 100 | 0.9 s |
| `/insights/events` | 100 | 100 | 100 | 100 | — |
| `/policy` | 100 | 100 | 100 | 100 | 1.2 s |
| `/fellows` | 99 | 100 | 100 | 100 | — |
| `/fellows/gideon-ndubuisi` | 100 | 100 | 100 | 100 | 1.7 s |
| `/contact` | 100 | 100 | 100 | 100 | 1.7 s |
| `/submit/new` | 100 | 100 | 100 | 69 (noindex) | 1.7 s |

## Fixed during testing

- **Colour contrast.** Several elements fell below 4.5:1:
  - grey text (`--mute`) on sand boxes;
  - text dimmed with opacity on the laterite tiles and the programme heroes;
  - breadcrumbs on the dark heroes.

  All of these now use full-strength colours.
- **Layout shift on `/research`.** The library rendered every item and then collapsed to 12 once JavaScript ran (CLS 0.14). An inline `js` class on `<html>` now lets CSS show the JavaScript-only controls and the first page of results from the first paint (CLS 0.02).
- **Missed clicks after an error.** Error messages were cleared on blur, so the page moved under the pointer and the next click could miss. They now clear as soon as the input becomes valid.
- **Focus in overlays.** The search overlay now focuses its input on open, not the close button.
- **Duplicate IDs.** Forms that appear twice on a page (newsletter band and modal) now give each field a unique id for its error message and summary link.

## What is in place (WCAG 2.2 AA)

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, breadcrumbs with `aria-current`.
- Visible focus everywhere: a 3px sun outline with a 2px offset.
- Overlays (menu, search, newsletter, cite) trap focus, close with Esc, return focus to their trigger and set `aria-modal`.
- In-page tabs use `role="tablist"` with arrow, Home and End keys. Tabs that change the URL are plain links.
- Forms:
  - labels are always visible and required fields are marked;
  - validation runs on blur and on submit;
  - an error summary takes focus and links to each field;
  - `aria-invalid` and `aria-describedby` point to each field's message;
  - inputs are 16px with the right `inputmode` and `autocomplete`.
- Respects `prefers-reduced-motion`. Text reflows at 400% zoom (single column below 600px).
- Links that open in a new tab say so to screen readers. Decorative colour squares and placeholders are `aria-hidden`.
- Works without JavaScript:
  - all content and links render;
  - the library shows every item;
  - overlays fall back to their pages (`/search`, `/subscribe`).

## Still to check (needs people or real content)

- **Screen readers.** Test the key journeys with NVDA (Windows) and VoiceOver (macOS and iOS): subscribe, contact, event registration and the four-step submission.
- **Real photography.** Check that it keeps LCP under 2.5 s. Use `<Photo>` with AVIF/WebP, `srcset` and lazy loading below the fold, and require alt text and credits in the CMS.
- **Captions** on any future video.
- **Known issues** for the `/accessibility` statement, once testing is done.
- **Lighthouse on the live domain** after deploy, including the CDN and the real fonts' cache headers.
- **Third-party scripts.** Plausible loads only after consent; re-check performance once it is enabled.

## How to re-run

```bash
npm run build && npx astro preview --port 4330
# axe: inject node_modules/axe-core/axe.min.js with Playwright and call axe.run()
# Lighthouse: npx lighthouse http://localhost:4330/ --chrome-flags="--headless=new"
```

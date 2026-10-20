# TODO: Contribute, legal, static assets, CMS

## /submit (22)
- Hero photo: writing / workshop shot (▣ placeholder).

## /submit/new (23)
- Sign-in, storage, editorial workflow and notifications: separate back-end. Connect `PUBLIC_SUBMISSIONS_API` (see `src/lib/api/submissions.ts` for the endpoints); until then the form runs in demo mode and stores drafts in the browser only.
- Author field: prefill from the signed-in account [TBC].
- Rich-text editor: the body is a plain textarea with markdown hints. TipTap (bold, italic, H2/H3, quote, lists, link, image, footnote, as in the wireframe) was left out to keep page JS under budget; add it if editors need it.
- Server-side validation of uploads (.docx/PDF type, image ≤10MB) and virus scanning: back-end.

## /submit/dashboard (24)
- "Signed in as {name}" [TBC]: needs sign-in.
- View / Edit actions for submitted pieces need the back-end (in demo mode only drafts can be continued).
- Confirmation email ("We've emailed you a copy"): back-end.

## /privacy (29)
- Last-updated date [TBC].
- Legal entity, registration number and address [TBC].
- Lawful bases, retention periods and processors [TBC].
- Full wording of rights under POPIA and GDPR [TBC].
- Lawyer review (POPIA + GDPR) before launch; remove the draft notice afterwards (`draftNotice={false}`).

## /cookies (29)
- Last-updated date [TBC].
- Cookie names and durations (session, consent, Plausible) [TBC].
- Lawyer review.

## /terms (29)
- Last-updated date [TBC].
- Legal entity and governing law [TBC].
- Content licence: CC BY 4.0 for RITA's own text [confirm].
- Third-party publications under the publisher's terms [confirm].
- Terms for contributions submitted through /submit [TBC].
- Lawyer review.

## /accessibility (30)
- Last-updated date [TBC].
- Known issues list [TBC] (fill in after the accessibility audit).

## Static assets
- Favicons, apple-touch-icon and `og-default.png` were rendered from the R symbol and white logo; replace with designer-exported files if available (ASSETS-CHECKLIST §1).
- `robots.txt` and `/admin` assume the domain `rita.africa` [domain TBC].

## CMS (/admin)
- Choose the auth backend: git-gateway (Netlify Identity) is configured; the GitHub backend alternative is commented in `public/admin/config.yml`. Invite editors.
- Media uploads go to `public/uploads`.

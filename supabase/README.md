# Back-end setup (Supabase)

The website stays a fast static site. Supabase adds:

- **Accounts** for Gideon, Elvis, fellows and contributors (email + password, or a sign-in link).
- **Submissions** from *Publish with RITA* (`/submit`), with file uploads and editor comments.
- **The Studio** (`/studio/`) to review submissions and edit every publication, Policy Insight, op-ed, brief, project, person, event and partner.
- **Publish website**: rebuilds the public site from Supabase, so edits go live in a few minutes.

Only the **publishable key** is used by the website. Row-level security in `schema.sql` decides who can read and write what. **Never put the secret key (`sb_secret_…`) in the website, the repo or any environment variable of the site.**

## 1. Create the database (5 minutes)

In Supabase → **SQL Editor**:

1. Open `supabase/schema.sql`, paste it all, press **Run**.
2. Open `supabase/seed.sql`, paste it all, press **Run**. This loads all current site content (215 items).

Both files are safe to run again. Re-running the seed updates content back to the version in the repo, so don't re-run it after people start editing in the Studio.

## 2. Configure sign-in

Supabase → **Authentication**:

- **Sign In / Providers** → Email: enabled. Decide whether "Confirm email" stays on (recommended).
- **URL Configuration**:
  - Site URL: the live address, e.g. `https://rita-woad.vercel.app` (later `https://rita.africa`).
  - Redirect URLs: add every address the site runs on, each followed by `/studio/`, e.g.
    - `https://rita-woad.vercel.app/studio/`
    - `https://marcelkempers96.github.io/RITA/studio/`
    - `http://localhost:4321/studio/`

## 3. Connect the website

The site needs two **public** values:

| Name | Where to find it |
|---|---|
| `PUBLIC_SUPABASE_URL` | Project Settings → Data API → Project URL, e.g. `https://abcd1234.supabase.co` |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → publishable key (`sb_publishable_…`) |

Set them on each host:

- **Vercel**: Project → Settings → Environment Variables (Production and Preview), then redeploy.
- **GitHub Pages**: repo → Settings → Secrets and variables → Actions → **Variables** tab → New repository variable (both names).
- **Local**: copy `.env.example` to `.env` and fill them in.

## 4. Make yourself admin

1. Open `/studio/` on the site and **Create an account**.
2. In the SQL Editor run (with your email):
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Reload `/studio/`. You now see **Submissions**, **Content**, **Users** and **Publish website**.

From then on, everything is done in the Studio → **Users**:

- **editor**: edits all content, reviews submissions, publishes the site (e.g. Gideon, Elvis).
- **fellow**: edits their own work. Link them to their profile, then press **Link work** to give them every item they authored.
- **contributor**: submits pieces and follows their status (the default for new accounts).

## 5. The "Publish website" button

The public site is rebuilt from Supabase when an editor presses **Publish website**. It calls a deploy hook stored in the Supabase Vault. Set one, or both (SQL Editor):

**Vercel** (Project → Settings → Git → Deploy Hooks → create one for the production branch):
```sql
select vault.create_secret('https://api.vercel.com/v1/integrations/deploy/…', 'deploy_hook_url');
```

**GitHub Pages** (a fine-grained personal access token for `marcelkempers96/RITA` with **Contents: Read and write** permission, which is what the dispatch API requires):
```sql
select vault.create_secret('github_pat_…', 'github_token');
```

To change a secret later: `select vault.update_secret((select id from vault.secrets where name = 'deploy_hook_url'), 'new value');`

## How content flows

```
Studio edit ─► public.content (Supabase) ─► "Publish website" ─► site rebuild reads published rows ─► live
```

- Drafts (status *draft*) never appear on the site.
- Every save is kept in `content_revisions`, so any change can be rolled back.
- If Supabase is unreachable during a build, the site builds from the JSON files in `src/content/` instead. A single invalid item is skipped and named in the build log; the rest of the site still publishes.
- To refresh the JSON fallback from Supabase later, export the `content` table, or ask a developer to add an export script.

## Tables

| Table | What it holds |
|---|---|
| `profiles` | One row per account: name, role, linked person, author surname |
| `content` | Every item on the site (`collection`, `slug`, `data` JSON, `status`, `owners`) |
| `content_revisions` | Previous versions of every edited item |
| `submissions` | Pieces sent through *Publish with RITA* |
| `submission_comments` | Editor ↔ author comments on a submission |
| `site_publishes` | Log of website publishes |
| Storage `submissions` | Private uploads (Word/PDF, header images), per user folder |
| Storage `media` | Public images and PDFs used on the site |

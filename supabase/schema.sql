-- RITA website back-end schema for Supabase.
-- Run once in Supabase → SQL Editor (paste and Run). Safe to re-run: it uses IF NOT EXISTS / OR REPLACE.
-- Then run supabase/seed.sql to load the current website content.

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions
create extension if not exists pg_net with schema extensions;   -- lets the database call the deploy hook

-- ─────────────────────────────────────────────────────────────────────────────
-- Profiles and roles
--   admin      everything, including user roles
--   editor     edit all content, review all submissions, publish the website
--   fellow     edit content they own (their publications, insights…), submit pieces
--   contributor  submit pieces and follow their status
do $$ begin
  create type public.user_role as enum ('admin', 'editor', 'fellow', 'contributor');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role public.user_role not null default 'contributor',
  person_slug text,            -- links the account to a person on the site, e.g. 'gideon-ndubuisi'
  author_key text,             -- surname used in author lists, e.g. 'Ndubuisi'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- New sign-ups get a contributor profile automatically.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Role helpers (security definer so policies can use them without recursion).
create or replace function public.my_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin', 'editor') from public.profiles where id = auth.uid()), false)
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- Non-admins may edit their own name only, never their role or links.
create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.role := old.role; new.person_slug := old.person_slug; new.author_key := old.author_key; new.email := old.email;
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles for each row execute function public.guard_profile_update();

alter table public.profiles enable row level security;
drop policy if exists "profiles: read own or staff" on public.profiles;
create policy "profiles: read own or staff" on public.profiles for select using (id = auth.uid() or public.is_staff());
drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- Content: every publication, insight, op-ed, brief, project, person, partner, event and job on the site.
-- `data` holds the same fields as the JSON files in src/content/<collection>/<slug>.json.
create table if not exists public.content (
  id bigint generated always as identity primary key,
  collection text not null check (collection in
    ('publications', 'insights', 'opeds', 'briefs', 'projects', 'people', 'programmes', 'partners', 'events', 'jobs')),
  slug text not null,
  data jsonb not null default '{}'::jsonb,
  status text not null default 'published' check (status in ('draft', 'published')),
  owners uuid[] not null default '{}',   -- accounts that may edit this item (besides editors)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  unique (collection, slug)
);
create index if not exists content_collection_idx on public.content (collection, status);
create index if not exists content_owners_idx on public.content using gin (owners);

create or replace function public.content_before_write() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end $$;
drop trigger if exists content_touch on public.content;
create trigger content_touch before insert or update on public.content for each row execute function public.content_before_write();

-- Only editors may change ownership or publication status; owners can edit the text.
create or replace function public.guard_content_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then
    new.owners := old.owners; new.collection := old.collection; new.slug := old.slug; new.status := old.status;
  end if;
  return new;
end $$;
drop trigger if exists content_guard on public.content;
create trigger content_guard before update on public.content for each row execute function public.guard_content_update();

-- Every change is kept, so any edit can be rolled back.
create table if not exists public.content_revisions (
  id bigint generated always as identity primary key,
  content_id bigint not null references public.content (id) on delete cascade,
  data jsonb not null,
  status text not null,
  edited_by uuid references auth.users (id),
  edited_at timestamptz not null default now()
);
create or replace function public.content_keep_revision() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.data is distinct from old.data or new.status is distinct from old.status then
    insert into public.content_revisions (content_id, data, status, edited_by) values (old.id, old.data, old.status, auth.uid());
  end if;
  return new;
end $$;
drop trigger if exists content_revision on public.content;
create trigger content_revision after update on public.content for each row execute function public.content_keep_revision();

alter table public.content enable row level security;
alter table public.content_revisions enable row level security;
drop policy if exists "content: public reads published" on public.content;
create policy "content: public reads published" on public.content for select using (status = 'published' or public.is_staff() or auth.uid() = any (owners));
drop policy if exists "content: staff insert" on public.content;
create policy "content: staff insert" on public.content for insert with check (public.is_staff());
drop policy if exists "content: staff or owner update" on public.content;
create policy "content: staff or owner update" on public.content for update using (public.is_staff() or auth.uid() = any (owners));
drop policy if exists "content: admin delete" on public.content;
create policy "content: admin delete" on public.content for delete using (public.is_admin());
drop policy if exists "revisions: staff or owner read" on public.content_revisions;
create policy "revisions: staff or owner read" on public.content_revisions for select using (
  public.is_staff() or exists (select 1 from public.content c where c.id = content_id and auth.uid() = any (c.owners)));

-- Give an account ownership of everything it authored (matches author_key in author lists and person_slug).
create or replace function public.claim_authored_content(target uuid) returns integer
language plpgsql security definer set search_path = public as $$
declare p public.profiles; n integer;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  select * into p from public.profiles where id = target;
  update public.content c set owners = array(select distinct unnest(c.owners || target))
  where not (target = any (c.owners)) and (
       (p.author_key is not null and c.data -> 'authors' ? p.author_key)
    or (p.person_slug is not null and (c.data -> 'authors' ? p.person_slug or c.data -> 'team' ? p.person_slug
        or (c.collection = 'people' and c.slug = p.person_slug))));
  get diagnostics n = row_count;
  return n;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Submissions (Publish with RITA)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  format text not null default 'policy-insight' check (format in ('policy-insight', 'blog-op-ed', 'policy-brief', 'working-paper')),
  programme text,
  title text not null default '',
  standfirst text not null default '',
  author text not null default '',
  co_authors text[] not null default '{}',
  tags text[] not null default '{}',
  body text,
  references_text text,
  file_path text,        -- storage path of an uploaded .docx / PDF
  image jsonb,           -- { path, caption, credit, alt, rightsConfirmed }
  declarations jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'in_review', 'changes_requested', 'scheduled', 'published', 'declined')),
  assigned_to uuid references auth.users (id),
  published_ref text,    -- 'insights:<slug>' once published on the site
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);
create index if not exists submissions_author_idx on public.submissions (author_id);
create index if not exists submissions_status_idx on public.submissions (status);

create or replace function public.guard_submission_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  if not public.is_staff() then
    -- authors may only move their piece between draft and submitted
    if new.status not in ('draft', 'submitted') then new.status := old.status; end if;
    new.assigned_to := old.assigned_to; new.published_ref := old.published_ref; new.author_id := old.author_id;
  end if;
  if new.status = 'submitted' and old.status is distinct from 'submitted' then new.submitted_at = now(); end if;
  return new;
end $$;
drop trigger if exists submissions_guard on public.submissions;
create trigger submissions_guard before update on public.submissions for each row execute function public.guard_submission_update();

alter table public.submissions enable row level security;
drop policy if exists "submissions: read own or staff" on public.submissions;
create policy "submissions: read own or staff" on public.submissions for select using (author_id = auth.uid() or public.is_staff());
drop policy if exists "submissions: insert own" on public.submissions;
create policy "submissions: insert own" on public.submissions for insert with check (author_id = auth.uid() and status in ('draft', 'submitted'));
drop policy if exists "submissions: update own while editable, or staff" on public.submissions;
create policy "submissions: update own while editable, or staff" on public.submissions for update using (
  public.is_staff() or (author_id = auth.uid() and status in ('draft', 'submitted', 'changes_requested')));
drop policy if exists "submissions: delete own drafts or admin" on public.submissions;
create policy "submissions: delete own drafts or admin" on public.submissions for delete using (
  public.is_admin() or (author_id = auth.uid() and status = 'draft'));

create table if not exists public.submission_comments (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.submissions (id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users (id),
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.submission_comments enable row level security;
drop policy if exists "comments: read if you can see the submission" on public.submission_comments;
create policy "comments: read if you can see the submission" on public.submission_comments for select using (
  public.is_staff() or exists (select 1 from public.submissions s where s.id = submission_id and s.author_id = auth.uid()));
drop policy if exists "comments: write if you can see the submission" on public.submission_comments;
create policy "comments: write if you can see the submission" on public.submission_comments for insert with check (
  author_id = auth.uid() and (public.is_staff() or exists (select 1 from public.submissions s where s.id = submission_id and s.author_id = auth.uid())));

-- Names of commenters / authors for the studio (staff only).
create or replace view public.profile_names with (security_invoker = true) as
  select id, full_name, email, role from public.profiles;

-- ─────────────────────────────────────────────────────────────────────────────
-- File storage
insert into storage.buckets (id, name, public) values ('submissions', 'submissions', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;

-- submissions/<user id>/<file>: owners and staff only
drop policy if exists "submission files: owner upload" on storage.objects;
create policy "submission files: owner upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "submission files: owner or staff read" on storage.objects;
create policy "submission files: owner or staff read" on storage.objects for select to authenticated
  using (bucket_id = 'submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));
-- media: public images for content, uploaded by staff and fellows
drop policy if exists "media: staff and fellows upload" on storage.objects;
create policy "media: staff and fellows upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.my_role() in ('admin', 'editor', 'fellow'));

-- ─────────────────────────────────────────────────────────────────────────────
-- Publishing the website
-- The site is static: content changes go live when it is rebuilt. publish_site() calls a deploy hook.
-- Store the hook once (see README "Back-end"), e.g. a Vercel deploy hook URL:
--   select vault.create_secret('https://api.vercel.com/v1/integrations/deploy/…', 'deploy_hook_url');
-- or a GitHub token to trigger the GitHub Pages workflow:
--   select vault.create_secret('github_pat_…', 'github_token');
create table if not exists public.site_publishes (
  id bigint generated always as identity primary key,
  requested_by uuid references auth.users (id) default auth.uid(),
  requested_at timestamptz not null default now(),
  target text
);
alter table public.site_publishes enable row level security;
drop policy if exists "publishes: staff read" on public.site_publishes;
create policy "publishes: staff read" on public.site_publishes for select using (public.is_staff());

create or replace function public.publish_site() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare hook text; token text; done text := '';
begin
  if not public.is_staff() then raise exception 'Only editors can publish the website'; end if;
  select decrypted_secret into hook from vault.decrypted_secrets where name = 'deploy_hook_url';
  select decrypted_secret into token from vault.decrypted_secrets where name = 'github_token';
  if hook is not null then
    perform net.http_post(url := hook, body := '{}'::jsonb);
    done := done || 'vercel ';
  end if;
  if token is not null then
    perform net.http_post(
      url := 'https://api.github.com/repos/marcelkempers96/RITA/dispatches',
      headers := jsonb_build_object('Authorization', 'Bearer ' || token, 'Accept', 'application/vnd.github+json',
                                   'User-Agent', 'rita-supabase', 'Content-Type', 'application/json'),
      body := '{"event_type":"content-updated"}'::jsonb);
    done := done || 'github ';
  end if;
  if done = '' then raise exception 'No deploy hook configured. Add deploy_hook_url or github_token to the vault.'; end if;
  insert into public.site_publishes (target) values (trim(done));
  return trim(done);
end $$;
revoke all on function public.publish_site() from public, anon;
grant execute on function public.publish_site() to authenticated;
revoke all on function public.claim_authored_content(uuid) from public, anon;
grant execute on function public.claim_authored_content(uuid) to authenticated;

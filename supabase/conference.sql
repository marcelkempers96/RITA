-- RITA Conference 2027: abstracts. Run in Supabase → SQL Editor after schema.sql. Safe to re-run.

create table if not exists public.abstracts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  conference text not null default 'rita-2027',
  track text not null,
  format text not null check (format in ('paper', 'panel', 'roundtable', 'poster')),
  title text not null,
  abstract text not null,
  keywords text[] not null default '{}',
  jel text,
  authors jsonb not null default '[]'::jsonb,      -- [{ name, affiliation, country, presenting }]
  presenting_author text not null,
  email text,
  country text,
  career_stage text,
  language text not null default 'en',
  rationale text,                                  -- panels and roundtables
  contributions text,                              -- panels and roundtables: papers / speakers
  online_request boolean not null default false,
  travel_support boolean not null default false,
  travel_motivation text,
  declarations jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'accepted', 'accepted_poster', 'declined', 'withdrawn')),
  decision_note text,                              -- shown to the author with the decision
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists abstracts_author_idx on public.abstracts (author_id);
create index if not exists abstracts_status_idx on public.abstracts (conference, status);

-- Deadline: authors can submit and edit until 31 March 2027, 23:59 SAST.
create or replace function public.abstracts_open() returns boolean language sql stable as $$
  select now() < timestamptz '2027-03-31 23:59:00+02'
$$;

create or replace function public.guard_abstract() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  if auth.uid() is not null and not public.is_staff() then
    if tg_op = 'UPDATE' then
      new.author_id := old.author_id; new.decision_note := old.decision_note;
      -- authors may only withdraw, never set a decision
      if new.status <> old.status and new.status <> 'withdrawn' then new.status := old.status; end if;
    else
      new.status := 'submitted'; new.decision_note := null;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists abstracts_guard on public.abstracts;
create trigger abstracts_guard before insert or update on public.abstracts for each row execute function public.guard_abstract();

alter table public.abstracts enable row level security;
drop policy if exists "abstracts: read own or staff" on public.abstracts;
create policy "abstracts: read own or staff" on public.abstracts for select using (author_id = auth.uid() or public.is_staff());
drop policy if exists "abstracts: insert own while open" on public.abstracts;
create policy "abstracts: insert own while open" on public.abstracts for insert with check (author_id = auth.uid() and public.abstracts_open());
drop policy if exists "abstracts: update own while open, or staff" on public.abstracts;
create policy "abstracts: update own while open, or staff" on public.abstracts for update using (
  public.is_staff() or (author_id = auth.uid() and public.abstracts_open()));
drop policy if exists "abstracts: admin delete" on public.abstracts;
create policy "abstracts: admin delete" on public.abstracts for delete using (public.is_admin());

-- Reviews live in their own table that only editors and admins can see.
create table if not exists public.abstract_reviews (
  id bigint generated always as identity primary key,
  abstract_id uuid not null references public.abstracts (id) on delete cascade,
  reviewer_id uuid not null default auth.uid() references auth.users (id),
  relevance smallint check (relevance between 1 and 5),
  rigour smallint check (rigour between 1 and 5),
  contribution smallint check (contribution between 1 and 5),
  policy smallint check (policy between 1 and 5),
  clarity smallint check (clarity between 1 and 5),
  recommendation text check (recommendation in ('accept', 'accept_poster', 'decline')),
  note text,
  created_at timestamptz not null default now(),
  unique (abstract_id, reviewer_id)
);
alter table public.abstract_reviews enable row level security;
drop policy if exists "reviews: staff only" on public.abstract_reviews;
create policy "reviews: staff only" on public.abstract_reviews for all using (public.is_staff()) with check (public.is_staff() and reviewer_id = auth.uid());

-- A simple view for authors (decision note only once decided).
create or replace view public.my_abstracts with (security_invoker = true) as
  select id, conference, track, format, title, abstract, keywords, jel, authors, presenting_author, email, country, career_stage,
         language, rationale, contributions, online_request, travel_support, travel_motivation, declarations, status,
         case when status in ('accepted', 'accepted_poster', 'declined') then decision_note end as decision_note, created_at, updated_at
  from public.abstracts where author_id = auth.uid();

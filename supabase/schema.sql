-- KQDFW database schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- ============================================================
-- INTEREST: public join-form submissions.
-- Anyone can submit; only you (via the dashboard) can read them.
-- ============================================================
create table public.interest (
  id bigint generated always as identity primary key,
  name text not null,
  contact text not null,
  how_found text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.interest enable row level security;

create policy "anyone can submit interest"
  on public.interest for insert
  to anon, authenticated
  with check (true);
-- No select policy on purpose: submissions are only readable
-- in the Supabase dashboard (Table Editor), which bypasses RLS.

-- ============================================================
-- MEMBERS: one row per authenticated user.
-- Created as 'pending' on first login; you approve in the dashboard
-- (Table Editor -> members -> change status to 'approved').
-- ============================================================
create table public.members (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'inactive')),
  notes text, -- e.g. "Met at Free Play Richardson, friend of X"
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

create policy "read own member row"
  on public.members for select
  to authenticated
  using (auth.uid() = id);

create policy "create own pending row"
  on public.members for insert
  to authenticated
  with check (auth.uid() = id and status = 'pending');

-- Helper: is the current user an approved member?
create or replace function public.is_approved()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where id = auth.uid() and status = 'approved'
  );
$$;

-- ============================================================
-- POLLS: created by you in the dashboard. Example insert:
--   insert into polls (question, options) values
--   ('Where should we play this week?',
--    '["Free Play Richardson","Free Play Arlington","Free Play Denton"]');
-- Close a poll by setting is_open = false.
-- ============================================================
create table public.polls (
  id bigint generated always as identity primary key,
  question text not null,
  options jsonb not null, -- JSON array of option strings
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.polls enable row level security;

create policy "approved members can read polls"
  on public.polls for select
  to authenticated
  using (public.is_approved());

-- ============================================================
-- VOTES: one vote per member per poll.
-- Members can see ONLY their own vote; everyone else sees totals
-- through poll_results(). Anonymous to peers, accountable to admin.
-- ============================================================
create table public.votes (
  poll_id bigint not null references public.polls (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  option_index int not null,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

alter table public.votes enable row level security;

create policy "approved members vote once on open polls"
  on public.votes for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and public.is_approved()
    and exists (
      select 1 from public.polls
      where id = poll_id and is_open
    )
  );

create policy "read own vote only"
  on public.votes for select
  to authenticated
  using (auth.uid() = user_id);

-- Aggregate results, only for approved members.
create or replace function public.poll_results(p_poll_id bigint)
returns table (option_index int, vote_count bigint)
language plpgsql stable security definer
set search_path = public
as $$
begin
  if not public.is_approved() then
    raise exception 'not an approved member';
  end if;
  return query
    select v.option_index, count(*)::bigint
    from public.votes v
    where v.poll_id = p_poll_id
    group by v.option_index;
end;
$$;

-- ============================================================
-- ADMIN / CONTENT MANAGEMENT
-- ------------------------------------------------------------
-- The calendar, league schedule + scores, and rosters are edited
-- live from the /admin page by "organizer" members. Everything
-- here is PUBLIC-READABLE (so the site can render it) but only
-- writable by organizers, enforced by RLS via is_organizer().
--
-- Bootstrapping your first organizer (one-time, in the dashboard):
--   Table Editor -> members -> set role = 'organizer' on your row.
-- (You also still want status = 'approved' for the members area.)
-- ============================================================

-- Add an organizer role to members. Safe to re-run.
alter table public.members
  add column if not exists role text not null default 'member'
    check (role in ('member', 'organizer'));

-- Helper: is the current user an organizer? (mirrors is_approved())
create or replace function public.is_organizer()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where id = auth.uid() and role = 'organizer'
  );
$$;

-- Apply the standard "public read, organizer write" pair to a table.
-- (Written out per-table below so it's explicit and easy to audit.)

-- ---- TEAMS & ROSTERS ----------------------------------------
create table if not exists public.teams (
  id bigint generated always as identity primary key,
  name text not null unique,
  captain text not null default '',
  players jsonb not null default '[]', -- JSON array of non-captain names
  sort int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.teams enable row level security;
create policy "public read teams" on public.teams
  for select to anon, authenticated using (true);
create policy "organizers write teams" on public.teams
  for all to authenticated
  using (public.is_organizer()) with check (public.is_organizer());

-- ---- SEASON (single settings row, id = 1) -------------------
create table if not exists public.season (
  id int primary key default 1,
  name text not null default '',
  day text not null default '',
  time text not null default '',
  constraint season_singleton check (id = 1)
);
alter table public.season enable row level security;
create policy "public read season" on public.season
  for select to anon, authenticated using (true);
create policy "organizers write season" on public.season
  for all to authenticated
  using (public.is_organizer()) with check (public.is_organizer());

-- ---- LEAGUE DAYS + MATCHES ----------------------------------
create table if not exists public.league_days (
  id bigint generated always as identity primary key,
  date date not null,
  name text not null default 'League',
  venue text not null default '',
  note text,
  created_at timestamptz not null default now()
);
alter table public.league_days enable row level security;
create policy "public read league_days" on public.league_days
  for select to anon, authenticated using (true);
create policy "organizers write league_days" on public.league_days
  for all to authenticated
  using (public.is_organizer()) with check (public.is_organizer());

create table if not exists public.matches (
  id bigint generated always as identity primary key,
  league_day_id bigint not null
    references public.league_days (id) on delete cascade,
  time text not null default '',
  cab text, -- "Cab 1"/"Cab 2"; null for single-cab venues
  blue text not null default '',
  gold text not null default '',
  blue_score int, -- null until played; set both to record a result
  gold_score int,
  sort int not null default 0
);
alter table public.matches enable row level security;
create policy "public read matches" on public.matches
  for select to anon, authenticated using (true);
create policy "organizers write matches" on public.matches
  for all to authenticated
  using (public.is_organizer()) with check (public.is_organizer());

-- ---- EVENTS (one-off) + RECURRING WEEKLY EVENTS -------------
create table if not exists public.events (
  id bigint generated always as identity primary key,
  date date not null,
  title text not null,
  kind text not null check (kind in ('pickup', 'tournament', 'social')),
  time text,
  venue text,
  href text
);
alter table public.events enable row level security;
create policy "public read events" on public.events
  for select to anon, authenticated using (true);
create policy "organizers write events" on public.events
  for all to authenticated
  using (public.is_organizer()) with check (public.is_organizer());

create table if not exists public.recurring_events (
  id bigint generated always as identity primary key,
  weekday int not null check (weekday between 0 and 6), -- 0=Sun .. 6=Sat
  title text not null,
  kind text not null check (kind in ('pickup', 'tournament', 'social')),
  time text,
  venue text,
  href text
);
alter table public.recurring_events enable row level security;
create policy "public read recurring_events" on public.recurring_events
  for select to anon, authenticated using (true);
create policy "organizers write recurring_events" on public.recurring_events
  for all to authenticated
  using (public.is_organizer()) with check (public.is_organizer());

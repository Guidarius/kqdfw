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

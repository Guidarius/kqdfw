# Conditional RSVP — "In if full" design plan

A design for letting magic-link members RSVP to pickup nights with a conditional
"I'm in if we hit full teams" pledge that resolves automatically at the event's
start time. Scope: the full auto-resolving system.

## The problem

Killer Queen is 5v5 and most people only want to play with full teams (10).
Today the "in if 10" mechanic lives in everyone's head: each person privately
tallies, privately picks a bail time, and privately leaves if it's short. There's
no shared source of truth and no shared deadline, so borderline nights collapse
even when enough people would actually have come.

The fix is less about clever logic and more about making the count **shared,
live, and visible**, with a single deadline everyone is looking at.

## Core model

A member's RSVP to a night is one of three states:

- **In** — firm, coming regardless of headcount.
- **In if full** — conditional; will come only if the night reaches the threshold.
- **Out** — no RSVP (the default; also the result of removing one).

The one idea that makes it work: **conditional pledges count toward the
threshold.** This dissolves the chicken-and-egg problem where everyone is waiting
on everyone. If ten people are each "in if full," the tally reads 10/10 and the
night tips on — nobody had to commit blindly first. The live number ("9/10 — one
more locks it in") is the social nudge that pushes borderline nights over.

Threshold defaults to **10** (two full teams) and can be overridden per night.

## The cutoff: event start time

Each night resolves at its **start time** (8:00 PM for the regular pickup nights).
No separate cutoff to configure — it's just the event's start. Rationale: it's a
time everyone already knows, and it's the exact moment a conditional player needs
an answer. Physical arrival can trail the cutoff (people trickle in at start and
later); the *RSVP* is what locks at start.

## Resolution

Let `T` = threshold, `S` = start time, `firm` = count of "In", `cond` = count of
"In if full", `total = firm + cond`.

**Before start (`now < S`) — live, changeable:**

- `total >= T` → status **"On — full teams, locks at start"**; conditionals shown
  as provisionally in.
- `total < T` → status **"Needs N more"** where `N = T - total`.
- Members can switch between In / In if full / Out freely.

**At/after start (`now >= S`) — binding snapshot:**

- `total >= T` → night is **ON**. Conditionals convert to **confirmed**; everyone
  (firm + conditional) is in.
- `total < T` → night is **SHORT**. Conditionals are **released** (treated as out,
  matching what they'd really do). The firm players remain and decide whether to
  run a smaller game or call it.

Once resolved at start, the outcome is **frozen** — a firm walk-in arriving at 8:15
adds to the headcount but does not un-release players who already made other plans,
and one firm drop after kickoff doesn't un-call an ON night. Snapshotting at the
cutoff is what keeps the system stable.

## Serverless resolution (no always-on server needed)

The status is a pure function of (RSVPs, threshold, start time, current time), so
most of it computes on page load. The only thing that must be *frozen* is the
at-start snapshot. Two ways to do it, in order of simplicity:

1. **Lazy snapshot on read (recommended for v1).** The first time the night is
   loaded after its start time, compute `total` and write `outcome` ('on'/'short')
   + `resolved_at` to the night row. Every later read uses the frozen value. No
   cron, no background worker — fits Vercel + Supabase. Good enough because someone
   always loads the page around start, and counts are stable by then.
2. **Scheduled job (optional precision upgrade).** A timed task at each night's
   start writes the same snapshot exactly on time, independent of page loads. The
   app already has a scheduling capability this could hang off, and it's also where
   a "we're on — see you at 8!" notification would live later.

## Data model (Supabase)

```sql
-- One row per pickup night that accepts RSVPs.
create table public.nights (
  id          bigint generated always as identity primary key,
  date        date not null,
  venue       text not null,
  starts_at   timestamptz not null,        -- the cutoff
  threshold   int  not null default 10,
  outcome     text check (outcome in ('on','short')),  -- null until resolved
  resolved_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (date, venue)                      -- one night per date+venue
);

-- One RSVP per member per night.
create table public.rsvps (
  night_id   bigint not null references public.nights(id) on delete cascade,
  user_id    uuid   not null references auth.users(id)    on delete cascade,
  status     text   not null check (status in ('in','if_full')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (night_id, user_id)           -- one pledge per person
);
```

RLS, mirroring the existing polls/votes trust model: approved members can read all
RSVPs for a night (to see the count and who's in) and can insert/update/delete only
their own row. `outcome` is written by a `security definer` resolve function so a
member can't fake the result. Night rows are upserted on first RSVP from the known
recurring schedule (date + venue), so there's no organizer setup step.

## UI / UX

On each upcoming night (members area, and optionally the calendar's Upcoming list):

- A headline gauge: **"7 / 10 — needs 3 more"** or **"11 / 10 — full teams, you're
  on"**, with a thin progress bar and the breakdown "5 in · 2 if full".
- The member's controls: **[I'm in] · [In if full] · [Can't make it]**, with the
  current choice highlighted.
- The cutoff: "Locks at 8:00 PM" (a countdown before start).
- After resolution: **"ON — see you at 8 at Free Play Richardson"**, or **"Didn't
  hit 10 — conditional players released; 4 firm in if you still want to run it."**
- The roster of who's in (names) — it's a members-only, mutual-acquaintance space,
  so showing names adds accountability and social proof. Conditionals can show as a
  count or names too.

## Edge cases

- **Exactly 10** → on (`>=` threshold).
- **Drop before start** that dips below 10 → status flips live back to "needs 1
  more". Fine; it's not locked yet.
- **Drop after an ON resolution** → stays ON; headcount updates but the night isn't
  un-called.
- **All conditional, none firm** → still works: 10 "if full" pledges = 10 total =
  on at start.
- **Nobody loads the page until late** → lazy snapshot resolves on that first late
  read; the optional scheduled job removes even this wrinkle.
- **Duplicate night rows** → prevented by the `unique (date, venue)` constraint.

## Build phases (within the full system)

1. Schema + RSVP read/write + live tally, threshold, and the before-start status.
2. At-start resolution (lazy snapshot) with confirmed/released states and the
   ON/SHORT messaging.
3. Polish: roster of names, countdown to lock, post-resolution copy.
4. Optional: a "we're on" notification at lock via a scheduled task / email.

## Dependency

This is the feature that justifies turning the backend on. It needs Supabase
connected and the magic-link member-approval flow live — both currently hidden in
the bare-bones build. Nothing here ships until that's wired up, so the natural
sequence is: connect Supabase → re-enable the members area → build this on top.

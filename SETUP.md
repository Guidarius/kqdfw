# KQDFW Site — Setup Guide

The site works in two layers:

- **Public pages** (home, schedule, first night, league, conduct) work with zero backend. Deploy and they're live.
- **DB features** (join form, login, members poll) light up once Supabase is connected. Until then they show friendly fallbacks.

## 1. Deploy to Vercel

1. Push this repo to GitHub (already done).
2. [vercel.com](https://vercel.com) → sign in with GitHub → **Add New → Project** → import `kqdfw` → Deploy.
3. You're live at `kqdfw.vercel.app`. Every `git push` redeploys automatically.

## 2. Point kqdfw.com at it

In the Vercel project: **Settings → Domains** → add `kqdfw.com` (and `www.kqdfw.com`).

Then at Namecheap (**Domain List → Manage → Nameservers**): choose **Custom DNS** and enter:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Vercel then handles DNS + SSL automatically. Propagation: minutes to a day.

## 3. Create the Supabase project

1. [supabase.com](https://supabase.com) → New project (free tier). Pick a strong DB password and save it somewhere.
2. **SQL Editor → New query** → paste the contents of `supabase/schema.sql` → Run.
3. **Project Settings → API**: copy the **Project URL** and **anon public key**.

## 4. Connect the app to Supabase

Local dev — create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOURPROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Vercel — **Project → Settings → Environment Variables**: add the same two, then redeploy (Deployments → ⋯ → Redeploy).

## 5. Configure auth (magic links)

In Supabase: **Authentication → URL Configuration**:

- **Site URL:** `https://kqdfw.com`
- **Redirect URLs:** add `https://kqdfw.com/members`, `https://kqdfw.vercel.app/members`, and `http://localhost:3000/members`

That's it — magic-link email login now works. Note: Supabase's built-in email sender is rate-limited (a few per hour). Fine for a small scene; when it's not, wire up a free [Resend](https://resend.com) account under **Authentication → SMTP Settings**.

## 6. Day-to-day admin (all in the Supabase dashboard)

- **Approve a member:** Table Editor → `members` → set their `status` to `approved`. Add a note ("met at Free Play, friend of X").
- **Read join-form submissions:** Table Editor → `interest`.
- **Post the weekly poll:** Table Editor → `polls` → Insert row:
  - question: `Where should we play this week?`
  - options: `["Free Play Richardson", "Free Play Arlington", "Free Play Denton"]`
- **Close a poll:** set its `is_open` to `false`.

Votes are anonymous to members (they only ever see totals) but stored per-user for one-vote-per-person. Don't browse the `votes` table out of curiosity — the trust model is that you *can* audit it but don't.

## 7. Updating the site

Everything editable lives in three files:

- **`lib/scene.ts`** — regular nights, this-week callout, venues, contacts, links
- **`lib/league.ts`** — season info, teams, rosters
- **`lib/league-days.ts`** — the match schedule + scores (standings are computed from scores automatically)
- **`lib/events.ts`** — calendar events (pickup nights, tournaments, socials); league days appear on the calendar automatically

To import the league schedule from your spreadsheet instead of hand-editing: export it as CSV with columns `date,day_name,venue,time,cab,blue,gold,score`, then run `node scripts/league-from-csv.mjs schedule.csv`.

Edit, then:

```
git add .
git commit -m "update schedule"
git push
```

Vercel redeploys in ~1 minute. Search the codebase for `EDIT` to find every placeholder that needs real info.

## Local development

```
npm run dev
```

→ http://localhost:3000

## Costs

$0/month on free tiers (domain renewal aside). One quirk: free Supabase projects pause after ~1 week of zero activity — one click in the dashboard wakes them. Stops being an issue once the weekly poll has traffic.

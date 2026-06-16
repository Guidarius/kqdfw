# Admin & data management

The calendar/events, league schedule + scores, and teams/rosters are edited
live from **`/admin`** by organizers. Edits save to Supabase and appear on the
public site immediately (the Calendar and League pages read fresh on each load).

If Supabase isn't configured, the public pages fall back to the bundled data in
`lib/league.ts`, `lib/league-days.ts`, and `lib/events.ts`, so the site always
renders.

## One-time setup

1. **Env vars** — copy `.env.local.example` to `.env.local` and fill in all three
   values (the `service_role` key is only used by the seed step below).

2. **Apply the schema** — Supabase dashboard → SQL Editor → paste all of
   `supabase/schema.sql` → Run. It's safe to re-run (idempotent).

3. **Seed the tables** from the current code data (so nothing is re-entered):
   ```
   npm run seed
   ```

4. **Make yourself an organizer** — log in once at `/login` (creates your
   `members` row), then in the dashboard → Table Editor → `members` → set your
   row's `role` to `organizer` (and `status` to `approved`).

5. Visit **`/admin`** (it's not in the public nav — go there directly).

To add more organizers later, repeat step 4 for that person's row.

## CSV formats

Each admin section has a "Replace … from CSV" upload. Export from Excel/Sheets
as CSV (a header row is required; column order doesn't matter). Uploading
**replaces** all rows in that section, after a confirmation prompt.

| Section            | Columns                                                        |
| ------------------ | -------------------------------------------------------------- |
| League schedule    | `date, day_name, venue, time, cab, blue, gold, score` (+ `note`) |
| Teams              | `team, captain, player` — one row per player                   |
| One-off events     | `date, title, kind, time, venue, href`                         |
| Recurring nights   | `weekday, title, kind, time, venue, href`                      |

Notes:
- `date` is ISO `YYYY-MM-DD`; `score` is `blue-gold` like `3-1` (leave empty if
  unplayed); `cab` is optional (only for two-cab venues).
- `kind` is one of `pickup`, `tournament`, `social`.
- `weekday` is `0`=Sunday … `6`=Saturday.

You can also add/edit/delete individual rows and enter match scores by hand in
the admin UI — CSV is just for bulk changes.

## How writes stay secure

Writes happen from the organizer's browser, but every content table has
Row-Level Security allowing writes only when `is_organizer()` is true (checked
in Postgres). The app never ships a service-role key; that key is used only by
the local `npm run seed` script.

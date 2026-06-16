/**
 * One-off, LOCAL seed: loads the current TypeScript constants into the
 * Supabase content tables so you don't re-enter anything by hand.
 *
 * Run after applying supabase/schema.sql:
 *   npm run seed
 *
 * Requires (in .env.local, NOT committed):
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...      <-- server-only secret, bypasses RLS
 *
 * The service-role key is only used here, locally. It is never imported
 * by the app and never shipped to the browser.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import { season, teams } from "../lib/league";
import { leagueDays } from "../lib/league-days";
import { events, recurringEvents } from "../lib/events";

// --- load .env.local (a standalone script doesn't get Next's env) ----
function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local — rely on the ambient environment */
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

function check(label: string, error: { message: string } | null) {
  if (error) {
    console.error(`✗ ${label}:`, error.message);
    process.exit(1);
  }
}

async function main() {
  // Season (singleton row id = 1)
  check("season", (await db.from("season").upsert({ id: 1, ...season })).error);

  // Teams (replace all; preserve display order via sort)
  check("clear teams", (await db.from("teams").delete().neq("id", -1)).error);
  check(
    "teams",
    (
      await db.from("teams").insert(
        teams.map((t, i) => ({
          name: t.name,
          captain: t.captain,
          players: t.players,
          sort: i,
        }))
      )
    ).error
  );

  // League days + matches (replace all; matches cascade-delete with days)
  check(
    "clear league_days",
    (await db.from("league_days").delete().neq("id", -1)).error
  );
  for (const d of leagueDays) {
    const ins = await db
      .from("league_days")
      .insert({ date: d.date, name: d.name, venue: d.venue, note: d.note ?? null })
      .select("id");
    check(`league_day ${d.date}`, ins.error);
    const dayId = (ins.data as { id: number }[])[0].id;
    if (d.matches.length) {
      check(
        `matches ${d.date}`,
        (
          await db.from("matches").insert(
            d.matches.map((m, i) => ({
              league_day_id: dayId,
              time: m.time,
              cab: m.cab ?? null,
              blue: m.blue,
              gold: m.gold,
              blue_score: m.score ? m.score[0] : null,
              gold_score: m.score ? m.score[1] : null,
              sort: i,
            }))
          )
        ).error
      );
    }
  }

  // Events + recurring events (replace all)
  check("clear events", (await db.from("events").delete().neq("id", -1)).error);
  check(
    "events",
    (
      await db.from("events").insert(
        events.map((e) => ({
          date: e.date,
          title: e.title,
          kind: e.kind,
          time: e.time ?? null,
          venue: e.venue ?? null,
          href: e.href ?? null,
        }))
      )
    ).error
  );

  check(
    "clear recurring_events",
    (await db.from("recurring_events").delete().neq("id", -1)).error
  );
  check(
    "recurring_events",
    (
      await db.from("recurring_events").insert(
        recurringEvents.map((e) => ({
          weekday: e.weekday,
          title: e.title,
          kind: e.kind,
          time: e.time ?? null,
          venue: e.venue ?? null,
          href: e.href ?? null,
        }))
      )
    ).error
  );

  const matchCount = leagueDays.reduce((n, d) => n + d.matches.length, 0);
  console.log(
    `✓ Seeded: ${teams.length} teams, ${leagueDays.length} league days, ` +
      `${matchCount} matches, ${events.length} events, ` +
      `${recurringEvents.length} recurring events.`
  );
}

main();

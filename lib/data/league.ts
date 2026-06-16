// DB-first data access for league content. Each function returns the
// SAME shape as the constants in lib/league.ts, so all consumers and
// utilities (computeStandings, etc.) work unchanged.
//
// Fallback rule: if Supabase isn't configured, or the query errors
// (e.g. tables not created yet), return the bundled constants so the
// site keeps working. If the DB is configured and the table simply
// has no rows, we return that empty result (an intentionally-empty
// table is a valid state, not a reason to resurrect old constants).

import { getServerSupabase } from "@/lib/supabase-server";
import {
  season as seasonConst,
  teams as teamsConst,
  leagueDays as leagueDaysConst,
  type Team,
  type LeagueDay,
  type Match,
} from "@/lib/league";

export type Season = { name: string; day: string; time: string };

export async function getSeason(): Promise<Season> {
  const supabase = getServerSupabase();
  if (!supabase) return seasonConst;
  const { data, error } = await supabase
    .from("season")
    .select("name, day, time")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return seasonConst;
  return data as Season;
}

export async function getTeams(): Promise<Team[]> {
  const supabase = getServerSupabase();
  if (!supabase) return teamsConst;
  const { data, error } = await supabase
    .from("teams")
    .select("name, captain, players, sort")
    .order("sort", { ascending: true })
    .order("name", { ascending: true });
  if (error || !data) return teamsConst;
  return data.map((t) => ({
    name: t.name as string,
    captain: (t.captain as string) ?? "",
    players: (t.players as string[]) ?? [],
  }));
}

type MatchRow = {
  time: string;
  cab: string | null;
  blue: string;
  gold: string;
  blue_score: number | null;
  gold_score: number | null;
  sort: number;
};

export async function getLeagueDays(): Promise<LeagueDay[]> {
  const supabase = getServerSupabase();
  if (!supabase) return leagueDaysConst;
  const { data, error } = await supabase
    .from("league_days")
    .select(
      "date, name, venue, note, matches(time, cab, blue, gold, blue_score, gold_score, sort)"
    )
    .order("date", { ascending: true });
  if (error || !data) return leagueDaysConst;
  return data.map((d) => {
    const rows = ((d.matches as MatchRow[]) ?? [])
      .slice()
      .sort((a, b) => a.sort - b.sort || a.time.localeCompare(b.time));
    const matches: Match[] = rows.map((m) => ({
      time: m.time,
      ...(m.cab ? { cab: m.cab } : {}),
      blue: m.blue,
      gold: m.gold,
      ...(m.blue_score != null && m.gold_score != null
        ? { score: [m.blue_score, m.gold_score] as [number, number] }
        : {}),
    }));
    return {
      date: d.date as string,
      name: d.name as string,
      venue: d.venue as string,
      ...(d.note ? { note: d.note as string } : {}),
      matches,
    };
  });
}

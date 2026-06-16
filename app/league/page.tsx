import { getSeason, getTeams, getLeagueDays } from "@/lib/data/league";
import { LeagueView } from "./LeagueView";

// Read live from the DB on every request so organizer edits show
// immediately (falls back to bundled constants when Supabase is unset).
export const dynamic = "force-dynamic";

export default async function LeaguePage() {
  const [season, teams, leagueDays] = await Promise.all([
    getSeason(),
    getTeams(),
    getLeagueDays(),
  ]);
  return <LeagueView season={season} teams={teams} leagueDays={leagueDays} />;
}

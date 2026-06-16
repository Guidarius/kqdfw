// ============================================================
// LEAGUE — season info, teams, rosters, and types.
// The week-by-week match schedule lives in lib/league-days.ts
// (hand-edit it, or regenerate from a spreadsheet CSV export
// with: node scripts/league-from-csv.mjs schedule.csv)
//
// Standings are COMPUTED from match scores — enter scores in
// league-days.ts and W/L/MW update automatically.
// ============================================================

export const season = {
  name: "FPKQL Season XIV",
  day: "Sundays",
  time: "4:00 PM",
};

export type Team = {
  name: string;
  captain: string;
  players: string[]; // non-captain players
};

export const teams: Team[] = [
  {
    name: "Battlehive Apis",
    captain: "Mihir Vashi",
    players: ["Sam Largent", "Chris Delp", "Liam Gillilan", "Andrew Shoda Jr"],
  },
  {
    name: "Bear Minimum",
    captain: "Guido Marasigan",
    players: [
      "Dylan Kley",
      "Eduardo Martinez Banda",
      "Michael Castronovo",
      "Jason Hester",
    ],
  },
  {
    name: "Death From Above",
    captain: "David Gillilan",
    players: ["Sean Jamison", "Brian Lucas", "Megan Ford", "Val Gillilan"],
  },
  {
    name: "Dusk Map Til Dawn",
    captain: "Nate Andrews",
    players: [
      "Anthony Sifuentes",
      "Philip King",
      "Chris Stehl",
      "Josh Sanderfer",
    ],
  },
  {
    name: "Hive Five",
    captain: "Christian Schmoker",
    players: ["Andrew Vidos", "Alex Moore", "Matt Hellman", "Naomi Lipsky"],
  },
  {
    name: "Pollen Count",
    captain: "Crystal Weideman",
    players: ["Eric Merritt", "Manny Lopez", "Kylie Butler", "Nick Pearce"],
  },
  {
    name: "Refried Bees",
    captain: "Timothy Lowe",
    players: [
      "Nathan Kasten",
      "Hayden Stone",
      "Jacob Sanders",
      "Christian Rivera",
    ],
  },
  {
    name: "Show Me The Honey",
    captain: "Darian Fazeli",
    players: [
      "Brenly Drake",
      "Stephen Renfroe",
      "Colin Wood",
      "Breanna Williams",
    ],
  },
];

export type Match = {
  time: string; // "4:00 PM"
  cab?: string; // "Cab 1", "Cab 2" — omit for single-cab venues
  blue: string; // team on blue side
  gold: string; // team on gold side
  score?: [number, number]; // [blue maps, gold maps] once played
};

export type LeagueDay = {
  date: string; // ISO: "2026-06-14"
  name: string; // "Opening Day", "Week 2", "Decision Sunday"...
  venue: string;
  matches: Match[];
  note?: string;
};

import { leagueDays } from "./league-days";
export { leagueDays };

// ---- computed standings ----------------------------------------

export type Standing = {
  name: string;
  wins: number;
  losses: number;
  mapWins: number;
};

// Compute standings from a roster + a set of league days. Pass DB-sourced
// data (see lib/data/league.ts) or the constants above — same shapes.
export function computeStandings(
  teamList: Team[] = teams,
  days: LeagueDay[] = leagueDays
): Standing[] {
  const rec = new Map<string, Standing>(
    teamList.map((t) => [
      t.name,
      { name: t.name, wins: 0, losses: 0, mapWins: 0 },
    ])
  );
  for (const day of days) {
    for (const m of day.matches) {
      if (!m.score) continue;
      const blue = rec.get(m.blue);
      const gold = rec.get(m.gold);
      if (!blue || !gold) continue;
      blue.mapWins += m.score[0];
      gold.mapWins += m.score[1];
      if (m.score[0] > m.score[1]) {
        blue.wins++;
        gold.losses++;
      } else if (m.score[1] > m.score[0]) {
        gold.wins++;
        blue.losses++;
      }
    }
  }
  return [...rec.values()].sort(
    (a, b) =>
      b.wins - a.wins || b.mapWins - a.mapWins || a.name.localeCompare(b.name)
  );
}

// ---- date helpers ----------------------------------------------

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

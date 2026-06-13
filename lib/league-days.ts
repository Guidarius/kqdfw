// ============================================================
// LEAGUE DAYS — the season's match schedule.
// Edit by hand, or regenerate from your spreadsheet:
//   1. Export the schedule as CSV with columns:
//      date,day_name,venue,time,cab,blue,gold,score
//   2. node scripts/league-from-csv.mjs schedule.csv
//
// Free Play Dallas runs two cabs; other venues are single-cab
// (no cab field needed).
//
// Add scores as matches are played: score: [3, 1] = blue 3, gold 1.
// Standings update automatically.
// ============================================================

import type { LeagueDay } from "./league";

export const leagueDays: LeagueDay[] = [
  {
    date: "2026-06-14",
    name: "League",
    venue: "Free Play Dallas",
    matches: [
      // Cab 1
      { time: "4:00 PM", cab: "Cab 1", blue: "Bear Minimum", gold: "Hive Five" },
      { time: "4:20 PM", cab: "Cab 1", blue: "Show Me The Honey", gold: "Pollen Count" },
      { time: "4:40 PM", cab: "Cab 1", blue: "Dusk Map Til Dawn", gold: "Show Me The Honey" },
      { time: "5:00 PM", cab: "Cab 1", blue: "Refried Bees", gold: "Pollen Count" },
      { time: "5:20 PM", cab: "Cab 1", blue: "Battlehive Apis", gold: "Refried Bees" },
      { time: "5:40 PM", cab: "Cab 1", blue: "Show Me The Honey", gold: "Hive Five" },
      { time: "6:00 PM", cab: "Cab 1", blue: "Hive Five", gold: "Battlehive Apis" },
      { time: "6:20 PM", cab: "Cab 1", blue: "Pollen Count", gold: "Death From Above" },
      { time: "6:40 PM", cab: "Cab 1", blue: "Bear Minimum", gold: "Dusk Map Til Dawn" },
      { time: "7:00 PM", cab: "Cab 1", blue: "Hive Five", gold: "Death From Above" },
      // Cab 2
      { time: "4:00 PM", cab: "Cab 2", blue: "Battlehive Apis", gold: "Dusk Map Til Dawn" },
      { time: "4:20 PM", cab: "Cab 2", blue: "Refried Bees", gold: "Death From Above" },
      { time: "4:40 PM", cab: "Cab 2", blue: "Death From Above", gold: "Bear Minimum" },
      { time: "5:00 PM", cab: "Cab 2", blue: "Battlehive Apis", gold: "Hive Five" },
      { time: "5:20 PM", cab: "Cab 2", blue: "Bear Minimum", gold: "Pollen Count" },
      { time: "5:40 PM", cab: "Cab 2", blue: "Death From Above", gold: "Dusk Map Til Dawn" },
      { time: "6:00 PM", cab: "Cab 2", blue: "Dusk Map Til Dawn", gold: "Bear Minimum" },
      { time: "6:20 PM", cab: "Cab 2", blue: "Show Me The Honey", gold: "Refried Bees" },
      { time: "6:40 PM", cab: "Cab 2", blue: "Refried Bees", gold: "Show Me The Honey" },
      { time: "7:00 PM", cab: "Cab 2", blue: "Battlehive Apis", gold: "Pollen Count" },
    ],
  },
  {
    date: "2026-06-21",
    name: "League",
    venue: "Tokyo Station (Arlington)",
    matches: [
      { time: "4:00 PM", blue: "Battlehive Apis", gold: "Bear Minimum" },
      { time: "4:20 PM", blue: "Show Me The Honey", gold: "Death From Above" },
      { time: "4:40 PM", blue: "Dusk Map Til Dawn", gold: "Hive Five" },
      { time: "5:00 PM", blue: "Pollen Count", gold: "Refried Bees" },
      { time: "5:20 PM", blue: "Refried Bees", gold: "Battlehive Apis" },
      { time: "5:40 PM", blue: "Pollen Count", gold: "Bear Minimum" },
      { time: "6:00 PM", blue: "Hive Five", gold: "Show Me The Honey" },
      { time: "6:20 PM", blue: "Dusk Map Til Dawn", gold: "Death From Above" },
    ],
  },
  {
    date: "2026-06-28",
    name: "League",
    venue: "Free Play Richardson",
    matches: [
      { time: "4:00 PM", blue: "Battlehive Apis", gold: "Death From Above" },
      { time: "4:20 PM", blue: "Bear Minimum", gold: "Show Me The Honey" },
      { time: "4:40 PM", blue: "Hive Five", gold: "Pollen Count" },
      { time: "5:00 PM", blue: "Dusk Map Til Dawn", gold: "Refried Bees" },
      { time: "5:20 PM", blue: "Battlehive Apis", gold: "Show Me The Honey" },
      { time: "5:40 PM", blue: "Dusk Map Til Dawn", gold: "Pollen Count" },
      { time: "6:00 PM", blue: "Bear Minimum", gold: "Death From Above" },
      { time: "6:20 PM", blue: "Hive Five", gold: "Refried Bees" },
    ],
  },
  {
    date: "2026-07-05",
    name: "League",
    venue: "Free Play Dallas",
    matches: [
      // Cab 1
      { time: "4:00 PM", cab: "Cab 1", blue: "Pollen Count", gold: "Battlehive Apis" },
      { time: "4:20 PM", cab: "Cab 1", blue: "Show Me The Honey", gold: "Dusk Map Til Dawn" },
      { time: "4:40 PM", cab: "Cab 1", blue: "Pollen Count", gold: "Show Me The Honey" },
      { time: "5:00 PM", cab: "Cab 1", blue: "Hive Five", gold: "Bear Minimum" },
      { time: "5:20 PM", cab: "Cab 1", blue: "Death From Above", gold: "Battlehive Apis" },
      { time: "5:40 PM", cab: "Cab 1", blue: "Refried Bees", gold: "Hive Five" },
      { time: "6:00 PM", cab: "Cab 1", blue: "Pollen Count", gold: "Hive Five" },
      { time: "6:20 PM", cab: "Cab 1", blue: "Refried Bees", gold: "Dusk Map Til Dawn" },
      { time: "6:40 PM", cab: "Cab 1", blue: "Show Me The Honey", gold: "Battlehive Apis" },
      { time: "7:00 PM", cab: "Cab 1", blue: "Death From Above", gold: "Pollen Count" },
      // Cab 2
      { time: "4:00 PM", cab: "Cab 2", blue: "Bear Minimum", gold: "Refried Bees" },
      { time: "4:20 PM", cab: "Cab 2", blue: "Death From Above", gold: "Hive Five" },
      { time: "4:40 PM", cab: "Cab 2", blue: "Death From Above", gold: "Refried Bees" },
      { time: "5:00 PM", cab: "Cab 2", blue: "Dusk Map Til Dawn", gold: "Battlehive Apis" },
      { time: "5:20 PM", cab: "Cab 2", blue: "Pollen Count", gold: "Dusk Map Til Dawn" },
      { time: "5:40 PM", cab: "Cab 2", blue: "Show Me The Honey", gold: "Bear Minimum" },
      { time: "6:00 PM", cab: "Cab 2", blue: "Death From Above", gold: "Show Me The Honey" },
      { time: "6:20 PM", cab: "Cab 2", blue: "Bear Minimum", gold: "Battlehive Apis" },
      { time: "6:40 PM", cab: "Cab 2", blue: "Hive Five", gold: "Dusk Map Til Dawn" },
      { time: "7:00 PM", cab: "Cab 2", blue: "Refried Bees", gold: "Bear Minimum" },
    ],
  },
  {
    date: "2026-07-12",
    name: "Honey Pot Playoffs",
    venue: "Free Play Dallas",
    matches: [],
    note: "Bracket set after the final league day",
  },
];

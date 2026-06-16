// ============================================================
// EVENTS — everything that shows on the Calendar besides league
// days (those are pulled in automatically from lib/league-days.ts).
//
// Two kinds of entry:
//   • events          — one-off, specific-date entries (tournaments,
//                        special socials, etc.)
//   • recurringEvents  — the regular weekly nights, by weekday. These
//                        are generated onto the calendar automatically,
//                        so you never hand-enter individual dates.
// ============================================================

export type EventKind = "pickup" | "tournament" | "social";

export type SceneEvent = {
  date: string; // ISO: "2026-06-18"
  title: string;
  kind: EventKind;
  time?: string;
  venue?: string;
  href?: string;
};

// One-off, specific-date events. Add tournaments, special socials, etc.
export const events: SceneEvent[] = [
  {
    date: "2026-06-07",
    title: "Draft + Casuals",
    kind: "social",
    time: "4:00 PM",
    venue: "Free Play Dallas",
  },
];

// ------------------------------------------------------------
// RECURRING WEEKLY EVENTS — the regular nights.
// weekday: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
// Edit here to change the weekly rotation; the calendar updates
// itself for every month automatically.
// ------------------------------------------------------------
export type RecurringEvent = {
  weekday: number;
  title: string;
  kind: EventKind;
  time?: string;
  venue?: string;
  href?: string;
};

export const recurringEvents: RecurringEvent[] = [
  {
    weekday: 2, // Tuesday
    title: "Mixer Night",
    kind: "social",
    time: "8:00 PM",
    venue: "Free Play Dallas",
  },
  {
    weekday: 3, // Wednesday
    title: "Pickup Games",
    kind: "pickup",
    time: "8:00 PM",
    venue: "Free Play Richardson",
  },
  {
    weekday: 4, // Thursday
    title: "Pickup Games",
    kind: "pickup",
    time: "8:00 PM",
    venue: "Tokyo Station (Arlington)",
  },
  {
    weekday: 4, // Thursday
    title: "Pickup Games",
    kind: "pickup",
    time: "8:00 PM",
    venue: "Free Play Denton",
  },
];

// Expand the recurring events into concrete dated events across an
// inclusive ISO date range (one month for the grid, a look-ahead
// window for "Upcoming").
export function expandRecurring(
  recurring: RecurringEvent[],
  startISO: string,
  endISO: string
): SceneEvent[] {
  const out: SceneEvent[] = [];
  const start = new Date(startISO + "T00:00");
  const end = new Date(endISO + "T00:00");
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const wd = d.getDay();
    for (const r of recurring) {
      if (r.weekday !== wd) continue;
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({
        date,
        title: r.title,
        kind: r.kind,
        time: r.time,
        venue: r.venue,
        href: r.href,
      });
    }
  }
  return out;
}

export function defaultHref(e: SceneEvent): string | undefined {
  // The members poll is hidden in the bare-bones build, and the regular
  // pickup nights now have fixed venues — so events only link if one is
  // set explicitly (e.g. a tournament bracket or signup page).
  return e.href;
}

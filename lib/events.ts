// ============================================================
// EVENTS — everything that shows on the Calendar besides league
// days (those are pulled in automatically from lib/league-days.ts).
// EDIT this list to add pickup nights, tournaments, socials.
// ============================================================

export type EventKind = "pickup" | "tournament" | "social";

export type SceneEvent = {
  date: string; // ISO: "2026-06-18"
  title: string;
  kind: EventKind;
  time?: string;
  venue?: string;
  // Where clicking the event takes you. Defaults:
  //   pickup     -> /members (the weekly poll)
  //   tournament -> wherever you set (bracket page, signup, etc.)
  //   social     -> nothing unless set
  href?: string;
};

export const events: SceneEvent[] = [
  {
    date: "2026-06-07",
    title: "Draft + Casuals",
    kind: "social",
    time: "4:00 PM",
    venue: "Free Play Dallas",
  },
  // EDIT: pickup night placeholders
  {
    date: "2026-06-17",
    title: "Pickup night",
    kind: "pickup",
    time: "7:00 PM",
    venue: "Voted weekly",
  },
  {
    date: "2026-06-24",
    title: "Pickup night",
    kind: "pickup",
    time: "7:00 PM",
    venue: "Voted weekly",
  },
];

export function defaultHref(e: SceneEvent): string | undefined {
  if (e.href) return e.href;
  if (e.kind === "pickup") return "/members";
  return undefined;
}

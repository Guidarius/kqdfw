import { getEvents, getRecurringEvents } from "@/lib/data/events";
import { getLeagueDays, getSeason } from "@/lib/data/league";
import { CalendarView } from "./CalendarView";

// Read live from the DB on every request so organizer edits show
// immediately (falls back to bundled constants when Supabase is unset).
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const [events, recurringEvents, leagueDays, season] = await Promise.all([
    getEvents(),
    getRecurringEvents(),
    getLeagueDays(),
    getSeason(),
  ]);
  return (
    <CalendarView
      events={events}
      recurringEvents={recurringEvents}
      leagueDays={leagueDays}
      season={season}
    />
  );
}

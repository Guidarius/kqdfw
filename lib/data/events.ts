// DB-first data access for calendar events. Same shapes as lib/events.ts;
// same fallback rule as lib/data/league.ts (constants only when Supabase
// is unconfigured or the query errors).

import { getServerSupabase } from "@/lib/supabase-server";
import {
  events as eventsConst,
  recurringEvents as recurringConst,
  type SceneEvent,
  type RecurringEvent,
  type EventKind,
} from "@/lib/events";

export async function getEvents(): Promise<SceneEvent[]> {
  const supabase = getServerSupabase();
  if (!supabase) return eventsConst;
  const { data, error } = await supabase
    .from("events")
    .select("date, title, kind, time, venue, href")
    .order("date", { ascending: true });
  if (error || !data) return eventsConst;
  return data.map((e) => ({
    date: e.date as string,
    title: e.title as string,
    kind: e.kind as EventKind,
    ...(e.time ? { time: e.time as string } : {}),
    ...(e.venue ? { venue: e.venue as string } : {}),
    ...(e.href ? { href: e.href as string } : {}),
  }));
}

export async function getRecurringEvents(): Promise<RecurringEvent[]> {
  const supabase = getServerSupabase();
  if (!supabase) return recurringConst;
  const { data, error } = await supabase
    .from("recurring_events")
    .select("weekday, title, kind, time, venue, href")
    .order("weekday", { ascending: true });
  if (error || !data) return recurringConst;
  return data.map((e) => ({
    weekday: e.weekday as number,
    title: e.title as string,
    kind: e.kind as EventKind,
    ...(e.time ? { time: e.time as string } : {}),
    ...(e.venue ? { venue: e.venue as string } : {}),
    ...(e.href ? { href: e.href as string } : {}),
  }));
}

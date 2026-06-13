"use client";

import { useState } from "react";
import Link from "next/link";
import { events, defaultHref, type SceneEvent } from "@/lib/events";
import { season, leagueDays, parseISODate } from "@/lib/league";

type CalEvent = Omit<SceneEvent, "kind"> & {
  kind: SceneEvent["kind"] | "league";
  href?: string;
};

// League days come in automatically; everything else from lib/events.ts.
const allEvents: CalEvent[] = [
  ...events.map((e) => ({ ...e, href: defaultHref(e) })),
  ...leagueDays.map((d) => ({
    date: d.date,
    title: d.name,
    kind: "league" as const,
    time: season.time,
    venue: d.venue,
    href: `/league?date=${d.date}`,
  })),
].sort((a, b) => a.date.localeCompare(b.date));

const kindStyles: Record<string, string> = {
  league: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  pickup: "bg-stone-800 text-stone-200 border-stone-700",
  tournament: "bg-rose-400/15 text-rose-300 border-rose-400/30",
  social: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
};

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function Chip({ e }: { e: CalEvent }) {
  const cls = `block truncate rounded border px-1 py-0.5 text-[10px] sm:px-1.5 sm:text-xs ${kindStyles[e.kind] ?? kindStyles.pickup}`;
  return e.href ? (
    <Link href={e.href} className={`${cls} hover:brightness-125`}>
      {e.title}
    </Link>
  ) : (
    <span className={cls}>{e.title}</span>
  );
}

export default function CalendarPage() {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const todayISO = iso(now.getFullYear(), now.getMonth(), now.getDate());

  const byDate = new Map<string, CalEvent[]>();
  for (const e of allEvents) {
    byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);
  }

  const monthName = first.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function shift(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }

  const upcoming = allEvents
    .filter((e) => parseISODate(e.date) >= new Date(todayISO + "T00:00"))
    .slice(0, 8);

  const cells: (number | null)[] = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-stone-50">Calendar</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="rounded-md border border-stone-700 px-3 py-1.5 text-stone-300 hover:border-amber-400 hover:text-amber-400 active:translate-y-px transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => setView({ y: now.getFullYear(), m: now.getMonth() })}
            className="rounded-md border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:border-amber-400 hover:text-amber-400 active:translate-y-px transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => shift(1)}
            aria-label="Next month"
            className="rounded-md border border-stone-700 px-3 py-1.5 text-stone-300 hover:border-amber-400 hover:text-amber-400 active:translate-y-px transition-colors"
          >
            ›
          </button>
        </div>
      </section>

      <section>
        <p className="text-lg font-semibold text-stone-100">{monthName}</p>
        <div className="mt-3 grid grid-cols-7 text-center font-pixel text-[10px] text-stone-500">
          {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((d) => (
            <div key={d} className="pb-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden border border-stone-800 bg-stone-800">
          {cells.map((day, i) => {
            const dISO = day ? iso(view.y, view.m, day) : "";
            const dayEvents = day ? (byDate.get(dISO) ?? []) : [];
            const isToday = dISO === todayISO;
            return (
              <div
                key={i}
                className={`min-h-20 bg-stone-950 p-1.5 ${day ? "" : "opacity-40"}`}
              >
                {day && (
                  <>
                    <span
                      className={`inline-block text-xs px-1 rounded ${
                        isToday
                          ? "bg-amber-400 text-stone-950 font-bold"
                          : "text-stone-500"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 flex flex-col gap-1">
                      {dayEvents.map((e, j) => (
                        <Chip key={j} e={e} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-400">
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400/60 me-1.5" />
            League
          </span>
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-stone-600 me-1.5" />
            Pickup (tap to vote)
          </span>
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-400/60 me-1.5" />
            Tournament
          </span>
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400/60 me-1.5" />
            Social
          </span>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-stone-50">Upcoming</h2>
        <div className="mt-4 flex flex-col gap-2">
          {upcoming.length === 0 && (
            <p className="text-stone-400 text-sm">
              Nothing on the calendar yet.
            </p>
          )}
          {upcoming.map((e, i) => {
            const inner = (
              <>
                <span className="text-amber-400 font-semibold w-20 shrink-0">
                  {parseISODate(e.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="font-medium text-stone-100">{e.title}</span>
                <span className="text-stone-400 text-sm">
                  {[e.time, e.venue].filter(Boolean).join(" · ")}
                </span>
              </>
            );
            const cls =
              "rounded-lg border border-stone-800 p-4 flex flex-wrap items-baseline gap-x-6 gap-y-1";
            return e.href ? (
              <Link
                key={i}
                href={e.href}
                className={`${cls} hover:border-amber-400 transition-colors`}
              >
                {inner}
              </Link>
            ) : (
              <div key={i} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

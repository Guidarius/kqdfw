"use client";

import { useState } from "react";
import Link from "next/link";
import {
  events,
  defaultHref,
  expandRecurring,
  type SceneEvent,
} from "@/lib/events";
import { season, leagueDays, parseISODate } from "@/lib/league";

type CalEvent = Omit<SceneEvent, "kind"> & {
  kind: SceneEvent["kind"] | "league";
  href?: string;
};

// One-off events + league days. The recurring weekly nights are generated
// per-view inside the component (see expandRecurring) so they appear on
// every month without hand-entering dates.
const baseEvents: CalEvent[] = [
  ...events.map((e) => ({ ...e, href: defaultHref(e) })),
  ...leagueDays.map((d) => ({
    date: d.date,
    title: d.name,
    kind: "league" as const,
    time: season.time,
    venue: d.venue,
    href: `/league?date=${d.date}`,
  })),
];

// ------------------------------------------------------------
// COLOR BY VENUE. Each location gets its own color so you can read
// the week at a glance (and tell the two Thursday pickups apart).
// `chip` styles the calendar entry; `dot` styles the legend swatch.
// Class strings are written out in full so Tailwind keeps them.
// Add a venue here to give it a color; anything unlisted falls back
// to neutral grey.
// ------------------------------------------------------------
const VENUE_COLORS: Record<
  string,
  { short: string; chip: string; dot: string }
> = {
  "Free Play Dallas": {
    short: "Dallas",
    chip: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    dot: "bg-amber-400/60",
  },
  "Free Play Richardson": {
    short: "Richardson",
    chip: "bg-sky-400/15 text-sky-300 border-sky-400/30",
    dot: "bg-sky-400/60",
  },
  "Tokyo Station (Arlington)": {
    short: "Tokyo Station (Arlington)",
    chip: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    dot: "bg-emerald-400/60",
  },
  "Free Play Denton": {
    short: "Denton",
    chip: "bg-violet-400/15 text-violet-300 border-violet-400/30",
    dot: "bg-violet-400/60",
  },
  "Free Play Fort Worth": {
    short: "Fort Worth",
    chip: "bg-rose-400/15 text-rose-300 border-rose-400/30",
    dot: "bg-rose-400/60",
  },
  "Arcade 92": {
    short: "Arcade 92",
    chip: "bg-orange-400/15 text-orange-300 border-orange-400/30",
    dot: "bg-orange-400/60",
  },
};

const VENUE_FALLBACK = {
  chip: "bg-stone-800 text-stone-200 border-stone-700",
  dot: "bg-stone-600",
};

function venueColor(venue?: string) {
  return (venue && VENUE_COLORS[venue]) || VENUE_FALLBACK;
}

function venueShort(venue?: string) {
  return (venue && VENUE_COLORS[venue]?.short) || venue || "";
}

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function Chip({ e }: { e: CalEvent }) {
  const cls = `block truncate rounded border px-1 py-0.5 text-[10px] sm:px-1.5 sm:text-xs ${venueColor(e.venue).chip}`;
  // Native tooltip: full detail on hover/focus without cluttering the cell.
  const tip = [e.title, e.venue, e.time].filter(Boolean).join(" · ");
  return e.href ? (
    <Link href={e.href} title={tip} className={`${cls} hover:brightness-125`}>
      {e.title}
    </Link>
  ) : (
    <span title={tip} className={cls}>
      {e.title}
    </span>
  );
}

export default function CalendarPage() {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const first = new Date(view.y, view.m, 1);
  // Monday-first week: push Sunday (getDay() === 0) to the last column.
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const todayISO = iso(now.getFullYear(), now.getMonth(), now.getDate());

  const monthStart = iso(view.y, view.m, 1);
  const monthEnd = iso(view.y, view.m, daysInMonth);

  // Everything happening in the visible month: in-range one-offs/league
  // days plus the recurring nights generated for this month.
  const monthEvents: CalEvent[] = [
    ...baseEvents.filter((e) => e.date >= monthStart && e.date <= monthEnd),
    ...expandRecurring(monthStart, monthEnd),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const byDate = new Map<string, CalEvent[]>();
  for (const e of monthEvents) {
    byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);
  }

  // Legend reflects only the venues actually on screen this month.
  const monthVenues = [
    ...new Set(monthEvents.map((e) => e.venue).filter(Boolean)),
  ] as string[];

  const monthName = first.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function shift(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }

  // "Upcoming": the next things across month boundaries (future one-offs/
  // league days + recurring nights for the next several weeks). This is also
  // the whole calendar view on phones — the month grid is desktop-only.
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 45);
  const horizonISO = iso(
    horizon.getFullYear(),
    horizon.getMonth(),
    horizon.getDate()
  );
  const upcoming: CalEvent[] = [
    ...baseEvents.filter(
      (e) => parseISODate(e.date) >= new Date(todayISO + "T00:00")
    ),
    ...expandRecurring(todayISO, horizonISO),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-stone-50">Calendar</h1>
        {/* Month controls drive the desktop grid only, so hide on phones. */}
        <div className="hidden sm:flex items-center gap-1">
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

      {/* Tablet / desktop: month grid (hidden on phones — too cramped there;
          the Upcoming list below is the phone view). */}
      <section className="hidden sm:block">
        <p className="text-lg font-semibold text-stone-100">{monthName}</p>
        <div className="mt-3 grid grid-cols-7 text-center font-pixel text-[10px] text-stone-500">
          {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => (
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
        {/* Legend: colors map to venues (only those on screen this month). */}
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-400">
          {monthVenues.length === 0 && (
            <span className="text-stone-500">No events this month.</span>
          )}
          {monthVenues.map((v) => (
            <span key={v}>
              <span
                className={`inline-block w-2.5 h-2.5 rounded-sm me-1.5 ${venueColor(v).dot}`}
              />
              {venueShort(v)}
            </span>
          ))}
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
                <span
                  className={`inline-block h-2.5 w-2.5 shrink-0 self-center rounded-sm ${venueColor(e.venue).dot}`}
                />
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
              "rounded-lg border border-stone-800 p-4 flex flex-wrap items-baseline gap-x-4 gap-y-1";
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

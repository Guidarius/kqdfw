import Link from "next/link";

import { schedule, thisWeek } from "@/lib/scene";
import { season } from "@/lib/league";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="pt-8">
        <p className="font-pixel text-xs text-amber-600 tracking-wider">
          dallas–fort worth
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-stone-50">
          Killer Queen <span className="text-amber-400">DFW</span>
        </h1>
        <p className="mt-3 text-stone-400">
          10-player arcade Killer Queen across the metroplex.
        </p>
      </section>

      <section className="rounded-lg border border-stone-800 p-5">
        <p className="font-pixel text-[11px] text-stone-500">this week</p>
        {thisWeek.headline ? (
          <>
            <p className="mt-1 text-lg font-bold text-stone-50">
              {thisWeek.headline}
            </p>
            {thisWeek.detail && (
              <p className="mt-1 text-sm text-stone-300">{thisWeek.detail}</p>
            )}
          </>
        ) : (
          <p className="mt-1 text-stone-300">
            Where we play is decided by weekly member vote.
          </p>
        )}
        <Link
          href="/members"
          className="mt-3 inline-block font-pixel text-xs text-amber-400 hover:text-amber-300"
        >
          vote now <span className="blink">_</span>
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        {schedule.map((s) => (
          <div
            key={s.day + s.label}
            className="rounded-lg border border-stone-800 p-5 flex flex-wrap gap-x-8 gap-y-1 items-baseline"
          >
            <span className="text-amber-400 font-semibold w-28">{s.day}</span>
            <span className="font-medium text-stone-100">{s.label}</span>
            <span className="text-stone-400 text-sm">
              {s.venue} · {s.time}
            </span>
          </div>
        ))}
        <Link
          href="/calendar"
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          Calendar →
        </Link>
      </section>

      <section className="rounded-lg border border-stone-800 p-5 flex flex-wrap items-baseline gap-x-8 gap-y-1">
        <span className="text-amber-400 font-semibold w-28">League</span>
        <span className="font-medium text-stone-100">{season.name}</span>
        <span className="text-stone-400 text-sm">
          {season.day} {season.time} · venue rotates
        </span>
        <Link
          href="/league"
          className="ms-auto text-sm text-amber-400 hover:text-amber-300"
        >
          Standings &amp; rosters →
        </Link>
      </section>

      <section className="text-sm text-stone-400">
        New or visiting?{" "}
        <Link href="/join" className="text-amber-400 hover:text-amber-300">
          Get in touch
        </Link>{" "}
        — we&apos;ll tell you where everyone&apos;s playing this week.
      </section>
    </div>
  );
}

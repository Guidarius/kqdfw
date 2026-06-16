import Link from "next/link";

import { schedule, thisWeek, gallery, links } from "@/lib/scene";
import { season } from "@/lib/league";
import { Hero } from "./components/Hero";
import { Gallery } from "./components/Gallery";
import { Button } from "./components/Button";
import { SectionLabel } from "./components/SectionLabel";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <Hero>
        <Button href="/join" variant="primary">
          New here? Come say hi
        </Button>
        <Button href="/calendar">See the calendar →</Button>
      </Hero>

      {/* This week's spot — the single most important live info. */}
      <section className="card glow-amber-box">
        <SectionLabel>this week</SectionLabel>
        {thisWeek.headline ? (
          <>
            <p className="mt-2 text-xl font-bold text-stone-50">
              {thisWeek.headline}
            </p>
            {thisWeek.detail && (
              <p className="mt-1 text-sm text-stone-300">{thisWeek.detail}</p>
            )}
          </>
        ) : (
          <p className="mt-2 text-lg text-stone-200">
            Where we play is decided by a weekly member vote.
          </p>
        )}
        <Link
          href="/members"
          className="mt-3 inline-block font-pixel text-xs text-amber-400 hover:text-amber-300"
        >
          vote now <span className="blink">_</span>
        </Link>
      </section>

      {/* Community photo wall — show off the scene. */}
      <section className="flex flex-col gap-4">
        <SectionLabel>the scene</SectionLabel>
        <Gallery photos={gallery} />
      </section>

      {/* Schedule */}
      <section className="flex flex-col gap-3">
        <SectionLabel>when we play</SectionLabel>
        {schedule.map((s) => (
          <div
            key={s.day + s.label}
            className="card flex flex-wrap items-baseline gap-x-8 gap-y-1"
          >
            <span className="w-28 font-semibold text-amber-400">{s.day}</span>
            <span className="font-medium text-stone-100">{s.label}</span>
            <span className="text-sm text-stone-400">
              {s.venue} · {s.time}
            </span>
          </div>
        ))}
        <Link
          href="/calendar"
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          Full calendar →
        </Link>
      </section>

      {/* League */}
      <section className="card flex flex-wrap items-baseline gap-x-8 gap-y-1">
        <span className="w-28 font-semibold text-amber-400">League</span>
        <span className="font-medium text-stone-100">{season.name}</span>
        <span className="text-sm text-stone-400">
          {season.day} {season.time} · venue rotates
        </span>
        <Link
          href="/league"
          className="ms-auto text-sm text-amber-400 hover:text-amber-300"
        >
          Standings &amp; rosters →
        </Link>
      </section>

      {/* Welcoming CTA band */}
      <section className="card glow-amber-box flex flex-col gap-4 text-center sm:p-8">
        <p className="text-lg font-semibold text-stone-50">
          New or visiting? Come watch — spectators always welcome.
        </p>
        <p className="text-sm text-stone-400">
          We&apos;ll tell you where everyone&apos;s playing this week. No
          experience needed.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/join" variant="primary">
            Get in touch
          </Button>
          <Button href={links.instagram}>Instagram</Button>
        </div>
      </section>
    </div>
  );
}

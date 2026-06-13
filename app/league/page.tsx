"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  season,
  teams,
  leagueDays,
  computeStandings,
  parseISODate,
  formatLong,
  type Match,
} from "@/lib/league";

function upcomingIndex(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return leagueDays.findIndex((d) => parseISODate(d.date) >= today);
}

function MatchRow({ m }: { m: Match }) {
  return (
    <li className="rounded-md border border-stone-800 bg-stone-950/40 px-3 py-2.5 flex items-center gap-2">
      <span className="text-stone-500 text-xs w-14 shrink-0">{m.time}</span>
      <span className="flex-1 text-right text-sm font-medium text-sky-300">
        {m.blue}
      </span>
      <span
        className={`w-12 shrink-0 text-center font-pixel text-[11px] ${
          m.score ? "text-stone-100" : "text-stone-600"
        }`}
      >
        {m.score ? `${m.score[0]}–${m.score[1]}` : "vs"}
      </span>
      <span className="flex-1 text-sm font-medium text-amber-300">
        {m.gold}
      </span>
    </li>
  );
}

function LeagueContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const upcomingIdx = upcomingIndex();
  const defaultIdx = upcomingIdx === -1 ? leagueDays.length - 1 : upcomingIdx;

  const [idx, setIdx] = useState(() => {
    const i = dateParam
      ? leagueDays.findIndex((d) => d.date === dateParam)
      : -1;
    return i !== -1 ? i : defaultIdx;
  });
  const [teamFilter, setTeamFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!dateParam) return;
    const i = leagueDays.findIndex((d) => d.date === dateParam);
    if (i !== -1) setIdx(i);
  }, [dateParam]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = leagueDays[idx];
  const isNext = idx === upcomingIdx;
  const seasonOver = upcomingIdx === -1;
  const standings = computeStandings();

  const visibleMatches = day
    ? day.matches.filter(
        (m) => !teamFilter || m.blue === teamFilter || m.gold === teamFilter
      )
    : [];

  // Distinct cabs on this day — multi-cab days render as columns.
  const cabs = day
    ? [...new Set(day.matches.flatMap((m) => (m.cab ? [m.cab] : [])))]
    : [];
  const multiCab = cabs.length > 1;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <h1 className="text-3xl font-bold text-stone-50">League</h1>
        <p className="text-stone-400">
          {season.name} · {season.day} {season.time}
        </p>
      </section>

      {/* Featured league day with cycler */}
      {day && (
        <section
          className={`rounded-lg border p-6 sm:p-8 ${
            isNext ? "border-amber-400/40 bg-amber-400/5" : "border-stone-800"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <p
              className={`font-pixel text-[11px] tracking-wider ${
                isNext ? "text-amber-400" : "text-stone-500"
              }`}
            >
              {isNext
                ? "next league day"
                : seasonOver
                  ? "season complete"
                  : parseISODate(day.date) < today
                    ? "earlier this season"
                    : "later this season"}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIdx(Math.max(0, idx - 1))}
                disabled={idx === 0}
                aria-label="Previous league day"
                className="rounded-md border border-stone-700 px-3 py-1.5 text-stone-300 hover:border-amber-400 hover:text-amber-400 active:translate-y-px disabled:opacity-30 disabled:hover:border-stone-700 disabled:hover:text-stone-300 transition-colors"
              >
                ‹
              </button>
              <button
                onClick={() => setIdx(Math.min(leagueDays.length - 1, idx + 1))}
                disabled={idx === leagueDays.length - 1}
                aria-label="Next league day"
                className="rounded-md border border-stone-700 px-3 py-1.5 text-stone-300 hover:border-amber-400 hover:text-amber-400 active:translate-y-px disabled:opacity-30 disabled:hover:border-stone-700 disabled:hover:text-stone-300 transition-colors"
              >
                ›
              </button>
            </div>
          </div>

          <p className="mt-2 text-2xl sm:text-3xl font-bold text-stone-50">
            {day.name}
          </p>
          <p className="mt-1 text-stone-300">
            {formatLong(day.date)} · {season.time} · {day.venue}
          </p>
          {day.note && (
            <p className="mt-2 text-sm text-amber-400">{day.note}</p>
          )}

          {/* Team filter */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            <button
              onClick={() => setTeamFilter(null)}
              className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                teamFilter === null
                  ? "border-amber-400 text-amber-400"
                  : "border-stone-700 text-stone-400 hover:text-stone-200"
              }`}
            >
              All teams
            </button>
            {teams.map((t) => (
              <button
                key={t.name}
                onClick={() =>
                  setTeamFilter(teamFilter === t.name ? null : t.name)
                }
                className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                  teamFilter === t.name
                    ? "border-amber-400 text-amber-400"
                    : "border-stone-700 text-stone-400 hover:text-stone-200"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Matches */}
          {day.matches.length === 0 ? (
            <p className="mt-5 text-stone-400 text-sm">
              Match schedule coming soon.
            </p>
          ) : multiCab ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {cabs.map((cab) => {
                const cabMatches = visibleMatches.filter((m) => m.cab === cab);
                return (
                  <div key={cab}>
                    <p className="font-pixel text-[11px] tracking-wider text-stone-400 pb-2 border-b border-stone-800">
                      {cab.toLowerCase()}
                    </p>
                    {cabMatches.length === 0 ? (
                      <p className="mt-3 text-sm text-stone-500">
                        No matches{teamFilter ? ` for ${teamFilter}` : ""} on
                        this cab.
                      </p>
                    ) : (
                      <ul className="mt-3 flex flex-col gap-2">
                        {cabMatches.map((m, i) => (
                          <MatchRow key={i} m={m} />
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <ul className="mt-5 flex flex-col gap-2">
              {visibleMatches.map((m, i) => (
                <MatchRow key={i} m={m} />
              ))}
              {visibleMatches.length === 0 && (
                <li className="text-stone-400 text-sm">
                  No matches for {teamFilter} this day.
                </li>
              )}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-stone-500">
            <span>
              <span className="text-sky-300">blue cab</span> ·{" "}
              <span className="text-amber-300">gold cab</span>
            </span>
            {!isNext && upcomingIdx !== -1 && (
              <button
                onClick={() => setIdx(defaultIdx)}
                className="text-amber-400 hover:text-amber-300"
              >
                Back to next league day
              </button>
            )}
          </div>
        </section>
      )}

      {/* Standings (computed from scores) */}
      <section>
        <h2 className="text-xl font-bold text-stone-50">Standings</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full max-w-xl text-left">
            <thead>
              <tr className="text-sm text-stone-500 border-b border-stone-800">
                <th className="py-2 pe-4 font-medium">#</th>
                <th className="py-2 pe-4 font-medium">Team</th>
                <th className="py-2 pe-4 font-medium">W</th>
                <th className="py-2 pe-4 font-medium">L</th>
                <th className="py-2 pe-4 font-medium" title="Map wins">
                  MW
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.name} className="border-b border-stone-800/60">
                  <td className="py-2.5 pe-4 font-pixel text-[11px] text-amber-600">
                    {i + 1}
                  </td>
                  <td className="py-2.5 pe-4 font-medium text-stone-100">
                    {s.name}
                  </td>
                  <td className="py-2.5 pe-4 text-stone-300">{s.wins}</td>
                  <td className="py-2.5 pe-4 text-stone-300">{s.losses}</td>
                  <td className="py-2.5 pe-4 text-stone-300">{s.mapWins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-stone-500">
          Computed from entered match scores. Standings are approximate until
          finalized after Decision Sunday.
        </p>
      </section>

      {/* Rosters */}
      <section>
        <h2 className="text-xl font-bold text-stone-50">Rosters</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((t) => (
            <div key={t.name} className="rounded-lg border border-stone-800 p-4">
              <p className="font-semibold text-stone-100">{t.name}</p>
              <p className="text-sm text-stone-300 mt-2">
                {t.captain}{" "}
                <span className="text-amber-400 text-xs font-semibold">C</span>
              </p>
              <ul className="mt-1 flex flex-col gap-1 text-sm text-stone-400">
                {t.players.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function LeaguePage() {
  return (
    <Suspense fallback={null}>
      <LeagueContent />
    </Suspense>
  );
}

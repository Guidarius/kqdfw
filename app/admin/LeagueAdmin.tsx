"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminCard, Btn, Field, Status, inputCls } from "./ui";
import { CsvImport } from "./TeamsAdmin";
import { parseCsv, requireCols, isISODate, parseScore } from "./csv";

type MatchRow = {
  id: number;
  time: string;
  cab: string | null;
  blue: string;
  gold: string;
  blue_score: number | null;
  gold_score: number | null;
  sort: number;
};
type DayRow = {
  id: number;
  date: string;
  name: string;
  venue: string;
  note: string | null;
  matches: MatchRow[];
};

export function LeagueAdmin({ supabase }: { supabase: SupabaseClient }) {
  const [season, setSeason] = useState({ name: "", day: "", time: "" });
  const [days, setDays] = useState<DayRow[]>([]);
  const [scores, setScores] = useState<Record<number, { blue: string; gold: string }>>({});
  const [newDay, setNewDay] = useState({ date: "", name: "League", venue: "", note: "" });
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const s = await supabase.from("season").select("name, day, time").eq("id", 1).maybeSingle();
    if (s.data) setSeason(s.data as typeof season);
    const d = await supabase
      .from("league_days")
      .select("id, date, name, venue, note, matches(id, time, cab, blue, gold, blue_score, gold_score, sort)")
      .order("date");
    if (d.error) return setStatus("! " + d.error.message);
    const list = ((d.data ?? []) as DayRow[]).map((day) => ({
      ...day,
      matches: [...day.matches].sort((a, b) => a.sort - b.sort || a.time.localeCompare(b.time)),
    }));
    setDays(list);
    const sc: Record<number, { blue: string; gold: string }> = {};
    for (const day of list)
      for (const m of day.matches)
        sc[m.id] = {
          blue: m.blue_score != null ? String(m.blue_score) : "",
          gold: m.gold_score != null ? String(m.gold_score) : "",
        };
    setScores(sc);
  }, [supabase]);

  useEffect(() => {
    // Fetch-on-mount: load() only setStates after an await, so this is safe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function saveSeason() {
    const { error } = await supabase.from("season").upsert({ id: 1, ...season });
    setStatus(error ? "! " + error.message : "Season saved.");
  }

  async function saveScore(id: number) {
    const s = scores[id];
    const blue = s.blue.trim() === "" ? null : Number(s.blue);
    const gold = s.gold.trim() === "" ? null : Number(s.gold);
    if ((blue === null) !== (gold === null))
      return setStatus("! Enter both scores, or clear both.");
    if ((blue != null && Number.isNaN(blue)) || (gold != null && Number.isNaN(gold)))
      return setStatus("! Scores must be numbers.");
    const { error } = await supabase
      .from("matches")
      .update({ blue_score: blue, gold_score: gold })
      .eq("id", id);
    setStatus(error ? "! " + error.message : "Score saved.");
    if (!error) load();
  }

  async function addDay() {
    if (!isISODate(newDay.date)) return setStatus("! Date must be YYYY-MM-DD.");
    const { error } = await supabase.from("league_days").insert({
      date: newDay.date,
      name: newDay.name.trim() || "League",
      venue: newDay.venue.trim(),
      note: newDay.note.trim() || null,
    });
    setStatus(error ? "! " + error.message : "League day added.");
    if (!error) {
      setNewDay({ date: "", name: "League", venue: "", note: "" });
      load();
    }
  }

  async function delDay(id: number, label: string) {
    if (!confirm(`Delete "${label}" and its matches?`)) return;
    const { error } = await supabase.from("league_days").delete().eq("id", id);
    setStatus(error ? "! " + error.message : "Deleted.");
    if (!error) load();
  }

  async function importSchedule(file: File) {
    try {
      const data = await parseCsv(file);
      const err = requireCols(data, ["date", "day_name", "venue", "time", "blue", "gold"]);
      if (err) return setStatus("! " + err);
      type DayBuild = { date: string; name: string; venue: string; note: string | null; matches: Omit<MatchRow, "id">[] };
      const order: string[] = [];
      const byDate = new Map<string, DayBuild>();
      for (const r of data) {
        const date = (r.date || "").trim();
        if (!isISODate(date)) return setStatus(`! Bad date "${r.date}".`);
        if (!byDate.has(date)) {
          byDate.set(date, {
            date,
            name: (r.day_name || "League").trim(),
            venue: (r.venue || "").trim(),
            note: r.note?.trim() || null,
            matches: [],
          });
          order.push(date);
        }
        const score = parseScore(r.score || "");
        byDate.get(date)!.matches.push({
          time: (r.time || "").trim(),
          cab: r.cab?.trim() || null,
          blue: (r.blue || "").trim(),
          gold: (r.gold || "").trim(),
          blue_score: score ? score[0] : null,
          gold_score: score ? score[1] : null,
          sort: byDate.get(date)!.matches.length,
        });
      }
      const totalMatches = order.reduce((n, d) => n + byDate.get(d)!.matches.length, 0);
      if (
        !confirm(
          `Replace the ENTIRE schedule with ${order.length} day(s) / ${totalMatches} match(es)? This cannot be undone.`
        )
      )
        return;
      const del = await supabase.from("league_days").delete().neq("id", -1);
      if (del.error) return setStatus("! " + del.error.message);
      for (const date of order) {
        const day = byDate.get(date)!;
        const ins = await supabase
          .from("league_days")
          .insert({ date: day.date, name: day.name, venue: day.venue, note: day.note })
          .select("id")
          .single();
        if (ins.error) return setStatus("! " + ins.error.message);
        if (day.matches.length) {
          const mi = await supabase
            .from("matches")
            .insert(day.matches.map((m) => ({ ...m, league_day_id: ins.data.id })));
          if (mi.error) return setStatus("! " + mi.error.message);
        }
      }
      setStatus(`Imported ${order.length} days / ${totalMatches} matches.`);
      load();
    } catch (e) {
      setStatus("! " + (e as Error).message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminCard title="Season" desc="Shown across the League and home pages.">
        <div className="grid gap-2 sm:grid-cols-3">
          <Field label="Name">
            <input className={inputCls} value={season.name} onChange={(e) => setSeason({ ...season, name: e.target.value })} />
          </Field>
          <Field label="Day">
            <input className={inputCls} value={season.day} onChange={(e) => setSeason({ ...season, day: e.target.value })} placeholder="Sundays" />
          </Field>
          <Field label="Time">
            <input className={inputCls} value={season.time} onChange={(e) => setSeason({ ...season, time: e.target.value })} placeholder="4:00 PM" />
          </Field>
        </div>
        <Btn variant="primary" onClick={saveSeason} className="self-start">Save season</Btn>
      </AdminCard>

      <AdminCard
        title="League days & scores"
        desc="Enter match scores as they're played — standings update automatically. Add or remove days, or replace the whole schedule from a CSV."
      >
        {days.map((day) => (
          <div key={day.id} className="rounded-md border border-stone-800 p-3 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-pixel text-[11px] text-amber-500">{day.date}</span>
              <span className="font-semibold text-stone-100">{day.name}</span>
              <span className="text-sm text-stone-400">{day.venue}</span>
              <Btn variant="danger" className="ms-auto" onClick={() => delDay(day.id, `${day.name} ${day.date}`)}>
                Delete day
              </Btn>
            </div>
            {day.matches.length === 0 ? (
              <p className="text-sm text-stone-500">No matches on this day.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {day.matches.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="w-14 shrink-0 text-xs text-stone-500">{m.time}</span>
                    {m.cab && <span className="text-[10px] text-stone-600">{m.cab}</span>}
                    <span className="flex-1 min-w-24 text-right font-medium text-sky-300">{m.blue}</span>
                    <input
                      className={`${inputCls} w-12 px-2 py-1 text-center`}
                      inputMode="numeric"
                      value={scores[m.id]?.blue ?? ""}
                      onChange={(e) => setScores({ ...scores, [m.id]: { ...scores[m.id], blue: e.target.value } })}
                    />
                    <span className="text-stone-600">–</span>
                    <input
                      className={`${inputCls} w-12 px-2 py-1 text-center`}
                      inputMode="numeric"
                      value={scores[m.id]?.gold ?? ""}
                      onChange={(e) => setScores({ ...scores, [m.id]: { ...scores[m.id], gold: e.target.value } })}
                    />
                    <span className="flex-1 min-w-24 font-medium text-amber-300">{m.gold}</span>
                    <Btn onClick={() => saveScore(m.id)}>Save</Btn>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {days.length === 0 && <p className="text-sm text-stone-500">No league days yet.</p>}

        <div className="rounded-md border border-stone-800 p-3 grid gap-2 sm:grid-cols-4">
          <Field label="Date">
            <input className={inputCls} value={newDay.date} onChange={(e) => setNewDay({ ...newDay, date: e.target.value })} placeholder="2026-07-19" />
          </Field>
          <Field label="Name">
            <input className={inputCls} value={newDay.name} onChange={(e) => setNewDay({ ...newDay, name: e.target.value })} />
          </Field>
          <Field label="Venue">
            <input className={inputCls} value={newDay.venue} onChange={(e) => setNewDay({ ...newDay, venue: e.target.value })} />
          </Field>
          <Field label="Note (optional)">
            <input className={inputCls} value={newDay.note} onChange={(e) => setNewDay({ ...newDay, note: e.target.value })} />
          </Field>
          <Btn variant="primary" onClick={addDay} className="self-start">Add league day</Btn>
        </div>

        <CsvImport
          label="Replace entire schedule from CSV"
          hint="Columns: date, day_name, venue, time, cab, blue, gold, score (cab & score optional; score like 3-1)."
          onFile={importSchedule}
        />
      </AdminCard>
      <Status msg={status} />
    </div>
  );
}

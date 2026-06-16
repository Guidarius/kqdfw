"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminCard, Btn, Field, Status, inputCls } from "./ui";
import { CsvImport } from "./TeamsAdmin";
import { parseCsv, requireCols, isISODate, KINDS } from "./csv";

type EventRow = {
  id: number;
  date: string;
  title: string;
  kind: string;
  time: string | null;
  venue: string | null;
  href: string | null;
};
type RecurRow = {
  id: number;
  weekday: number;
  title: string;
  kind: string;
  time: string | null;
  venue: string | null;
  href: string | null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function EventsAdmin({ supabase }: { supabase: SupabaseClient }) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [recur, setRecur] = useState<RecurRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [ev, setEv] = useState({
    date: "",
    title: "",
    kind: "social",
    time: "",
    venue: "",
    href: "",
  });
  const [rc, setRc] = useState({
    weekday: "2",
    title: "",
    kind: "pickup",
    time: "",
    venue: "",
    href: "",
  });

  const load = useCallback(async () => {
    const e = await supabase
      .from("events")
      .select("id, date, title, kind, time, venue, href")
      .order("date");
    const r = await supabase
      .from("recurring_events")
      .select("id, weekday, title, kind, time, venue, href")
      .order("weekday");
    if (e.error || r.error)
      return setStatus("! " + (e.error?.message || r.error?.message));
    setEvents((e.data ?? []) as EventRow[]);
    setRecur((r.data ?? []) as RecurRow[]);
  }, [supabase]);

  useEffect(() => {
    // Fetch-on-mount: load() only setStates after an await, so this is safe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function addEvent() {
    if (!isISODate(ev.date)) return setStatus("! Date must be YYYY-MM-DD.");
    if (!ev.title.trim()) return setStatus("! Title is required.");
    const { error } = await supabase.from("events").insert({
      date: ev.date,
      title: ev.title.trim(),
      kind: ev.kind,
      time: ev.time || null,
      venue: ev.venue || null,
      href: ev.href || null,
    });
    setStatus(error ? "! " + error.message : "Event added.");
    if (!error) {
      setEv({ date: "", title: "", kind: "social", time: "", venue: "", href: "" });
      load();
    }
  }

  async function addRecur() {
    if (!rc.title.trim()) return setStatus("! Title is required.");
    const { error } = await supabase.from("recurring_events").insert({
      weekday: Number(rc.weekday),
      title: rc.title.trim(),
      kind: rc.kind,
      time: rc.time || null,
      venue: rc.venue || null,
      href: rc.href || null,
    });
    setStatus(error ? "! " + error.message : "Recurring night added.");
    if (!error) {
      setRc({ weekday: rc.weekday, title: "", kind: "pickup", time: "", venue: "", href: "" });
      load();
    }
  }

  async function del(table: "events" | "recurring_events", id: number) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    setStatus(error ? "! " + error.message : "Deleted.");
    if (!error) load();
  }

  async function importEvents(file: File) {
    try {
      const data = await parseCsv(file);
      const err = requireCols(data, ["date", "title", "kind"]);
      if (err) return setStatus("! " + err);
      for (const r of data) {
        if (!isISODate(r.date || "")) return setStatus(`! Bad date "${r.date}".`);
        if (!KINDS.includes((r.kind || "").trim() as (typeof KINDS)[number]))
          return setStatus(`! Bad kind "${r.kind}" — use pickup/tournament/social.`);
      }
      if (!confirm(`Replace ALL one-off events with ${data.length} row(s)?`)) return;
      const d = await supabase.from("events").delete().neq("id", -1);
      if (d.error) return setStatus("! " + d.error.message);
      const ins = await supabase.from("events").insert(
        data.map((r) => ({
          date: r.date.trim(),
          title: (r.title || "").trim(),
          kind: r.kind.trim(),
          time: r.time?.trim() || null,
          venue: r.venue?.trim() || null,
          href: r.href?.trim() || null,
        }))
      );
      setStatus(ins.error ? "! " + ins.error.message : `Imported ${data.length} events.`);
      if (!ins.error) load();
    } catch (e) {
      setStatus("! " + (e as Error).message);
    }
  }

  async function importRecur(file: File) {
    try {
      const data = await parseCsv(file);
      const err = requireCols(data, ["weekday", "title", "kind"]);
      if (err) return setStatus("! " + err);
      for (const r of data) {
        const wd = Number(r.weekday);
        if (!Number.isInteger(wd) || wd < 0 || wd > 6)
          return setStatus(`! Bad weekday "${r.weekday}" — use 0 (Sun) to 6 (Sat).`);
        if (!KINDS.includes((r.kind || "").trim() as (typeof KINDS)[number]))
          return setStatus(`! Bad kind "${r.kind}".`);
      }
      if (!confirm(`Replace ALL recurring nights with ${data.length} row(s)?`)) return;
      const d = await supabase.from("recurring_events").delete().neq("id", -1);
      if (d.error) return setStatus("! " + d.error.message);
      const ins = await supabase.from("recurring_events").insert(
        data.map((r) => ({
          weekday: Number(r.weekday),
          title: (r.title || "").trim(),
          kind: r.kind.trim(),
          time: r.time?.trim() || null,
          venue: r.venue?.trim() || null,
          href: r.href?.trim() || null,
        }))
      );
      setStatus(ins.error ? "! " + ins.error.message : `Imported ${data.length} nights.`);
      if (!ins.error) load();
    } catch (e) {
      setStatus("! " + (e as Error).message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminCard
        title="One-off events"
        desc="Tournaments, special socials — anything on a specific date."
      >
        <div className="flex flex-col gap-2">
          {events.map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-stone-800 px-3 py-2 text-sm"
            >
              <span className="font-pixel text-[11px] text-amber-500 w-24">{e.date}</span>
              <span className="font-medium text-stone-100">{e.title}</span>
              <span className="text-stone-500">{e.kind}</span>
              <span className="text-stone-400">
                {[e.time, e.venue].filter(Boolean).join(" · ")}
              </span>
              <Btn variant="danger" className="ms-auto" onClick={() => del("events", e.id)}>
                Delete
              </Btn>
            </div>
          ))}
          {events.length === 0 && <p className="text-sm text-stone-500">No one-off events.</p>}
        </div>

        <div className="rounded-md border border-stone-800 p-3 grid gap-2 sm:grid-cols-2">
          <Field label="Date (YYYY-MM-DD)">
            <input className={inputCls} value={ev.date} onChange={(x) => setEv({ ...ev, date: x.target.value })} placeholder="2026-07-01" />
          </Field>
          <Field label="Title">
            <input className={inputCls} value={ev.title} onChange={(x) => setEv({ ...ev, title: x.target.value })} />
          </Field>
          <Field label="Kind">
            <select className={inputCls} value={ev.kind} onChange={(x) => setEv({ ...ev, kind: x.target.value })}>
              {KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </Field>
          <Field label="Time">
            <input className={inputCls} value={ev.time} onChange={(x) => setEv({ ...ev, time: x.target.value })} placeholder="4:00 PM" />
          </Field>
          <Field label="Venue">
            <input className={inputCls} value={ev.venue} onChange={(x) => setEv({ ...ev, venue: x.target.value })} />
          </Field>
          <Field label="Link (optional)">
            <input className={inputCls} value={ev.href} onChange={(x) => setEv({ ...ev, href: x.target.value })} placeholder="https://…" />
          </Field>
          <Btn variant="primary" onClick={addEvent} className="self-start">Add event</Btn>
        </div>

        <CsvImport
          label="Replace all one-off events from CSV"
          hint="Columns: date, title, kind, time, venue, href"
          onFile={importEvents}
        />
      </AdminCard>

      <AdminCard
        title="Recurring weekly nights"
        desc="The regular nights — generated onto every month automatically."
      >
        <div className="flex flex-col gap-2">
          {recur.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-stone-800 px-3 py-2 text-sm"
            >
              <span className="font-pixel text-[11px] text-amber-500 w-12">{WEEKDAYS[r.weekday]}</span>
              <span className="font-medium text-stone-100">{r.title}</span>
              <span className="text-stone-500">{r.kind}</span>
              <span className="text-stone-400">{[r.time, r.venue].filter(Boolean).join(" · ")}</span>
              <Btn variant="danger" className="ms-auto" onClick={() => del("recurring_events", r.id)}>
                Delete
              </Btn>
            </div>
          ))}
          {recur.length === 0 && <p className="text-sm text-stone-500">No recurring nights.</p>}
        </div>

        <div className="rounded-md border border-stone-800 p-3 grid gap-2 sm:grid-cols-2">
          <Field label="Weekday">
            <select className={inputCls} value={rc.weekday} onChange={(x) => setRc({ ...rc, weekday: x.target.value })}>
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Title">
            <input className={inputCls} value={rc.title} onChange={(x) => setRc({ ...rc, title: x.target.value })} />
          </Field>
          <Field label="Kind">
            <select className={inputCls} value={rc.kind} onChange={(x) => setRc({ ...rc, kind: x.target.value })}>
              {KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </Field>
          <Field label="Time">
            <input className={inputCls} value={rc.time} onChange={(x) => setRc({ ...rc, time: x.target.value })} placeholder="8:00 PM" />
          </Field>
          <Field label="Venue">
            <input className={inputCls} value={rc.venue} onChange={(x) => setRc({ ...rc, venue: x.target.value })} />
          </Field>
          <Field label="Link (optional)">
            <input className={inputCls} value={rc.href} onChange={(x) => setRc({ ...rc, href: x.target.value })} />
          </Field>
          <Btn variant="primary" onClick={addRecur} className="self-start">Add night</Btn>
        </div>

        <CsvImport
          label="Replace all recurring nights from CSV"
          hint="Columns: weekday (0=Sun..6=Sat), title, kind, time, venue, href"
          onFile={importRecur}
        />
      </AdminCard>
      <Status msg={status} />
    </div>
  );
}

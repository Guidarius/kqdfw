"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminCard, Btn, Field, Status, inputCls } from "./ui";
import { parseCsv, requireCols } from "./csv";

type TeamRow = {
  id: number;
  name: string;
  captain: string;
  players: string[];
  sort: number;
};

export function TeamsAdmin({ supabase }: { supabase: SupabaseClient }) {
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [edit, setEdit] = useState<Record<number, { captain: string; players: string }>>({});
  const [add, setAdd] = useState({ name: "", captain: "", players: "" });
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, captain, players, sort")
      .order("sort")
      .order("name");
    if (error) return setStatus("! " + error.message);
    const list = (data ?? []) as TeamRow[];
    setRows(list);
    setEdit(
      Object.fromEntries(
        list.map((t) => [t.id, { captain: t.captain, players: (t.players ?? []).join(", ") }])
      )
    );
  }, [supabase]);

  useEffect(() => {
    // Fetch-on-mount: load() only setStates after an await, so this is safe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function players(s: string): string[] {
    return s.split(",").map((p) => p.trim()).filter(Boolean);
  }

  async function saveTeam(id: number) {
    const e = edit[id];
    const { error } = await supabase
      .from("teams")
      .update({ captain: e.captain, players: players(e.players) })
      .eq("id", id);
    setStatus(error ? "! " + error.message : "Saved.");
    if (!error) load();
  }

  async function delTeam(id: number, name: string) {
    if (!confirm(`Delete team "${name}"?`)) return;
    const { error } = await supabase.from("teams").delete().eq("id", id);
    setStatus(error ? "! " + error.message : "Deleted.");
    if (!error) load();
  }

  async function addTeam() {
    if (!add.name.trim()) return setStatus("! Team name is required.");
    const sort = rows.length ? Math.max(...rows.map((r) => r.sort)) + 1 : 0;
    const { error } = await supabase.from("teams").insert({
      name: add.name.trim(),
      captain: add.captain.trim(),
      players: players(add.players),
      sort,
    });
    setStatus(error ? "! " + error.message : "Team added.");
    if (!error) {
      setAdd({ name: "", captain: "", players: "" });
      load();
    }
  }

  async function importCsv(file: File) {
    try {
      const data = await parseCsv(file);
      const err = requireCols(data, ["team", "captain", "player"]);
      if (err) return setStatus("! " + err);
      // Group rows into teams, preserving first-seen order.
      const order: string[] = [];
      const byTeam = new Map<string, { captain: string; players: string[] }>();
      for (const r of data) {
        const name = (r.team || "").trim();
        if (!name) continue;
        if (!byTeam.has(name)) {
          byTeam.set(name, { captain: (r.captain || "").trim(), players: [] });
          order.push(name);
        }
        const t = byTeam.get(name)!;
        if (!t.captain && r.captain) t.captain = r.captain.trim();
        if (r.player && r.player.trim()) t.players.push(r.player.trim());
      }
      if (!order.length) return setStatus("! No teams found in CSV.");
      if (
        !confirm(
          `Replace ALL teams with ${order.length} team(s) from the CSV? This cannot be undone.`
        )
      )
        return;
      const del = await supabase.from("teams").delete().neq("id", -1);
      if (del.error) return setStatus("! " + del.error.message);
      const ins = await supabase.from("teams").insert(
        order.map((name, i) => ({
          name,
          captain: byTeam.get(name)!.captain,
          players: byTeam.get(name)!.players,
          sort: i,
        }))
      );
      setStatus(ins.error ? "! " + ins.error.message : `Imported ${order.length} teams.`);
      if (!ins.error) load();
    } catch (e) {
      setStatus("! " + (e as Error).message);
    }
  }

  return (
    <AdminCard
      title="Teams & rosters"
      desc="Edit a team's captain and players, add a team, or replace everything from a CSV."
    >
      <div className="flex flex-col gap-3">
        {rows.map((t) => (
          <div
            key={t.id}
            className="rounded-md border border-stone-800 p-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-100">{t.name}</span>
              <Btn variant="danger" onClick={() => delTeam(t.id, t.name)}>
                Delete
              </Btn>
            </div>
            <Field label="Captain">
              <input
                className={inputCls}
                value={edit[t.id]?.captain ?? ""}
                onChange={(ev) =>
                  setEdit({ ...edit, [t.id]: { ...edit[t.id], captain: ev.target.value } })
                }
              />
            </Field>
            <Field label="Players (comma-separated)">
              <input
                className={inputCls}
                value={edit[t.id]?.players ?? ""}
                onChange={(ev) =>
                  setEdit({ ...edit, [t.id]: { ...edit[t.id], players: ev.target.value } })
                }
              />
            </Field>
            <Btn variant="primary" onClick={() => saveTeam(t.id)} className="self-start">
              Save
            </Btn>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-stone-500">No teams yet.</p>
        )}
      </div>

      <div className="rounded-md border border-stone-800 p-3 flex flex-col gap-2">
        <p className="font-pixel text-[10px] uppercase tracking-wider text-amber-500">
          add a team
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            className={inputCls}
            placeholder="Team name"
            value={add.name}
            onChange={(e) => setAdd({ ...add, name: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Captain"
            value={add.captain}
            onChange={(e) => setAdd({ ...add, captain: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Players (comma-separated)"
            value={add.players}
            onChange={(e) => setAdd({ ...add, players: e.target.value })}
          />
        </div>
        <Btn variant="primary" onClick={addTeam} className="self-start">
          Add team
        </Btn>
      </div>

      <CsvImport
        label="Replace all teams from CSV"
        hint="Columns: team, captain, player — one row per player."
        onFile={importCsv}
      />
      <Status msg={status} />
    </AdminCard>
  );
}

export function CsvImport({
  label,
  hint,
  onFile,
}: {
  label: string;
  hint: string;
  onFile: (f: File) => void;
}) {
  return (
    <div className="rounded-md border border-dashed border-stone-700 p-3 flex flex-col gap-2">
      <p className="font-pixel text-[10px] uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <p className="text-xs text-stone-500">{hint}</p>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
        className="text-sm text-stone-300 file:mr-3 file:rounded-md file:border file:border-stone-700 file:bg-stone-900 file:px-3 file:py-1.5 file:text-sm file:text-amber-300 hover:file:border-amber-400"
      />
    </div>
  );
}

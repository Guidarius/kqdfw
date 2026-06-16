"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { LeagueAdmin } from "./LeagueAdmin";
import { EventsAdmin } from "./EventsAdmin";
import { TeamsAdmin } from "./TeamsAdmin";

const TABS = [
  { id: "league", label: "League & scores" },
  { id: "calendar", label: "Calendar" },
  { id: "teams", label: "Teams" },
] as const;

export function AdminDashboard({
  supabase,
  email,
  onSignOut,
}: {
  supabase: SupabaseClient;
  email?: string;
  onSignOut: () => void;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("league");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-stone-50">Admin</h1>
          <p className="mt-1 text-sm text-stone-400">
            Edits go live on the site immediately. {email && `Signed in as ${email}.`}
          </p>
        </div>
        <button onClick={onSignOut} className="text-sm text-stone-400 hover:text-amber-400">
          Sign out
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-stone-800 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-sm border transition-colors ${
              tab === t.id
                ? "border-amber-400 text-amber-400"
                : "border-stone-700 text-stone-400 hover:text-stone-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "league" && <LeagueAdmin supabase={supabase} />}
      {tab === "calendar" && <EventsAdmin supabase={supabase} />}
      {tab === "teams" && <TeamsAdmin supabase={supabase} />}
    </div>
  );
}

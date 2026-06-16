"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { AdminDashboard } from "./AdminDashboard";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-xl flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-stone-50">Admin</h1>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const supabase = getSupabase();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const { data: me } = await supabase
          .from("members")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        setIsOrganizer(me?.role === "organizer");
      }
      setLoading(false);
    });
  }, [supabase]);

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null);
    setIsOrganizer(false);
  }

  if (!supabase)
    return (
      <Shell>
        <p className="rounded-lg border border-stone-800 p-5 text-stone-300">
          The admin area isn&apos;t live yet — Supabase isn&apos;t configured.
        </p>
      </Shell>
    );

  if (loading) return <p className="text-stone-400">Loading…</p>;

  if (!session)
    return (
      <Shell>
        <p className="leading-7 text-stone-300">
          The admin area is for scene organizers. Log in to continue.
        </p>
        <Link
          href="/login"
          className="self-start rounded-md bg-amber-400 px-5 py-2.5 font-semibold text-stone-950 hover:bg-amber-300 transition-colors"
        >
          Log in
        </Link>
      </Shell>
    );

  if (!isOrganizer)
    return (
      <Shell>
        <p className="leading-7 text-stone-300">
          You&apos;re signed in, but this area is limited to organizers. If you
          should have access, ask an existing organizer to grant it.
        </p>
        <button
          onClick={signOut}
          className="self-start text-sm text-stone-400 hover:text-amber-400"
        >
          Sign out
        </button>
      </Shell>
    );

  return (
    <AdminDashboard
      supabase={supabase}
      email={session.user.email}
      onSignOut={signOut}
    />
  );
}

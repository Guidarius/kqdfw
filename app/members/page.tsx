"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { contacts } from "@/lib/scene";

type Poll = {
  id: number;
  question: string;
  options: string[];
  is_open: boolean;
};

type Result = { option_index: number; vote_count: number };

export default function MembersPage() {
  const supabase = getSupabase();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [memberStatus, setMemberStatus] = useState<string | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);
  const [voting, setVoting] = useState(false);

  const loadPoll = useCallback(
    async (userId: string) => {
      if (!supabase) return;
      const { data: polls } = await supabase
        .from("polls")
        .select("id, question, options, is_open")
        .eq("is_open", true)
        .order("created_at", { ascending: false })
        .limit(1);
      const p = polls?.[0] as Poll | undefined;
      if (!p) return;
      setPoll(p);
      const { data: vote } = await supabase
        .from("votes")
        .select("option_index")
        .eq("poll_id", p.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (vote) {
        setMyVote(vote.option_index);
        const { data: res } = await supabase.rpc("poll_results", {
          p_poll_id: p.id,
        });
        setResults(res ?? null);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Ensure a member row exists (created as pending on first login).
        await supabase
          .from("members")
          .insert({
            id: session.user.id,
            display_name: session.user.email,
          })
          .select()
          .maybeSingle(); // ignore conflict errors — row may already exist
        const { data: me } = await supabase
          .from("members")
          .select("status")
          .eq("id", session.user.id)
          .maybeSingle();
        setMemberStatus(me?.status ?? "pending");
        if (me?.status === "approved") await loadPoll(session.user.id);
      }
      setLoading(false);
    });
  }, [supabase, loadPoll]);

  async function castVote(optionIndex: number) {
    if (!supabase || !poll || !session) return;
    setVoting(true);
    const { error } = await supabase.from("votes").insert({
      poll_id: poll.id,
      user_id: session.user.id,
      option_index: optionIndex,
    });
    if (!error) {
      setMyVote(optionIndex);
      const { data: res } = await supabase.rpc("poll_results", {
        p_poll_id: poll.id,
      });
      setResults(res ?? null);
    }
    setVoting(false);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null);
    setMemberStatus(null);
  }

  if (!supabase)
    return (
      <p className="rounded-lg border border-stone-800 p-5 text-stone-300 max-w-xl">
        The members area isn&apos;t live yet — check back soon.
      </p>
    );

  if (loading) return <p className="text-stone-400">Loading…</p>;

  if (!session)
    return (
      <div className="max-w-xl flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-stone-50">Members</h1>
        <p className="leading-7 text-stone-300">
          This area is for approved local players — weekly polls, RSVPs, and
          league tools live here.
        </p>
        <Link
          href="/login"
          className="self-start rounded-md bg-amber-400 px-5 py-2.5 font-semibold text-stone-950 hover:bg-amber-300 transition-colors"
        >
          Log in
        </Link>
      </div>
    );

  if (memberStatus !== "approved")
    return (
      <div className="max-w-xl flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-stone-50">
          Account pending approval
        </h1>
        <p className="leading-7 text-stone-300">
          You&apos;re signed in, but member features unlock once an organizer
          confirms you&apos;re a local player. Usually that&apos;s quick —
          mention it to {contacts[0].name} at a night, or message the socials
          and say who you are.
        </p>
        <button
          onClick={signOut}
          className="self-start text-sm text-stone-400 hover:text-amber-400"
        >
          Sign out
        </button>
      </div>
    );

  const total = results?.reduce((s, r) => s + Number(r.vote_count), 0) ?? 0;

  return (
    <div className="max-w-xl flex flex-col gap-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-3xl font-bold text-stone-50">Members</h1>
        <button
          onClick={signOut}
          className="text-sm text-stone-400 hover:text-amber-400"
        >
          Sign out
        </button>
      </div>

      {!poll ? (
        <p className="rounded-lg border border-stone-800 p-5 leading-7 text-stone-300">
          No open poll right now — check back when the week&apos;s vote goes
          up.
        </p>
      ) : (
        <section className="rounded-lg border border-stone-800 p-6">
          <h2 className="text-xl font-bold text-stone-50">{poll.question}</h2>
          <p className="mt-1 text-sm text-stone-500">
            Votes are anonymous — only the totals are visible, to anyone.
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            {poll.options.map((opt, i) => {
              const count = Number(
                results?.find((r) => r.option_index === i)?.vote_count ?? 0
              );
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return myVote === null ? (
                <button
                  key={i}
                  disabled={voting}
                  onClick={() => castVote(i)}
                  className="rounded-md border border-stone-700 px-4 py-2.5 text-left text-stone-200 hover:border-amber-400 hover:text-amber-400 disabled:opacity-50 transition-colors"
                >
                  {opt}
                </button>
              ) : (
                <div
                  key={i}
                  className="relative rounded-md border border-stone-800 px-4 py-2.5 overflow-hidden"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-amber-400/15"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex justify-between text-stone-200">
                    <span>
                      {opt}
                      {myVote === i && (
                        <span className="text-amber-400"> — your vote</span>
                      )}
                    </span>
                    <span className="text-stone-400 text-sm">
                      {count} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {myVote !== null && (
            <p className="mt-3 text-sm text-stone-500">{total} votes so far</p>
          )}
        </section>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const supabase = getSupabase();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [email, setEmail] = useState("");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/members` },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="flex flex-col gap-8 max-w-md">
      <section>
        <h1 className="text-3xl font-bold text-stone-50">Member login</h1>
        <p className="mt-3 leading-7 text-stone-300">
          For local players. Enter your email and we&apos;ll send you a sign-in
          link — no password to remember.
        </p>
      </section>

      {!supabase ? (
        <p className="rounded-lg border border-stone-800 p-5 text-stone-300">
          Login isn&apos;t live yet — check back soon.
        </p>
      ) : status === "sent" ? (
        <p className="rounded-lg border border-amber-400/40 bg-amber-400/5 p-5 text-stone-200 leading-7">
          Check your email — the sign-in link is on its way. It can take a
          minute or two.
        </p>
      ) : (
        <form onSubmit={sendLink} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-200">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-400 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="self-start rounded-md bg-amber-400 px-5 py-2.5 font-semibold text-stone-950 hover:bg-amber-300 disabled:opacity-50 transition-colors"
          >
            {status === "sending" ? "Sending…" : "Email me a link"}
          </button>
          {status === "error" && (
            <p className="text-sm text-red-400">
              Couldn&apos;t send the link — double-check the address and try
              again.
            </p>
          )}
        </form>
      )}

      <p className="text-sm text-stone-500 leading-6">
        New around here? Logging in creates a pending account — an organizer
        approves local players before member features unlock. Start with the
        join form if we haven&apos;t met yet.
      </p>
    </div>
  );
}

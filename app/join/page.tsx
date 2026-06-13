"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { links } from "@/lib/scene";

export default function JoinPage() {
  const supabase = getSupabase();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    const { error } = await supabase.from("interest").insert({
      name: form.get("name"),
      contact: form.get("contact"),
      how_found: form.get("how_found"),
      message: form.get("message"),
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <section>
        <h1 className="text-3xl font-bold text-stone-50">Get in touch</h1>
        <p className="mt-2 text-stone-400">
          Drop your info and someone will reach out — or message the{" "}
          <a href={links.instagram} className="text-amber-400 hover:text-amber-300">
            Instagram
          </a>{" "}
          /{" "}
          <a href={links.facebook} className="text-amber-400 hover:text-amber-300">
            Facebook
          </a>{" "}
          directly.
        </p>
      </section>

      {!supabase ? (
        <p className="rounded-lg border border-stone-800 p-5 text-stone-300">
          Form coming soon — message us on{" "}
          <a href={links.instagram} className="text-amber-400 hover:text-amber-300">
            Instagram
          </a>{" "}
          or{" "}
          <a href={links.facebook} className="text-amber-400 hover:text-amber-300">
            Facebook
          </a>
          .
        </p>
      ) : status === "sent" ? (
        <p className="rounded-lg border border-amber-400/40 bg-amber-400/5 p-5 text-stone-200">
          Got it — we&apos;ll be in touch soon.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-200">Name</span>
            <input
              name="name"
              required
              maxLength={100}
              className="rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-200">
              How should we reach you?
            </span>
            <input
              name="contact"
              required
              maxLength={200}
              placeholder="Email, Instagram, Messenger, Discord"
              className="rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 placeholder:text-stone-500 focus:border-amber-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-200">
              How&apos;d you hear about us?{" "}
              <span className="text-stone-500 font-normal">(optional)</span>
            </span>
            <input
              name="how_found"
              maxLength={200}
              className="rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-200">
              Anything else?{" "}
              <span className="text-stone-500 font-normal">(optional)</span>
            </span>
            <textarea
              name="message"
              rows={3}
              maxLength={1000}
              className="rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-400 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="self-start rounded-md bg-amber-400 px-5 py-2.5 font-semibold text-stone-950 hover:bg-amber-300 disabled:opacity-50 transition-colors"
          >
            {status === "sending" ? "Sending…" : "Send"}
          </button>
          {status === "error" && (
            <p className="text-sm text-red-400">
              Something went wrong — try again or message us on socials.
            </p>
          )}
        </form>
      )}

      <p className="text-sm text-stone-500">
        Read by scene organizers only.
      </p>
    </div>
  );
}

"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Returns null when Supabase isn't configured yet, so the public
// site works before any backend exists. Pages that need the DB
// show a friendly fallback instead of crashing.
let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key ? createClient(url, key) : null;
  return client;
}

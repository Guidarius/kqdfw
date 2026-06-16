import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-side, read-only Supabase client for use in Server Components.
// Uses the public anon key (RLS allows anonymous SELECT on content
// tables). Returns null when Supabase isn't configured, so the data
// layer can fall back to the bundled constants and the site still
// renders. No session/cookies — this is for public reads only.
export function getServerSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

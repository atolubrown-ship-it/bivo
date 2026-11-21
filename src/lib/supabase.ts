import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Set these in Vercel (Project → Settings → Environment Variables) and in a local .env file.
const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

// null when keys are missing: the app then runs in demo mode and keeps branding in the browser.
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = supabase !== null;

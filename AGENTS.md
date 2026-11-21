# AGENTS.md — project rules

- Branding (name, logo, sign-in text) lives in `src/lib/brand-store.ts` (data) with the context/hook in `src/lib/brand-context.ts` and only the provider component in `src/lib/brand.tsx` — never mix components and non-component exports in one file, or Fast Refresh forces full reloads: it reads/writes the Supabase `brand_settings` row (id 1) when `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are set, else localStorage — why: the owner deploys with their own Supabase + Vercel, not a hosted backend.
- Admin edits are gated by the `is_admin()` SQL function and RLS defined in `supabase/brand_settings.sql` — why: the client check is UX only; the database enforces who can write.
- `vite.config.ts` pins `nitro: { preset: "vercel" }` — why: `vite build` must always emit Vercel's Build Output API (`.vercel/output`) instead of auto-detecting another target.
- The Supabase client is created from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` only (`src/lib/supabase.ts`), and stays `null` when they are missing — why: the app must still run in demo mode locally, and no secret key may ever reach the browser.

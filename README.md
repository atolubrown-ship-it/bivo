# Bivo — sign-in app (React + TypeScript)

A two-step sign-in page with an editable brand (name, logo, headline, support email) that
the owner changes from `/admin`. Built with TanStack Start, React 19, Tailwind CSS v4 and
Supabase.

---

## 1. Run it locally

```sh
bun install        # or: npm install
cp .env.example .env
bun run dev        # or: npm run dev
```

Open the printed URL (usually http://localhost:8080).

Without Supabase keys in `.env` the app runs in **demo mode**: sign-in only shows a demo
result, and branding edits are saved in your own browser instead of the database.

## 2. Connect your own Supabase project

1. In Supabase: **SQL Editor → New query**, paste the whole contents of
   `supabase/brand_settings.sql`, and run it. This creates the `brand_settings` and
   `admins` tables, the `is_admin()` check, and the row-level-security rules.
2. In Supabase: **Project Settings → API**, copy the **Project URL** and the
   **anon public** key.
3. Put both in `.env`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

4. In Supabase: **Authentication → Providers**, make sure **Email** is enabled (and
   optionally Google / Apple).

## 3. Deploy to Vercel

Vercel detects TanStack Start + Nitro automatically, so no build settings are needed.

**From GitHub (recommended)**

1. Push this folder to a GitHub repository:
   ```sh
   git init
   git add .
   git commit -m "Bivo"
   git branch -M main
   git remote add origin https://github.com/YOUR-USER/bivo.git
   git push -u origin main
   ```
2. On vercel.com: **Add New → Project → Import** that repository.
3. **Settings → Environment Variables → Add**, for Production *and* Preview:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon public key
4. **Deploy**. The build command is `vite build` (auto-detected); the output is
   `.vercel/output`, produced by Nitro's `vercel` preset.

**Or with the Vercel CLI**

```sh
npm i -g vercel
vercel        # preview
vercel --prod # live
```

Add the same two environment variables in the Vercel dashboard before `--prod`.

## 4. Make yourself an admin

1. Open the deployed site and sign up once.
2. In Supabase: **SQL Editor**, run (replace the email with the one you signed up with):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com';
```

3. Open `/admin` on the site to change the app name, logo URL, headline, subline and
   support email. Only users in `public.admins` can save; everyone can read.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Local dev server |
| `bun run build` | Production build for Vercel (`.vercel/output`) |
| `bun run preview` | Serve the built app locally |
| `bun test` | Run the test suite |
| `bun run lint` / `bun run format` | Lint / format |

## Layout

- `src/routes/index.tsx` — the sign-in page
- `src/routes/admin.tsx` — the branding editor (admin only)
- `src/components/AuthCard.tsx` — the sign-in / sign-up card
- `src/lib/brand-store.ts` — reads and writes `public.brand_settings`
- `src/lib/supabase.ts` — creates the Supabase client from the `VITE_` variables
- `supabase/brand_settings.sql` — tables, RLS policies, admin check (run once)

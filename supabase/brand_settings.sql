-- Run this once in your Supabase project (SQL Editor → New query).

-- 1) Branding (one row, id = 1). Everyone can read it; only admins can change it.
create table if not exists public.brand_settings (
  id int primary key default 1 check (id = 1),
  app_name text not null default 'Bivo',
  logo_url text not null default '',
  headline text not null default 'Sign in',
  subline text not null default 'Use your Bivo account to continue',
  support_email text not null default 'help@bivo.app',
  updated_at timestamptz not null default now()
);
insert into public.brand_settings (id) values (1) on conflict (id) do nothing;

-- 2) Admins: add the user id of each person allowed to edit branding.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.brand_settings enable row level security;
alter table public.admins enable row level security;

grant select on public.brand_settings to anon, authenticated;
grant insert, update on public.brand_settings to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "brand readable by all" on public.brand_settings;
create policy "brand readable by all" on public.brand_settings for select using (true);

drop policy if exists "admins insert brand" on public.brand_settings;
create policy "admins insert brand" on public.brand_settings for insert to authenticated with check (public.is_admin());

drop policy if exists "admins update brand" on public.brand_settings;
create policy "admins update brand" on public.brand_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins see themselves" on public.admins;
create policy "admins see themselves" on public.admins for select to authenticated using (user_id = auth.uid());

-- Make yourself admin (replace with your email after signing up once):
-- insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';

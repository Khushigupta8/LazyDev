-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- The whole site (settings, services, projects, enquiries, admin login) is stored as one JSON row.
create table if not exists public.site_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Lock the table down: with RLS on and no policies, only the server (service role key) can read or write it.
alter table public.site_data enable row level security;

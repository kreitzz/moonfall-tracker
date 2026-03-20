create table if not exists public.party_sheets (
  slug text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.party_sheets enable row level security;

-- The app uses the service role on the server route, so client-side policies are not required
-- for the current implementation. If you later expose direct client access, add explicit policies.

-- Favorites tables
create table if not exists public.event_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create table if not exists public.job_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.job_postings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

-- Enable RLS
alter table public.event_favorites enable row level security;
alter table public.job_favorites enable row level security;

-- Event favorites policies
drop policy if exists "event_favorites_select_own" on public.event_favorites;
create policy "event_favorites_select_own"
on public.event_favorites for select
using (auth.uid() = user_id);

drop policy if exists "event_favorites_insert_own" on public.event_favorites;
create policy "event_favorites_insert_own"
on public.event_favorites for insert
with check (auth.uid() = user_id);

drop policy if exists "event_favorites_delete_own" on public.event_favorites;
create policy "event_favorites_delete_own"
on public.event_favorites for delete
using (auth.uid() = user_id);

-- Job favorites policies
drop policy if exists "job_favorites_select_own" on public.job_favorites;
create policy "job_favorites_select_own"
on public.job_favorites for select
using (auth.uid() = user_id);

drop policy if exists "job_favorites_insert_own" on public.job_favorites;
create policy "job_favorites_insert_own"
on public.job_favorites for insert
with check (auth.uid() = user_id);

drop policy if exists "job_favorites_delete_own" on public.job_favorites;
create policy "job_favorites_delete_own"
on public.job_favorites for delete
using (auth.uid() = user_id);

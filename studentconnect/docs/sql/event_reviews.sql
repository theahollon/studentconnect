create table if not exists public.event_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (event_id, user_id)
);

create index if not exists event_reviews_event_id_idx
  on public.event_reviews (event_id);

alter table public.event_reviews enable row level security;

create policy "Event reviews are readable by everyone"
  on public.event_reviews
  for select
  using (true);

create policy "Authenticated users can insert their own event reviews"
  on public.event_reviews
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own event reviews"
  on public.event_reviews
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_event_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_event_reviews_updated_at on public.event_reviews;

create trigger set_event_reviews_updated_at
before update on public.event_reviews
for each row
execute function public.set_event_reviews_updated_at();

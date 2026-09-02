-- 001-v1-trips-itinerary.sql — Travel App v1
-- Source of truth for Supabase. Run via `supabase db push` or psql.

-- Enable pgcrypto for gen_random_uuid if not exists
create extension if not exists "pgcrypto";

-- Trips
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  destination text not null check (char_length(destination) between 1 and 100),
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  trip_type text not null default 'leisure' check (trip_type in ('leisure','business','adventure','family','other')),
  traveler_count int not null default 1 check (traveler_count >= 1),
  status text not null default 'planning' check (status in ('planning','upcoming','ongoing','completed','cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists idx_trips_user_start on public.trips(user_id, start_date);

-- Itinerary items
create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  time time null,
  activity text not null check (char_length(activity) between 1 and 200),
  location text null,
  notes text null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_itinerary_trip_date on public.itinerary_items(trip_id, date, time);

-- RLS
alter table public.trips enable row level security;
alter table public.itinerary_items enable row level security;

drop policy if exists "trips_own" on public.trips;
create policy "trips_own" on public.trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "itinerary_via_trip" on public.itinerary_items;
create policy "itinerary_via_trip" on public.itinerary_items for all
  using (exists (select 1 from public.trips where trips.id = itinerary_items.trip_id and trips.user_id = auth.uid()))
  with check (exists (select 1 from public.trips where trips.id = itinerary_items.trip_id and trips.user_id = auth.uid()));

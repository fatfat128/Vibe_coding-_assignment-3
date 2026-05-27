-- FurniLoop — database setup
-- Apply via Supabase Dashboard → SQL Editor → paste → Run.
-- Creates tables, row-level security, and the item-photos storage bucket.

-- =========================================================
-- 1. TABLES
-- =========================================================

-- profiles: extra user info beyond auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  suburb text,
  consent_given boolean default false,
  created_at timestamptz default now()
);

-- items: furniture postings
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  condition text check (condition in ('Good','Fair','Poor')) not null,
  suburb text not null,
  pickup_window text,
  item_size text,
  still_available boolean default true,
  remarks text,
  photo_url text,
  lat numeric,
  lng numeric,
  claimed_by uuid references auth.users(id),
  claimed_at timestamptz,
  created_at timestamptz default now()
);

-- item_reports: community status reports
create table if not exists public.item_reports (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items(id) on delete cascade,
  reporter_id uuid references auth.users(id),
  status text check (status in ('Still there','Just picked up','Looks damaged','Already gone')) not null,
  created_at timestamptz default now()
);

create index if not exists items_suburb_idx on public.items (suburb);
create index if not exists item_reports_item_idx on public.item_reports (item_id, created_at desc);

-- =========================================================
-- 2. ROW-LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.item_reports enable row level security;

-- profiles: a user manages only their own row
create policy "users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- items: anyone may read; owner writes; authenticated users may claim
create policy "anyone read items"   on public.items for select using (true);
create policy "owner inserts items"  on public.items for insert with check (auth.uid() = owner_id);
create policy "owner updates items"  on public.items for update using (auth.uid() = owner_id);
create policy "claimer marks claim"  on public.items for update using (auth.role() = 'authenticated');

-- item_reports: authenticated users add their own; anyone reads
create policy "auth read reports"   on public.item_reports for select using (true);
create policy "auth insert reports" on public.item_reports for insert with check (auth.uid() = reporter_id);

-- =========================================================
-- 3. STORAGE (item photos)
-- =========================================================

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

create policy "auth can upload item-photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'item-photos');

create policy "anyone can view item-photos"
  on storage.objects for select
  using (bucket_id = 'item-photos');

create policy "auth can delete own item-photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'item-photos' and owner = auth.uid());

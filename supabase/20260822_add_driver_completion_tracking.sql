-- BioLoop: real driver attribution and completion timestamps for history and analytics.
alter table public.waste_listings add column if not exists driver_id uuid references public.profiles(id) on delete set null;
alter table public.waste_listings add column if not exists completed_at timestamptz;
create index if not exists waste_listings_driver_id_idx on public.waste_listings(driver_id);
create index if not exists waste_listings_completed_at_idx on public.waste_listings(completed_at desc);

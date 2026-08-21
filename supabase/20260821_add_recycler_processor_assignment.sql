-- BioLoop: add recycler ownership to waste listings and permit safe claims.
-- Run this in Supabase Dashboard > SQL Editor.

begin;

alter table public.waste_listings
  add column if not exists processor_id uuid;

-- The relationship is optional until a recycler claims the listing.
alter table public.waste_listings
  drop constraint if exists waste_listings_processor_id_fkey;

alter table public.waste_listings
  add constraint waste_listings_processor_id_fkey
  foreign key (processor_id)
  references public.profiles(id)
  on update cascade
  on delete set null;

create index if not exists waste_listings_processor_id_idx
  on public.waste_listings (processor_id);

alter table public.waste_listings enable row level security;

-- Recyclers can see sources available for claim plus their own claimed listings.
drop policy if exists "BioLoop recyclers can read available or own listings" on public.waste_listings;
create policy "BioLoop recyclers can read available or own listings"
  on public.waste_listings
  for select
  to authenticated
  using (
    status in ('available', 'pending')
    or processor_id = auth.uid()
  );

-- A recycler can claim only an open listing and must assign it to their own profile.
drop policy if exists "BioLoop recyclers can claim open listings" on public.waste_listings;
create policy "BioLoop recyclers can claim open listings"
  on public.waste_listings
  for update
  to authenticated
  using (status in ('available', 'pending'))
  with check (processor_id = auth.uid() and status = 'claimed');

commit;

-- Verification: confirms the new column and policies were created.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'waste_listings'
  and column_name = 'processor_id';

select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'waste_listings'
  and policyname in (
    'BioLoop recyclers can read available or own listings',
    'BioLoop recyclers can claim open listings'
  );

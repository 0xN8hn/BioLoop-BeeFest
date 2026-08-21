-- BioLoop: let logistics partners view and advance claimed pickup jobs.
-- The current schema does not store driver_id, so this policy scopes access by
-- operational status. Add driver assignment before using this in a multi-driver production fleet.

alter table public.waste_listings enable row level security;

drop policy if exists "BioLoop drivers can read active route jobs" on public.waste_listings;
create policy "BioLoop drivers can read active route jobs"
  on public.waste_listings
  for select
  to authenticated
  using (status in ('claimed', 'in_transit'));

drop policy if exists "BioLoop drivers can advance route jobs" on public.waste_listings;
create policy "BioLoop drivers can advance route jobs"
  on public.waste_listings
  for update
  to authenticated
  using (status in ('claimed', 'in_transit'))
  with check (status in ('in_transit', 'completed'));

select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'waste_listings'
  and policyname in (
    'BioLoop drivers can read active route jobs',
    'BioLoop drivers can advance route jobs'
  );

-- BioLoop: allow producers to read the listings they create.
-- RLS previously allowed INSERT but had no SELECT policy, so a successful listing
-- could be committed but remain invisible to the producer dashboard.

alter table public.waste_listings enable row level security;

drop policy if exists "BioLoop producers can read own listings" on public.waste_listings;
create policy "BioLoop producers can read own listings"
  on public.waste_listings
  for select
  to authenticated
  using (producer_id = auth.uid());

-- SQL Editor has no end-user session, so this only checks that the policy exists.
select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'waste_listings'
  and policyname = 'BioLoop producers can read own listings';

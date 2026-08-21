-- BioLoop: intentionally disable the producer profile foreign key.
-- Tradeoff: waste_listings.producer_id may no longer reference a real profile.
-- Use only while the producer/profile model is being stabilized.

begin;

alter table public.waste_listings
  drop constraint if exists waste_listings_producer_id_fkey;

commit;

-- Confirm the constraint is gone. This query should return no rows.
select constraint_name
from information_schema.table_constraints
where table_schema = 'public'
  and table_name = 'waste_listings'
  and constraint_name = 'waste_listings_producer_id_fkey';

-- RESTORATION SCRIPT — keep for later, do not run while the constraint is disabled.
-- First normalize any invalid non-null producer IDs, then recreate the relationship.
--
-- update public.waste_listings as listing
-- set producer_id = null
-- where listing.producer_id is not null
--   and not exists (
--     select 1 from public.profiles as profile where profile.id = listing.producer_id
--   );
--
-- alter table public.waste_listings
--   add constraint waste_listings_producer_id_fkey
--   foreign key (producer_id)
--   references public.profiles(id)
--   on update cascade
--   on delete set null;

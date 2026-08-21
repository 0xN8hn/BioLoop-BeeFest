-- BioLoop: normalize historical dummy producer IDs without deleting listings.
-- Run AFTER the profile migration and orphan-profile repair scripts.
-- This changes only non-null producer_id values that have no public.profiles parent.
-- It does NOT alter rows whose producer_id is already NULL.

begin;

-- Historical listings with a dummy/nonexistent producer ID cannot be safely
-- attributed to a real partner. Clear that invalid relationship while retaining
-- every other listing field, including status and audit timestamps.
update public.waste_listings as listing
set producer_id = null
where listing.producer_id is not null
  and not exists (
    select 1
    from public.profiles as profile
    where profile.id = listing.producer_id
  );

commit;

-- Validation A: must be 0. Only non-null producer IDs are expected to have a profile parent.
select count(*) as listings_with_invalid_producer_profile
from public.waste_listings as listing
left join public.profiles as profile on profile.id = listing.producer_id
where listing.producer_id is not null
  and profile.id is null;

-- Validation B: historical rows without known attribution are preserved and reported separately.
select count(*) as historical_listings_without_producer
from public.waste_listings
where producer_id is null;

-- Optional audit list. This should return no rows after the update.
select listing.id, listing.producer_id, listing.waste_type, listing.location_name, listing.status
from public.waste_listings as listing
left join public.profiles as profile on profile.id = listing.producer_id
where listing.producer_id is not null
  and profile.id is null;

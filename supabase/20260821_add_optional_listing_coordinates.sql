-- BioLoop: optional map coordinates for waste listings.
-- Run this only when you want newly created listings to appear as precise markers.
-- Listing creation remains valid without these columns because coordinates are optional.

alter table public.waste_listings
  add column if not exists location_lat double precision;

alter table public.waste_listings
  add column if not exists location_lng double precision;

-- Confirm both optional coordinate columns exist.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'waste_listings'
  and column_name in ('location_lat', 'location_lng')
order by column_name;

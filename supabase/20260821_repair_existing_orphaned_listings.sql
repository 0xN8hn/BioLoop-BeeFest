-- BioLoop: repair historical waste_listings whose producer_id lacks a profile row.
-- Run AFTER 20260821_fix_profiles_and_producer_fk.sql.
-- This script never deletes or reassigns listings.

begin;

-- Safely restore profile rows only where the orphan producer_id is a real Auth user.
-- A profile is therefore created with the correct, existing auth.users ID.
insert into public.profiles (id, email, full_name, role)
select distinct
  auth_user.id,
  auth_user.email,
  coalesce(
    auth_user.raw_user_meta_data ->> 'full_name',
    auth_user.raw_user_meta_data ->> 'name',
    nullif(split_part(coalesce(auth_user.email, ''), '@', 1), ''),
    'User BioLoop'
  ),
  (
    case
      when auth_user.raw_user_meta_data ->> 'role' in ('producer', 'recycler', 'driver', 'admin')
        then auth_user.raw_user_meta_data ->> 'role'
      else 'producer'
    end
  )::public.user_role
from public.waste_listings as listing
join auth.users as auth_user on auth_user.id = listing.producer_id
left join public.profiles as profile on profile.id = listing.producer_id
where profile.id is null
on conflict (id) do nothing;

commit;

-- Result A: should now be zero. These are listings repaired automatically.
select count(*) as listings_without_producer_profile
from public.waste_listings as listing
left join public.profiles as profile on profile.id = listing.producer_id
where profile.id is null;

-- Result B: only inspect; DO NOT run an update based on this automatically.
-- Any remaining row has a producer_id that does not exist in auth.users, so ownership
-- must be mapped to a real producer account before a safe reassignment can be made.
select
  listing.id as listing_id,
  listing.producer_id,
  listing.waste_type,
  listing.location_name,
  listing.status,
  listing.created_at,
  case
    when auth_user.id is null then 'producer_id is not an Auth user — manual mapping required'
    else 'Auth user exists — rerun the profile repair migration'
  end as repair_status
from public.waste_listings as listing
left join public.profiles as profile on profile.id = listing.producer_id
left join auth.users as auth_user on auth_user.id = listing.producer_id
where profile.id is null
order by listing.created_at desc;

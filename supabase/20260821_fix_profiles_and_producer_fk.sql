-- BioLoop: repair profiles <-> waste_listings producer foreign key flow.
-- Run this once in Supabase Dashboard > SQL Editor.
-- It does not delete existing users, profiles, or listings.

begin;

-- Keep the application-facing profile shape available even if the table was created
-- before the current BioLoop account flow.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role public.user_role;

-- Backfill a profile parent row for every existing Auth user. This is the missing
-- record required by waste_listings.producer_id -> profiles.id.
insert into public.profiles (id, email, full_name, role)
select
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
from auth.users as auth_user
on conflict (id) do update
set
  email = coalesce(public.profiles.email, excluded.email),
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  role = coalesce(public.profiles.role, excluded.role);

-- Create the profile atomically whenever a new Supabase Auth user is created.
create or replace function public.handle_new_bioloop_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'User BioLoop'
    ),
    (
      case
      when new.raw_user_meta_data ->> 'role' in ('producer', 'recycler', 'driver', 'admin')
        then new.raw_user_meta_data ->> 'role'
      else 'producer'
      end
    )::public.user_role
  )
  on conflict (id) do update
  set
    email = coalesce(public.profiles.email, excluded.email),
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = coalesce(public.profiles.role, excluded.role);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_bioloop on auth.users;
create trigger on_auth_user_created_bioloop
  after insert on auth.users
  for each row execute procedure public.handle_new_bioloop_user();

-- Allow authenticated users to read and create only their own profile record.
-- These policies make the dashboard's profile lookup and the compatibility
-- fallback safe under RLS without exposing other users' profiles.
alter table public.profiles enable row level security;

drop policy if exists "BioLoop users can read own profile" on public.profiles;
create policy "BioLoop users can read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "BioLoop users can insert own profile" on public.profiles;
create policy "BioLoop users can insert own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "BioLoop users can update own profile" on public.profiles;
create policy "BioLoop users can update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Producers can create only listings that reference their own profile ID.
alter table public.waste_listings enable row level security;

drop policy if exists "BioLoop producers can create own listings" on public.waste_listings;
create policy "BioLoop producers can create own listings"
  on public.waste_listings for insert to authenticated
  with check (producer_id = auth.uid());

create index if not exists waste_listings_producer_id_idx
  on public.waste_listings (producer_id);

commit;

-- Validation: both results should be zero after this migration.
-- 1) Auth users without a matching public profile.
select count(*) as auth_users_without_profile
from auth.users as auth_user
left join public.profiles as profile on profile.id = auth_user.id
where profile.id is null;

-- 2) Non-null producer IDs whose profile parent is missing. This should be zero.
select count(*) as listings_with_invalid_producer_profile
from public.waste_listings as listing
left join public.profiles as profile on profile.id = listing.producer_id
where listing.producer_id is not null
  and profile.id is null;

-- 3) Historical listings can legitimately have no producer attribution. This is
-- reported separately and does not violate the foreign key because producer_id is NULL.
select count(*) as historical_listings_without_producer
from public.waste_listings
where producer_id is null;

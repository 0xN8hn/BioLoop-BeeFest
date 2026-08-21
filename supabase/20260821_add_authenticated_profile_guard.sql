-- BioLoop: server-side profile guard for listing creation.
-- Run this in Supabase Dashboard > SQL Editor, then pull the matching app update.
-- The function uses the logged-in user's auth.uid(), not a browser-provided ID.

create or replace function public.ensure_bioloop_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  ensured_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'BioLoop profile guard requires an authenticated user';
  end if;

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
  where auth_user.id = auth.uid()
  on conflict (id) do update
  set
    email = coalesce(public.profiles.email, excluded.email),
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = coalesce(public.profiles.role, excluded.role)
  returning * into ensured_profile;

  if ensured_profile.id is null then
    raise exception 'BioLoop profile could not be created for the authenticated user';
  end if;

  return ensured_profile;
end;
$$;

revoke all on function public.ensure_bioloop_profile() from public;
grant execute on function public.ensure_bioloop_profile() to authenticated;

-- In the SQL Editor this returns NULL by design because there is no signed-in
-- browser session. Verify the function through the BioLoop app after deployment.
select routine_name, routine_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'ensure_bioloop_profile';

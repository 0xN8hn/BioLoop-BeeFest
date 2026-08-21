-- BioLoop: role-aware dashboard visibility for maps, charts, and completed history.
-- This migration relies on public.profiles.id matching auth.uid() and public.user_role.

alter table public.waste_listings enable row level security;

drop policy if exists "BioLoop drivers can read own completed history" on public.waste_listings;
create policy "BioLoop drivers can read own completed history"
  on public.waste_listings
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'driver'::public.user_role
    )
    and (status in ('claimed', 'in_transit') or driver_id = auth.uid())
  );

drop policy if exists "BioLoop recyclers can read owned material history" on public.waste_listings;
create policy "BioLoop recyclers can read owned material history"
  on public.waste_listings
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'recycler'::public.user_role
    )
    and (status in ('available', 'pending') or processor_id = auth.uid())
  );

drop policy if exists "BioLoop admins can read all dashboard analytics" on public.waste_listings;
create policy "BioLoop admins can read all dashboard analytics"
  on public.waste_listings
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'::public.user_role
    )
  );

create or replace function public.get_bioloop_admin_partner_count()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'::public.user_role
  ) then
    raise exception 'Admin access is required';
  end if;

  return (select count(*) from public.profiles);
end;
$$;

revoke all on function public.get_bioloop_admin_partner_count() from public;
grant execute on function public.get_bioloop_admin_partner_count() to authenticated;

select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'waste_listings'
  and (policyname like 'BioLoop % dashboard %'
     or policyname like 'BioLoop drivers can read own completed history'
     or policyname like 'BioLoop recyclers can read owned material history');

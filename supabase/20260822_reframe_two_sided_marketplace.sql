-- BioLoop two-sided marketplace reframe.
-- Run AFTER 20260822_add_bioloop_marketplace.sql and 20260822_allow_role_dashboard_analytics.sql.
-- This keeps the legacy `driver` enum value and columns for historical compatibility,
-- but removes driver accounts and access policies from the live product flow.

begin;

-- 1) Retire the standalone driver persona without deleting historical data.
update public.profiles
set role = 'recycler'::public.user_role
where role = 'driver'::public.user_role;

update auth.users
set raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{role}', '"recycler"'::jsonb, true)
where raw_user_meta_data ->> 'role' = 'driver';

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
    coalesce(auth_user.raw_user_meta_data ->> 'full_name', auth_user.raw_user_meta_data ->> 'name', nullif(split_part(coalesce(auth_user.email, ''), '@', 1), ''), 'User BioLoop'),
    (case when auth_user.raw_user_meta_data ->> 'role' in ('producer', 'recycler', 'admin') then auth_user.raw_user_meta_data ->> 'role' else 'recycler' end)::public.user_role
  from auth.users as auth_user
  where auth_user.id = auth.uid()
  on conflict (id) do update
  set
    email = coalesce(public.profiles.email, excluded.email),
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = case when public.profiles.role = 'driver'::public.user_role then 'recycler'::public.user_role else public.profiles.role end
  returning * into ensured_profile;

  return ensured_profile;
end;
$$;

-- 2) Catalog fields are deliberately attached to listings so they can be rendered without synthetic data.
alter table public.waste_listings add column if not exists category text not null default 'campuran';
alter table public.waste_listings add column if not exists nutrient_profile text not null default 'campuran';
alter table public.waste_listings add column if not exists image_url text;
alter table public.waste_listings add column if not exists operational_pickup_window text;
alter table public.waste_listings add column if not exists availability_note text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'waste_listings_category_check') then
    alter table public.waste_listings add constraint waste_listings_category_check check (category in ('sayur', 'buah', 'ampas', 'daging_ikan', 'sisa_olahan', 'campuran'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'waste_listings_nutrient_profile_check') then
    alter table public.waste_listings add constraint waste_listings_nutrient_profile_check check (nutrient_profile in ('tinggi_protein', 'tinggi_karbohidrat', 'serat', 'campuran'));
  end if;
end $$;

create index if not exists waste_listings_catalog_idx on public.waste_listings (status, category, nutrient_profile, created_at desc);

-- A schedule is a seller-declared availability commitment. It never auto-publishes a listing.
create table if not exists public.recurring_availability_schedules (
  id uuid primary key default gen_random_uuid(),
  producer_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.waste_listings(id) on delete set null,
  frequency text not null check (frequency in ('harian', 'mingguan')),
  available_days smallint[] not null default '{}',
  available_from time not null,
  estimated_weight_kg numeric(12,2) not null check (estimated_weight_kg > 0),
  pickup_window text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recurring_availability_schedules_producer_idx on public.recurring_availability_schedules(producer_id, is_active);

-- 3) Logistics belongs to an order. There is no third consumer-facing driver workspace.
alter table public.marketplace_orders add column if not exists logistics_mode text not null default 'mandiri';
alter table public.marketplace_orders add column if not exists logistics_provider_name text;
alter table public.marketplace_orders add column if not exists logistics_contact text;
alter table public.marketplace_orders add column if not exists logistics_note text;
alter table public.marketplace_orders add column if not exists actual_weight_kg numeric(12,2);
alter table public.marketplace_orders add column if not exists settled_material_subtotal numeric(12,2);
alter table public.marketplace_orders add column if not exists settled_total_amount numeric(12,2);
alter table public.marketplace_orders add column if not exists weight_variance_percent numeric(8,2);
alter table public.marketplace_orders add column if not exists weight_confirmation_status text not null default 'pending';
alter table public.marketplace_orders add column if not exists escrow_status text not null default 'not_used';
alter table public.marketplace_orders add column if not exists dispute_status text not null default 'none';
alter table public.marketplace_orders add column if not exists weight_confirmed_at timestamptz;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'marketplace_orders_logistics_mode_check') then
    alter table public.marketplace_orders add constraint marketplace_orders_logistics_mode_check check (logistics_mode in ('mandiri', 'armada_mitra', 'pooling'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'marketplace_orders_weight_confirmation_status_check') then
    alter table public.marketplace_orders add constraint marketplace_orders_weight_confirmation_status_check check (weight_confirmation_status in ('pending', 'confirmed', 'review_needed'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'marketplace_orders_escrow_status_check') then
    alter table public.marketplace_orders add constraint marketplace_orders_escrow_status_check check (escrow_status in ('not_used', 'held', 'release_ready', 'released', 'disputed'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'marketplace_orders_dispute_status_check') then
    alter table public.marketplace_orders add constraint marketplace_orders_dispute_status_check check (dispute_status in ('none', 'review_needed', 'open', 'resolved'));
  end if;
end $$;

-- 4) Pooling is transaction-linked coordination, not a standalone chat product.
create table if not exists public.pooling_groups (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.waste_listings(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  target_weight_kg numeric(12,2) not null check (target_weight_kg > 0),
  pickup_area text,
  status text not null default 'open' check (status in ('open', 'ready', 'closed', 'cancelled')),
  created_at timestamptz not null default now()
);
create table if not exists public.pooling_members (
  pooling_group_id uuid not null references public.pooling_groups(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  reserved_weight_kg numeric(12,2) not null check (reserved_weight_kg > 0),
  created_at timestamptz not null default now(),
  primary key (pooling_group_id, buyer_id)
);
create table if not exists public.pooling_messages (
  id uuid primary key default gen_random_uuid(),
  pooling_group_id uuid not null references public.pooling_groups(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
alter table public.marketplace_orders add column if not exists pooling_group_id uuid references public.pooling_groups(id) on delete set null;

-- 5) Close a transaction with weight, quality, and measured climate impact.
create table if not exists public.quality_ratings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  rater_id uuid not null references public.profiles(id) on delete cascade,
  ratee_id uuid not null references public.profiles(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  tags text[] not null default '{}',
  comment text,
  created_at timestamptz not null default now(),
  unique (order_id, rater_id)
);
create table if not exists public.order_impacts (
  order_id uuid primary key references public.marketplace_orders(id) on delete cascade,
  producer_id uuid not null references public.profiles(id) on delete restrict,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  processed_weight_kg numeric(12,2) not null check (processed_weight_kg >= 0),
  co2e_saved_kg numeric(12,2) not null check (co2e_saved_kg >= 0),
  methane_prevented_kg numeric(12,2) not null check (methane_prevented_kg >= 0),
  created_at timestamptz not null default now()
);

-- Buyer confirms final scale weight. ±10% triggers a review before escrow release.
create or replace function public.confirm_bioloop_delivery_weight(p_order_id uuid, p_actual_weight_kg numeric)
returns public.marketplace_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.marketplace_orders;
  variance numeric(8,2);
  settled_material numeric(12,2);
  settled_total numeric(12,2);
  needs_review boolean;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if p_actual_weight_kg is null or p_actual_weight_kg <= 0 then raise exception 'Berat akhir harus lebih dari 0 kg'; end if;

  select * into target_order from public.marketplace_orders where id = p_order_id for update;
  if target_order.id is null then raise exception 'Order tidak ditemukan'; end if;
  if target_order.buyer_id <> auth.uid() then raise exception 'Hanya pembeli yang dapat mengonfirmasi berat akhir'; end if;
  if target_order.fulfillment_status not in ('in_transit', 'received') then raise exception 'Konfirmasi berat tersedia setelah material tiba'; end if;

  variance := ((p_actual_weight_kg - target_order.quantity_kg) / nullif(target_order.quantity_kg, 0)) * 100;
  needs_review := abs(variance) > 10;
  settled_material := p_actual_weight_kg * target_order.price_per_kg;
  settled_total := settled_material + target_order.delivery_fee + target_order.service_fee;

  update public.marketplace_orders
  set actual_weight_kg = p_actual_weight_kg,
      weight_variance_percent = variance,
      settled_material_subtotal = settled_material,
      settled_total_amount = settled_total,
      weight_confirmation_status = case when needs_review then 'review_needed' else 'confirmed' end,
      escrow_status = case when payment_method = 'escrow' then case when needs_review then 'disputed' else 'release_ready' end else escrow_status end,
      dispute_status = case when needs_review then 'review_needed' else 'none' end,
      payment_status = case when needs_review then 'pending_verification' else payment_status end,
      fulfillment_status = case when needs_review then 'received' else 'completed' end,
      weight_confirmed_at = now(),
      completed_at = case when needs_review then completed_at else now() end
  where id = p_order_id
  returning * into target_order;

  insert into public.order_impacts (order_id, producer_id, buyer_id, processed_weight_kg, co2e_saved_kg, methane_prevented_kg)
  values (target_order.id, target_order.producer_id, target_order.buyer_id, p_actual_weight_kg, p_actual_weight_kg * 2.5, p_actual_weight_kg * 0.6)
  on conflict (order_id) do update set processed_weight_kg = excluded.processed_weight_kg, co2e_saved_kg = excluded.co2e_saved_kg, methane_prevented_kg = excluded.methane_prevented_kg;

  insert into public.order_timeline (order_id, status, title, detail, actor_id)
  values (target_order.id, target_order.fulfillment_status, case when needs_review then 'Berat perlu ditinjau' else 'Berat akhir dikonfirmasi' end, concat('Timbangan akhir: ', p_actual_weight_kg, ' kg. Selisih: ', round(variance, 2), '%.'), auth.uid());

  return target_order;
end;
$$;

-- 6) Replace driver-specific RLS with buyer/producer ownership and transaction participants.
drop policy if exists "BioLoop drivers can read own completed history" on public.waste_listings;
drop policy if exists "BioLoop drivers can read available pickup orders" on public.marketplace_orders;
drop policy if exists "BioLoop drivers can claim and progress pickup orders" on public.marketplace_orders;
drop policy if exists "BioLoop participants can read their marketplace orders" on public.marketplace_orders;
drop policy if exists "BioLoop participants can read order timeline" on public.order_timeline;
drop policy if exists "BioLoop delivery participants can add timeline events" on public.order_timeline;

create policy "BioLoop buyer and producer can read marketplace orders" on public.marketplace_orders for select to authenticated using (buyer_id = auth.uid() or producer_id = auth.uid());
create policy "BioLoop producers can update their order fulfillment" on public.marketplace_orders for update to authenticated using (producer_id = auth.uid()) with check (producer_id = auth.uid());
create policy "BioLoop buyers can confirm their received order" on public.marketplace_orders for update to authenticated using (buyer_id = auth.uid()) with check (buyer_id = auth.uid());
create policy "BioLoop buyer and producer can read order timeline" on public.order_timeline for select to authenticated using (exists (select 1 from public.marketplace_orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.producer_id = auth.uid())));
create policy "BioLoop buyer and producer can add order timeline" on public.order_timeline for insert to authenticated with check (actor_id = auth.uid() and exists (select 1 from public.marketplace_orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.producer_id = auth.uid())));

alter table public.recurring_availability_schedules enable row level security;
alter table public.pooling_groups enable row level security;
alter table public.pooling_members enable row level security;
alter table public.pooling_messages enable row level security;
alter table public.quality_ratings enable row level security;
alter table public.order_impacts enable row level security;

create policy "BioLoop producers manage their availability commitments" on public.recurring_availability_schedules for all to authenticated using (producer_id = auth.uid()) with check (producer_id = auth.uid());
create policy "BioLoop buyers can read open pooling groups" on public.pooling_groups for select to authenticated using (true);
create policy "BioLoop buyers can create pooling groups" on public.pooling_groups for insert to authenticated with check (creator_id = auth.uid());
create policy "BioLoop group members can read memberships" on public.pooling_members for select to authenticated using (buyer_id = auth.uid() or exists (select 1 from public.pooling_groups g where g.id = pooling_group_id and g.creator_id = auth.uid()));
create policy "BioLoop buyers can join pooling groups" on public.pooling_members for insert to authenticated with check (buyer_id = auth.uid());
create policy "BioLoop pooling members can read messages" on public.pooling_messages for select to authenticated using (exists (select 1 from public.pooling_members m where m.pooling_group_id = pooling_messages.pooling_group_id and m.buyer_id = auth.uid()));
create policy "BioLoop pooling members can send messages" on public.pooling_messages for insert to authenticated with check (sender_id = auth.uid() and exists (select 1 from public.pooling_members m where m.pooling_group_id = pooling_messages.pooling_group_id and m.buyer_id = auth.uid()));
create policy "BioLoop participants can read quality ratings" on public.quality_ratings for select to authenticated using (exists (select 1 from public.marketplace_orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.producer_id = auth.uid())));
create policy "BioLoop buyers can submit seller ratings" on public.quality_ratings for insert to authenticated with check (rater_id = auth.uid() and exists (select 1 from public.marketplace_orders o where o.id = order_id and o.buyer_id = auth.uid() and o.producer_id = ratee_id and o.fulfillment_status = 'completed'));
create policy "BioLoop participants can read order impact" on public.order_impacts for select to authenticated using (producer_id = auth.uid() or buyer_id = auth.uid());

create or replace function public.get_bioloop_national_impact()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'processed_weight_kg', coalesce(sum(processed_weight_kg), 0),
    'co2e_saved_kg', coalesce(sum(co2e_saved_kg), 0),
    'methane_prevented_kg', coalesce(sum(methane_prevented_kg), 0),
    'completed_orders', count(*)
  )
  from public.order_impacts;
$$;

revoke all on function public.confirm_bioloop_delivery_weight(uuid, numeric) from public;
grant execute on function public.confirm_bioloop_delivery_weight(uuid, numeric) to authenticated;
revoke all on function public.get_bioloop_national_impact() from public;
grant execute on function public.get_bioloop_national_impact() to anon, authenticated;

commit;

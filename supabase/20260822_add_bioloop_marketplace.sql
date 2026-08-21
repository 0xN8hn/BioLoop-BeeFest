-- BioLoop marketplace core: commercial order, fulfillment timeline, and payout records.

alter table public.waste_listings add column if not exists price_per_kg numeric(12,2) not null default 0;
alter table public.waste_listings add column if not exists material_grade text;
alter table public.waste_listings add column if not exists intended_use text;
alter table public.waste_listings add column if not exists available_until timestamptz;

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.waste_listings(id) on delete restrict,
  producer_id uuid not null references public.profiles(id) on delete restrict,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  driver_id uuid references public.profiles(id) on delete set null,
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  price_per_kg numeric(12,2) not null check (price_per_kg >= 0),
  material_subtotal numeric(12,2) not null check (material_subtotal >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  service_fee numeric(12,2) not null default 0 check (service_fee >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  producer_amount numeric(12,2) not null default 0 check (producer_amount >= 0),
  driver_amount numeric(12,2) not null default 0 check (driver_amount >= 0),
  payment_method text,
  payment_status text not null default 'awaiting_payment' check (payment_status in ('awaiting_payment','pending_verification','paid','failed','refunded')),
  fulfillment_status text not null default 'awaiting_payment' check (fulfillment_status in ('awaiting_payment','ready_for_pickup','driver_assigned','picked_up','in_transit','received','completed','cancelled')),
  buyer_location_name text,
  buyer_lat double precision,
  buyer_lng double precision,
  distance_km numeric(10,2),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  picked_up_at timestamptz,
  received_at timestamptz,
  completed_at timestamptz
);

create index if not exists marketplace_orders_buyer_idx on public.marketplace_orders(buyer_id, created_at desc);
create index if not exists marketplace_orders_producer_idx on public.marketplace_orders(producer_id, created_at desc);
create index if not exists marketplace_orders_driver_idx on public.marketplace_orders(driver_id, created_at desc);
create index if not exists marketplace_orders_fulfillment_idx on public.marketplace_orders(fulfillment_status, created_at desc);

create table if not exists public.order_timeline (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  status text not null,
  title text not null,
  detail text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists order_timeline_order_idx on public.order_timeline(order_id, created_at asc);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  recipient_role text not null check (recipient_role in ('producer','driver')),
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','processing','paid','failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.marketplace_orders enable row level security;
alter table public.order_timeline enable row level security;
alter table public.payouts enable row level security;

create policy "BioLoop participants can read their marketplace orders" on public.marketplace_orders for select to authenticated using (buyer_id = auth.uid() or producer_id = auth.uid() or driver_id = auth.uid());
create policy "BioLoop buyers can create marketplace orders" on public.marketplace_orders for insert to authenticated with check (buyer_id = auth.uid());
create policy "BioLoop drivers can read available pickup orders" on public.marketplace_orders for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'driver'::public.user_role)
  and ((driver_id is null and fulfillment_status in ('ready_for_pickup','driver_assigned')) or driver_id = auth.uid())
);
create policy "BioLoop drivers can claim and progress pickup orders" on public.marketplace_orders for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'driver'::public.user_role)
  and (driver_id is null or driver_id = auth.uid())
) with check (
  driver_id = auth.uid()
  and fulfillment_status in ('driver_assigned','picked_up','in_transit','received')
);
create policy "BioLoop participants can read order timeline" on public.order_timeline for select to authenticated using (exists (select 1 from public.marketplace_orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.producer_id = auth.uid() or o.driver_id = auth.uid())));
create policy "BioLoop delivery participants can add timeline events" on public.order_timeline for insert to authenticated with check (actor_id = auth.uid());
create policy "BioLoop recipients can read payouts" on public.payouts for select to authenticated using (recipient_id = auth.uid());

-- The first deployed version intentionally creates orders as awaiting_payment.
-- Wire a licensed payment provider before changing payment_status to paid automatically.

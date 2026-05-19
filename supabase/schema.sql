-- ============================================
-- SLINGSHOT MULTI-TENANT SAAS SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TENANTS (Each business on Slingshot)
-- ============================================
create table if not exists public.tenants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  slug text unique not null,
  business_name text not null,
  niche text not null check (niche in ('restoran','cafe','klinik','hartanah','auto','pasarmalam','event','catering','bengkel','dfy','dental','aesthetic')),
  template_id text not null,
  custom_domain text unique,
  brand_logo_url text,
  brand_color text default '#1d1d1f',
  brand_letter text default 'b',
  tagline text,
  address text,
  whatsapp_number text,
  email text,
  social_facebook text,
  social_instagram text,
  social_tiktok text,
  duitnow_qr_url text,
  stripe_customer_id text,
  stripe_connect_id text,
  stripe_connect_enabled boolean default false,
  status text default 'trial' check (status in ('trial','active','suspended','canceled')),
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_tenants_slug on public.tenants(slug);
create index idx_tenants_user_id on public.tenants(user_id);
create index idx_tenants_custom_domain on public.tenants(custom_domain);

-- ============================================
-- SUBSCRIPTIONS (Slingshot plan billing)
-- ============================================
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('free','starter','pro','dfy')),
  status text not null check (status in ('active','past_due','canceled','trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_subscriptions_tenant_id on public.subscriptions(tenant_id);

-- ============================================
-- ITEMS (Menu items, properties, cars, services - universal)
-- ============================================
create table if not exists public.items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  category text,
  name text not null,
  description text,
  price numeric(10,2) default 0,
  currency text default 'MYR',
  emoji text,
  photo_url text,
  is_available boolean default true,
  is_featured boolean default false,
  sort_order int default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_items_tenant_id on public.items(tenant_id);
create index idx_items_category on public.items(tenant_id, category);

-- ============================================
-- CATEGORIES (Per tenant)
-- ============================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  slug text not null,
  name text not null,
  emoji text,
  sort_order int default 0,
  is_visible boolean default true,
  created_at timestamptz default now(),
  unique(tenant_id, slug)
);

-- ============================================
-- ORDERS (Universal - food orders, viewings, appointments etc)
-- ============================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  order_number text not null,
  reference text,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2) not null default 0,
  payment_method text check (payment_method in ('duitnow','stripe','cash','pending')),
  payment_status text default 'pending' check (payment_status in ('pending','confirmed','refunded','failed')),
  fulfillment_status text default 'new' check (fulfillment_status in ('new','accepted','in_progress','ready','completed','canceled')),
  scheduled_at timestamptz,
  notes text,
  promo_code text,
  stripe_payment_intent_id text,
  whatsapp_notified boolean default false,
  picked_up_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id, order_number)
);

create index idx_orders_tenant_id on public.orders(tenant_id);
create index idx_orders_status on public.orders(tenant_id, fulfillment_status);
create index idx_orders_created_at on public.orders(tenant_id, created_at desc);

-- ============================================
-- PROMO CODES
-- ============================================
create table if not exists public.promo_codes (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  code text not null,
  description text,
  discount_pct int check (discount_pct between 0 and 100),
  discount_rm numeric(10,2),
  min_order_amount numeric(10,2) default 0,
  valid_from timestamptz default now(),
  valid_until timestamptz,
  used_count int default 0,
  max_uses int,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(tenant_id, code)
);

-- ============================================
-- WHATSAPP TEMPLATES
-- ============================================
create table if not exists public.whatsapp_templates (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  trigger text not null check (trigger in ('new_order','order_ready','order_completed','reminder','custom')),
  message text not null,
  is_enabled boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- RLS POLICIES (Multi-tenant security)
-- ============================================
alter table public.tenants enable row level security;
alter table public.subscriptions enable row level security;
alter table public.items enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.promo_codes enable row level security;
alter table public.whatsapp_templates enable row level security;

-- Owners can manage their own tenant
create policy "Owners manage tenants" on public.tenants
  for all using (auth.uid() = user_id);

-- Public can read tenant info (for customer-facing site)
create policy "Public can read active tenants" on public.tenants
  for select using (status = 'active' or status = 'trial');

-- Owners manage their items
create policy "Owners manage items" on public.items
  for all using (tenant_id in (select id from public.tenants where user_id = auth.uid()));

-- Public can read items (for customer site)
create policy "Public can read available items" on public.items
  for select using (is_available = true);

-- Categories
create policy "Owners manage categories" on public.categories
  for all using (tenant_id in (select id from public.tenants where user_id = auth.uid()));
create policy "Public can read categories" on public.categories
  for select using (is_visible = true);

-- Orders
create policy "Owners view their orders" on public.orders
  for select using (tenant_id in (select id from public.tenants where user_id = auth.uid()));
create policy "Owners update their orders" on public.orders
  for update using (tenant_id in (select id from public.tenants where user_id = auth.uid()));
-- Public can insert orders (customer checkout)
create policy "Public can place orders" on public.orders
  for insert with check (true);
-- Public can read their own order by order_number + phone match
create policy "Public can track their order" on public.orders
  for select using (true);

-- Promo codes
create policy "Owners manage promos" on public.promo_codes
  for all using (tenant_id in (select id from public.tenants where user_id = auth.uid()));
create policy "Public can read active promos" on public.promo_codes
  for select using (is_active = true);

-- Subscriptions (owners only)
create policy "Owners view subscriptions" on public.subscriptions
  for select using (tenant_id in (select id from public.tenants where user_id = auth.uid()));

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_tenants_updated_at before update on public.tenants
  for each row execute function public.set_updated_at();
create trigger trg_items_updated_at before update on public.items
  for each row execute function public.set_updated_at();
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================
-- REALTIME (for KDS live updates)
-- ============================================
-- Enable in Supabase dashboard: Database > Replication > orders table
alter publication supabase_realtime add table public.orders;

-- ============================================
-- STORAGE BUCKETS (for logos, photos, QR codes)
-- ============================================
-- Run in Supabase Storage section, or via API:
-- create bucket 'tenant-assets' (public, max 5MB per file)
-- create bucket 'item-photos' (public, max 3MB per file)
-- create bucket 'duitnow-qrs' (public, max 1MB per file)

-- Done! Schema ready for Slingshot multi-tenant SaaS

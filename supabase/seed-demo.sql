-- ============================================
-- SLINGSHOT DEMO TENANTS — one live demo per niche
-- Run this AFTER schema.sql in the Supabase SQL Editor.
-- Powers the "Live demo" links on the landing page, /templates and /demo.
-- Safe to re-run (uses ON CONFLICT).
-- ============================================

insert into public.tenants (slug, business_name, niche, template_id, brand_color, brand_letter, tagline, status, trial_ends_at)
values
  ('demo-restoran',   'Sambal & Rice',        'restoran',   'template-restoran',   '#cb1212', 'r', 'Home-style Malaysian dining',     'active', now() + interval '365 days'),
  ('demo-cafe',       'Brew Pickup',          'cafe',       'template-cafe',       '#2c1810', 'b', 'Specialty coffee · order pickup', 'active', now() + interval '365 days'),
  ('demo-klinik',     'Klinik Sihat Sentosa', 'klinik',     'template-klinik',     '#0f6b5c', 'k', 'Trusted family healthcare',        'active', now() + interval '365 days'),
  ('demo-hartanah',   'Rumah Impian Realty',  'hartanah',   'template-hartanah',   '#1a3a52', 'h', 'Find your dream home',             'active', now() + interval '365 days'),
  ('demo-auto',       'Prestige Motors',      'auto',       'template-auto',       '#1d1d1f', 'p', 'Authorized dealer · new & used',   'active', now() + interval '365 days'),
  ('demo-pasarmalam', 'Gerai Along',          'pasarmalam', 'template-pasarmalam', '#b45309', 'a', 'Pasar malam favourites',           'active', now() + interval '365 days'),
  ('demo-event',      'Majlis Bahagia',       'event',      'template-event',      '#6d28d9', 'm', 'Pelamin · Makeup · Photography',   'active', now() + interval '365 days'),
  ('demo-catering',   'Dapur Mak Cik',        'catering',   'template-catering',   '#92400e', 'd', 'Kenduri catering, per-pax',         'active', now() + interval '365 days'),
  ('demo-bengkel',    'Bengkel Pak Man',      'bengkel',    'template-bengkel',    '#374151', 'b', 'Certified mechanics, book online', 'active', now() + interval '365 days'),
  ('demo-dfy',        'Slingshot DFY',        'dfy',        'template-dfy',        '#0f172a', 's', 'We build your site for you',       'active', now() + interval '365 days'),
  ('demo-dental',     'Klinik Pergigian Ceria','dental',    'template-dental',     '#003366', 'c', 'Gentle, modern dental care',        'active', now() + interval '365 days'),
  ('demo-aesthetic',  'Lumière Aesthetic',    'aesthetic',  'template-aesthetic',  '#2a1a2e', 'l', 'Premium aesthetic clinic',          'active', now() + interval '365 days')
on conflict (slug) do update set
  business_name = excluded.business_name,
  brand_color = excluded.brand_color,
  tagline = excluded.tagline,
  status = excluded.status;

-- ============================================
-- Categories + Items per demo tenant
-- ============================================

do $$
declare
  t_id uuid;
begin

  -- Idempotent re-runs: wipe existing demo items first (items has no natural unique key)
  delete from public.items where tenant_id in (select id from public.tenants where slug like 'demo-%');

  -- Restoran -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-restoran';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'mains', 'Mains', '🍛', 1),
    (t_id, 'drinks', 'Drinks', '🥤', 2)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'mains', 'Nasi Lemak Ayam Goreng', 'Coconut rice, fried chicken, sambal, egg', 14.90, '🍗', 1),
    (t_id, 'mains', 'Beef Rendang', 'Slow-cooked spiced beef, steamed rice', 18.50, '🥘', 2),
    (t_id, 'mains', 'Mee Goreng Mamak', 'Wok-fried noodles, prawns, egg', 12.00, '🍜', 3),
    (t_id, 'drinks', 'Teh Tarik', 'Pulled milk tea', 4.50, '🧋', 1),
    (t_id, 'drinks', 'Iced Lemon Tea', '', 5.00, '🍋', 2)
  on conflict do nothing;

  -- Cafe -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-cafe';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'coffee', 'Coffee', '☕', 1),
    (t_id, 'pastry', 'Pastries', '🥐', 2)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'coffee', 'Espresso', 'Double shot', 8.00, '☕', 1),
    (t_id, 'coffee', 'Oat Milk Latte', '', 13.00, '🥛', 2),
    (t_id, 'coffee', 'Cold Brew', '18-hour steeped', 12.00, '🧊', 3),
    (t_id, 'pastry', 'Butter Croissant', '', 7.50, '🥐', 1),
    (t_id, 'pastry', 'Banana Bread Slice', '', 9.00, '🍌', 2)
  on conflict do nothing;

  -- Klinik -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-klinik';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'consult', 'Consultations', '🩺', 1)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'consult', 'General Consultation', 'Doctor consult + basic meds', 40.00, '🩺', 1),
    (t_id, 'consult', 'Health Screening', 'Blood pressure, sugar, BMI check', 80.00, '🩸', 2),
    (t_id, 'consult', 'Vaccination', 'Flu / travel vaccine', 120.00, '💉', 3)
  on conflict do nothing;

  -- Hartanah -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-hartanah';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'sale', 'For Sale', '🏠', 1),
    (t_id, 'rent', 'For Rent', '🔑', 2)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order, metadata) values
    (t_id, 'sale', 'Taman Permata Double Storey', '4 bed · 3 bath · 1,800 sqft', 580000, '🏡', 1, '{"beds":4,"baths":3,"sqft":1800}'),
    (t_id, 'sale', 'Residensi Bayu Condo', '3 bed · 2 bath · 1,100 sqft', 420000, '🏢', 2, '{"beds":3,"baths":2,"sqft":1100}'),
    (t_id, 'rent', 'Studio near LRT', '1 bed · 1 bath · fully furnished', 1500, '🏙️', 1, '{"beds":1,"baths":1}')
  on conflict do nothing;

  -- Auto -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-auto';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'new', 'New Cars', '🚗', 1),
    (t_id, 'used', 'Used Cars', '🚙', 2)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'new', 'Perodua Alza AV 2026', 'Brand new · 7 seater', 78000, '🚐', 1),
    (t_id, 'new', 'Proton X50 Flagship', 'Brand new · turbo', 109800, '🚗', 2),
    (t_id, 'used', 'Honda City 2021', '32,000 km · well maintained', 68000, '🚙', 1)
  on conflict do nothing;

  -- Pasar Malam -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-pasarmalam';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'food', 'Food', '🍢', 1),
    (t_id, 'drinks', 'Drinks', '🥤', 2)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'food', 'Apam Balik', 'Peanut & sweetcorn', 3.00, '🥞', 1),
    (t_id, 'food', 'Popiah', '', 2.50, '🌯', 2),
    (t_id, 'food', 'Satay (10 sticks)', 'Chicken satay with peanut sauce', 8.00, '🍢', 3),
    (t_id, 'drinks', 'Sugarcane Juice', '', 4.00, '🥤', 1)
  on conflict do nothing;

  -- Event -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-event';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'packages', 'Packages', '🎉', 1)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'packages', 'Pelamin + Deco Package', 'Full stage decoration', 3500, '💐', 1),
    (t_id, 'packages', 'Bridal Makeup', 'Akad + reception look', 900, '💄', 2),
    (t_id, 'packages', 'Photography (Full Day)', '2 photographers + album', 2200, '📷', 3)
  on conflict do nothing;

  -- Catering -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-catering';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'pax', 'Per Pax Packages', '🍱', 1)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'pax', 'Nasi Beriani Package', 'Per pax, min 50 pax', 15.00, '🍛', 1),
    (t_id, 'pax', 'Western Fusion Package', 'Per pax, min 30 pax', 22.00, '🍝', 2),
    (t_id, 'pax', 'Kenduri Kahwin (Full)', 'Per pax, min 100 pax', 18.00, '🍽️', 3)
  on conflict do nothing;

  -- Bengkel -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-bengkel';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'service', 'Services', '🔧', 1)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'service', 'Full Service (Basic)', 'Oil, filter, inspection', 180.00, '🛢️', 1),
    (t_id, 'service', 'Tyre Change (4x)', '', 400.00, '🛞', 2),
    (t_id, 'service', 'Aircond Gas Top-up', '', 120.00, '❄️', 3)
  on conflict do nothing;

  -- DFY -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-dfy';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'consult', 'Consultation', '🚀', 1)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'consult', 'Free Discovery Call', '30 min, no obligation', 0.00, '📞', 1),
    (t_id, 'consult', 'DFY Full Build', 'We build your entire site', 499.00, '🚀', 2)
  on conflict do nothing;

  -- Dental -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-dental';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'treatments', 'Treatments', '🦷', 1)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'treatments', 'Scaling & Polishing', '', 90.00, '🦷', 1),
    (t_id, 'treatments', 'Tooth Filling', 'Per tooth', 150.00, '😬', 2),
    (t_id, 'treatments', 'Teeth Whitening', 'In-clinic session', 450.00, '✨', 3)
  on conflict do nothing;

  -- Aesthetic -------------------------------------------------
  select id into t_id from public.tenants where slug = 'demo-aesthetic';
  insert into public.categories (tenant_id, slug, name, emoji, sort_order) values
    (t_id, 'treatments', 'Signature Treatments', '✨', 1)
  on conflict (tenant_id, slug) do nothing;
  insert into public.items (tenant_id, category, name, description, price, emoji, sort_order) values
    (t_id, 'treatments', 'HIFU Facelift', '', 1200.00, '✨', 1),
    (t_id, 'treatments', 'Botox (per area)', '', 800.00, '💉', 2),
    (t_id, 'treatments', 'Hydrafacial', '', 350.00, '💧', 3)
  on conflict do nothing;

end $$;

-- Done! Visit /t/demo-restoran, /t/demo-cafe, etc. or use the links on
-- the landing page, /templates and /demo to see each business type live.

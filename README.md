# Slingshot — Malaysian SaaS Website Builder

12 niche templates · multi-tenant · DuitNow QR + Stripe · trusted by Malaysian businesses

## 🚀 Quick start

This is a Next.js 14 + Supabase + Stripe multi-tenant SaaS.

### Step 1: Clone & install

```bash
git clone https://github.com/parcellomalaysia-a11y/slingshot.git
cd slingshot
npm install
```

### Step 2: Supabase setup

1. Create new Supabase project at supabase.com
2. Go to SQL Editor → paste contents of `supabase/schema.sql` → Run
3. Go to Authentication → Settings → enable Email provider
4. Go to Storage → create 3 buckets:
   - `tenant-assets` (public, 5MB max)
   - `item-photos` (public, 3MB max)
   - `duitnow-qrs` (public, 1MB max)
5. Go to Project Settings → API → copy your keys

### Step 3: Stripe setup

1. Create Stripe account at stripe.com (use test mode first)
2. Go to Products → create 3 products:
   - Starter (RM 29/month)
   - Pro (RM 79/month)
   - DFY (RM 499 one-time)
3. Note down the price IDs (price_xxxx)
4. Go to Developers → API Keys → copy publishable + secret keys
5. Go to Connect → enable Stripe Connect (Express accounts)

### Step 4: Environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

### Step 5: Run locally

```bash
npm run dev
# Opens http://localhost:3000
```

### Step 6: Test subdomain locally

Add to `/etc/hosts` (Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1   slingshot.localhost
127.0.0.1   brewpickup.slingshot.localhost
127.0.0.1   app.slingshot.localhost
```

Then visit:
- http://slingshot.localhost:3000 — landing page
- http://app.slingshot.localhost:3000 — owner dashboard
- http://brewpickup.slingshot.localhost:3000 — tenant customer site

### Step 7: Deploy to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "Initial Slingshot M2 foundation"
git push origin main
```

2. Go to vercel.com → Import GitHub repo
3. Add same env vars to Vercel Project Settings
4. Go to Domains → add `slingshot.my` AND `*.slingshot.my` (wildcard)
5. Add DNS records at your domain registrar:
   - `slingshot.my` → A record to Vercel's IP
   - `*.slingshot.my` → CNAME to `cname.vercel-dns.com`

## 📁 Architecture

```
slingshot.my              → Marketing landing (/app/page.tsx)
app.slingshot.my          → Owner dashboard (/app/(dashboard)/)
brewpickup.slingshot.my   → Tenant site (/app/_sites/brewpickup/)
mycafe.com (custom)       → Tenant site (custom domain via DNS CNAME)
```

`middleware.ts` detects subdomain and rewrites to `/_sites/[slug]` route.

## 🗄 Schema

See `supabase/schema.sql` for full schema. Key tables:

- `tenants` — businesses on Slingshot
- `subscriptions` — Stripe billing
- `items` — universal (food/property/car/service)
- `categories` — per-tenant
- `orders` — universal bookings
- `promo_codes` — discounts
- `whatsapp_templates` — auto-messages

RLS policies enforce multi-tenancy.

## 🎨 Templates

Each niche has a React component in `components/templates/`:

- `RestoranTemplate.tsx` — cart + pickup (F&B)
- `CafeTemplate.tsx` — extends Restoran
- `HartanahTemplate.tsx` — property grid + viewing booking
- `GenericNicheTemplate.tsx` — handles klinik/dental/aesthetic/auto/event/catering/bengkel/dfy/pasarmalam

`TenantRenderer.tsx` routes to the right template based on `tenant.niche`.

## 🔌 Realtime (KDS)

Owner KDS uses Supabase Realtime to listen for order changes:

```typescript
const channel = supabase
  .channel('orders')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenant.id}` },
    payload => { /* update KDS */ })
  .subscribe();
```

## 💳 DuitNow + Stripe

- DuitNow QR uploaded by tenant to Supabase Storage
- Customer scans QR → pays into tenant's bank account directly
- Owner manually confirms payment in KDS ("✓ Confirm Paid")
- Stripe Connect handles online card payments to tenant's Stripe account

## 🚧 What's done in M2 foundation

- ✅ Next.js 14 App Router setup
- ✅ Supabase schema with multi-tenant RLS
- ✅ Subdomain middleware (slingshot.my → tenant lookup)
- ✅ Tenant page route (/_sites/[slug])
- ✅ TenantRenderer routing to template by niche
- ✅ RestoranTemplate with cart system (functional)
- ✅ HartanahTemplate with property grid
- ✅ GenericNicheTemplate handling 9 other niches

## 🔜 Next phases (M3 and beyond)

- M3: Onboarding flow (signup → pick niche → customize brand → publish)
- M4: Full Owner Dashboard (Kitchen, Menu, Orders, Settings)
- M4.5: Real-time KDS via Supabase Realtime
- M5: Stripe webhooks + subscription management
- M5.5: WhatsApp Business API integration
- M6: Marketing site, demo videos, launch

## 📞 Support

Built by Parcello Global · parcellomalaysia@gmail.com

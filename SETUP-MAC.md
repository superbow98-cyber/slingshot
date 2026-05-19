# Slingshot M2 — Mac Setup Guide

Complete step-by-step from zero to deployed. Follow in order.

---

## ⏱️ Total time: ~45 mins

- 5 min — Download & extract
- 10 min — Supabase setup
- 5 min — Stripe setup
- 5 min — GitHub repo
- 10 min — Local install + run
- 10 min — Vercel deploy

---

## 📦 Step 1: Download & Extract (Mac)

Download `slingshot-m2-foundation.zip` to your Desktop, then:

```bash
cd ~/Desktop
unzip slingshot-m2-foundation.zip
mv slingshot-m2 slingshot
cd slingshot
```

You should see all the files. Confirm with:

```bash
ls
# Should show: app, components, lib, supabase, package.json, README.md, etc
```

---

## 🗄️ Step 2: Create Supabase Project

1. Go to **https://supabase.com** in your browser
2. Click **"Sign in"** top-right
3. Sign in with `amormalaysia53@gmail.com` (or create new account if needed)
4. Click **"New Project"** button
5. Fill in:
   - **Name:** `slingshot`
   - **Database Password:** create strong password (SAVE THIS)
   - **Region:** `Southeast Asia (Singapore)` — closest to Malaysia
   - **Pricing Plan:** Free
6. Click **"Create new project"** — wait 2-3 min for provisioning

### 2a. Run schema migration

7. Once project is ready, click **"SQL Editor"** in left sidebar
8. Click **"New query"**
9. Open `~/Desktop/slingshot/supabase/schema.sql` in TextEdit
10. **Copy the ENTIRE contents** (Cmd+A, Cmd+C)
11. Paste into Supabase SQL Editor
12. Click **"Run"** (or Cmd+Enter)
13. Should see success: "Success. No rows returned"

### 2b. Get your API keys

14. Click **"Project Settings"** (gear icon, bottom-left)
15. Click **"API"** in submenu
16. You'll see 3 things to copy:
    - **Project URL:** `https://xxxxx.supabase.co`
    - **anon public key:** `eyJhbGc...` (long string)
    - **service_role key:** `eyJhbGc...` (different long string, KEEP SECRET)

Keep this page open — we'll use these keys in Step 6.

### 2c. Create storage buckets

17. Click **"Storage"** in left sidebar
18. Click **"New bucket"**:
    - Name: `tenant-assets`
    - Public bucket: ✅ ON
    - File size limit: 5MB
    - Click Save
19. Repeat for:
    - `item-photos` (Public, 3MB)
    - `duitnow-qrs` (Public, 1MB)

### 2d. Enable Realtime on orders

20. Click **"Database"** → **"Replication"** in left sidebar
21. Find `orders` table
22. Toggle **"Send realtime events"** ON

---

## 💳 Step 3: Stripe Setup (Test Mode First)

1. Go to **https://stripe.com** → Sign in (or create account)
2. Use **TEST mode** for now (toggle top-right corner)

### 3a. Get API keys

3. Click **"Developers"** → **"API keys"** in left sidebar
4. Copy:
   - **Publishable key:** `pk_test_...`
   - **Secret key:** `sk_test_...` (click "Reveal test key")

### 3b. Skip products for now

We'll add products + Stripe Connect later when needed for billing. For M2 foundation, the API keys are enough.

---

## 🐙 Step 4: Create GitHub Repo

1. Go to **https://github.com** → Sign in as **parcellomalaysia-a11y**
2. Click **"+"** top-right → **"New repository"**
3. Fill in:
   - **Owner:** parcellomalaysia-a11y
   - **Repository name:** `slingshot`
   - **Description:** "Slingshot — multi-tenant SaaS website builder for Malaysian businesses"
   - **Visibility:** Private (until ready to launch)
   - **DO NOT initialize with README, .gitignore, or license** (we have our own)
4. Click **"Create repository"**

GitHub shows you setup commands. We'll use them in Step 6.

---

## ⚙️ Step 5: Local Install

Open Terminal and run:

```bash
cd ~/Desktop/slingshot
npm install
```

This will take 2-3 min. You'll see `node_modules/` created. Some warnings are normal.

---

## 🔐 Step 6: Environment Variables

```bash
cd ~/Desktop/slingshot
cp .env.example .env.local
open -e .env.local
```

This opens `.env.local` in TextEdit. Fill in your values:

```bash
# Supabase (from Step 2b)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (from Step 3a)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (leave blank for now)

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe products (leave blank for now)
STRIPE_PRICE_STARTER_MONTHLY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_DFY_ONETIME=

# WhatsApp (leave blank for now)
WHATSAPP_BUSINESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

Save (Cmd+S) and close.

---

## 🧪 Step 7: Test Locally

```bash
cd ~/Desktop/slingshot
npm run dev
```

Open **http://localhost:3000** in your browser.

You should see the Slingshot landing placeholder: "Slingshot · Website builder for Malaysian businesses".

### Test subdomain locally

To test tenant subdomains, edit Mac's hosts file:

```bash
sudo nano /etc/hosts
```

Add these lines at the bottom:

```
127.0.0.1   slingshot.localhost
127.0.0.1   app.slingshot.localhost
127.0.0.1   brewpickup.slingshot.localhost
```

Save with Ctrl+O, Enter, then Ctrl+X.

Now visit:
- http://slingshot.localhost:3000 → landing page
- http://brewpickup.slingshot.localhost:3000 → tenant page (will show 404 until you add a tenant row in Supabase)

### Quick test: Add a fake tenant

In Supabase SQL Editor, run:

```sql
insert into public.tenants (slug, business_name, niche, template_id, brand_color, brand_letter, tagline, status)
values ('brewpickup', 'Brew Pickup', 'cafe', 'template-02-cafe', '#2c1810', 'b', 'Specialty coffee · order pickup', 'active');
```

Refresh http://brewpickup.slingshot.localhost:3000 — you should see the empty Cafe template (no items yet).

---

## 🚀 Step 8: Push to GitHub

```bash
cd ~/Desktop/slingshot
git init
git add .
git commit -m "Initial Slingshot M2 foundation"
git branch -M main
git remote add origin https://github.com/parcellomalaysia-a11y/slingshot.git
git push -u origin main
```

If prompted for credentials, use `parcellomalaysia@gmail.com` as email + your GitHub Personal Access Token (PAT) as password.

Don't have a PAT? Create one at: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Scopes: ✅ repo (full control)
- Generate → copy the token

After first push, macOS Keychain remembers it.

---

## ☁️ Step 9: Deploy to Vercel

1. Go to **https://vercel.com** → Sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find `parcellomalaysia-a11y/slingshot` → Click **"Import"**
4. **Framework Preset:** Next.js (auto-detected)
5. **Root Directory:** ./ (default)
6. Click **"Environment Variables"** to expand:
   - Add all variables from your `.env.local` ONE BY ONE
   - But change `NEXT_PUBLIC_APP_URL` to: `https://slingshot.my`
7. Click **"Deploy"**

Wait 2-3 min. You'll get a URL like `slingshot-xxx.vercel.app`.

### 9a. Add custom domain

8. Once deployed, click **"Domains"** tab in Vercel project
9. Add domains ONE BY ONE:
   - `slingshot.my` (main)
   - `*.slingshot.my` (wildcard — important!)
10. Vercel shows DNS records to add at your domain registrar

### 9b. DNS records (at your registrar — where you bought slingshot.my)

Add these:

| Type  | Name | Value                  |
|-------|------|------------------------|
| A     | @    | 76.76.21.21            |
| CNAME | *    | cname.vercel-dns.com   |
| CNAME | www  | cname.vercel-dns.com   |

DNS propagation: 5-60 min.

---

## ✅ Step 10: Verify Live

Once DNS propagates:

- **https://slingshot.my** → landing page
- **https://brewpickup.slingshot.my** → fake tenant test page

You did it! Slingshot foundation is LIVE.

---

## 🐛 Common Issues

### "supabase URL is required" error
- Check `.env.local` has actual values, not placeholders
- Restart `npm run dev` after editing .env.local

### Subdomain not working locally
- Check `/etc/hosts` has the entries
- Use `localhost:3000` not `127.0.0.1:3000`
- Try Chrome (Safari sometimes caches subdomain DNS)

### Vercel build fails on type errors
- Make sure all 5 template component files exist:
  - TenantRenderer.tsx
  - RestoranTemplate.tsx
  - CafeTemplate.tsx
  - HartanahTemplate.tsx
  - GenericNicheTemplate.tsx

### GitHub push fails
- Make sure you used your PAT, not your GitHub password
- Run: `git remote -v` to confirm remote URL is correct

---

## 📚 What's next after M2

Once M2 is deployed and you can see tenants render:

- **M3:** Build onboarding wizard (signup → niche → customize → publish)
- **M4:** Real owner dashboard (Kitchen, Menu, Orders, Settings panels)
- **M4.5:** Supabase Realtime KDS for live order updates
- **M5:** Stripe Connect tenant onboarding + subscription billing
- **M6:** WhatsApp Business API + Marketing landing + Launch

Tell me when M2 is deployed and we'll move to M3.

---

Built by Parcello Global for Malaysian micro-businesses 🇲🇾

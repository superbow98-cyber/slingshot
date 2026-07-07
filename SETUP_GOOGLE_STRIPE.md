# Slingshot — Google Login + Stripe Payments Setup

This covers the two pieces that need real accounts/keys before they work in production:
Google sign-in and Stripe billing. Everything else in this package (landing page, onboarding,
dashboard, demos) works with just your existing Supabase project.

## 1. Run the new database seed

In Supabase SQL Editor, run (in order):
1. `supabase/schema.sql` — if you haven't already (safe to re-run, uses `if not exists`)
2. `supabase/seed-demo.sql` — creates one live demo tenant per business type

After this, `/t/demo-restoran`, `/t/demo-cafe`, etc. all work immediately, and the
"Live demo" links on the landing page, `/templates`, and `/demo` will show real data.

## 2. Google OAuth login

Google login is handled by Supabase Auth — no extra `npm` packages, no app-side secrets.

**a) Create Google OAuth credentials**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project (or reuse one) → "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Authorized redirect URI — get the exact value from Supabase (next step), it looks like:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
5. Save → copy the **Client ID** and **Client Secret**

**b) Enable the provider in Supabase**
1. Supabase Dashboard → Authentication → Providers → Google → toggle **Enabled**
2. Paste the Client ID + Client Secret from step (a)
3. Copy the "Callback URL" shown here — it must match what you entered in Google Cloud
4. Save

**c) Add your app's redirect URLs**
1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL: `https://slingshot.my` (or your Vercel URL for staging)
3. Redirect URLs — add both:
   - `https://slingshot.my/auth/callback`
   - `https://slingshot-liart.vercel.app/auth/callback` (staging)
   - `http://localhost:3000/auth/callback` (local dev)

That's it — the "Continue with Google" buttons on `/login` and `/signup` already call
`supabase.auth.signInWithOAuth({ provider: 'google' })` and land on `/app/auth/callback/route.ts`,
which exchanges the code for a session and redirects into `/dashboard` (or `/onboarding` for new users).

## 3. Stripe payments

**a) Create products + prices** (Stripe Dashboard → Product catalog)
- **Starter** — RM 29/month recurring → copy the Price ID → `STRIPE_PRICE_STARTER_MONTHLY`
- **Pro** — RM 79/month recurring → copy the Price ID → `STRIPE_PRICE_PRO_MONTHLY`
- **DFY** — RM 499 one-time → copy the Price ID → `STRIPE_PRICE_DFY_ONETIME`

Start in **Test mode** first, switch the keys to live mode when you're ready to charge real cards.

**b) Set environment variables** (Vercel Project Settings → Environment Variables, and `.env.local`)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...          # from step (c) below
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_DFY_ONETIME=price_...
```

**c) Create the webhook**
1. Stripe Dashboard → Developers → Webhooks → "Add endpoint"
2. Endpoint URL: `https://slingshot.my/api/webhooks/stripe`
3. Events to send: `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

**d) How it flows**
- `/pricing` and `/dashboard/billing` call `POST /api/checkout` with `{ plan: 'starter' | 'pro' | 'dfy' }`
- That route creates (or reuses) a Stripe Customer for the tenant, then a Checkout Session, and returns
  the `url` to redirect to
- After payment, Stripe calls `POST /api/webhooks/stripe`, which activates the tenant and writes/updates
  a row in `subscriptions`
- `/dashboard/billing` shows "Manage billing →" once a `stripe_customer_id` exists, which opens the
  Stripe Billing Portal (`/api/billing-portal`) for the tenant to update card details or cancel

**e) Test it end-to-end** (test mode)
Use Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC. Trigger the webhook locally with:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 4. Deploy

Same one-push workflow as before (see `slingshot-brain.md`):
```bash
git add -A && git commit -m "feat: full app — auth, onboarding, dashboard, billing, demos" && git push origin main
```
Vercel auto-deploys in ~2 minutes. Double check all env vars above are set in Vercel first,
or the build will succeed but checkout/login will fail at runtime.

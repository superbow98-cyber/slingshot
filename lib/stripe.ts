import Stripe from 'stripe';
import { type PlanId } from './niches';

let _stripe: Stripe | null = null;

// Lazy-initialized so builds (and page-data collection) never crash just
// because STRIPE_SECRET_KEY isn't set in this environment yet. The key is
// only required once a route actually calls a Stripe API method.
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2024-11-20.acacia' as any,
    });
  }
  return _stripe;
}

// Maps our internal plan ids to Stripe Price IDs (set these in Vercel env vars
// after creating the products/prices in the Stripe Dashboard).
export const STRIPE_PRICE_IDS: Partial<Record<PlanId, string>> = {
  starter: process.env.STRIPE_PRICE_STARTER_MONTHLY,
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY,
  dfy: process.env.STRIPE_PRICE_DFY_ONETIME,
};

export function planIdFromPriceId(priceId: string | null | undefined): PlanId {
  if (!priceId) return 'free';
  const entry = Object.entries(STRIPE_PRICE_IDS).find(([, v]) => v === priceId);
  return (entry?.[0] as PlanId) || 'free';
}

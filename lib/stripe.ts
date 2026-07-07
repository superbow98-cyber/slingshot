import Stripe from 'stripe';
import { type PlanId } from './niches';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
});

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

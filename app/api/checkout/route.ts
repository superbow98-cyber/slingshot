import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { type PlanId } from '@/lib/niches';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const plan = body.plan as PlanId;

  if (!plan || !['starter', 'pro', 'dfy'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const origin = new URL(request.url).origin;

  // Not logged in yet — send them to sign up first, remembering the chosen plan
  if (!user) {
    return NextResponse.json({ redirect: `/signup?plan=${plan}` });
  }

  const admin = createAdminClient();
  const { data: tenant } = await admin.from('tenants').select('*').eq('user_id', user.id).maybeSingle();

  // Logged in but hasn't finished onboarding yet
  if (!tenant) {
    return NextResponse.json({ redirect: `/onboarding?plan=${plan}` });
  }

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: 'This plan is not configured yet. Please contact support.' }, { status: 500 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments are not configured yet on this deployment.' }, { status: 500 });
  }

  // Ensure a Stripe customer exists for this tenant
  let customerId = tenant.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      metadata: { tenant_id: tenant.id, tenant_slug: tenant.slug },
    });
    customerId = customer.id;
    await admin.from('tenants').update({ stripe_customer_id: customerId }).eq('id', tenant.id);
  }

  const isOneTime = plan === 'dfy';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: isOneTime ? 'payment' : 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: isOneTime ? undefined : { trial_period_days: tenant.status === 'trial' ? 14 : undefined },
    success_url: `${origin}/dashboard/billing?checkout=success`,
    cancel_url: `${origin}/dashboard/billing?checkout=canceled`,
    metadata: { tenant_id: tenant.id, plan },
  });

  return NextResponse.json({ url: session.url });
}

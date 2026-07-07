import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe, planIdFromPriceId } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

// Stripe requires the raw body to verify the webhook signature — do not use request.json() here.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenant_id;
      const plan = (session.metadata?.plan as string) || 'starter';
      if (tenantId) {
        await admin.from('tenants').update({ status: 'active' }).eq('id', tenantId);
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(admin, tenantId, sub, plan);
        } else {
          // One-time payment (DFY plan)
          await admin.from('subscriptions').insert({
            tenant_id: tenantId,
            plan: 'dfy',
            status: 'active',
          });
        }
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription;
      const tenantId = await tenantIdFromCustomer(admin, sub.customer as string);
      if (tenantId) {
        const plan = planIdFromPriceId(sub.items.data[0]?.price?.id);
        await upsertSubscription(admin, tenantId, sub, plan);
        await admin.from('tenants').update({ status: sub.status === 'active' || sub.status === 'trialing' ? 'active' : 'suspended' }).eq('id', tenantId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const tenantId = await tenantIdFromCustomer(admin, sub.customer as string);
      if (tenantId) {
        await admin.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id);
        await admin.from('tenants').update({ status: 'suspended' }).eq('id', tenantId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const tenantId = await tenantIdFromCustomer(admin, invoice.customer as string);
      if (tenantId) {
        await admin.from('subscriptions').update({ status: 'past_due' }).eq('tenant_id', tenantId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function tenantIdFromCustomer(admin: ReturnType<typeof createAdminClient>, customerId: string): Promise<string | null> {
  const { data } = await admin.from('tenants').select('id').eq('stripe_customer_id', customerId).maybeSingle();
  return data?.id || null;
}

async function upsertSubscription(admin: ReturnType<typeof createAdminClient>, tenantId: string, sub: Stripe.Subscription, plan: string) {
  await admin.from('subscriptions').upsert(
    {
      tenant_id: tenantId,
      stripe_subscription_id: sub.id,
      plan,
      status: sub.status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    { onConflict: 'stripe_subscription_id' }
  );
}

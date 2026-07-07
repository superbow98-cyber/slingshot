'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PLANS, type PlanId } from '@/lib/niches';

export default function BillingPage() {
  const supabase = createClient();
  const [tenant, setTenant] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: t } = await supabase.from('tenants').select('*').eq('user_id', user.id).single();
    setTenant(t);
    if (t) {
      const { data: s } = await supabase.from('subscriptions').select('*').eq('tenant_id', t.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      setSubscription(s);
    }
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function upgrade(planId: PlanId) {
    setLoadingPlan(planId);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoadingPlan(null);
  }

  async function openPortal() {
    setPortalLoading(true);
    const res = await fetch('/api/billing-portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalLoading(false);
  }

  if (!tenant) return <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>;

  const currentPlan = subscription?.plan || 'free';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Billing</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Manage your Slingshot subscription.</p>

      <div className="rounded-2xl p-6 mb-8 flex items-center justify-between" style={{ background: 'white', border: '1px solid var(--line)' }}>
        <div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>Current plan</div>
          <div className="serif text-2xl capitalize" style={{ color: 'var(--ink)' }}>{currentPlan}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            Status: {subscription?.status || 'trialing'} {tenant.status === 'trial' && `· trial ends ${new Date(tenant.trial_ends_at).toLocaleDateString()}`}
          </div>
        </div>
        {tenant.stripe_customer_id && (
          <button onClick={openPortal} disabled={portalLoading} className="px-4 py-2.5 rounded-xl text-xs font-bold" style={{ background: 'var(--bg-soft)', color: 'var(--ink)' }}>
            {portalLoading ? 'Opening…' : 'Manage billing →'}
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-5">
        {PLANS.map((p) => (
          <div key={p.id} className="rounded-2xl p-6 flex flex-col" style={{ border: p.featured ? '2px solid var(--ink)' : '1px solid var(--line)', background: 'white' }}>
            <div className="font-bold text-sm mb-1" style={{ color: 'var(--ink)' }}>{p.name}</div>
            <div className="mb-3">
              <span className="serif text-2xl" style={{ color: 'var(--ink)' }}>RM {p.price}</span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{p.billing === 'month' ? '/mo' : ''}</span>
            </div>
            <ul className="text-xs space-y-1.5 mb-5 flex-1">
              {p.features.map((f) => <li key={f} style={{ color: 'var(--ink-2)' }}>· {f}</li>)}
            </ul>
            {currentPlan === p.id ? (
              <span className="text-center rounded-xl py-2 text-xs font-bold" style={{ background: 'var(--bg-soft)', color: 'var(--muted)' }}>Current plan</span>
            ) : p.id === 'free' ? (
              <span className="text-center rounded-xl py-2 text-xs font-bold" style={{ background: 'var(--bg-soft)', color: 'var(--muted)' }}>Default</span>
            ) : (
              <button onClick={() => upgrade(p.id)} disabled={loadingPlan === p.id} className="rounded-xl py-2 text-xs font-bold" style={{ background: 'var(--ink)', color: 'white', opacity: loadingPlan === p.id ? 0.6 : 1 }}>
                {loadingPlan === p.id ? 'Redirecting…' : `Switch to ${p.name}`}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

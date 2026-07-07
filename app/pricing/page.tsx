'use client';

import { useState } from 'react';
import { PLANS, type PlanId } from '@/lib/niches';

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [err, setErr] = useState('');

  async function choosePlan(planId: PlanId) {
    setErr('');
    if (planId === 'free') {
      window.location.href = '/signup?plan=free';
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.redirect) {
        // not logged in / no tenant yet — send to signup, plan is remembered via query param
        window.location.href = data.redirect;
        return;
      }
      setErr(data.error || 'Something went wrong. Please try again.');
    } catch (e) {
      setErr('Could not start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen px-6 py-16" style={{ background: 'var(--bg-soft)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <a href="/" className="serif text-2xl" style={{ color: 'var(--ink)' }}>Slingshot</a>
        </div>
        <div className="text-center mb-14">
          <h1 className="serif text-5xl mb-3" style={{ color: 'var(--ink)' }}>Pricing that grows with you</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Start free. Upgrade anytime. Cancel anytime — no lock-in.</p>
        </div>

        {err && (
          <div className="max-w-md mx-auto mb-8 text-center text-sm rounded-xl p-3" style={{ background: '#fee', color: 'var(--red)' }}>
            {err}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl p-6 flex flex-col"
              style={{ border: p.featured ? '2px solid var(--ink)' : '1px solid var(--line)', background: 'white' }}
            >
              {p.featured && (
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full self-start mb-3" style={{ background: 'var(--ink)', color: 'white' }}>
                  Most popular
                </span>
              )}
              <div className="font-bold text-sm mb-1" style={{ color: 'var(--ink)' }}>{p.name}</div>
              <div className="mb-3">
                <span className="serif text-3xl" style={{ color: 'var(--ink)' }}>RM {p.price}</span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{p.billing === 'month' ? '/mo' : ' one-time'}</span>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>{p.tagline}</p>
              <ul className="text-xs space-y-2 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} style={{ color: 'var(--ink-2)' }}>· {f}</li>
                ))}
              </ul>
              <button
                onClick={() => choosePlan(p.id)}
                disabled={loadingPlan === p.id}
                className="text-center rounded-xl py-2.5 text-xs font-bold"
                style={{ background: p.featured ? 'var(--ink)' : 'var(--bg-soft)', color: p.featured ? 'white' : 'var(--ink)', opacity: loadingPlan === p.id ? 0.6 : 1 }}
              >
                {loadingPlan === p.id ? 'Redirecting…' : p.ctaLabel}
              </button>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center mt-16 text-xs" style={{ color: 'var(--muted)' }}>
          Payments processed securely by Stripe (card) or DuitNow QR (direct bank transfer, no fees).
          All paid plans include a 14-day free trial — you won't be charged until the trial ends.
        </div>
      </div>
    </main>
  );
}

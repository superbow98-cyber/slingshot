'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  total: number;
  payment_method: string | null;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
};

const STATUS_FLOW = ['new', 'accepted', 'in_progress', 'ready', 'completed'];

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: tenant } = await supabase.from('tenants').select('id').eq('user_id', user.id).single();
    if (!tenant) return;
    const { data } = await supabase.from('orders').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);

    const channel = supabase
      .channel('orders-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenant.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    load().then((c) => { if (typeof c === 'function') cleanup = c; });
    return () => cleanup?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function advance(order: Order) {
    const idx = STATUS_FLOW.indexOf(order.fulfillment_status);
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
    await supabase.from('orders').update({ fulfillment_status: next }).eq('id', order.id);
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.fulfillment_status === filter);

  if (loading) return <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Orders</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Live — updates automatically as customers order.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...STATUS_FLOW, 'canceled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
            style={{ background: filter === s ? 'var(--ink)' : 'white', color: filter === s ? 'white' : 'var(--ink-2)', border: '1px solid var(--line)' }}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--line)' }}>
        {filtered.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: 'var(--muted)' }}>No orders here yet.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {filtered.map((o) => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-16">
                  <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>#{o.order_number}</div>
                  <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleTimeString()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{o.customer_name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{o.customer_phone || '—'} · {o.payment_method || 'pending'}</div>
                </div>
                <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>RM {Number(o.total).toFixed(2)}</div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize" style={{ background: 'var(--bg-soft)', color: 'var(--ink-2)' }}>
                  {o.fulfillment_status.replace('_', ' ')}
                </span>
                {o.fulfillment_status !== 'completed' && o.fulfillment_status !== 'canceled' && (
                  <button onClick={() => advance(o)} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'var(--ink)', color: 'white' }}>
                    Next step →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

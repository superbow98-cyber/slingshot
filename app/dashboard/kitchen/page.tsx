'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  items: { name: string; qty: number }[];
  fulfillment_status: string;
  created_at: string;
  notes: string | null;
};

const QUEUE_STATUSES = ['new', 'accepted', 'in_progress'];

export default function KitchenDisplayPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const load = useCallback(async (tid: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', tid)
      .in('fulfillment_status', QUEUE_STATUSES)
      .order('created_at', { ascending: true });
    setOrders(data || []);
  }, [supabase]);

  useEffect(() => {
    let channel: any;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: tenant } = await supabase.from('tenants').select('id').eq('user_id', user.id).single();
      if (!tenant) return;
      setTenantId(tenant.id);
      load(tenant.id);
      channel = supabase
        .channel('kds-' + tenant.id)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenant.id}` }, () => load(tenant.id))
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function advance(order: Order) {
    const next = order.fulfillment_status === 'new' ? 'accepted' : order.fulfillment_status === 'accepted' ? 'in_progress' : 'ready';
    await supabase.from('orders').update({ fulfillment_status: next }).eq('id', order.id);
  }

  return (
    <div className="-m-6 md:-m-10 min-h-screen p-6" style={{ background: '#111' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'white' }}>👨‍🍳 Kitchen Display</h1>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{orders.length} orders in queue · live</span>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>No active orders. New orders will appear here instantly.</p>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl p-5" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg" style={{ color: 'white' }}>#{o.order_number}</span>
                <StatusBadge status={o.fulfillment_status} />
              </div>
              <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{o.customer_name} · {new Date(o.created_at).toLocaleTimeString()}</div>
              <ul className="text-sm space-y-1 mb-4">
                {(o.items || []).map((it, i) => (
                  <li key={i} style={{ color: 'white' }}>{it.qty}× {it.name}</li>
                ))}
              </ul>
              {o.notes && <p className="text-xs mb-3 italic" style={{ color: '#ff9500' }}>Note: {o.notes}</p>}
              <button onClick={() => advance(o)} className="w-full rounded-xl py-2.5 text-xs font-bold" style={{ background: 'white', color: '#111' }}>
                {o.fulfillment_status === 'new' ? 'Accept order' : o.fulfillment_status === 'accepted' ? 'Start cooking' : 'Mark ready'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { new: '#ff3b30', accepted: '#ff9500', in_progress: '#007aff' };
  return (
    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full" style={{ background: (colors[status] || '#666') + '33', color: colors[status] || '#999' }}>
      {status.replace('_', ' ')}
    </span>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Order = { id: string; order_number: string; fulfillment_status: string; created_at: string };

export default function CounterDisplayPage() {
  const supabase = createClient();
  const [preparing, setPreparing] = useState<Order[]>([]);
  const [ready, setReady] = useState<Order[]>([]);

  useEffect(() => {
    let channel: any;
    let tid: string;

    async function load() {
      const [{ data: prep }, { data: rdy }] = await Promise.all([
        supabase.from('orders').select('*').eq('tenant_id', tid).in('fulfillment_status', ['accepted', 'in_progress']).order('created_at'),
        supabase.from('orders').select('*').eq('tenant_id', tid).eq('fulfillment_status', 'ready').order('created_at', { ascending: false }).limit(8),
      ]);
      setPreparing(prep || []);
      setReady(rdy || []);
    }

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: tenant } = await supabase.from('tenants').select('id').eq('user_id', user.id).single();
      if (!tenant) return;
      tid = tenant.id;
      load();
      channel = supabase
        .channel('cds-' + tenant.id)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenant.id}` }, load)
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="-m-6 md:-m-10 min-h-screen p-10" style={{ background: '#0a0a0a' }}>
      <h1 className="serif text-3xl mb-10 text-center" style={{ color: 'white' }}>Order Status</h1>
      <div className="grid grid-cols-2 gap-10 max-w-4xl mx-auto">
        <div>
          <div className="text-center text-sm font-bold uppercase tracking-wide mb-6" style={{ color: '#ff9500' }}>Preparing</div>
          <div className="grid grid-cols-2 gap-4">
            {preparing.length === 0 && <p className="col-span-2 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>—</p>}
            {preparing.map((o) => (
              <div key={o.id} className="rounded-2xl py-6 text-center" style={{ background: '#1c1c1e' }}>
                <span className="serif text-4xl" style={{ color: 'white' }}>{o.order_number}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-center text-sm font-bold uppercase tracking-wide mb-6" style={{ color: '#34c759' }}>Ready for pickup</div>
          <div className="grid grid-cols-2 gap-4">
            {ready.length === 0 && <p className="col-span-2 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>—</p>}
            {ready.map((o) => (
              <div key={o.id} className="rounded-2xl py-6 text-center" style={{ background: '#0d2818', border: '1px solid #34c759' }}>
                <span className="serif text-4xl" style={{ color: '#34c759' }}>{o.order_number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-center text-xs mt-14" style={{ color: 'rgba(255,255,255,0.3)' }}>Updates live — no refresh needed. Display this on a TV at your counter.</p>
    </div>
  );
}

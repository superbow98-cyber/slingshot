'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUS_COLOR: Record<string, string> = {
  pending: '#c89440',
  confirmed: '#4a9c6d',
  preparing: '#c45c6a',
  ready: '#5b9bd5',
  completed: '#4a4540',
  cancelled: '#3a3530',
}

export default function DashboardPage() {
  const [tenant, setTenant] = useState<any>(null)
  const [stats, setStats] = useState({ today: 0, revenue: 0, pending: 0, items: 0 })
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: t } = await supabase
        .from('tenants').select('*').eq('owner_id', user.id).single()
      if (!t) return
      setTenant(t)

      // Today orders
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const { data: todayOrders } = await supabase
        .from('orders').select('id, total_amount, status').eq('tenant_id', t.id)
        .gte('created_at', today.toISOString())

      const revenue = todayOrders?.reduce((s: number, o: any) => s + (o.total_amount || 0), 0) || 0
      const pending = todayOrders?.filter((o: any) => o.status === 'pending').length || 0

      const { count: itemCount } = await supabase
        .from('items').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id)

      setStats({ today: todayOrders?.length || 0, revenue, pending, items: itemCount || 0 })

      // Recent 10 orders
      const { data: recent } = await supabase
        .from('orders').select('id, customer_name, total_amount, status, created_at, items')
        .eq('tenant_id', t.id).order('created_at', { ascending: false }).limit(10)

      setOrders(recent || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSkeleton />

  const trialDaysLeft = tenant?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div>
      {/* Trial banner */}
      {trialDaysLeft !== null && trialDaysLeft <= 14 && tenant?.status === 'trial' && (
        <div style={{ background: '#c89440', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#0f0e0d', fontWeight: 600 }}>
            ⏳ Trial tamat dalam {trialDaysLeft} hari
          </span>
          <span style={{ fontSize: 11, color: '#0f0e0d' }}>Upgrade →</span>
        </div>
      )}

      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
          Selamat datang 👋
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b6560' }}>
          {new Date().toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        <StatCard label="Pesanan Hari Ini" value={stats.today} color="#c45c6a" icon="🛒" />
        <StatCard label="Hasil Hari Ini" value={`RM ${stats.revenue.toFixed(2)}`} color="#4a9c6d" icon="💰" />
        <StatCard label="Menunggu" value={stats.pending} color="#c89440" icon="⏳" />
        <StatCard label="Produk Aktif" value={stats.items} color="#5b9bd5" icon="📦" />
      </div>

      {/* Recent orders */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Pesanan Terkini</h2>
          <a href="/dashboard/orders" style={{ fontSize: 12, color: '#c45c6a', textDecoration: 'none' }}>Lihat semua →</a>
        </div>

        {orders.length === 0 ? (
          <EmptyState icon="🛒" text="Tiada pesanan lagi" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: '#161410', border: '1px solid #1e1c19', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{order.customer_name || 'Pelanggan'}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b6560' }}>
                    {new Date(order.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>RM {(order.total_amount || 0).toFixed(2)}</p>
                  <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: STATUS_COLOR[order.status] + '33', color: STATUS_COLOR[order.status] }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon }: any) {
  return (
    <div style={{ background: '#161410', border: '1px solid #1e1c19', borderRadius: 12, padding: '16px 14px' }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <p style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: '#6b6560' }}>{label}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ height: 32, background: '#1e1c19', borderRadius: 8, width: '50%', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 90, background: '#1e1c19', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
    </div>
  )
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: '#4a4540' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 13 }}>{text}</p>
    </div>
  )
}

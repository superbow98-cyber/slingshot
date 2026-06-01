'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']

const STATUS_META: Record<string, { color: string; label: string; next: string | null }> = {
  pending:   { color: '#c89440', label: 'Menunggu',   next: 'confirmed' },
  confirmed: { color: '#5b9bd5', label: 'Disahkan',   next: 'preparing' },
  preparing: { color: '#c45c6a', label: 'Sedang Sedia', next: 'ready' },
  ready:     { color: '#4a9c6d', label: 'Sedia',      next: 'completed' },
  completed: { color: '#3a5a3a', label: 'Selesai',    next: null },
  cancelled: { color: '#3a3530', label: 'Batal',      next: null },
}

interface Order {
  id: string
  customer_name: string | null
  customer_phone: string | null
  total_amount: number
  status: string
  created_at: string
  notes: string | null
  items: any
}

export default function OrdersPage() {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<string>('active')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: t } = await supabase.from('tenants').select('id').eq('owner_id', user.id).single()
      if (!t) return
      setTenantId(t.id)
      await fetchOrders(t.id)
    }
    load()
  }, [])

  async function fetchOrders(tid: string) {
    setLoading(true)
    const { data } = await supabase
      .from('orders').select('*').eq('tenant_id', tid)
      .order('created_at', { ascending: false }).limit(50)
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(orderId: string, status: string) {
    setUpdating(true)
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    if (selected?.id === orderId) setSelected(prev => prev ? { ...prev, status } : null)
    setUpdating(false)
  }

  const filtered = orders.filter(o => {
    if (filter === 'active') return ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
    if (filter === 'completed') return o.status === 'completed'
    if (filter === 'cancelled') return o.status === 'cancelled'
    return true
  })

  if (loading) return <p style={{ color: '#6b6560', fontSize: 13 }}>Memuatkan pesanan...</p>

  return (
    <div>
      <h1 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Pesanan</h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { key: 'active', label: 'Aktif' },
          { key: 'completed', label: 'Selesai' },
          { key: 'cancelled', label: 'Batal' },
          { key: 'all', label: 'Semua' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ flexShrink: 0, padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === key ? '#c45c6a' : '#1e1c19', color: filter === key ? '#fff' : '#6b6560' }}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#4a4540' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
          <p style={{ margin: 0, fontSize: 14 }}>Tiada pesanan</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(order => {
            const meta = STATUS_META[order.status] || STATUS_META.pending
            return (
              <div key={order.id} onClick={() => setSelected(order)}
                style={{ background: '#161410', border: '1px solid #1e1c19', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{order.customer_name || 'Pelanggan'}</p>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: meta.color + '22', color: meta.color, flexShrink: 0 }}>
                      {meta.label}
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6b6560' }}>
                    {new Date(order.created_at).toLocaleString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#c45c6a' }}>RM {(order.total_amount || 0).toFixed(2)}</p>
                  {meta.next && (
                    <button onClick={e => { e.stopPropagation(); updateStatus(order.id, meta.next!) }}
                      style={{ marginTop: 4, fontSize: 10, padding: '3px 8px', background: meta.color, border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                      → {STATUS_META[meta.next]?.label}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order detail drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div style={{ background: '#161410', borderRadius: '16px 16px 0 0', padding: '24px 20px 32px', width: '100%', maxWidth: 640, margin: '0 auto', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{selected.customer_name || 'Pelanggan'}</h2>
                {selected.customer_phone && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b6560' }}>📱 {selected.customer_phone}</p>}
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#6b6560', fontSize: 20, cursor: 'pointer', padding: 0 }}>×</button>
            </div>

            {selected.notes && (
              <div style={{ background: '#c8944022', border: '1px solid #c8944033', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#c89440' }}>📝 {selected.notes}</p>
              </div>
            )}

            {/* Items */}
            {Array.isArray(selected.items) && selected.items.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {selected.items.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e1c19' }}>
                    <span style={{ fontSize: 13 }}>{item.quantity}× {item.name}</span>
                    <span style={{ fontSize: 13, color: '#c45c6a' }}>RM {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Jumlah</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#c45c6a' }}>RM {(selected.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Status actions */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#6b6560' }}>Tukar status:</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUSES.map(s => {
                  const meta = STATUS_META[s]
                  const isActive = selected.status === s
                  return (
                    <button key={s} disabled={updating || isActive} onClick={() => updateStatus(selected.id, s)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${isActive ? meta.color : '#2a2826'}`, background: isActive ? meta.color + '33' : 'transparent', color: isActive ? meta.color : '#6b6560', cursor: isActive ? 'default' : 'pointer', fontSize: 12, fontWeight: isActive ? 700 : 400 }}>
                      {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

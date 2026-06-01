'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Item {
  id: string
  name: string
  description: string | null
  price: number
  available: boolean
  image_url: string | null
  category_id: string | null
}

interface Category {
  id: string
  name: string
}

export default function MenuPage() {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', available: true })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: t } = await supabase.from('tenants').select('id').eq('owner_id', user.id).single()
      if (!t) return
      setTenantId(t.id)

      const [{ data: itemsData }, { data: catsData }] = await Promise.all([
        supabase.from('items').select('*').eq('tenant_id', t.id).order('name'),
        supabase.from('categories').select('*').eq('tenant_id', t.id).order('name'),
      ])
      setItems(itemsData || [])
      setCategories(catsData || [])
      setLoading(false)
    }
    load()
  }, [])

  function openAdd() {
    setEditItem(null)
    setForm({ name: '', description: '', price: '', category_id: '', available: true })
    setShowForm(true)
  }

  function openEdit(item: Item) {
    setEditItem(item)
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id || '',
      available: item.available,
    })
    setShowForm(true)
  }

  async function toggleAvailable(item: Item) {
    await supabase.from('items').update({ available: !item.available }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i))
  }

  async function handleDelete(id: string) {
    if (!confirm('Padam item ni?')) return
    await supabase.from('items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function handleSave() {
    if (!form.name || !form.price || !tenantId) return
    setSaving(true)

    const payload = {
      tenant_id: tenantId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      category_id: form.category_id || null,
      available: form.available,
    }

    if (editItem) {
      const { data } = await supabase.from('items').update(payload).eq('id', editItem.id).select().single()
      if (data) setItems(prev => prev.map(i => i.id === editItem.id ? data : i))
    } else {
      const { data } = await supabase.from('items').insert(payload).select().single()
      if (data) setItems(prev => [...prev, data])
    }

    setSaving(false)
    setShowForm(false)
  }

  if (loading) return <p style={{ color: '#6b6560', fontSize: 13 }}>Memuatkan menu...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Menu</h1>
        <button onClick={openAdd} style={{ background: '#c45c6a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Tambah
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#4a4540' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
          <p style={{ margin: 0, fontSize: 14 }}>Belum ada item. Tambah yang pertama!</p>
          <button onClick={openAdd} style={{ marginTop: 16, background: '#c45c6a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Tambah Item
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#161410', border: '1px solid #1e1c19', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Toggle */}
              <button onClick={() => toggleAvailable(item)} style={{ flexShrink: 0, width: 36, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: item.available ? '#4a9c6d' : '#3a3530', position: 'relative', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: 3, left: item.available ? 16 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </button>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, opacity: item.available ? 1 : 0.4 }}>{item.name}</p>
                {item.description && (
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b6560', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
                )}
              </div>

              {/* Price */}
              <span style={{ fontSize: 14, fontWeight: 700, color: '#c45c6a', flexShrink: 0 }}>
                RM {item.price.toFixed(2)}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => openEdit(item)} style={{ background: 'transparent', border: '1px solid #2a2826', borderRadius: 6, padding: '5px 8px', color: '#a09590', cursor: 'pointer', fontSize: 12 }}>Edit</button>
                <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: '1px solid #2a2826', borderRadius: 6, padding: '5px 8px', color: '#c45c6a', cursor: 'pointer', fontSize: 12 }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={{ background: '#161410', borderRadius: '16px 16px 0 0', padding: '24px 20px 32px', width: '100%', maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>{editItem ? 'Edit Item' : 'Tambah Item'}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Nama item">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Cth: Nasi Lemak Ayam" style={inputStyle} />
              </Field>
              <Field label="Penerangan (opsional)">
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ringkasan pendek" style={inputStyle} />
              </Field>
              <Field label="Harga (RM)">
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" step="0.10" min="0" style={inputStyle} />
              </Field>
              {categories.length > 0 && (
                <Field label="Kategori (opsional)">
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={inputStyle}>
                    <option value="">-- Tiada kategori --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#a09590' }}>Tersedia sekarang</span>
                <button onClick={() => setForm(f => ({ ...f, available: !f.available }))} style={{ width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: form.available ? '#4a9c6d' : '#3a3530', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 3, left: form.available ? 20 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'transparent', border: '1px solid #2a2826', borderRadius: 10, padding: 14, color: '#a09590', cursor: 'pointer', fontSize: 14 }}>Batal</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.price} style={{ flex: 2, background: saving ? '#5a3a3e' : '#c45c6a', border: 'none', borderRadius: 10, padding: 14, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                {saving ? 'Menyimpan...' : editItem ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: '#6b6560', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f0e0d', border: '1px solid #2a2826', borderRadius: 8,
  padding: '10px 12px', color: '#f0ece4', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

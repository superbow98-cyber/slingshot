'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BRAND_COLORS = [
  '#c45c6a', '#c89440', '#4a9c6d', '#5b9bd5',
  '#7b5ea7', '#d4603a', '#2c6e6a', '#1d1a16',
]

export default function SettingsPage() {
  const router = useRouter()
  const [tenant, setTenant] = useState<any>(null)
  const [form, setForm] = useState({ business_name: '', tagline: '', brand_color: '', brand_letter: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [qrUploading, setQrUploading] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrSuccess, setQrSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: t } = await supabase.from('tenants').select('*').eq('owner_id', user.id).single()
      if (!t) return
      setTenant(t)
      setQrUrl(t.duitnow_qr_url || null)
      setForm({
        business_name: t.business_name || '',
        tagline: t.tagline || '',
        brand_color: t.brand_color || '#c45c6a',
        brand_letter: t.brand_letter || '',
      })
    }
    load()
  }, [])

  async function handleSave() {
    if (!tenant || !form.business_name) return
    setSaving(true)
    await supabase.from('tenants').update({
      business_name: form.business_name.trim(),
      tagline: form.tagline.trim() || null,
      brand_color: form.brand_color,
      brand_letter: form.brand_letter.trim().toLowerCase().charAt(0) || form.business_name.charAt(0).toLowerCase(),
    }).eq('id', tenant.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !tenant) return
    setQrUploading(true)

    const ext = file.name.split('.').pop()
    const path = `qr-${tenant.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('tenant-assets')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setQrUploading(false)
      alert('Gagal upload. Cuba lagi.')
      return
    }

    const { data } = supabase.storage.from('tenant-assets').getPublicUrl(path)
    const publicUrl = data.publicUrl

    await supabase.from('tenants').update({ duitnow_qr_url: publicUrl }).eq('id', tenant.id)

    setQrUrl(publicUrl)
    setQrUploading(false)
    setQrSuccess(true)
    setTimeout(() => setQrSuccess(false), 2500)
  }

  async function handleQrRemove() {
    if (!tenant) return
    await supabase.from('tenants').update({ duitnow_qr_url: null }).eq('id', tenant.id)
    setQrUrl(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (!tenant) return <p style={{ color: '#6b6560', fontSize: 13 }}>Memuatkan...</p>

  const trialDaysLeft = tenant?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Tetapan</h1>

      {/* Subscription status */}
      <div style={{ background: '#161410', border: '1px solid #1e1c19', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Plan Semasa</p>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6b6560', textTransform: 'capitalize' }}>{tenant.status || 'trial'}</p>
          </div>
          {trialDaysLeft !== null && tenant.status === 'trial' && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: trialDaysLeft <= 3 ? '#c45c6a' : '#c89440' }}>{trialDaysLeft}</p>
              <p style={{ margin: 0, fontSize: 10, color: '#6b6560' }}>hari lagi</p>
            </div>
          )}
        </div>
        {tenant.status === 'trial' && (
          <button style={{ marginTop: 12, width: '100%', background: '#c89440', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 700, color: '#0f0e0d', cursor: 'pointer' }}>
            Upgrade ke Starter — RM 49/bulan
          </button>
        )}
      </div>

      {/* Business info */}
      <div style={{ background: '#161410', border: '1px solid #1e1c19', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Maklumat Bisnes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Nama Bisnes">
            <input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} style={inputStyle} />
          </Field>
          <Field label="Tagline">
            <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Cth: Kopi terbaik di Shah Alam" style={inputStyle} />
          </Field>
          <Field label="Huruf Logo">
            <input value={form.brand_letter} maxLength={1} onChange={e => setForm(f => ({ ...f, brand_letter: e.target.value }))} placeholder="Satu huruf sahaja" style={{ ...inputStyle, textTransform: 'uppercase', width: 60 }} />
          </Field>
        </div>
      </div>

      {/* Brand color */}
      <div style={{ background: '#161410', border: '1px solid #1e1c19', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>Warna Brand</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {BRAND_COLORS.map(c => (
            <button key={c} onClick={() => setForm(f => ({ ...f, brand_color: c }))}
              style={{ width: 36, height: 36, borderRadius: 8, background: c, border: form.brand_color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer', outline: form.brand_color === c ? `2px solid ${c}` : 'none', outlineOffset: 1 }} />
          ))}
          <input type="color" value={form.brand_color} onChange={e => setForm(f => ({ ...f, brand_color: e.target.value }))}
            style={{ width: 36, height: 36, borderRadius: 8, border: 'none', padding: 2, background: '#0f0e0d', cursor: 'pointer' }} title="Warna custom" />
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: form.brand_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
            {form.brand_letter || form.business_name?.charAt(0) || '?'}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{form.business_name || 'Nama Bisnes'}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b6560' }}>{form.tagline || 'Tagline bisnes'}</p>
          </div>
        </div>
      </div>

      {/* URL info */}
      <div style={{ background: '#161410', border: '1px solid #1e1c19', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 12, color: '#6b6560' }}>URL kedai anda</p>
        <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: '#c45c6a' }}>{tenant.slug}.slingshot.my</p>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#4a4540' }}>Slug tidak boleh ditukar selepas publish.</p>
      </div>

      {/* DuitNow QR */}
      <div style={{ background: '#161410', border: '1px solid #1e1c19', borderRadius: 12, padding: '16px', marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>DuitNow QR</h2>

        {qrUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <img src={qrUrl} alt="DuitNow QR" style={{ width: 160, height: 160, objectFit: 'contain', borderRadius: 10, background: '#fff', padding: 8 }} />
            <p style={{ margin: 0, fontSize: 11, color: '#6b6560', textAlign: 'center' }}>QR ini akan dipaparkan kepada pelanggan semasa checkout</p>
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <label style={{ flex: 1, background: '#0f0e0d', border: '1px solid #2a2826', borderRadius: 8, padding: '10px 0', fontSize: 13, color: '#f0ece4', cursor: 'pointer', textAlign: 'center' }}>
                {qrUploading ? 'Mengupload...' : qrSuccess ? '✓ Tersimpan!' : 'Tukar QR'}
                <input type="file" accept="image/*" onChange={handleQrUpload} style={{ display: 'none' }} />
              </label>
              <button onClick={handleQrRemove} style={{ background: 'transparent', border: '1px solid #c45c6a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c45c6a', cursor: 'pointer' }}>
                Buang
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b6560' }}>Upload gambar QR DuitNow anda. Pelanggan akan scan masa checkout.</p>
            <label style={{ display: 'block', width: '100%', background: '#0f0e0d', border: '1px dashed #2a2826', borderRadius: 10, padding: '20px 0', fontSize: 13, color: qrUploading ? '#6b6560' : '#c89440', cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box' }}>
              {qrUploading ? 'Mengupload...' : qrSuccess ? '✓ QR berjaya disimpan!' : '+ Upload QR DuitNow'}
              <input type="file" accept="image/*" onChange={handleQrUpload} style={{ display: 'none' }} disabled={qrUploading} />
            </label>
          </div>
        )}
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        style={{ width: '100%', background: saved ? '#4a9c6d' : '#c45c6a', border: 'none', borderRadius: 10, padding: '14px 0', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', marginBottom: 12 }}>
        {saved ? '✓ Tersimpan!' : saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>

      {/* Logout */}
      <button onClick={handleLogout}
        style={{ width: '100%', background: 'transparent', border: '1px solid #2a2826', borderRadius: 10, padding: '12px 0', fontSize: 14, color: '#6b6560', cursor: 'pointer' }}>
        Log Keluar
      </button>
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

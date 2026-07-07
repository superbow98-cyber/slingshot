'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const supabase = createClient();
  const [tenant, setTenant] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('tenants').select('*').eq('user_id', user.id).single();
    setTenant(data);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!tenant) return;
    setSaving(true);
    await supabase.from('tenants').update({
      business_name: tenant.business_name,
      tagline: tenant.tagline,
      brand_color: tenant.brand_color,
      whatsapp_number: tenant.whatsapp_number,
      address: tenant.address,
      social_facebook: tenant.social_facebook,
      social_instagram: tenant.social_instagram,
      social_tiktok: tenant.social_tiktok,
    }).eq('id', tenant.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function uploadQr(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `qr-${tenant.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('tenant-assets').upload(path, file, { upsert: true });
    if (!uploadError) {
      const { data: pub } = supabase.storage.from('tenant-assets').getPublicUrl(path);
      await supabase.from('tenants').update({ duitnow_qr_url: pub.publicUrl }).eq('id', tenant.id);
      load();
    }
    setUploading(false);
  }

  async function removeQr() {
    if (!tenant) return;
    await supabase.from('tenants').update({ duitnow_qr_url: null }).eq('id', tenant.id);
    load();
  }

  if (!tenant) return <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Settings</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Brand, contact info, and payment QR.</p>

      <div className="rounded-2xl p-6 mb-6 space-y-4" style={{ background: 'white', border: '1px solid var(--line)' }}>
        <h2 className="font-bold text-sm" style={{ color: 'var(--ink)' }}>Business info</h2>
        <Field label="Business name" value={tenant.business_name} onChange={(v) => setTenant({ ...tenant, business_name: v })} />
        <Field label="Tagline" value={tenant.tagline || ''} onChange={(v) => setTenant({ ...tenant, tagline: v })} />
        <Field label="WhatsApp number" value={tenant.whatsapp_number || ''} onChange={(v) => setTenant({ ...tenant, whatsapp_number: v })} placeholder="60123456789" />
        <Field label="Address" value={tenant.address || ''} onChange={(v) => setTenant({ ...tenant, address: v })} />
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ink-2)' }}>Brand colour</label>
          <input type="color" value={tenant.brand_color} onChange={(e) => setTenant({ ...tenant, brand_color: e.target.value })} className="w-16 h-10 rounded-lg" />
        </div>
      </div>

      <div className="rounded-2xl p-6 mb-6 space-y-4" style={{ background: 'white', border: '1px solid var(--line)' }}>
        <h2 className="font-bold text-sm" style={{ color: 'var(--ink)' }}>Social links</h2>
        <Field label="Facebook" value={tenant.social_facebook || ''} onChange={(v) => setTenant({ ...tenant, social_facebook: v })} />
        <Field label="Instagram" value={tenant.social_instagram || ''} onChange={(v) => setTenant({ ...tenant, social_instagram: v })} />
        <Field label="TikTok" value={tenant.social_tiktok || ''} onChange={(v) => setTenant({ ...tenant, social_tiktok: v })} />
      </div>

      <div className="rounded-2xl p-6 mb-6" style={{ background: 'white', border: '1px solid var(--line)' }}>
        <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--ink)' }}>DuitNow QR (direct bank payment, no fees)</h2>
        {tenant.duitnow_qr_url ? (
          <div className="flex items-center gap-4">
            <img src={tenant.duitnow_qr_url} alt="DuitNow QR" className="w-24 h-24 rounded-xl object-cover" style={{ border: '1px solid var(--line)' }} />
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: 'var(--bg-soft)', color: 'var(--ink)' }}>Change QR</button>
              <button onClick={removeQr} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ color: 'var(--red)' }}>Remove</button>
            </div>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2.5 rounded-xl text-xs font-bold" style={{ background: 'var(--ink)', color: 'white' }}>
            {uploading ? 'Uploading…' : 'Upload DuitNow QR'}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadQr} />
        <p className="text-[11px] mt-3" style={{ color: 'var(--muted)' }}>Get this QR from your banking app (Settings → DuitNow QR → Download/Screenshot).</p>
      </div>

      <button onClick={save} disabled={saving} className="px-6 py-3 rounded-xl text-sm font-bold" style={{ background: 'var(--ink)', color: 'white', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ink-2)' }}>{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
        style={{ border: '1px solid var(--line)' }}
      />
    </div>
  );
}

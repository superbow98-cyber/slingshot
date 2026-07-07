'use client';

import { useState, useMemo } from 'react';
import { type Tenant } from '@/lib/tenant';
import { createClient } from '@/lib/supabase/client';

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  emoji: string | null;
  photo_url: string | null;
  category: string | null;
  metadata: Record<string, any>;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
};

interface Props {
  tenant: Tenant;
  items: Item[];
  categories: Category[];
}

type CartItem = { item: Item; qty: number };
type Screen = 'menu' | 'checkout' | 'success';

export function RestoranTemplate({ tenant, items, categories }: Props) {
  const [activeCat, setActiveCat] = useState<string>('all');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [screen, setScreen] = useState<Screen>('menu');

  const [form, setForm] = useState({ name: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderRef, setOrderRef] = useState('');

  const brandColor = tenant.brand_color || '#cb1212';

  const filteredItems = useMemo(() => {
    if (activeCat === 'all') return items;
    return items.filter(i => i.category === activeCat);
  }, [items, activeCat]);

  const cartTotal = useMemo(() => {
    let total = 0;
    cart.forEach(ci => total += ci.item.price * ci.qty);
    return total;
  }, [cart]);

  const cartCount = useMemo(() => {
    let count = 0;
    cart.forEach(ci => count += ci.qty);
    return count;
  }, [cart]);

  const cartItems = useMemo(() => Array.from(cart.values()), [cart]);

  function addToCart(item: Item) {
    const newCart = new Map(cart);
    const existing = newCart.get(item.id);
    newCart.set(item.id, { item, qty: existing ? existing.qty + 1 : 1 });
    setCart(newCart);
  }

  function removeFromCart(itemId: string) {
    const newCart = new Map(cart);
    const existing = newCart.get(itemId);
    if (existing && existing.qty > 1) {
      newCart.set(itemId, { item: existing.item, qty: existing.qty - 1 });
    } else {
      newCart.delete(itemId);
    }
    setCart(newCart);
  }

  function getQty(itemId: string) {
    return cart.get(itemId)?.qty || 0;
  }

  async function handleCheckout() {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    setSubmitError('');

    const supabase = createClient();
    const today = new Date();
    const orderNumber = 'A' + Math.floor(Math.random() * 100 + 10);
    const ref = `${tenant.slug.toUpperCase().slice(0, 2)}-${orderNumber}-${today.getDate().toString().padStart(2, '0')}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getFullYear().toString().slice(2)}`;

    const orderItems = cartItems.map(ci => ({
      id: ci.item.id,
      name: ci.item.name,
      price: ci.item.price,
      quantity: ci.qty,
      emoji: ci.item.emoji,
    }));

    const { error } = await supabase.from('orders').insert({
      tenant_id: tenant.id,
      order_number: orderNumber,
      reference: ref,
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      notes: form.notes.trim() || null,
      items: orderItems,
      subtotal: cartTotal,
      total: cartTotal,
      status: 'pending',
      fulfillment_status: 'pending',
      payment_method: tenant.duitnow_qr_url ? 'duitnow' : 'cash',
      payment_status: 'unpaid',
    });

    setSubmitting(false);

    if (error) {
      setSubmitError('Ralat semasa hantar pesanan. Cuba lagi.');
      return;
    }

    setOrderRef(ref);
    setCart(new Map());
    setForm({ name: '', phone: '', notes: '' });
    setScreen('success');
  }

  // ── Success screen ──
  if (screen === 'success') return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-sans, sans-serif)' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Pesanan Diterima!</h1>
      <p style={{ margin: '10px 0 4px', fontSize: 13, color: '#888' }}>No. rujukan</p>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: brandColor, letterSpacing: 2 }}>{orderRef}</p>
      {tenant.duitnow_qr_url && (
        <p style={{ margin: '14px 0 0', fontSize: 13, color: '#e67e22', fontWeight: 600 }}>
          ⚠️ Sila tunjuk bukti bayaran DuitNow kepada kakitangan
        </p>
      )}
      <p style={{ margin: '10px 0 0', fontSize: 13, color: '#888', maxWidth: 260 }}>
        {tenant.business_name} akan sediakan pesanan anda. Terima kasih!
      </p>
      <button
        onClick={() => setScreen('menu')}
        style={{ marginTop: 28, background: brandColor, border: 'none', borderRadius: 14, padding: '13px 32px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        Balik ke Menu
      </button>
    </div>
  );

  // ── Checkout screen ──
  if (screen === 'checkout') return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', fontFamily: 'var(--font-sans, sans-serif)', paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #e8e4de', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
        <button onClick={() => setScreen('menu')} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', padding: 0, color: '#111', lineHeight: 1 }}>←</button>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Checkout</h1>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '16px' }}>
        {/* Order summary */}
        <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Pesanan Anda</p>
          {cartItems.map(ci => (
            <div key={ci.item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f0ece4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => removeFromCart(ci.item.id)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e8e4de', background: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, minWidth: 14, textAlign: 'center' }}>{ci.qty}</span>
                  <button onClick={() => addToCart(ci.item)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: brandColor, color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <span style={{ fontSize: 13 }}>{ci.item.emoji} {ci.item.name}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: brandColor }}>RM {(ci.item.price * ci.qty).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Jumlah</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: brandColor }}>RM {cartTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Customer details */}
        <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Maklumat Anda</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CField label="Nama *">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama anda" style={inputSt} />
            </CField>
            <CField label="No. Telefon *">
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01X-XXXXXXX" style={inputSt} />
            </CField>
            <CField label="Nota (opsional)">
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Cth: Kurang pedas, tanpa bawang..." rows={3} style={{ ...inputSt, resize: 'none' }} />
            </CField>
          </div>
        </div>

        {/* DuitNow QR */}
        {tenant.duitnow_qr_url && (
          <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: 16, padding: '14px 16px', marginBottom: 16, textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Bayaran DuitNow</p>
            <img src={tenant.duitnow_qr_url} alt="DuitNow QR" style={{ width: 200, height: 200, objectFit: 'contain', borderRadius: 8 }} />
            <p style={{ margin: '10px 0 0', fontSize: 12, color: '#888' }}>Scan QR · Tunjuk bukti bayaran kepada kakitangan</p>
          </div>
        )}

        {submitError && (
          <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{submitError}</p>
        )}

        <button
          onClick={handleCheckout}
          disabled={submitting || !form.name.trim() || !form.phone.trim()}
          style={{ width: '100%', background: !form.name.trim() || !form.phone.trim() ? '#d0ccc6' : brandColor, border: 'none', borderRadius: 16, padding: '16px 0', color: '#fff', fontSize: 15, fontWeight: 700, cursor: !form.name.trim() || !form.phone.trim() ? 'not-allowed' : 'pointer' }}>
          {submitting ? 'Menghantar...' : `Hantar Pesanan · RM ${cartTotal.toFixed(2)}`}
        </button>
      </div>
    </div>
  );

  // ── Menu screen ──
  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', fontFamily: 'var(--font-sans, sans-serif)', paddingBottom: cartCount > 0 ? 96 : 32 }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e4de', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {tenant.brand_logo_url ? (
          <img src={tenant.brand_logo_url} alt={tenant.business_name} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 10, background: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0, textTransform: 'uppercase' }}>
            {tenant.brand_letter || tenant.business_name.charAt(0)}
          </div>
        )}
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{tenant.business_name}</p>
          {tenant.tagline && <p style={{ margin: '1px 0 0', fontSize: 12, color: '#888' }}>{tenant.tagline}</p>}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', overflowX: 'auto', background: '#fff', borderBottom: '1px solid #e8e4de' }}>
        <CatTab label={`Semua (${items.length})`} active={activeCat === 'all'} color={brandColor} onClick={() => setActiveCat('all')} />
        {categories.map(cat => (
          <CatTab key={cat.id} label={`${cat.emoji || ''} ${cat.name}`} active={activeCat === cat.slug} color={brandColor} onClick={() => setActiveCat(cat.slug)} />
        ))}
      </div>

      {/* Items */}
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '12px 16px' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
            <p style={{ margin: 0, fontSize: 14 }}>Tiada item dalam kategori ini</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const qty = getQty(item.id);
            return (
              <div key={item.id} style={{ background: '#fff', borderRadius: 16, padding: 12, display: 'flex', gap: 12, marginBottom: 10, boxShadow: '0 1px 4px #0000000a' }}>
                <div style={{ width: 76, height: 76, borderRadius: 12, background: '#f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0, overflow: 'hidden' }}>
                  {item.photo_url
                    ? <img src={item.photo_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (item.emoji || '🍽️')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{item.name}</p>
                  {item.description && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#888', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>RM {item.price.toFixed(2)}</span>
                    {qty === 0 ? (
                      <button onClick={() => addToCart(item)}
                        style={{ padding: '6px 16px', borderRadius: 20, border: 'none', background: brandColor, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Tambah
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => removeFromCart(item.id)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e8e4de', background: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                        <button onClick={() => addToCart(item)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: brandColor, color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky cart bar */}
      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: 16, left: 16, right: 16, maxWidth: 508, margin: '0 auto', zIndex: 50 }}>
          <button
            onClick={() => setScreen('checkout')}
            style={{ width: '100%', background: brandColor, border: 'none', borderRadius: 16, padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: `0 4px 20px ${brandColor}55` }}>
            <span style={{ background: '#ffffff33', borderRadius: 8, padding: '2px 10px', fontSize: 13, fontWeight: 700, color: '#fff' }}>{cartCount}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Lihat Pesanan</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>RM {cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function CatTab({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: active ? 'none' : '1px solid #e8e4de', background: active ? color : '#fff', color: active ? '#fff' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {label}
    </button>
  );
}

function CField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputSt: React.CSSProperties = {
  width: '100%', background: '#fafaf8', border: '1px solid #e8e4de', borderRadius: 10,
  padding: '10px 12px', color: '#111', fontSize: 14, outline: 'none', boxSizing: 'border-box',
};

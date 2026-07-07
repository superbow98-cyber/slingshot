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

export function RestoranTemplate({ tenant, items, categories }: Props) {
  const [activeCat, setActiveCat] = useState<string>('all');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [screen, setScreen] = useState<'menu' | 'cart' | 'pickup' | 'payment' | 'success' | 'track'>('menu');

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

  async function placeOrder() {
    const supabase = createClient();
    const orderNumber = 'A' + Math.floor(Math.random() * 100 + 50);
    const today = new Date();
    const ref = `${tenant.slug.toUpperCase().slice(0,2)}-${orderNumber}-${today.getDate().toString().padStart(2,'0')}${(today.getMonth()+1).toString().padStart(2,'0')}${today.getFullYear().toString().slice(2)}`;
    const itemsArray = Array.from(cart.values()).map(ci => ({
      qty: ci.qty,
      name: ci.item.name,
      price: ci.item.price,
    }));
    const { error } = await supabase.from('orders').insert({
      tenant_id: tenant.id,
      order_number: orderNumber,
      reference: ref,
      customer_name: 'You',
      customer_phone: '011-XXX XXXX',
      items: itemsArray,
      subtotal: cartTotal,
      total: cartTotal,
      payment_method: 'duitnow',
      payment_status: 'pending',
      fulfillment_status: 'new',
    });
    if (!error) {
      setScreen('success');
      setCart(new Map());
    }
  }

  return (
    <div className="min-h-screen" style={{ background: tenant.brand_color || '#fffaf0' }}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3" style={{ borderColor: 'var(--line)' }}>
        {tenant.brand_logo_url ? (
          <img src={tenant.brand_logo_url} alt={tenant.business_name} className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center serif text-xl text-white"
               style={{ background: tenant.brand_color || '#cb1212' }}>
            {tenant.brand_letter}
          </div>
        )}
        <div className="flex-1">
          <div className="font-bold text-sm">{tenant.business_name}</div>
          <div className="text-xs text-gray-500">{tenant.tagline}</div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeCat === 'all' ? 'bg-black text-white' : 'bg-white border'}`}
          style={{ borderColor: 'var(--line)' }}
        >
          All <span className="opacity-60">{items.length}</span>
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeCat === cat.slug ? 'bg-black text-white' : 'bg-white border'}`}
            style={{ borderColor: 'var(--line)' }}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Menu items grid */}
      <div className="px-4 pb-32">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-3 mb-3 shadow-sm">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl flex-shrink-0">
              {item.photo_url ? (
                <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span>{item.emoji || '🍽'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{item.name}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</div>
              <div className="flex justify-between items-center mt-2">
                <div className="serif text-xl">RM {item.price.toFixed(2)}</div>
                <button
                  onClick={() => addToCart(item)}
                  className="px-4 py-1.5 rounded-full text-white text-xs font-bold"
                  style={{ background: tenant.brand_color || '#cb1212' }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
          <button
            onClick={() => setScreen('cart')}
            className="w-full rounded-2xl py-4 px-5 flex justify-between items-center text-white shadow-2xl"
            style={{ background: tenant.brand_color || '#cb1212' }}
          >
            <span className="font-bold">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} · RM {cartTotal.toFixed(2)}
            </span>
            <span className="font-bold">View cart →</span>
          </button>
        </div>
      )}

      {/* TODO: Add cart, pickup, payment, success, track screens */}
      {/* These will follow same pattern as the HTML preview */}
    </div>
  );
}

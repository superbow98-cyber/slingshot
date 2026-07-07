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
};

type Category = { id: string; slug: string; name: string; emoji: string | null };

interface Props {
  tenant: Tenant;
  items: Item[];
  categories: Category[];
}

// Niche-specific copy
const nicheCopy: Record<string, { heroTitle: string; heroSub: string; cta: string; orderType: string }> = {
  klinik: { heroTitle: 'Book Your Appointment', heroSub: 'Trusted healthcare · panel accepted', cta: 'Book slot', orderType: 'Appointment' },
  dental: { heroTitle: 'Book Dental Appointment', heroSub: 'Latest equipment · gentle approach', cta: 'Book slot', orderType: 'Appointment' },
  aesthetic: { heroTitle: 'Premium Aesthetic Clinic', heroSub: 'KKM-registered · discreet booking', cta: 'Reserve', orderType: 'Reservation' },
  auto: { heroTitle: 'Drive Your Dream Car', heroSub: 'Authorized dealer · book test drive', cta: 'Test drive', orderType: 'Test drive' },
  pasarmalam: { heroTitle: 'Pasar Malam Gerai', heroSub: 'Order awal · skip queue', cta: 'Order', orderType: 'Order' },
  event: { heroTitle: 'Plan Your Majlis', heroSub: 'Pelamin · Makeup · Foto · Catering', cta: 'Get quote', orderType: 'Quote' },
  catering: { heroTitle: 'Tempah Makanan Kenduri', heroSub: 'Sedap macam buatan sendiri', cta: 'Tempah', orderType: 'Tempahan' },
  bengkel: { heroTitle: 'Service Kereta Online', heroSub: 'Mekanik certified · book slot', cta: 'Book service', orderType: 'Service' },
  dfy: { heroTitle: 'We Build Your Site', heroSub: 'RM 499 one-time · trusted by 200+', cta: 'Book call', orderType: 'Consultation' },
};

export function GenericNicheTemplate({ tenant, items, categories }: Props) {
  const [activeCat, setActiveCat] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  const copy = nicheCopy[tenant.niche] || { heroTitle: tenant.business_name, heroSub: '', cta: 'Book', orderType: 'Booking' };

  const filteredItems = useMemo(() => {
    if (activeCat === 'all') return items;
    return items.filter(i => i.category === activeCat);
  }, [items, activeCat]);

  async function confirmBooking() {
    if (!selectedItem) return;
    const supabase = createClient();
    const orderNumber = 'A' + Math.floor(Math.random() * 100 + 50);
    await supabase.from('orders').insert({
      tenant_id: tenant.id,
      order_number: orderNumber,
      reference: `${tenant.slug.toUpperCase().slice(0,2)}-${orderNumber}`,
      customer_name: 'You',
      customer_phone: '011-XXX XXXX',
      items: [{ qty: 1, name: selectedItem.name, price: selectedItem.price }],
      total: selectedItem.price,
      payment_method: 'pending',
      payment_status: 'pending',
      fulfillment_status: 'new',
    });
    setSelectedItem(null);
    alert(`✓ ${copy.orderType} confirmed for ${selectedItem.name}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Hero */}
      <div className="rounded-2xl p-8 text-white relative overflow-hidden mb-6"
           style={{ background: `linear-gradient(135deg, ${tenant.brand_color || '#1d1d1f'}, #0a0a0c)` }}>
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
             style={{ background: '#c89968', color: '#1d1d1f' }}>
          ★ {tenant.business_name}
        </div>
        <h1 className="serif text-4xl mb-2">{copy.heroTitle}</h1>
        <p className="text-sm opacity-85">{copy.heroSub}</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
        <button onClick={() => setActiveCat('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeCat === 'all' ? 'text-white' : 'bg-white border'}`}
                style={{ background: activeCat === 'all' ? tenant.brand_color : 'white', borderColor: 'var(--line)' }}>
          All
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeCat === cat.slug ? 'text-white' : 'bg-white border'}`}
                  style={{ background: activeCat === cat.slug ? tenant.brand_color : 'white', borderColor: 'var(--line)' }}>
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer"
               onClick={() => setSelectedItem(item)}>
            <div className="h-32 flex items-center justify-center text-5xl"
                 style={{ background: `linear-gradient(135deg, ${tenant.brand_color}, #1d1d1f)` }}>
              {item.photo_url ? <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" /> : <span>{item.emoji}</span>}
            </div>
            <div className="p-3">
              <div className="font-bold text-sm">{item.name}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</div>
              <div className="flex justify-between items-center mt-2">
                <div className="serif text-xl">RM {item.price.toFixed(2)}</div>
                <button className="px-3 py-1.5 rounded-lg text-white text-xs font-bold"
                        style={{ background: tenant.brand_color }}>
                  {copy.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
             onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="serif text-2xl mb-2">{selectedItem.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{selectedItem.description}</p>
            <div className="serif text-3xl mb-4">RM {selectedItem.price.toFixed(2)}</div>
            <button onClick={confirmBooking}
                    className="w-full py-3 rounded-xl text-white font-bold"
                    style={{ background: tenant.brand_color }}>
              Confirm {copy.orderType} →
            </button>
            <button onClick={() => setSelectedItem(null)}
                    className="w-full py-3 rounded-xl bg-gray-100 font-bold mt-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

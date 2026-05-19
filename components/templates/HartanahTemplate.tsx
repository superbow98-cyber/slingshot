'use client';

import { useState, useMemo } from 'react';
import { type Tenant } from '@/lib/tenant';

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

export function HartanahTemplate({ tenant, items, categories }: Props) {
  const [activeCat, setActiveCat] = useState<string>('all');
  const filteredItems = useMemo(() => {
    if (activeCat === 'all') return items;
    return items.filter(i => i.category === activeCat);
  }, [items, activeCat]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Hero search */}
      <div className="rounded-2xl p-8 text-white relative overflow-hidden mb-6"
           style={{ background: `linear-gradient(135deg, ${tenant.brand_color || '#1a3a52'}, #0e2538)` }}>
        <h1 className="serif text-4xl mb-2">Find your dream home</h1>
        <p className="text-sm opacity-80 mb-4">200+ verified listings · REN licensed</p>
        <div className="bg-white rounded-xl p-2 flex gap-2">
          <select className="flex-1 px-3 py-2 text-xs text-gray-900 bg-transparent">
            <option>Anywhere</option>
          </select>
          <select className="flex-1 px-3 py-2 text-xs text-gray-900 bg-transparent">
            <option>All types</option>
          </select>
          <button className="px-5 py-2 rounded-lg font-bold text-xs"
                  style={{ background: '#c89968', color: '#0e2538' }}>
            Search
          </button>
        </div>
      </div>

      {/* Property grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="h-40 flex items-center justify-center text-5xl"
                 style={{ background: `linear-gradient(135deg, ${tenant.brand_color}, #0e2538)` }}>
              {item.photo_url ? (
                <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span>{item.emoji || '🏘'}</span>
              )}
            </div>
            <div className="p-3">
              <div className="serif text-xl">RM {item.price.toLocaleString()}</div>
              <div className="font-bold text-sm mt-1">{item.name}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
              <button className="w-full mt-2 py-2 rounded-lg text-white text-xs font-bold"
                      style={{ background: tenant.brand_color || '#1a3a52' }}>
                Book viewing
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

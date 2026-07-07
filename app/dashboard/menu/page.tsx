'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type Item = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  price: number;
  emoji: string | null;
  category: string | null;
  is_available: boolean;
  sort_order: number;
};

type Category = { id: string; tenant_id: string; slug: string; name: string; emoji: string | null; is_visible: boolean };

export default function MenuPage() {
  const supabase = createClient();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', emoji: '', category: '' });

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: tenant } = await supabase.from('tenants').select('id').eq('user_id', user.id).single();
    if (!tenant) return;
    setTenantId(tenant.id);
    const [{ data: itemsData }, { data: catsData }] = await Promise.all([
      supabase.from('items').select('*').eq('tenant_id', tenant.id).order('sort_order'),
      supabase.from('categories').select('*').eq('tenant_id', tenant.id).order('sort_order'),
    ]);
    setItems(itemsData || []);
    setCategories(catsData || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !form.name || !form.price) return;
    await supabase.from('items').insert({
      tenant_id: tenantId,
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      emoji: form.emoji || null,
      category: form.category || null,
      is_available: true,
    });
    setForm({ name: '', description: '', price: '', emoji: '', category: '' });
    setShowForm(false);
    load();
  }

  async function toggleAvailable(item: Item) {
    await supabase.from('items').update({ is_available: !item.is_available }).eq('id', item.id);
    load();
  }

  async function removeItem(item: Item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await supabase.from('items').delete().eq('id', item.id);
    load();
  }

  async function addCategory() {
    const name = prompt('Category name (e.g. Mains, Drinks):');
    if (!name || !tenantId) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await supabase.from('categories').insert({ tenant_id: tenantId, slug, name, is_visible: true });
    load();
  }

  if (loading) return <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Menu / Items</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>What customers see and can order.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addCategory} className="px-4 py-2.5 rounded-xl text-sm font-bold" style={{ background: 'var(--bg-soft)', color: 'var(--ink)' }}>+ Category</button>
          <button onClick={() => setShowForm((v) => !v)} className="px-4 py-2.5 rounded-xl text-sm font-bold" style={{ background: 'var(--ink)', color: 'white' }}>+ Add item</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={addItem} className="rounded-2xl p-5 mb-6 grid md:grid-cols-5 gap-3" style={{ background: 'white', border: '1px solid var(--line)' }}>
          <input placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="rounded-lg px-3 py-2 text-sm" style={{ border: '1px solid var(--line)' }} />
          <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg px-3 py-2 text-sm md:col-span-2" style={{ border: '1px solid var(--line)' }} />
          <input placeholder="Price (RM)" required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-lg px-3 py-2 text-sm" style={{ border: '1px solid var(--line)' }} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg px-3 py-2 text-sm" style={{ border: '1px solid var(--line)' }}>
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg px-3 py-2 text-sm md:col-span-4" style={{ border: '1px solid var(--line)' }} />
          <button type="submit" className="rounded-lg px-3 py-2 text-sm font-bold" style={{ background: 'var(--ink)', color: 'white' }}>Save</button>
        </form>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--line)' }}>
        {items.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: 'var(--muted)' }}>No items yet. Click "+ Add item" to create your first one.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="text-xl">{item.emoji || '🍽️'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{item.name}</div>
                  {item.description && <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>{item.description}</div>}
                </div>
                <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>RM {Number(item.price).toFixed(2)}</div>
                <button
                  onClick={() => toggleAvailable(item)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: item.is_available ? '#e8f7ec' : '#f5f5f5', color: item.is_available ? 'var(--green)' : 'var(--muted)' }}
                >
                  {item.is_available ? 'Available' : 'Hidden'}
                </button>
                <button onClick={() => removeItem(item)} className="text-xs font-semibold" style={{ color: 'var(--red)' }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

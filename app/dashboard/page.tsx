import { getCurrentTenant } from '@/lib/tenant';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const admin = createAdminClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ count: ordersToday }, { data: recentOrders }, { count: itemCount }] = await Promise.all([
    admin.from('orders').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id).gte('created_at', todayStart.toISOString()),
    admin.from('orders').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false }).limit(5),
    admin.from('items').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
  ]);

  const revenueToday = (recentOrders || [])
    .filter((o: any) => new Date(o.created_at) >= todayStart)
    .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Welcome back, {tenant.business_name}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Here's what's happening with your business today.</p>

      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Orders today" value={String(ordersToday || 0)} />
        <StatCard label="Revenue today" value={`RM ${revenueToday.toFixed(2)}`} />
        <StatCard label="Menu items" value={String(itemCount || 0)} />
        <StatCard label="Plan" value={tenant.status === 'trial' ? 'Free trial' : 'Active'} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <QuickLink href="/dashboard/menu" icon="🗂️" title="Manage menu" body="Add items, categories, and photos" />
        <QuickLink href={`/t/${tenant.slug}`} icon="👀" title="View your live site" body="See exactly what customers see" external />
        <QuickLink href="/dashboard/kitchen" icon="👨‍🍳" title="Kitchen display" body="Live incoming order queue" />
        <QuickLink href="/dashboard/settings" icon="⚙️" title="Brand + DuitNow QR" body="Colours, logo, payment QR" />
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--line)' }}>
        <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--ink)' }}>Recent orders</h2>
        {(!recentOrders || recentOrders.length === 0) ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No orders yet — share your link <b>{tenant.slug}.slingshot.my</b> to get your first customer.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {recentOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-semibold" style={{ color: 'var(--ink)' }}>#{o.order_number} · {o.customer_name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{o.fulfillment_status}</div>
                </div>
                <div className="font-bold" style={{ color: 'var(--ink)' }}>RM {Number(o.total).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--line)' }}>
      <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="serif text-2xl" style={{ color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

function QuickLink({ href, icon, title, body, external }: { href: string; icon: string; title: string; body: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: 'white', border: '1px solid var(--line)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--bg-soft)' }}>{icon}</div>
      <div>
        <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{title}</div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>{body}</div>
      </div>
    </a>
  );
}

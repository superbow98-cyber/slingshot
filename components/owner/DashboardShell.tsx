'use client';

import { useRouter } from 'next/navigation';
import { type Tenant } from '@/lib/tenant';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/menu', label: 'Menu / Items', icon: '🗂️' },
  { href: '/dashboard/orders', label: 'Orders', icon: '🧾' },
  { href: '/dashboard/kitchen', label: 'Kitchen Display', icon: '👨‍🍳' },
  { href: '/dashboard/counter', label: 'Counter Display', icon: '🖥️' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
];

function trialDaysLeft(trialEndsAt: string) {
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function DashboardShell({ tenant, children }: { tenant: Tenant; children: React.ReactNode }) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-soft)' }}>
      <aside className="w-60 shrink-0 hidden md:flex flex-col" style={{ background: 'white', borderRight: '1px solid var(--line)' }}>
        <div className="p-5">
          <a href="/" className="serif text-xl" style={{ color: 'var(--ink)' }}>Slingshot</a>
        </div>
        <div className="px-5 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold uppercase text-sm" style={{ background: tenant.brand_color }}>
            {tenant.brand_letter}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: 'var(--ink)' }}>{tenant.business_name}</div>
            <div className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>{tenant.slug}.slingshot.my</div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{ color: 'var(--ink-2)' }}
            >
              <span>{item.icon}</span> {item.label}
            </a>
          ))}
        </nav>
        <div className="p-3">
          <button onClick={logout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium" style={{ color: 'var(--muted)' }}>
            ↩ Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {tenant.status === 'trial' && (
          <div className="px-6 py-2.5 text-xs font-semibold text-center" style={{ background: 'var(--ink)', color: 'white' }}>
            {trialDaysLeft(tenant.trial_ends_at)} days left in your free trial — <a href="/dashboard/billing" className="underline">upgrade now</a>
          </div>
        )}
        {tenant.status === 'suspended' && (
          <div className="px-6 py-2.5 text-xs font-semibold text-center" style={{ background: 'var(--red)', color: 'white' }}>
            Your subscription is inactive — <a href="/dashboard/billing" className="underline">reactivate billing</a> to keep your site live.
          </div>
        )}
        <div className="p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const tabs = [
  { href: '/dashboard', label: 'Overview', icon: OverviewIcon },
  { href: '/dashboard/menu', label: 'Menu', icon: MenuIcon },
  { href: '/dashboard/orders', label: 'Orders', icon: OrdersIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [tenant, setTenant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (!tenantData) { router.replace('/onboarding'); return }

      setTenant(tenantData)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0e0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #c45c6a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0e0d', color: '#f0ece4', fontFamily: "'DM Sans', sans-serif", paddingBottom: 72 }}>
      {/* Top bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0f0e0d', borderBottom: '1px solid #1e1c19', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: tenant?.brand_color || '#c45c6a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
            {tenant?.brand_letter || '?'}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>{tenant?.business_name}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#6b6560' }}>{tenant?.slug}.slingshot.my</p>
          </div>
        </div>
        <a href={`/t/${tenant?.slug}`} target="_blank" rel="noreferrer"
          style={{ fontSize: 11, color: '#c45c6a', textDecoration: 'none', border: '1px solid #c45c6a33', borderRadius: 6, padding: '4px 10px' }}>
          Lihat Kedai ↗
        </a>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f0e0d', borderTop: '1px solid #1e1c19', display: 'flex', zIndex: 50 }}>
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '10px 0 14px', textDecoration: 'none', color: active ? '#c45c6a' : '#4a4540' }}>
              <Icon size={22} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// SVG Icons
function OverviewIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}
function MenuIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" />
    </svg>
  )
}
function OrdersIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
function SettingsIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

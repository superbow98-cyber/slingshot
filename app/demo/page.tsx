import { NICHES } from '@/lib/niches';

// A live, clickable demo tenant for each of the 12 business types.
// Each links to /t/[slug] which renders the real customer-facing template
// against a seeded demo tenant (see supabase/seed-demo.sql).
export default function DemoGalleryPage() {
  return (
    <main className="min-h-screen px-6 py-16" style={{ background: 'var(--bg-soft)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <a href="/" className="serif text-2xl" style={{ color: 'var(--ink)' }}>Slingshot</a>
        </div>
        <div className="text-center mb-14">
          <h1 className="serif text-5xl mb-3" style={{ color: 'var(--ink)' }}>Try it as a customer, right now</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No login needed — click into any business type below and place a test order exactly like your customers would.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {NICHES.map((n) => (
            <a
              key={n.slug}
              href={`/t/${n.demoSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl p-5 flex flex-col items-center text-center gap-2 transition"
              style={{ border: '1px solid var(--line)', background: 'white' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: n.color + '1a' }}>
                {n.emoji}
              </div>
              <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{n.name}</div>
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{n.tagline}</div>
              <span className="text-[11px] font-semibold mt-1" style={{ color: n.color }}>Open demo →</span>
            </a>
          ))}
        </div>

        <div className="text-center mt-14">
          <a href="/signup" className="inline-block px-7 py-3.5 rounded-xl font-bold text-sm" style={{ background: 'var(--ink)', color: 'white' }}>
            Like what you see? Start your free trial →
          </a>
        </div>
      </div>
    </main>
  );
}

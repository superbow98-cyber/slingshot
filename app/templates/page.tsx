import { NICHES } from '@/lib/niches';

export default function TemplatesPage() {
  return (
    <main className="min-h-screen px-6 py-16" style={{ background: 'var(--bg-soft)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <a href="/" className="serif text-2xl" style={{ color: 'var(--ink)' }}>Slingshot</a>
        </div>
        <div className="text-center mb-14">
          <h1 className="serif text-5xl mb-3" style={{ color: 'var(--ink)' }}>12 templates, every Malaysian business</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Each template ships with a customer app, owner dashboard, kitchen display and counter display.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {NICHES.map((n) => (
            <div key={n.slug} className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)', background: 'white' }}>
              <div className="h-24 flex items-center justify-center text-4xl" style={{ background: n.color }}>
                {n.emoji}
              </div>
              <div className="p-5">
                <div className="font-bold text-sm mb-1" style={{ color: 'var(--ink)' }}>{n.name}</div>
                <div className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{n.tagline}</div>
                <div className="text-[11px] mb-4" style={{ color: n.color }}>★ {n.feature}</div>
                <div className="flex gap-2">
                  <a
                    href={`/t/${n.demoSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center rounded-lg py-2 text-xs font-bold"
                    style={{ background: 'var(--bg-soft)', color: 'var(--ink)' }}
                  >
                    Live demo
                  </a>
                  <a
                    href={`/signup?niche=${n.slug}`}
                    className="flex-1 text-center rounded-lg py-2 text-xs font-bold"
                    style={{ background: 'var(--ink)', color: 'white' }}
                  >
                    Use this
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

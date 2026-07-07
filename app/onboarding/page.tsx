'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NICHES } from '@/lib/niches';

const SWATCHES = ['#1d1d1f', '#cb1212', '#2c1810', '#1a3a52', '#0f6b5c', '#6d28d9', '#92400e', '#2a1a2e'];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 30);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [color, setColor] = useState('#1d1d1f');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Read ?niche= from the URL without useSearchParams (avoids a Suspense
  // boundary requirement for what is otherwise a fully client-rendered page).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = params.get('niche');
    if (n) setNiche(n);
  }, []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(businessName));
  }, [businessName, slugTouched]);

  const selectedNiche = useMemo(() => NICHES.find((n) => n.slug === niche), [niche]);
  const brandLetter = businessName.trim().charAt(0).toLowerCase() || 'b';

  async function publish() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          template_id: `template-${niche}`,
          business_name: businessName,
          slug,
          brand_color: color,
          brand_letter: brandLetter,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }
      router.push('/dashboard?welcome=1');
      router.refresh();
    } catch (e) {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12" style={{ background: 'var(--bg-soft)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <a href="/" className="serif text-2xl" style={{ color: 'var(--ink)' }}>Slingshot</a>
        </div>

        <StepDots step={step} />

        <div className="rounded-2xl p-8 mt-8" style={{ background: 'white', border: '1px solid var(--line)' }}>
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>What's your business?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Pick the type closest to what you do.</p>
              <div className="grid grid-cols-3 gap-3">
                {NICHES.map((n) => (
                  <button
                    key={n.slug}
                    onClick={() => setNiche(n.slug)}
                    className="rounded-xl p-4 text-left"
                    style={{
                      border: niche === n.slug ? `2px solid ${n.color}` : '1px solid var(--line)',
                      background: niche === n.slug ? n.color + '0d' : 'white',
                    }}
                  >
                    <div className="text-xl mb-1">{n.emoji}</div>
                    <div className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{n.name}</div>
                  </button>
                ))}
              </div>
              <NavButtons onNext={() => setStep(2)} nextDisabled={!niche} />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Name your business</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>This becomes your web address.</p>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ink-2)' }}>Business name</label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Brew Pickup"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-4"
                style={{ border: '1px solid var(--line)' }}
              />
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--ink-2)' }}>Your web address</label>
              <div className="flex items-center rounded-xl overflow-hidden mb-1" style={{ border: '1px solid var(--line)' }}>
                <input
                  value={slug}
                  onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                  className="flex-1 px-4 py-3 text-sm outline-none"
                />
                <span className="px-4 py-3 text-sm" style={{ background: 'var(--bg-soft)', color: 'var(--muted)' }}>.slingshot.my</span>
              </div>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>Lowercase letters and numbers only, 3–30 characters.</p>
              <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={businessName.trim().length < 2 || slug.length < 3} />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Pick your brand colour</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Used across your storefront and dashboard.</p>
              <div className="flex flex-wrap gap-3 mb-6">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-10 h-10 rounded-full"
                    style={{ background: c, outline: color === c ? '3px solid var(--ink)' : 'none', outlineOffset: 2 }}
                  />
                ))}
                <label className="w-10 h-10 rounded-full flex items-center justify-center text-xs cursor-pointer" style={{ border: '1px dashed var(--line)' }}>
                  ✎
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="hidden" />
                </label>
              </div>
              <div className="rounded-xl p-5 flex items-center gap-3" style={{ background: 'var(--bg-soft)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold uppercase" style={{ background: color }}>
                  {brandLetter}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{businessName || 'Your business'}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{slug || 'yourslug'}.slingshot.my</div>
                </div>
              </div>
              <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Ready to publish</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Review, then go live — you can change everything later.</p>
              <div className="rounded-xl divide-y" style={{ border: '1px solid var(--line)' }}>
                <Row label="Business type" value={`${selectedNiche?.emoji} ${selectedNiche?.name}`} />
                <Row label="Name" value={businessName} />
                <Row label="Web address" value={`${slug}.slingshot.my`} />
                <Row label="Brand colour" value={<span className="inline-flex items-center gap-2"><span className="w-4 h-4 rounded-full inline-block" style={{ background: color }} />{color}</span>} />
              </div>
              {error && <p className="text-xs mt-4" style={{ color: 'var(--red)' }}>{error}</p>}
              <NavButtons
                onBack={() => setStep(3)}
                onNext={publish}
                nextLabel={submitting ? 'Publishing…' : 'Publish my site 🚀'}
                nextDisabled={submitting}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="h-1.5 rounded-full transition-all" style={{ width: s === step ? 24 : 8, background: s <= step ? 'var(--ink)' : 'var(--line)' }} />
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span className="font-semibold" style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = 'Continue', nextDisabled }: { onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean }) {
  return (
    <div className="flex justify-between mt-8">
      {onBack ? (
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ color: 'var(--ink)' }}>← Back</button>
      ) : <span />}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
        style={{ background: 'var(--ink)' }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

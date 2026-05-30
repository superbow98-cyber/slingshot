'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5

interface WizardState {
  niche: string
  nicheLabel: string
  templateId: string
  templateLabel: string
  businessName: string
  slug: string
  brandColor: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NICHES = [
  { id: 'cafe',       label: 'Kafe',        desc: 'Kopi, dessert, pickup',    icon: '☕' },
  { id: 'restoran',   label: 'Restoran',    desc: 'F&B, cart, takeaway',      icon: '🍽' },
  { id: 'klinik',     label: 'Klinik',      desc: 'Temujanji & rekod',        icon: '🏥' },
  { id: 'hartanah',   label: 'Hartanah',    desc: 'Listing & viewing',        icon: '🏢' },
  { id: 'auto',       label: 'Auto',        desc: 'Showroom & trade-in',      icon: '🚗' },
  { id: 'bengkel',    label: 'Bengkel',     desc: 'Slot servis',              icon: '🔧' },
  { id: 'dental',     label: 'Dental',      desc: 'Temujanji gigi',           icon: '🦷' },
  { id: 'aesthetic',  label: 'Aesthetic',   desc: 'Klinik kecantikan',        icon: '✨' },
  { id: 'event',      label: 'Event',       desc: 'Pakej majlis',             icon: '🎉' },
  { id: 'catering',   label: 'Catering',    desc: 'Tempahan kenduri',         icon: '🍲' },
  { id: 'pasarmalam', label: 'Pasar Malam', desc: 'Gerai & jualan',           icon: '🛒' },
  { id: 'dfy',        label: 'DFY',         desc: 'Discovery call',           icon: '🎧' },
]

const TEMPLATES = [
  {
    id: 'template-01-klasik',
    label: 'Klasik',
    desc: 'Bersih & minimalis',
    bg: '#f5f0e8',
    accent: '#c45c6a',
    textColor: '#1d1a16',
  },
  {
    id: 'template-02-modern',
    label: 'Modern',
    desc: 'Bold & kontemporari',
    bg: '#1d1a16',
    accent: '#c89440',
    textColor: '#f5f0e8',
  },
  {
    id: 'template-03-warm',
    label: 'Warm',
    desc: 'Mesra & organik',
    bg: '#fdf6ec',
    accent: '#c89440',
    textColor: '#1d1a16',
  },
]

const BRAND_SWATCHES = [
  '#2c1810', // espresso brown
  '#c45c6a', // rose
  '#c89440', // gold
  '#1a3a52', // navy
  '#1d4a2f', // forest green
  '#6b3fa0', // purple
  '#b5320d', // burnt orange
  '#374151', // slate
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30)
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {[1, 2, 3, 4, 5].map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all duration-300 ${
              s < step
                ? 'bg-[#1d1a16] text-[#f5f0e8]'
                : s === step
                ? 'bg-[#c45c6a] text-white'
                : 'bg-white/10 text-white/30 border border-white/10'
            }`}
          >
            {s < step ? '✓' : s}
          </div>
          {i < 4 && (
            <div
              className={`flex-1 h-px mx-1 transition-all duration-300 ${
                s < step ? 'bg-[#1d1a16]' : 'bg-white/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1: Niche ───────────────────────────────────────────────────────────

function StepNiche({
  value,
  onChange,
  onNext,
}: {
  value: string
  onChange: (id: string, label: string) => void
  onNext: () => void
}) {
  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Langkah 1 dari 5</p>
      <h1 className="text-2xl font-medium text-white mb-1 leading-snug">
        Bisnes anda dalam kategori apa?
      </h1>
      <p className="text-sm text-white/50 mb-7 leading-relaxed">
        Pilih niche yang paling sesuai — template akan dioptimumkan untuk anda.
      </p>

      <div className="grid grid-cols-3 gap-2.5 mb-8">
        {NICHES.map((n) => (
          <button
            key={n.id}
            onClick={() => onChange(n.id, n.label)}
            className={`text-left p-3.5 rounded-xl border transition-all duration-150 ${
              value === n.id
                ? 'border-[#c45c6a] bg-[#c45c6a]/10'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
            }`}
          >
            <span className="text-xl block mb-1.5">{n.icon}</span>
            <span className="text-sm font-medium text-white block">{n.label}</span>
            <span className="text-xs text-white/40">{n.desc}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-white/8">
        <button
          onClick={onNext}
          disabled={!value}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#c45c6a] text-white hover:opacity-90"
        >
          Seterusnya →
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Template ────────────────────────────────────────────────────────

function StepTemplate({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string
  onChange: (id: string, label: string) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Langkah 2 dari 5</p>
      <h1 className="text-2xl font-medium text-white mb-1 leading-snug">
        Pilih reka bentuk yang anda suka
      </h1>
      <p className="text-sm text-white/50 mb-7 leading-relaxed">
        Semua boleh diubahsuai kemudian. Pilih yang paling dekat dengan visi anda.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id, t.label)}
            className={`text-left rounded-xl overflow-hidden border transition-all duration-150 ${
              value === t.id ? 'border-[#c45c6a]' : 'border-white/10 hover:border-white/25'
            }`}
          >
            {/* Mini preview */}
            <div
              className="h-24 p-3 flex flex-col gap-1.5"
              style={{ backgroundColor: t.bg }}
            >
              <div
                className="h-3 rounded-sm w-3/4"
                style={{ backgroundColor: t.accent }}
              />
              <div className="h-2 rounded-sm w-full opacity-30" style={{ backgroundColor: t.textColor }} />
              <div className="h-2 rounded-sm w-5/6 opacity-20" style={{ backgroundColor: t.textColor }} />
              <div
                className="mt-auto h-5 rounded-md w-1/2 text-[8px] flex items-center justify-center font-medium"
                style={{ backgroundColor: t.accent, color: '#fff' }}
              >
                Order
              </div>
            </div>
            <div className="p-3 bg-white/5">
              <p className="text-sm font-medium text-white">{t.label}</p>
              <p className="text-xs text-white/40">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/8">
        <button onClick={onBack} className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Balik
        </button>
        <button
          onClick={onNext}
          disabled={!value}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#c45c6a] text-white hover:opacity-90"
        >
          Seterusnya →
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Name & Slug ─────────────────────────────────────────────────────

function StepBrand({
  businessName,
  slug,
  onChangeName,
  onChangeSlug,
  onNext,
  onBack,
}: {
  businessName: string
  slug: string
  onChangeName: (v: string) => void
  onChangeSlug: (v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const slugError = slug.length > 0 && slug.length < 3

  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Langkah 3 dari 5</p>
      <h1 className="text-2xl font-medium text-white mb-1 leading-snug">
        Nama dan URL bisnes anda
      </h1>
      <p className="text-sm text-white/50 mb-7 leading-relaxed">
        URL akan jadi alamat laman web anda. Gunakan nama pendek tanpa spasi.
      </p>

      <div className="space-y-5 mb-8">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Nama bisnes</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="cth: Kopi Warisan"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c45c6a] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Alamat URL anda</label>
          <div className="flex items-center border border-white/10 rounded-lg overflow-hidden focus-within:border-[#c45c6a] transition-colors">
            <span className="px-3 py-3 text-xs text-white/30 bg-white/5 border-r border-white/10 whitespace-nowrap">
              slingshot.my/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => onChangeSlug(slugify(e.target.value))}
              placeholder="kopijaya"
              className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder-white/20 focus:outline-none"
            />
          </div>
          {slugError && (
            <p className="text-xs text-[#c45c6a] mt-1.5">URL kena ada sekurang-kurangnya 3 huruf</p>
          )}
          {slug.length >= 3 && (
            <p className="text-xs text-white/30 mt-1.5">
              Laman anda: <span className="text-white/60">{slug}.slingshot.my</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/8">
        <button onClick={onBack} className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Balik
        </button>
        <button
          onClick={onNext}
          disabled={!businessName.trim() || slug.length < 3}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#c45c6a] text-white hover:opacity-90"
        >
          Seterusnya →
        </button>
      </div>
    </div>
  )
}

// ─── Step 4: Brand Color ─────────────────────────────────────────────────────

function StepColor({
  businessName,
  slug,
  color,
  onChange,
  onNext,
  onBack,
}: {
  businessName: string
  slug: string
  color: string
  onChange: (c: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const initial = businessName ? businessName[0].toUpperCase() : 'B'

  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Langkah 4 dari 5</p>
      <h1 className="text-2xl font-medium text-white mb-1 leading-snug">
        Warna brand anda
      </h1>
      <p className="text-sm text-white/50 mb-7 leading-relaxed">
        Warna ini akan dipakai pada logo, butang, dan elemen utama laman web anda.
      </p>

      {/* Swatch picker */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-white/50 mb-3">Pilih warna</label>
        <div className="flex gap-2.5 flex-wrap">
          {BRAND_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => onChange(c)}
              className="w-8 h-8 rounded-full transition-all duration-150 flex-shrink-0"
              style={{
                backgroundColor: c,
                outline: color === c ? `3px solid ${c}` : '3px solid transparent',
                outlineOffset: '2px',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
              }}
              aria-label={c}
            />
          ))}
          {/* Custom colour picker */}
          <label
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center cursor-pointer text-white/50 hover:border-white/40 text-sm overflow-hidden relative"
            title="Pilih warna lain"
          >
            <span>+</span>
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>

      {/* Live preview */}
      <div className="mb-8">
        <label className="block text-xs font-medium text-white/50 mb-3">Pratonton langsung</label>
        <div className="rounded-xl overflow-hidden border border-white/10">
          {/* Fake browser bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-white/8">
            <div className="w-2 h-2 rounded-full bg-white/15" />
            <div className="w-2 h-2 rounded-full bg-white/15" />
            <div className="w-2 h-2 rounded-full bg-white/15" />
            <span className="flex-1 text-center text-[10px] text-white/25">
              {slug || 'slug'}.slingshot.my
            </span>
          </div>
          {/* Mini site */}
          <div className="p-4" style={{ backgroundColor: '#f5f0e8' }}>
            {/* Nav */}
            <div
              className="rounded-lg flex items-center gap-2.5 px-3 py-2 mb-3"
              style={{ backgroundColor: color }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
              >
                {initial}
              </div>
              <span className="text-sm font-medium text-white">
                {businessName || 'Nama Bisnes'}
              </span>
            </div>
            {/* Hero */}
            <div
              className="rounded-lg px-4 py-5 text-center"
              style={{ backgroundColor: color }}
            >
              <p className="text-sm font-semibold text-white mb-1">
                Selamat Datang ke {businessName || 'Bisnes Anda'}
              </p>
              <p className="text-[11px] text-white/70">Tempah · Pesan · Nikmati</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/8">
        <button onClick={onBack} className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Balik
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[#c45c6a] text-white hover:opacity-90 transition-all"
        >
          Seterusnya →
        </button>
      </div>
    </div>
  )
}

// ─── Step 5: Review & Publish ────────────────────────────────────────────────

function StepReview({
  state,
  onBack,
  onPublish,
  publishing,
  error,
}: {
  state: WizardState
  onBack: () => void
  onPublish: () => void
  publishing: boolean
  error: string | null
}) {
  const rows = [
    { label: 'Niche', value: state.nicheLabel },
    { label: 'Template', value: state.templateLabel },
    { label: 'Nama bisnes', value: state.businessName },
    { label: 'URL', value: `${state.slug}.slingshot.my` },
    { label: 'Warna brand', value: state.brandColor, isColor: true },
  ]

  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Langkah 5 dari 5</p>
      <h1 className="text-2xl font-medium text-white mb-1 leading-snug">
        Sedia untuk publish!
      </h1>
      <p className="text-sm text-white/50 mb-7 leading-relaxed">
        Semak maklumat anda sebelum laman web anda dilancarkan.
      </p>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden mb-6">
        {rows.map((row, i) => (
          <div key={row.label}>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-xs text-white/40">{row.label}</span>
              {row.isColor ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: row.value }}
                  />
                  <span className="text-sm text-white font-medium">{row.value}</span>
                </div>
              ) : (
                <span className="text-sm text-white font-medium">{row.value}</span>
              )}
            </div>
            {i < rows.length - 1 && <div className="h-px bg-white/8 mx-4" />}
          </div>
        ))}
      </div>

      <p className="text-xs text-white/30 mb-6 text-center">
        Trial percuma 14 hari bermula selepas publish
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-[#c45c6a]/15 border border-[#c45c6a]/30">
          <p className="text-sm text-[#c45c6a]">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/8">
        <button
          onClick={onBack}
          disabled={publishing}
          className="text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-30"
        >
          ← Balik
        </button>
        <button
          onClick={onPublish}
          disabled={publishing}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[#1d1a16] text-[#f5f0e8] border border-white/10 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {publishing ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Mencipta tenant...
            </>
          ) : (
            '🚀 Publish sekarang'
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Done screen ─────────────────────────────────────────────────────────────

function Done({ slug }: { slug: string }) {
  const liveUrl = `https://${slug}.slingshot.my`

  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 rounded-full bg-[#1d1a16] flex items-center justify-center text-3xl mx-auto mb-5">
        🎉
      </div>
      <h1 className="text-2xl font-medium text-white mb-2">Laman web anda dah live!</h1>
      <p className="text-sm text-white/50 mb-6 max-w-sm mx-auto leading-relaxed">
        Tahniah! Tenant anda telah dicipta. Trial percuma 14 hari bermula sekarang.
      </p>

      <a
        href={liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-lg px-5 py-2.5 text-sm text-white/80 hover:text-white hover:border-white/25 transition-all mb-8"
      >
        🔗 {slug}.slingshot.my
      </a>

      <ul className="text-left inline-block space-y-2.5 mb-8">
        {[
          'Niche & template dipasang',
          'Brand color diset',
          'Tenant dicipta dalam Supabase',
          'Trial 14 hari bermula sekarang',
        ].map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm text-white/60">
            <span className="text-[#c45c6a] text-base">✓</span>
            {item}
          </li>
        ))}
      </ul>

      <div className="pt-6 border-t border-white/8">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#c45c6a] text-white text-sm font-medium hover:opacity-90 transition-all"
        >
          Pergi ke Dashboard →
        </a>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [done, setDone] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [wizard, setWizard] = useState<WizardState>({
    niche: '',
    nicheLabel: '',
    templateId: '',
    templateLabel: '',
    businessName: '',
    slug: '',
    brandColor: '#c45c6a',
  })

  // Auto-generate slug from business name (only if slug hasn't been manually set)
  const [slugManual, setSlugManual] = useState(false)
  useEffect(() => {
    if (!slugManual && wizard.businessName) {
      setWizard((prev) => ({ ...prev, slug: slugify(wizard.businessName) }))
    }
  }, [wizard.businessName, slugManual])

  // Guard: redirect if already has a tenant
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/signup')
    })
  }, [router])

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setWizard((prev) => ({ ...prev, [key]: value }))
  }

  async function handlePublish() {
    setPublishing(true)
    setError(null)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: wizard.niche,
          templateId: wizard.templateId,
          businessName: wizard.businessName,
          slug: wizard.slug,
          brandColor: wizard.brandColor,
          brandLetter: wizard.businessName[0]?.toUpperCase() ?? 'B',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Ralat semasa mencipta tenant. Cuba lagi.')
        return
      }

      setDone(true)
    } catch {
      setError('Ralat rangkaian. Semak sambungan internet anda.')
    } finally {
      setPublishing(false)
    }
  }

  const containerClass =
    'min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4'

  const cardClass =
    'w-full max-w-[560px] bg-[#111] border border-white/8 rounded-2xl p-8'

  if (done) {
    return (
      <div className={containerClass}>
        <div className={cardClass}>
          <Done slug={wizard.slug} />
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[#c89968] font-serif italic text-lg">Slingshot</span>
        </div>

        <ProgressBar step={step} />

        {step === 1 && (
          <StepNiche
            value={wizard.niche}
            onChange={(id, label) => update('nicheLabel', label) || update('niche', id)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepTemplate
            value={wizard.templateId}
            onChange={(id, label) => {
              update('templateId', id)
              update('templateLabel', label)
            }}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepBrand
            businessName={wizard.businessName}
            slug={wizard.slug}
            onChangeName={(v) => update('businessName', v)}
            onChangeSlug={(v) => {
              setSlugManual(true)
              update('slug', v)
            }}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepColor
            businessName={wizard.businessName}
            slug={wizard.slug}
            color={wizard.brandColor}
            onChange={(c) => update('brandColor', c)}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && (
          <StepReview
            state={wizard}
            onBack={() => setStep(4)}
            onPublish={handlePublish}
            publishing={publishing}
            error={error}
          />
        )}
      </div>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── Types ───────────────────────────────────────────────────────────────────

interface OnboardingPayload {
  niche: string
  templateId: string
  businessName: string
  slug: string
  brandColor: string
  brandLetter: string
}

// ─── Validation ───────────────────────────────────────────────────────────────

const VALID_NICHES = [
  'cafe', 'restoran', 'klinik', 'hartanah', 'auto',
  'bengkel', 'dental', 'aesthetic', 'event', 'catering',
  'pasarmalam', 'dfy',
]

function validate(body: Partial<OnboardingPayload>): string | null {
  if (!body.niche || !VALID_NICHES.includes(body.niche))
    return 'Niche tidak sah.'
  if (!body.templateId || typeof body.templateId !== 'string')
    return 'Template ID diperlukan.'
  if (!body.businessName?.trim() || body.businessName.trim().length < 2)
    return 'Nama bisnes terlalu pendek.'
  if (!body.slug || !/^[a-z0-9]{3,30}$/.test(body.slug))
    return 'Slug tidak sah. Gunakan 3–30 aksara huruf kecil atau nombor sahaja.'
  if (!body.brandColor || !/^#[0-9a-fA-F]{6}$/.test(body.brandColor))
    return 'Warna brand tidak sah.'
  return null
}

// ─── POST /api/onboarding ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()

    // 1. Auth check — user must be logged in
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Sila log masuk untuk meneruskan.' },
        { status: 401 }
      )
    }

    // 2. Parse & validate body
    const body: Partial<OnboardingPayload> = await req.json()
    const validationError = validate(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const { niche, templateId, businessName, slug, brandColor, brandLetter } =
      body as OnboardingPayload

    // 3. Check slug uniqueness
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: `URL "${slug}" dah diambil. Cuba nama lain.` },
        { status: 409 }
      )
    }

    // 4. Check user doesn't already have a tenant
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Akaun anda sudah mempunyai tenant.' },
        { status: 409 }
      )
    }

    // 5. Insert tenant
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    const { data: tenant, error: insertError } = await supabase
      .from('tenants')
      .insert({
        slug,
        business_name: businessName.trim(),
        niche,
        template_id: templateId,
        brand_color: brandColor,
        brand_letter: brandLetter ?? businessName[0]?.toUpperCase() ?? 'B',
        tagline: '',
        owner_id: user.id,
        status: 'trial',
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('[onboarding] insert error:', insertError)
      // Friendly message for duplicate slug race condition
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: `URL "${slug}" dah diambil. Cuba nama lain.` },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Ralat semasa mencipta tenant. Cuba lagi.' },
        { status: 500 }
      )
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        url: `https://${tenant.slug}.slingshot.my`,
      },
    })
  } catch (err) {
    console.error('[onboarding] unexpected error:', err)
    return NextResponse.json(
      { error: 'Ralat tidak dijangka. Cuba lagi.' },
      { status: 500 }
    )
  }
}

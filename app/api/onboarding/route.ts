import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const NICHE_SLUGS = ['restoran', 'cafe', 'klinik', 'hartanah', 'auto', 'pasarmalam', 'event', 'catering', 'bengkel', 'dfy', 'dental', 'aesthetic'] as const;

const payloadSchema = z.object({
  niche: z.enum(NICHE_SLUGS),
  template_id: z.string().min(1),
  business_name: z.string().min(2).max(80),
  slug: z.string().regex(/^[a-z0-9]{3,30}$/, 'Slug must be 3-30 lowercase letters/numbers'),
  brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  brand_letter: z.string().min(1).max(2),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
  }
  const body = parsed.data;

  const admin = createAdminClient();

  // One tenant per user for now
  const { data: existingTenant } = await admin.from('tenants').select('id').eq('user_id', user.id).maybeSingle();
  if (existingTenant) {
    return NextResponse.json({ error: 'You already have a business on Slingshot.' }, { status: 409 });
  }

  // Slug uniqueness
  const { data: slugTaken } = await admin.from('tenants').select('id').eq('slug', body.slug).maybeSingle();
  if (slugTaken) {
    return NextResponse.json({ error: 'That web address is already taken. Try another.' }, { status: 409 });
  }

  const { data: tenant, error } = await admin
    .from('tenants')
    .insert({
      user_id: user.id,
      slug: body.slug,
      business_name: body.business_name,
      niche: body.niche,
      template_id: body.template_id,
      brand_color: body.brand_color,
      brand_letter: body.brand_letter,
      email: user.email,
      status: 'trial',
    })
    .select()
    .single();

  if (error || !tenant) {
    return NextResponse.json({ error: error?.message || 'Could not create tenant' }, { status: 500 });
  }

  // Seed default subscription row (free tier until they pick a plan)
  await admin.from('subscriptions').insert({
    tenant_id: tenant.id,
    plan: 'free',
    status: 'trialing',
  });

  return NextResponse.json({
    success: true,
    tenant: { id: tenant.id, slug: tenant.slug, url: `https://${tenant.slug}.slingshot.my` },
  });
}

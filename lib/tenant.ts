import { createAdminClient } from '@/lib/supabase/server';

export type Tenant = {
  id: string;
  slug: string;
  business_name: string;
  niche: string;
  template_id: string;
  custom_domain: string | null;
  brand_logo_url: string | null;
  brand_color: string;
  brand_letter: string;
  tagline: string | null;
  address: string | null;
  whatsapp_number: string | null;
  email: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_tiktok: string | null;
  duitnow_qr_url: string | null;
  status: 'trial' | 'active' | 'suspended' | 'canceled';
  trial_ends_at: string;
};

// Get tenant by subdomain slug (e.g. "brewpickup")
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .in('status', ['active', 'trial'])
    .single();
  if (error) return null;
  return data as Tenant;
}

// Get tenant by custom domain (e.g. "mycafe.com")
export async function getTenantByCustomDomain(domain: string): Promise<Tenant | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('custom_domain', domain.toLowerCase())
    .in('status', ['active', 'trial'])
    .single();
  if (error) return null;
  return data as Tenant;
}

// Get the current authenticated user's tenant (for owner dashboard)
export async function getCurrentTenant(): Promise<Tenant | null> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (error) return null;
  return data as Tenant;
}

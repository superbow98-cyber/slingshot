import { notFound } from 'next/navigation';
import { getTenantBySlug } from '@/lib/tenant';
import { TenantRenderer } from '@/components/templates/TenantRenderer';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TenantTestPage({ params }: { params: { slug: string } }) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();
  const supabase = createAdminClient();
  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase.from('items').select('*').eq('tenant_id', tenant.id).eq('is_available', true).order('sort_order'),
    supabase.from('categories').select('*').eq('tenant_id', tenant.id).eq('is_visible', true).order('sort_order'),
  ]);
  return (
    <TenantRenderer
      tenant={tenant}
      items={items || []}
      categories={categories || []}
    />
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) return { title: 'Not found' };
  return {
    title: tenant.business_name + ' · ' + (tenant.tagline || tenant.niche),
    description: tenant.tagline || ''
  };
}

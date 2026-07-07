import { redirect } from 'next/navigation';
import { getCurrentTenant } from '@/lib/tenant';
import { DashboardShell } from '@/components/owner/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant();

  // Logged in (middleware guarantees that) but no tenant yet → finish onboarding first
  if (!tenant) {
    redirect('/onboarding');
  }

  return <DashboardShell tenant={tenant}>{children}</DashboardShell>;
}

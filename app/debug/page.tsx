import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
  };

  let tenantCheck: any = { status: 'not_tried' };
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('tenants').select('slug, business_name, status').limit(5);
    tenantCheck = { status: 'ok', data, error };
  } catch (e: any) {
    tenantCheck = { status: 'error', message: e.message };
  }

  return (
    <main style={{ padding: 40, fontFamily: 'monospace', fontSize: 14 }}>
      <h1>Slingshot Debug</h1>
      <h2>Environment Variables</h2>
      <pre>{JSON.stringify(envCheck, null, 2)}</pre>
      <h2>Tenant Fetch Test</h2>
      <pre>{JSON.stringify(tenantCheck, null, 2)}</pre>
      <h2>Server Time</h2>
      <pre>{new Date().toISOString()}</pre>
    </main>
  );
}

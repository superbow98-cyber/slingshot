import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const RESERVED_SUBDOMAINS = ['', 'www', 'app', 'admin', 'api', 'staging', 'dev'];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = (request.headers.get('host') || '').toLowerCase();
  const cleanHost = hostname.split(':')[0];

  const isVercelPreview = cleanHost.endsWith('.vercel.app');
  const isProduction = cleanHost.endsWith('slingshot.my');
  const isLocal = cleanHost === 'localhost' || cleanHost.endsWith('.localhost');

  let subdomain = '';

  if (isProduction) {
    subdomain = cleanHost.replace('.slingshot.my', '');
    if (subdomain === cleanHost) subdomain = '';
  } else if (isVercelPreview) {
    subdomain = '';
  } else if (isLocal) {
    if (cleanHost === 'localhost') {
      subdomain = '';
    } else {
      subdomain = cleanHost.replace('.localhost', '');
    }
  }

  // Skip Next.js internals + favicon
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Real tenant subdomain → rewrite to /_sites/[slug], skip auth check
  if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
    url.pathname = `/_sites/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Skip auth check for API routes and /t/ test routes
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/t/')) {
    return NextResponse.next();
  }

  // ── Onboarding redirect logic ──────────────────────────────────────────────
  // Logged-in user with no tenant → /onboarding
  // Logged-in user with tenant visiting /onboarding → /dashboard

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    // No tenant yet and not already on /onboarding → redirect to wizard
    if (!tenant && url.pathname !== '/onboarding') {
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    // Has tenant but visiting /onboarding → redirect to dashboard
    if (tenant && url.pathname === '/onboarding') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

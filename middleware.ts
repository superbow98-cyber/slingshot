import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Reserved subdomains that map to the main app
const RESERVED_SUBDOMAINS = ['', 'www', 'app', 'admin', 'api', 'staging', 'dev'];

// Paths that require the user to be logged in
const PROTECTED_PATHS = ['/dashboard', '/onboarding'];

// Auth pages a logged-in user shouldn't see again
const AUTH_PATHS = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = (request.headers.get('host') || '').toLowerCase();

  // Strip port (for localhost development)
  const cleanHost = hostname.split(':')[0];

  // Production: brewpickup.slingshot.my
  // Dev: brewpickup.localhost
  // Vercel preview URLs (*.vercel.app) are always treated as root, never as a tenant subdomain
  const isVercelPreview = cleanHost.endsWith('.vercel.app');
  const isProduction = cleanHost.endsWith('slingshot.my');
  const baseDomain = isProduction ? 'slingshot.my' : 'localhost';

  // Extract subdomain
  let subdomain = '';
  if (!isVercelPreview) {
    if (cleanHost === baseDomain) {
      subdomain = ''; // root
    } else {
      subdomain = cleanHost.replace(`.${baseDomain}`, '');
    }
  }

  // Skip API routes and static assets
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api') || url.pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Non-reserved subdomain → rewrite straight to the tenant site (no auth check needed, public storefront)
  if (!RESERVED_SUBDOMAINS.includes(subdomain)) {
    url.pathname = `/_sites/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // --- Root app (marketing site, auth, onboarding, dashboard) ---
  // `/t/[slug]` direct test URLs and public marketing pages skip the auth-aware logic entirely
  if (
    url.pathname.startsWith('/t/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname === '/' ||
    url.pathname.startsWith('/pricing') ||
    url.pathname.startsWith('/templates') ||
    url.pathname.startsWith('/demo')
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedPath = PROTECTED_PATHS.some((p) => url.pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => url.pathname.startsWith(p));

  if (isProtectedPath && !user) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPath && user) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

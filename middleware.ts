import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Reserved subdomains that map to the main app
const RESERVED_SUBDOMAINS = ['', 'www', 'app', 'admin', 'api', 'staging', 'dev'];

// Marketing pages that don't need tenant rewrite
const MARKETING_PATHS = ['/login', '/signup', '/pricing', '/templates', '/about', '/contact', '/_next', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = (request.headers.get('host') || '').toLowerCase();
  
  // Strip port (for localhost development)
  const cleanHost = hostname.split(':')[0];
  
  // Production: brewpickup.slingshot.my
  // Dev: brewpickup.localhost
  const isProduction = cleanHost.endsWith('slingshot.my');
  const baseDomain = isProduction ? 'slingshot.my' : 'localhost';
  
  // Extract subdomain
  let subdomain = '';
  if (cleanHost === baseDomain) {
    subdomain = ''; // root
  } else {
    subdomain = cleanHost.replace(`.${baseDomain}`, '');
  }
  
  // Skip API routes and static assets
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api') || url.pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  
  // Reserved subdomain → main app (marketing/dashboard)
  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    // Skip marketing paths
    if (MARKETING_PATHS.some(p => url.pathname.startsWith(p))) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }
  
  // Tenant subdomain → rewrite to /_sites/[slug]
  url.pathname = `/_sites/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

// Custom domain support (production only) — check Supabase for tenant with matching custom_domain
// This runs ONLY if hostname doesn't match slingshot.my pattern
async function lookupCustomDomain(hostname: string) {
  // Placeholder: would call Supabase to find tenant with custom_domain = hostname
  // Implementation in /app/_sites/[slug]/page.tsx instead
  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

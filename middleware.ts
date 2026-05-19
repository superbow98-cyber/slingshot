import { NextResponse, type NextRequest } from 'next/server';

const RESERVED_SUBDOMAINS = ['', 'www', 'app', 'admin', 'api', 'staging', 'dev'];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = (request.headers.get('host') || '').toLowerCase();
  const cleanHost = hostname.split(':')[0];

  // Detect base domain
  // Production: slingshot.my
  // Vercel preview: slingshot-liart.vercel.app, slingshot-xyz.vercel.app etc
  // Local dev: localhost
  const isVercelPreview = cleanHost.endsWith('.vercel.app');
  const isProduction = cleanHost.endsWith('slingshot.my');
  const isLocal = cleanHost === 'localhost' || cleanHost.endsWith('.localhost');

  let subdomain = '';

  if (isProduction) {
    // brewpickup.slingshot.my → subdomain = 'brewpickup'
    // slingshot.my → subdomain = ''
    subdomain = cleanHost.replace('.slingshot.my', '');
    if (subdomain === cleanHost) subdomain = ''; // root domain
  } else if (isVercelPreview) {
    // slingshot-liart.vercel.app → treat as root, no tenant
    subdomain = '';
  } else if (isLocal) {
    if (cleanHost === 'localhost') {
      subdomain = '';
    } else {
      subdomain = cleanHost.replace('.localhost', '');
    }
  }

  // Skip API + static + Next.js internals
  if (url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Reserved subdomain or root → main app (no tenant rewrite)
  if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next();
  }

  // Real tenant subdomain → rewrite to /_sites/[slug]
  url.pathname = `/_sites/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

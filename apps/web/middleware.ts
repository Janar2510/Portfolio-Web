import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Public auth routes that don't require authentication
const publicAuthRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/callback',
];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Check if this is a subdomain request (portfolio site)
  // Format: subdomain.domain.com or subdomain.localhost:3000
  const subdomainMatch = hostname.match(/^([^.]+)\./);
  const isSubdomainRoute = subdomainMatch && subdomainMatch[1] !== 'www' && subdomainMatch[1] !== 'app';

  // If it's a subdomain route, handle it differently
  if (isSubdomainRoute) {
    const subdomain = subdomainMatch[1];
    const pathname = url.pathname;

    // Rewrite to /sites/[subdomain]/[slug] format
    if (pathname === '/' || pathname === '') {
      url.pathname = `/sites/${subdomain}`;
    } else {
      url.pathname = `/sites/${subdomain}${pathname}`;
    }

    // Don't apply auth or locale middleware for public portfolio sites
    return NextResponse.rewrite(url);
  }

  // For regular app routes, handle internationalization
  const response = intlMiddleware(request);

  // Extract locale from pathname
  const pathname = request.nextUrl.pathname;
  const pathParts = pathname.split('/').filter(Boolean);
  const firstPart = pathParts[0];

  // Check if the first part is a valid locale
  const isLocale = firstPart && routing.locales.includes(firstPart as any);
  const locale = isLocale ? firstPart : routing.defaultLocale;

  // If it is a locale, remove it to get the path
  const pathWithoutLocale = isLocale
    ? '/' + pathParts.slice(1).join('/')
    : pathname;

  // Normalize empty path
  if (pathWithoutLocale === '') {
    // It was just /et or /en
    // pathWithoutLocale should be /
  }

  // Check if this is a public auth route
  const isPublicAuthRoute = publicAuthRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  // Update Supabase session (this handles auth state)
  // Skip Supabase for subdomain routes (public portfolio sites)
  let supabaseResponse = response;
  try {
    supabaseResponse = await updateSession(request);
  } catch (error) {
    // If Supabase fails due to missing env vars, allow public routes to continue
    if (isPublicAuthRoute || pathWithoutLocale === '/') {
      return response;
    }
    // For other routes, rethrow the error
    throw error;
  }

  // If it's a public auth route, allow access
  if (isPublicAuthRoute) {
    return response;
  }

  // For protected routes, check authentication
  // The updateSession function handles redirects for unauthenticated users
  if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
    return supabaseResponse;
  }

  // Merge headers from supabaseResponse into the final response
  // This ensures cookies are set in the browser
  supabaseResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      response.headers.append(key, value);
    }
  });

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // - … static files
    '/((?!api|_next|_vercel|sites|.*\\..*).*)',
  ],
};

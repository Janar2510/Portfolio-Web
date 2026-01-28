import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { routing } from './src/i18n/routing';
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
  '/s',
];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Check if this is a subdomain or custom domain request
  // Format: subdomain.yourapp.com or clientdomain.com
  const isLocalhost = hostname.includes('localhost');
  const domainParts = hostname.split('.');

  // Detect if it's a subdomain of our main app (e.g., sites.yourapp.com or app.yourapp.com)
  const isSubdomain = domainParts.length > 2 || (isLocalhost && domainParts.length > 1);
  const subdomain = isSubdomain ? domainParts[0] : null;

  // Reserved subdomains for admin and auth
  const reservedSubdomains = ['www', 'app', 'admin', 'auth', 'api'];
  const isReserved = subdomain && reservedSubdomains.includes(subdomain);

  // If it's a non-reserved subdomain OR a naked custom domain
  if ((isSubdomain && !isReserved) || (!isSubdomain && hostname !== 'yourapp.com' && !isLocalhost)) {
    const pathname = url.pathname;

    // Rewrite to the internal renderer logic
    // Subdomains map to slugs: subdomain.yourapp.com -> /render/[subdomain]
    // Custom domains map via host: clientdomain.com -> /render/domain/[hostname]
    if (isSubdomain) {
      url.pathname = `/render/${subdomain}${pathname === '/' ? '' : pathname}`;
    } else {
      url.pathname = `/render/domain/${hostname}${pathname === '/' ? '' : pathname}`;
    }

    // Don't apply locale or auth middleware for public portfolio sites
    return NextResponse.rewrite(url);
  }

  // Bypass for public /s/ routes (no locale, no auth)
  if (url.pathname.startsWith('/s/')) {
    return NextResponse.next();
  }

  // For regular app routes, handle internationalization
  const response = intlMiddleware(request);

  // Extract locale from pathname
  const pathname = url.pathname;
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
  const isPublicAuthRoute = publicAuthRoutes.some(route =>
    pathWithoutLocale.startsWith(route)
  );

  // Update Supabase session (this handles auth state)
  // Skip Supabase for subdomain routes (public portfolio sites)
  // Update Supabase session (this handles auth state)
  // Skip Supabase for subdomain routes (public portfolio sites)
  let supabaseResponse = response;
  let supabaseUser = null;

  try {
    const { response: res, user } = await updateSession(request, response);
    supabaseResponse = res;
    supabaseUser = user;
  } catch (error) {
    // If Supabase fails due to missing env vars, allow public routes to continue
    // But block admin routes by letting the protected check below handle it (or fail secure)
    if (isPublicAuthRoute || pathWithoutLocale === '/') {
      return response;
    }
    // For other routes, rethrow the error
    throw error;
  }

  // Check if this is an auth page that should redirect logged-in users
  const redirectIfAuthedRoutes = ['/sign-in', '/sign-up'];
  const shouldRedirectIfAuthed = redirectIfAuthedRoutes.some(r => pathWithoutLocale.startsWith(r));

  // If it's a public auth route
  if (isPublicAuthRoute) {
    // Only check auth state and redirect if on a specific "guest-only" page
    if (shouldRedirectIfAuthed) {
      // Use the user we already fetched in updateSession
      if (supabaseUser) {
        // User is already logged in, redirect to builder
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/${locale}/builder/sites`;
        redirectUrl.searchParams.delete('next');
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Otherwise (e.g. /s routes or /forgot-password), just return the response
    return supabaseResponse;
  }

  // Check if the user is authenticated from the supabase response context
  // We use the user returned by updateSession which handles token refresh and cookies correctly

  // For the MVP golden path:
  // Protected Routes: /(admin)/**
  // Access Control: Redirect to /sign-in if accessing protected route without session.

  // NOTE: We do NOT check for (admin) in path string because nextjs route groups are not in the URL.
  // We rely on prefix matching.

  const protectedPrefixes = [
    '/admin',
    '/builder',
    '/dashboard',
    '/projects',
    '/crm',
    '/analytics',
    '/settings',
    '/portfolio',
    '/deploy',
    '/email',
  ];

  const isProtectedRoute = protectedPrefixes.some(prefix =>
    pathWithoutLocale === prefix || pathWithoutLocale.startsWith(prefix + '/')
  );

  if (isProtectedRoute) {
    // Check if we have a user from the updateSession call
    if (!supabaseUser) {
      // Double check NOT needed here because updateSession already did a thorough check
      // including manual recovery from cookies.

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/sign-in`;

      // Add next param for redirection after login
      // Construct the full relative path including search params
      const nextPath = pathname + request.nextUrl.search;
      redirectUrl.searchParams.set('next', nextPath);

      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // - … static files
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, return early without Supabase (for development)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase environment variables not found. Skipping auth check.'
    );
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: CookieOptions;
        }>
      ) {
        // Update the response with new cookies
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, {
            ...options,
            path: '/',
            sameSite: 'lax',
            httpOnly: false, // Must be false for browser to read
          });
        });
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Debug: Log cookies being received
  const allCookies = request.cookies.getAll();
  const authCookies = allCookies.filter(
    c => c.name.includes('sb-') || c.name.includes('supabase')
  );
  if (authCookies.length > 0) {
    console.log('[Middleware] Auth cookies found:', {
      count: authCookies.length,
      names: authCookies.map(c => c.name),
      firstCookieValueLength: authCookies[0]?.value?.length || 0,
    });
  } else {
    console.log(
      '[Middleware] No auth cookies found. Total cookies:',
      allCookies.length
    );
  }

  // IMPORTANT: Call getSession() to refresh the session from cookies
  // This ensures cookies are properly read and the session is refreshed
  let session = null;
  let user = null;
  let authError = null;

  try {
    // First, try getSession() which reads from cookies
    const sessionResult = await supabase.auth.getSession();
    session = sessionResult.data?.session ?? null;
    user = session?.user ?? null;
    authError = sessionResult.error;

    console.log('[Middleware] getSession() result:', {
      hasSession: !!session,
      hasUser: !!user,
      error: authError?.message,
      errorType: authError?.constructor?.name,
      authCookiesCount: authCookies.length,
    });

    // ALWAYS try manual recovery if we have cookies but no session
    // This is necessary because Supabase SSR sometimes can't parse cookies automatically
    if (authCookies.length > 0 && (!user || !session)) {
      console.log(
        '[Middleware] ⚠️ Cookie exists but no session - attempting manual recovery...'
      );
      console.log('[Middleware] Recovery check:', {
        hasUser: !!user,
        hasSession: !!session,
        authCookiesCount: authCookies.length,
        willAttemptRecovery: true,
      });

      const authCookie = authCookies.find(c => c.name.includes('auth-token'));
      console.log('[Middleware] Found auth cookie:', {
        name: authCookie?.name,
        hasValue: !!authCookie?.value,
        valueLength: authCookie?.value?.length,
      });

      if (authCookie?.value) {
        try {
          // Decode the URL-encoded cookie value
          const decoded = decodeURIComponent(authCookie.value);
          console.log('[Middleware] Decoded cookie, length:', decoded.length);
          const cookieData = JSON.parse(decoded);
          console.log(
            '[Middleware] Parsed cookie data keys:',
            Object.keys(cookieData)
          );

          if (cookieData.access_token && cookieData.refresh_token) {
            console.log(
              '[Middleware] Found tokens in cookie, setting session manually...'
            );
            const manualSessionResult = await supabase.auth.setSession({
              access_token: cookieData.access_token,
              refresh_token: cookieData.refresh_token,
            });

            if (manualSessionResult.data?.session) {
              session = manualSessionResult.data.session;
              user = session.user;
              console.log(
                '[Middleware] ✅ Manual session recovery successful! User:',
                user.id
              );
              // The setSession() call should have already updated cookies via setAll()
              // But let's verify by checking if cookies were set
              console.log(
                '[Middleware] Session recovered, cookies should be updated by Supabase'
              );
            } else {
              console.log(
                '[Middleware] ❌ Manual session recovery failed:',
                manualSessionResult.error?.message
              );
            }
          } else {
            console.log(
              '[Middleware] Cookie missing access_token or refresh_token'
            );
          }
        } catch (parseError) {
          console.error('[Middleware] Error parsing cookie:', parseError);
          if (parseError instanceof Error) {
            console.error(
              '[Middleware] Parse error message:',
              parseError.message
            );
          }
        }
      } else {
        console.log('[Middleware] No auth cookie value found');
      }
    }

    // If still no user after recovery attempt, try getUser() as last resort
    if (!user) {
      console.log(
        '[Middleware] Still no user after recovery, trying getUser()...'
      );
      const userResult = await supabase.auth.getUser();
      if (userResult.data?.user) {
        user = userResult.data.user;
        console.log('[Middleware] getUser() succeeded');
      } else if (userResult.error) {
        authError = userResult.error;
        console.log(
          '[Middleware] getUser() also failed:',
          userResult.error.message
        );
      }
    }
  } catch (err) {
    console.error('[Middleware] Error getting session/user:', err);
    authError = err as Error;
  }

  console.log('[Middleware] Auth check result:', {
    hasSession: !!session,
    hasUser: !!user,
    userId: user?.id,
    error: authError?.message,
    path: request.nextUrl.pathname,
  });

  // Extract locale and path without locale
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1] || 'en'; // Default to 'en' if no locale in path
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Public auth routes that don't require authentication
  const publicAuthRoutes = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/auth/callback',
  ];

  const isPublicAuthRoute = publicAuthRoutes.some(route =>
    pathWithoutLocale.startsWith(route)
  );

  if (!user && !isPublicAuthRoute) {
    // No user and not a public route, redirect to sign in
    console.log(
      '[Middleware] No user found, redirecting to sign-in. Path:',
      pathWithoutLocale
    );
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    return NextResponse.redirect(url);
  }

  if (user) {
    console.log(
      '[Middleware] User authenticated:',
      user.id,
      'Path:',
      pathWithoutLocale
    );
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}

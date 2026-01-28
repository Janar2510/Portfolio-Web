import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Extract locale from pathname or default to first locale
  const pathname = requestUrl.pathname;
  const locale = pathname.split('/')[1] || routing.locales[0];
  const next = requestUrl.searchParams.get('next') || `/${locale}/portfolio`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // MVP: Redirect directly to builder sites list
      // The sites list page handles the "Onboarding" (Create Site) if no sites exist.
      const targetPath = next.includes('dashboard') ? `/${locale}/portfolio` : next;
      return NextResponse.redirect(new URL(targetPath, request.url));
    } else {
      console.error('Auth callback error:', error);
      const redirectUrl = new URL(`/${locale}/sign-in`, request.url);
      redirectUrl.searchParams.set('error', 'AuthCallbackError');
      redirectUrl.searchParams.set('error_description', error.message);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Error or no code, redirect to sign in with generic error if needed, or just clean redirect
  const redirectUrl = new URL(`/${locale}/sign-in`, request.url);
  if (!code) {
    redirectUrl.searchParams.set('error', 'NoCode');
    redirectUrl.searchParams.set('error_description', 'No authentication code provided.');
  }
  return NextResponse.redirect(redirectUrl);
}

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
  const next = requestUrl.searchParams.get('next') || `/${locale}/dashboard`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user needs onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (!profile?.onboarding_completed) {
          return NextResponse.redirect(
            new URL(`/${locale}/onboarding`, request.url)
          );
        }
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Error or no code, redirect to sign in
  return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
}

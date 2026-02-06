import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AppShell } from '@/components/shell/AppShell';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  try {
    const supabase = await createClient();

    // Try getSession() first - it's more reliable for reading cookies
    let {
      data: { session },
    } = await supabase.auth.getSession();
    let user = session?.user ?? null;

    // If no session, try getUser()
    if (!user) {
      const {
        data: { user: getUserResult },
        error: authError,
      } = await supabase.auth.getUser();
      user = getUserResult ?? null;

      // If still no user but we have auth cookies, try manual recovery
      if (!user && authError?.message === 'Auth session missing!') {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        const authCookies = allCookies.filter(
          c => c.name.includes('sb-') && c.name.includes('auth-token')
        );

        if (authCookies.length > 0) {
          const authCookie = authCookies.find(c =>
            c.name.includes('auth-token')
          );
          if (authCookie?.value) {
            try {
              const decoded = decodeURIComponent(authCookie.value);
              const cookieData = JSON.parse(decoded);

              if (cookieData.access_token && cookieData.refresh_token) {
                // Try to recover the session
                const recoveryResult = await supabase.auth.setSession({
                  access_token: cookieData.access_token,
                  refresh_token: cookieData.refresh_token,
                });

                if (recoveryResult.data?.session) {
                  user = recoveryResult.data.session.user;
                } else {
                  // Try getUser() one more time after recovery attempt
                  const retryResult = await supabase.auth.getUser();
                  user = retryResult.data?.user ?? null;
                }
              }
            } catch (err) {
              // Recovery failed, continue to redirect
            }
          }
        }
      }
    }

    if (!user) {
      redirect(`/${locale}/sign-in`);
    }

    // Check onboarding status - handled in middleware!
    // We removed the redundant check here to prevent redirect loops between Middleware (Edge) and Layout (Node).
    // Middleware is the single source of truth for onboarding access control.

    return (
      <QueryProvider>
        <AppShell locale={locale}>
          {children}
        </AppShell>
      </QueryProvider>
    );
  } catch (error) {
    redirect(`/${locale}/sign-in`);
  }
}

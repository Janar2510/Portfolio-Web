import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { TopNav } from '@/components/layout/TopNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { QueryProvider } from '@/components/providers/QueryProvider';

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
    let { data: { session } } = await supabase.auth.getSession();
    let user = session?.user ?? null;
    
    // If no session, try getUser()
    if (!user) {
      const { data: { user: getUserResult }, error: authError } = await supabase.auth.getUser();
      user = getUserResult ?? null;
      
      // If still no user but we have auth cookies, try manual recovery
      if (!user && authError?.message === 'Auth session missing!') {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        const authCookies = allCookies.filter(c => c.name.includes('sb-') && c.name.includes('auth-token'));
        
        if (authCookies.length > 0) {
          const authCookie = authCookies.find(c => c.name.includes('auth-token'));
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

    // Check onboarding status - redirect if not completed
    const { data: onboardingProgress } = await supabase
      .from('onboarding_progress')
      .select('status')
      .eq('user_id', user.id)
      .single();

    // If onboarding exists and is not completed/skipped, redirect to onboarding
    if (
      onboardingProgress &&
      onboardingProgress.status !== 'completed' &&
      onboardingProgress.status !== 'skipped'
    ) {
      redirect(`/${locale}/onboarding`);
    }

    return (
      <QueryProvider>
        <div className="min-h-screen bg-background">
          <TopNav locale={locale} />
          <div className="flex">
            <Sidebar locale={locale} />
            <main className="flex-1 ml-64 pt-14 transition-all duration-200">
              <div className="p-4 md:p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </QueryProvider>
    );
  } catch (error) {
    redirect(`/${locale}/sign-in`);
  }
}

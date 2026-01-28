'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { QueryProvider } from '@/components/providers/QueryProvider';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/sign-in');
        return;
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  return (
    <QueryProvider>
      <OnboardingFlow />
    </QueryProvider>
  );
}

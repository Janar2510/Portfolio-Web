import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User, SupabaseClient } from '@supabase/supabase-js';

interface CreateClientResult {
  supabase: SupabaseClient;
  user: User | null;
}

/**
 * Creates a Supabase client with automatic session recovery.
 * Returns both the client and the recovered user (if any).
 */
export async function createClientWithUser(): Promise<CreateClientResult> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Try to find the access token in cookies before creating the client
  let accessToken: string | undefined;
  let refreshToken: string | undefined;

  const authCookie = allCookies.find(c => c.name.includes('auth-token') && !c.name.includes('.'));
  if (authCookie?.value) {
    try {
      const decoded = decodeURIComponent(authCookie.value);
      const cookieData = JSON.parse(decoded);
      accessToken = cookieData.access_token;
      refreshToken = cookieData.refresh_token;
    } catch (e) {
      console.error('[Supabase Server] Error parsing auth cookie:', e);
    }
  }

  // Create the supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      },
      cookies: {
        getAll() {
          return allCookies;
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax' as const,
                httpOnly: false,
              })
            );
          } catch (error) {
            // This happens when called from Server Components during render
          }
        },
      },
    }
  );

  let recoveredUser: User | null = null;

  try {
    // 1. Primary method: Use getUser()
    console.log('[Supabase Server] 🔍 Attempting getUser()...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (user) {
      console.log('[Supabase Server] ✅ getUser() successful! User:', user.id);
      recoveredUser = user;
    } else if (accessToken && refreshToken) {
      // 2. Manual fallback if getUser failed but we have tokens
      console.log('[Supabase Server] ⚠️ getUser failed, attempting manual setSession...');
      const { data, error: setError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (data.user) {
        console.log('[Supabase Server] ✅ manual setSession successful! User:', data.user.id);
        recoveredUser = data.user;
      } else {
        console.log('[Supabase Server] ❌ manual setSession failed:', setError?.message);
      }
    } else {
      console.log('[Supabase Server] ❌ No user and no tokens for recovery');
    }
  } catch (error) {
    console.error('[Supabase Server] ❌ Unexpected error during session recovery:', error);
  }

  return { supabase, user: recoveredUser };
}


/**
 * Creates a Supabase client (backward compatible).
 * For pages that need user info, use createClientWithUser() instead.
 */
export async function createClient(): Promise<SupabaseClient> {
  const { supabase } = await createClientWithUser();
  return supabase;
}

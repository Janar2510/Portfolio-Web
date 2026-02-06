import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User, SupabaseClient } from '@supabase/supabase-js';

// Define the return type for compatibility
interface CreateClientResult {
  supabase: SupabaseClient;
  user: User | null;
}

/**
 * Creates a standard Supabase server client with cookie handling.
 */
/**
 * Creates a standard Supabase server client with cookie handling.
 * Includes manual session recovery for robust authentication.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  // Pre-check for auth token to force header injection
  // This solves the issue where setSession() updates Auth state but not DB headers in some SSR contexts
  let initialGlobalHeaders: Record<string, string> = {};

  try {
    const allCookies = cookieStore.getAll();
    const authCookie = allCookies.find(c => c.name.includes('auth-token') && c.value);
    if (authCookie) {
      const decoded = decodeURIComponent(authCookie.value);
      const cookieData = JSON.parse(decoded);
      if (cookieData.access_token) {
        initialGlobalHeaders['Authorization'] = `Bearer ${cookieData.access_token}`;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
      global: {
        headers: initialGlobalHeaders
      }
    }
  );

  // Still perform setSession if needed for internal state consistency
  // (though the header above should handle the DB request authority)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && initialGlobalHeaders['Authorization']) {
      // We have a token but no session state, try to sync them
      // This is safe because we verified the token exists above
      const authCookie = cookieStore.getAll().find(c => c.name.includes('auth-token'));
      if (authCookie) {
        const data = JSON.parse(decodeURIComponent(authCookie.value));
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });
      }
    }
  } catch (e) {
    // console.error('Session check failed', e);
  }

  return supabase;
}

/**
 * Helper to get the current authenticated user safely on the server.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Backward compatible wrapper for existing code.
 * Returns both the client and the user.
 */
export async function createClientWithUser(): Promise<CreateClientResult> {
  const supabase = await createClient(); // Now fully authenticated
  const { data: { user } } = await supabase.auth.getUser();

  return { supabase, user };
}

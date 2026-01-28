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
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
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
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Helper to get the current authenticated user safely on the server.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) return user;

    // Manual recovery attempt (copying logic from middleware)
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const authCookie = allCookies.find(c => c.name.includes('auth-token') && c.value);

    if (authCookie) {
      try {
        const decoded = decodeURIComponent(authCookie.value);
        const cookieData = JSON.parse(decoded);

        if (cookieData.access_token && cookieData.refresh_token) {
          const { data: sessionData } = await supabase.auth.setSession({
            access_token: cookieData.access_token,
            refresh_token: cookieData.refresh_token,
          });
          return sessionData.session?.user ?? null;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    return null;
  } catch (error) {
    // console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Backward compatible wrapper for existing code.
 * Returns both the client and the user.
 */
// Consolidated client creation to prevent multiple instances
export async function createClientWithUser(): Promise<CreateClientResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('[createClientWithUser] getUser failed:', error);
    } else {
      console.log('[createClientWithUser] Success user:', user.id);
    }

    return { supabase, user };
  } catch (err) {
    console.error('[createClientWithUser] Unexpected error:', err);
    return { supabase, user: null };
  }
}

/**
 * Creates a Supabase client with the service role key (Admin).
 * ARNING: This client bypasses Row Level Security. Use with extreme caution.
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
  }

  // We import createClient from the base package for admin usage to avoid cookie overhead
  const { createClient: createBaseClient } = require('@supabase/supabase-js');

  return createBaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

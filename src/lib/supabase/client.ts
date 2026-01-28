import { createBrowserClient } from '@supabase/ssr';

// Cache the client to avoid recreating it on every call
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Only create client once and reuse it
  if (!supabaseClient) {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!hasUrl || !hasKey) {
      console.error(
        '[ERROR] Supabase environment variables missing in browser client',
        { hasUrl, hasKey }
      );
      throw new Error('Missing Supabase environment variables');
    }

    const anonKeyLength =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0;
    const anonKeyPrefix =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'MISSING';

    if (anonKeyLength < 100) {
      console.error(
        '[ERROR] Supabase anon key appears to be invalid or truncated',
        {
          length: anonKeyLength,
          prefix: anonKeyPrefix,
        }
      );
    }

    // createBrowserClient automatically handles cookies from document.cookie
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return supabaseClient;
}

import { createClient as createBaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the service role key (Admin).
 * WARNING: This client bypasses Row Level Security. Use with extreme caution.
 * This file is purposefully isolated to avoid importing next/headers in client components.
 */
export function createAdminClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
    }

    return createBaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

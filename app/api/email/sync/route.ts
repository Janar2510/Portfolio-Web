/**
 * Trigger Email Sync
 *
 * API route to trigger email synchronization for one or all accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { account_id, force_full_sync } = body;

    // Get Supabase URL and service key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Call the edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/email-sync`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id,
        force_full_sync: force_full_sync || false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sync emails');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Email sync error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to sync emails',
      },
      { status: 500 }
    );
  }
}

/**
 * Apple Mail IMAP Connection
 * 
 * Handles IMAP credential storage for Apple Mail/iCloud
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptCredentials } from '@/lib/email/encryption';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Apple Mail IMAP settings
    const credentials = {
      host: 'imap.mail.me.com', // iCloud IMAP
      port: 993,
      username: email,
      password,
      use_tls: true,
    };

    // Encrypt credentials
    const credentialsEncrypted = await encryptCredentials(credentials);

    // Store in database
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if account already exists
    const { data: existing } = await supabase
      .from('email_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('email_address', email)
      .single();

    if (existing) {
      // Update existing account
      const { error } = await supabase
        .from('email_accounts')
        .update({
          credentials_encrypted: credentialsEncrypted,
          display_name: displayName || email,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Create new account
      const { error } = await supabase
        .from('email_accounts')
        .insert({
          user_id: user.id,
          provider: 'apple',
          email_address: email,
          display_name: displayName || email,
          credentials_encrypted: credentialsEncrypted,
          is_active: true,
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Apple connection error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect account' },
      { status: 500 }
    );
  }
}

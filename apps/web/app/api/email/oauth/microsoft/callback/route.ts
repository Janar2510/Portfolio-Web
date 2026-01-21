/**
 * Microsoft Graph OAuth Callback
 * 
 * Handles OAuth callback and stores encrypted credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptCredentials } from '@/lib/email/encryption';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Verify state
  const storedState = request.cookies.get('oauth_state')?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL('/email/accounts?error=invalid_state', request.url)
    );
  }

  if (error) {
    return NextResponse.redirect(
      new URL(`/email/accounts?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/email/accounts?error=no_code', request.url)
    );
  }

  try {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${request.nextUrl.origin}/api/email/oauth/microsoft/callback`;
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';

    if (!clientId || !clientSecret) {
      throw new Error('Microsoft OAuth not configured');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          scope: 'https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/User.Read offline_access',
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error_description || 'Failed to exchange code');
    }

    const tokenData = await tokenResponse.json();

    // Get user profile to get email address
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const userData = await userResponse.json();
    const emailAddress = userData.mail || userData.userPrincipalName;
    const displayName = userData.displayName || userData.mail;

    // Encrypt credentials
    const credentials = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000),
      token_type: tokenData.token_type,
    };

    const credentialsEncrypted = await encryptCredentials(credentials);

    // Store in database
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL('/sign-in?redirect=/email/accounts', request.url)
      );
    }

    // Check if account already exists
    const { data: existing } = await supabase
      .from('email_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('email_address', emailAddress)
      .single();

    if (existing) {
      // Update existing account
      await supabase
        .from('email_accounts')
        .update({
          credentials_encrypted: credentialsEncrypted,
          display_name: displayName,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Create new account
      await supabase
        .from('email_accounts')
        .insert({
          user_id: user.id,
          provider: 'outlook',
          email_address: emailAddress,
          display_name: displayName,
          credentials_encrypted: credentialsEncrypted,
          is_active: true,
        });
    }

    // Clear state cookie
    const response = NextResponse.redirect(
      new URL('/email/accounts?success=connected', request.url)
    );
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/email/accounts?error=${encodeURIComponent(error instanceof Error ? error.message : 'unknown_error')}`, request.url)
    );
  }
}

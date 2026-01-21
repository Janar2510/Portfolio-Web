import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailAccount {
  id: string;
  user_id: string;
  provider: 'outlook' | 'apple';
  email_address: string;
  credentials_encrypted: string;
  sync_state: Record<string, unknown>;
  last_sync_at: string | null;
}

interface EmailMessage {
  external_id: string;
  subject: string | null;
  body_preview: string | null;
  body_html: string | null;
  from_address: string;
  to_addresses: string[];
  cc_addresses: string[] | null;
  has_attachments: boolean;
  sent_at: string;
  received_at: string | null;
  is_read: boolean;
  thread_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { account_id, force_full_sync } = await req.json().catch(() => ({}));

    // Get email account
    let accounts: EmailAccount[];
    if (account_id) {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('id', account_id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      accounts = data ? [data] : [];
    } else {
      // Sync all active accounts
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      accounts = data || [];
    }

    if (accounts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active email accounts to sync' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const results = [];

    for (const account of accounts) {
      try {
        const syncResult = await syncAccount(account, supabase, force_full_sync);
        results.push({
          account_id: account.id,
          email_address: account.email_address,
          ...syncResult,
        });
      } catch (error) {
        console.error(`Error syncing account ${account.id}:`, error);
        results.push({
          account_id: account.id,
          email_address: account.email_address,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Email sync completed',
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in email-sync:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function syncAccount(
  account: EmailAccount,
  supabase: any,
  forceFullSync: boolean = false
): Promise<{
  emails_synced: number;
  contacts_matched: number;
  threads_created: number;
}> {
  // Decrypt credentials (simplified - in production use proper decryption)
  // For now, we'll use the provider-specific sync logic
  
  let emails: EmailMessage[] = [];
  const syncState = account.sync_state || {};
  const lastSyncAt = account.last_sync_at ? new Date(account.last_sync_at) : null;

  // Sync emails based on provider
  if (account.provider === 'outlook') {
    emails = await syncMicrosoftGraph(account, syncState, lastSyncAt, forceFullSync);
  } else if (account.provider === 'apple') {
    emails = await syncAppleIMAP(account, syncState, lastSyncAt, forceFullSync);
  }

  if (emails.length === 0) {
    // Update last_sync_at even if no new emails
    await supabase
      .from('email_accounts')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_state: syncState,
      })
      .eq('id', account.id);

    return {
      emails_synced: 0,
      contacts_matched: 0,
      threads_created: 0,
    };
  }

  // Process emails: thread grouping, contact matching, and storage
  let contactsMatched = 0;
  let threadsCreated = 0;
  const newThreadIds = new Set<string>();

  for (const email of emails) {
    // Generate or find thread ID
    const threadId = await findOrCreateThreadId(
      {
        subject: email.subject,
        from_address: email.from_address,
        to_addresses: email.to_addresses,
        sent_at: email.sent_at,
        account_id: account.id,
      },
      supabase
    );

    if (!newThreadIds.has(threadId)) {
      newThreadIds.add(threadId);
      threadsCreated++;
    }

    // Determine direction
    const direction = email.from_address.toLowerCase() === account.email_address.toLowerCase()
      ? 'outbound'
      : 'inbound';

    // Match to contact
    let contactId: string | null = null;
    if (direction === 'inbound') {
      contactId = await matchEmailToContact(email.from_address, supabase);
    } else if (email.to_addresses.length > 0) {
      // For outbound, match first recipient
      contactId = await matchEmailToContact(email.to_addresses[0], supabase);
    }

    if (contactId) {
      contactsMatched++;
    }

    // Store email
    const { error: insertError } = await supabase
      .from('emails')
      .upsert({
        account_id: account.id,
        external_id: email.external_id,
        thread_id: threadId,
        contact_id: contactId,
        direction,
        subject: email.subject,
        body_preview: email.body_preview,
        body_html: email.body_html,
        from_address: email.from_address,
        to_addresses: email.to_addresses,
        cc_addresses: email.cc_addresses,
        has_attachments: email.has_attachments,
        sent_at: email.sent_at,
        received_at: email.received_at || (direction === 'inbound' ? email.sent_at : null),
        is_read: email.is_read,
      }, {
        onConflict: 'account_id,external_id',
      });

    if (insertError) {
      console.error(`Error inserting email ${email.external_id}:`, insertError);
    }
  }

  // Update account sync state
  const newSyncState = {
    ...syncState,
    last_sync_cursor: emails.length > 0 ? emails[0].external_id : syncState.last_sync_cursor,
    last_sync_count: emails.length,
  };

  await supabase
    .from('email_accounts')
    .update({
      last_sync_at: new Date().toISOString(),
      sync_state: newSyncState,
    })
    .eq('id', account.id);

  return {
    emails_synced: emails.length,
    contacts_matched: contactsMatched,
    threads_created: threadsCreated,
  };
}

// Helper functions (simplified versions - implement full logic based on providers)

async function syncMicrosoftGraph(
  account: EmailAccount,
  syncState: Record<string, unknown>,
  lastSyncAt: Date | null,
  forceFullSync: boolean
): Promise<EmailMessage[]> {
  // TODO: Implement Microsoft Graph API sync
  // This would use the encrypted credentials to fetch emails
  // For now, return empty array
  return [];
}

async function syncAppleIMAP(
  account: EmailAccount,
  syncState: Record<string, unknown>,
  lastSyncAt: Date | null,
  forceFullSync: boolean
): Promise<EmailMessage[]> {
  // TODO: Implement IMAP sync
  // This would use the encrypted credentials to connect via IMAP
  // For now, return empty array
  return [];
}

function normalizeSubject(subject: string | null): string {
  if (!subject) return '';
  const prefixes = ['re:', 'fwd:', 'fw:', 'aw:', 'vs:'];
  let normalized = subject.toLowerCase().trim();
  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.substring(prefix.length).trim();
    }
  }
  return normalized;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

async function findOrCreateThreadId(
  email: {
    subject: string | null;
    from_address: string;
    to_addresses: string[];
    sent_at: string;
    account_id: string;
  },
  supabase: any
): Promise<string> {
  const normalizedSubject = normalizeSubject(email.subject);
  const participants = [
    email.from_address.toLowerCase(),
    ...email.to_addresses.map((a) => a.toLowerCase()),
  ].sort();
  const threadKey = `${normalizedSubject}|${participants.join(',')}`;
  const candidateThreadId = hashString(threadKey);

  const { data: existingThread } = await supabase
    .from('emails')
    .select('thread_id')
    .eq('account_id', email.account_id)
    .eq('thread_id', candidateThreadId)
    .limit(1)
    .single();

  return existingThread?.thread_id || candidateThreadId;
}

async function matchEmailToContact(
  emailAddress: string,
  supabase: any
): Promise<string | null> {
  const { data: exactMatch } = await supabase
    .from('contacts')
    .select('id')
    .eq('email', emailAddress.toLowerCase())
    .single();

  if (exactMatch) {
    return exactMatch.id;
  }

  const domain = emailAddress.split('@')[1];
  if (domain) {
    const { data: domainMatch } = await supabase
      .from('contacts')
      .select('id, email')
      .ilike('email', `%@${domain}`)
      .limit(1)
      .single();

    if (domainMatch) {
      return domainMatch.id;
    }
  }

  return null;
}

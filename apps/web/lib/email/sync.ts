/**
 * Email Sync Utilities
 *
 * Thread grouping and contact matching logic
 */

import type { Email } from '@/lib/services/email';

/**
 * Generate thread ID from email metadata
 * Uses subject normalization and participant matching
 */
export function generateThreadId(email: {
  subject: string | null;
  from_address: string;
  to_addresses: string[];
  sent_at: string;
}): string {
  // Normalize subject (remove Re:, Fwd:, etc.)
  const normalizedSubject = normalizeSubject(email.subject || '');

  // Get all participants (from + to)
  const participants = [
    email.from_address.toLowerCase(),
    ...email.to_addresses.map(a => a.toLowerCase()),
  ].sort();

  // Create thread ID from normalized subject and participants
  const threadKey = `${normalizedSubject}|${participants.join(',')}`;

  // Hash the thread key (simple hash for now)
  return hashString(threadKey);
}

/**
 * Normalize email subject for thread grouping
 */
function normalizeSubject(subject: string): string {
  if (!subject) return '';

  // Remove common prefixes
  const prefixes = ['re:', 'fwd:', 'fw:', 'aw:', 'vs:'];
  let normalized = subject.toLowerCase().trim();

  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.substring(prefix.length).trim();
    }
  }

  return normalized;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Match email to contact by email address
 */
export async function matchEmailToContact(
  emailAddress: string,
  supabase: any
): Promise<string | null> {
  // Try exact match first
  const { data: exactMatch } = await supabase
    .from('contacts')
    .select('id')
    .eq('email', emailAddress.toLowerCase())
    .single();

  if (exactMatch) {
    return exactMatch.id;
  }

  // Try partial match (email domain)
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

/**
 * Match email to multiple contacts
 */
export async function matchEmailToContacts(
  emailAddresses: string[],
  supabase: any
): Promise<Record<string, string>> {
  const matches: Record<string, string> = {};

  for (const email of emailAddresses) {
    const contactId = await matchEmailToContact(email, supabase);
    if (contactId) {
      matches[email] = contactId;
    }
  }

  return matches;
}

/**
 * Determine email direction (inbound/outbound)
 */
export function determineDirection(
  fromAddress: string,
  accountEmail: string
): 'inbound' | 'outbound' {
  return fromAddress.toLowerCase() === accountEmail.toLowerCase()
    ? 'outbound'
    : 'inbound';
}

/**
 * Extract body preview from HTML or text
 */
export function extractBodyPreview(
  body: string | null,
  maxLength: number = 200
): string | null {
  if (!body) return null;

  // Remove HTML tags if present
  const textOnly = body.replace(/<[^>]*>/g, '').trim();

  if (textOnly.length <= maxLength) {
    return textOnly;
  }

  return textOnly.substring(0, maxLength) + '...';
}

/**
 * Group emails into threads
 */
export function groupEmailsIntoThreads(emails: Email[]): Map<string, Email[]> {
  const threads = new Map<string, Email[]>();

  for (const email of emails) {
    const threadId =
      email.thread_id ||
      generateThreadId({
        subject: email.subject,
        from_address: email.from_address,
        to_addresses: email.to_addresses,
        sent_at: email.sent_at,
      });

    if (!threads.has(threadId)) {
      threads.set(threadId, []);
    }
    threads.get(threadId)!.push(email);
  }

  // Sort emails within each thread by sent_at
  for (const [threadId, threadEmails] of threads.entries()) {
    threadEmails.sort(
      (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
    );
  }

  return threads;
}

/**
 * Find or create thread ID for an email
 */
export async function findOrCreateThreadId(
  email: {
    subject: string | null;
    from_address: string;
    to_addresses: string[];
    sent_at: string;
    account_id: string;
  },
  supabase: any
): Promise<string> {
  // Generate candidate thread ID
  const candidateThreadId = generateThreadId({
    subject: email.subject,
    from_address: email.from_address,
    to_addresses: email.to_addresses,
    sent_at: email.sent_at,
  });

  // Check if thread already exists
  const { data: existingThread } = await supabase
    .from('emails')
    .select('thread_id')
    .eq('account_id', email.account_id)
    .eq('thread_id', candidateThreadId)
    .limit(1)
    .single();

  if (existingThread?.thread_id) {
    return existingThread.thread_id;
  }

  return candidateThreadId;
}

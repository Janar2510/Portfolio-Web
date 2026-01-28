/**
 * Contact Matching Utilities
 *
 * Advanced contact matching algorithms for email-to-contact linking
 */

import type { Contact } from '@/domain/crm/crm';

export interface ContactMatch {
  contact_id: string;
  confidence: number;
  match_type: 'exact' | 'domain' | 'name' | 'fuzzy';
}

/**
 * Match email address to contact with confidence scoring
 */
export async function matchEmailToContactWithConfidence(
  emailAddress: string,
  contacts: Contact[],
  options?: {
    includeDomainMatch?: boolean;
    includeNameMatch?: boolean;
    minConfidence?: number;
  }
): Promise<ContactMatch | null> {
  const {
    includeDomainMatch = true,
    includeNameMatch = false,
    minConfidence = 0.5,
  } = options || {};

  const emailLower = emailAddress.toLowerCase();
  const [localPart, domain] = emailLower.split('@');

  // 1. Exact email match (highest confidence)
  const exactMatch = contacts.find(c => c.email?.toLowerCase() === emailLower);
  if (exactMatch) {
    return {
      contact_id: exactMatch.id,
      confidence: 1.0,
      match_type: 'exact',
    };
  }

  // 2. Domain match (medium confidence)
  if (includeDomainMatch && domain) {
    const domainMatches = contacts.filter(c =>
      c.email?.toLowerCase().endsWith(`@${domain}`)
    );

    if (domainMatches.length === 1) {
      return {
        contact_id: domainMatches[0].id,
        confidence: 0.7,
        match_type: 'domain',
      };
    }
  }

  // 3. Name-based matching (lower confidence)
  if (includeNameMatch && localPart) {
    const nameMatch = matchByName(localPart, contacts);
    if (nameMatch && nameMatch.confidence >= minConfidence) {
      return nameMatch;
    }
  }

  // 4. Fuzzy matching (lowest confidence)
  const fuzzyMatch = fuzzyMatchEmail(emailAddress, contacts);
  if (fuzzyMatch && fuzzyMatch.confidence >= minConfidence) {
    return fuzzyMatch;
  }

  return null;
}

/**
 * Match by name extracted from email local part
 */
function matchByName(
  localPart: string,
  contacts: Contact[]
): ContactMatch | null {
  // Try to extract name from email (e.g., "john.doe" -> "John Doe")
  const nameParts = localPart
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1));

  if (nameParts.length < 2) {
    return null;
  }

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  // Find contacts with matching first and last name
  const matches = contacts.filter(c => {
    const cFirstName = c.first_name?.toLowerCase();
    const cLastName = c.last_name?.toLowerCase();
    return (
      cFirstName === firstName.toLowerCase() &&
      cLastName === lastName.toLowerCase()
    );
  });

  if (matches.length === 1) {
    return {
      contact_id: matches[0].id,
      confidence: 0.6,
      match_type: 'name',
    };
  }

  return null;
}

/**
 * Fuzzy matching using string similarity
 */
function fuzzyMatchEmail(
  emailAddress: string,
  contacts: Contact[]
): ContactMatch | null {
  let bestMatch: ContactMatch | null = null;
  let bestScore = 0;

  for (const contact of contacts) {
    if (!contact.email) continue;

    const similarity = calculateSimilarity(
      emailAddress.toLowerCase(),
      contact.email.toLowerCase()
    );

    if (similarity > bestScore && similarity >= 0.7) {
      bestScore = similarity;
      bestMatch = {
        contact_id: contact.id,
        confidence: similarity * 0.8, // Reduce confidence for fuzzy matches
        match_type: 'fuzzy',
      };
    }
  }

  return bestMatch;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Batch match multiple email addresses to contacts
 */
export async function batchMatchEmailsToContacts(
  emailAddresses: string[],
  contacts: Contact[],
  options?: {
    includeDomainMatch?: boolean;
    includeNameMatch?: boolean;
    minConfidence?: number;
  }
): Promise<Record<string, ContactMatch | null>> {
  const matches: Record<string, ContactMatch | null> = {};

  for (const email of emailAddresses) {
    matches[email] = await matchEmailToContactWithConfidence(
      email,
      contacts,
      options
    );
  }

  return matches;
}

/**
 * Match email to deal by contact association
 */
export async function matchEmailToDeal(
  emailAddress: string,
  contactId: string | null,
  supabase: any
): Promise<string | null> {
  if (!contactId) {
    return null;
  }

  // Find active deals associated with the contact
  const { data: deals } = await supabase
    .from('deals')
    .select('id')
    .eq('contact_id', contactId)
    .is('actual_close_date', null) // Only active deals
    .order('created_at', { ascending: false })
    .limit(1);

  if (deals && deals.length > 0) {
    return deals[0].id;
  }

  return null;
}

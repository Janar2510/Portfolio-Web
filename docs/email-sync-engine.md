# Email Sync Engine

## Overview

The email sync engine provides automated email synchronization, thread grouping, and contact matching. It runs as a Supabase Edge Function and can be triggered manually or scheduled.

## Components

### 1. Edge Function: email-sync

**Location**: `supabase/functions/email-sync/index.ts`

Main sync function that processes email accounts and syncs emails.

**Features:**
- Syncs all active email accounts or a specific account
- Supports incremental and full sync
- Thread grouping
- Contact matching
- Deal association
- Sync state management

**Request Body:**
```json
{
  "account_id": "optional-account-id",
  "force_full_sync": false
}
```

**Response:**
```json
{
  "message": "Email sync completed",
  "results": [
    {
      "account_id": "uuid",
      "email_address": "user@example.com",
      "emails_synced": 25,
      "contacts_matched": 15,
      "threads_created": 8
    }
  ]
}
```

### 2. Sync Utilities

**Location**: `lib/email/sync.ts`

Core sync logic and thread grouping.

**Functions:**
- `generateThreadId()`: Creates thread ID from email metadata
- `normalizeSubject()`: Normalizes email subject for thread grouping
- `matchEmailToContact()`: Matches email address to contact
- `determineDirection()`: Determines if email is inbound or outbound
- `extractBodyPreview()`: Extracts text preview from HTML
- `groupEmailsIntoThreads()`: Groups emails into conversation threads
- `findOrCreateThreadId()`: Finds existing thread or creates new one

### 3. Contact Matching

**Location**: `lib/email/contact-matching.ts`

Advanced contact matching with confidence scoring.

**Features:**
- Exact email match (confidence: 1.0)
- Domain match (confidence: 0.7)
- Name-based match (confidence: 0.6)
- Fuzzy match (confidence: 0.5-0.8)
- Batch matching for multiple emails
- Deal association via contact

**Match Types:**
- **Exact**: Email address matches exactly
- **Domain**: Email domain matches contact's email domain
- **Name**: Name extracted from email local part matches contact name
- **Fuzzy**: String similarity matching using Levenshtein distance

## Thread Grouping

### Algorithm

1. **Normalize Subject**: Remove common prefixes (Re:, Fwd:, etc.)
2. **Extract Participants**: Get all email addresses (from + to)
3. **Generate Thread Key**: Combine normalized subject and sorted participants
4. **Hash Thread Key**: Create unique thread ID from hash
5. **Match Existing Threads**: Check if thread already exists in database

### Example

```
Email 1:
  Subject: "Project Update"
  From: alice@example.com
  To: bob@example.com

Email 2:
  Subject: "Re: Project Update"
  From: bob@example.com
  To: alice@example.com

Both emails get the same thread_id because:
- Normalized subject: "project update"
- Participants: ["alice@example.com", "bob@example.com"]
- Thread key: "project update|alice@example.com,bob@example.com"
```

## Contact Matching

### Matching Strategy

1. **Exact Match** (Highest Priority):
   - Email address matches contact email exactly
   - Confidence: 1.0

2. **Domain Match**:
   - Email domain matches contact's email domain
   - Only if single contact with that domain
   - Confidence: 0.7

3. **Name Match**:
   - Extract name from email local part (e.g., "john.doe" → "John Doe")
   - Match against contact first_name and last_name
   - Confidence: 0.6

4. **Fuzzy Match** (Lowest Priority):
   - String similarity using Levenshtein distance
   - Minimum similarity: 0.7
   - Confidence: similarity * 0.8

### Configuration

```typescript
const match = await matchEmailToContactWithConfidence(
  'john.doe@example.com',
  contacts,
  {
    includeDomainMatch: true,
    includeNameMatch: true,
    minConfidence: 0.5,
  }
);
```

## Sync Process

### Flow

1. **Fetch Active Accounts**:
   - Get all active email accounts or specific account
   - Load encrypted credentials

2. **Provider-Specific Sync**:
   - **Microsoft Graph**: Use OAuth tokens to fetch emails
   - **Apple IMAP**: Connect via IMAP and fetch emails

3. **Process Each Email**:
   - Generate/find thread ID
   - Determine direction (inbound/outbound)
   - Match to contact
   - Match to deal (via contact)
   - Extract body preview
   - Store in database

4. **Update Sync State**:
   - Update `last_sync_at` timestamp
   - Store sync cursor in `sync_state`
   - Track sync statistics

### Incremental vs Full Sync

- **Incremental Sync**: Only fetch emails since last sync
- **Full Sync**: Fetch all emails (ignores sync state)

## API Endpoints

### POST `/api/email/sync`

Trigger email synchronization.

**Request:**
```json
{
  "account_id": "optional-uuid",
  "force_full_sync": false
}
```

**Response:**
```json
{
  "message": "Email sync completed",
  "results": [...]
}
```

## Usage

### Manual Sync

```typescript
import { EmailService } from '@/lib/services/email';

const emailService = new EmailService();

// Sync specific account
await emailService.syncAccount(accountId);

// Sync all accounts
await emailService.syncAllAccounts();

// Force full sync
await emailService.triggerSync(accountId, true);
```

### Scheduled Sync

Set up a cron job to run the edge function periodically:

```sql
-- Using pg_cron extension
SELECT cron.schedule(
  'email-sync',
  '*/15 * * * *',  -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/email-sync',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

## Database Updates

### Email Accounts

After sync, `email_accounts` table is updated:
- `last_sync_at`: Timestamp of last sync
- `sync_state`: JSON object with sync cursor and metadata

### Emails

New emails are inserted with:
- `thread_id`: Generated or matched thread ID
- `contact_id`: Matched contact (if found)
- `deal_id`: Associated deal (if contact has active deal)
- `direction`: 'inbound' or 'outbound'
- `body_preview`: First 200 characters of email body

## Performance Considerations

1. **Batch Processing**: Process emails in batches to avoid timeouts
2. **Incremental Sync**: Use sync cursors to only fetch new emails
3. **Contact Caching**: Cache contacts for faster matching
4. **Thread Lookup**: Index thread_id for fast lookups
5. **Rate Limiting**: Respect provider rate limits

## Error Handling

- **Provider Errors**: Log and continue with next account
- **Decryption Errors**: Skip account and log error
- **Database Errors**: Retry with exponential backoff
- **Network Errors**: Retry up to 3 times

## Future Enhancements

- [ ] Real-time sync via webhooks
- [ ] Attachment syncing
- [ ] Email search indexing
- [ ] Smart thread merging
- [ ] Contact suggestion based on email patterns
- [ ] Deal probability scoring from email content
- [ ] Email sentiment analysis
- [ ] Automated tagging
- [ ] Email templates from thread history
- [ ] Multi-account thread grouping

## Security

1. **Credential Encryption**: All credentials encrypted at rest
2. **Service Key**: Edge function uses service role key (server-side only)
3. **RLS Enforcement**: All database operations respect RLS policies
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Error Logging**: Don't log sensitive credential information

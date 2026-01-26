/**
 * Apple Mail IMAP Provider
 *
 * Implements IMAP connection for Apple Mail/iCloud email
 */

import type { EmailProvider, SyncOptions, SendEmailOptions } from './base';
import { decryptCredentials, type IMAPCredentials } from '../encryption';
import type { Email } from '@/lib/services/email';

// Note: IMAP operations need to run server-side
// This is a client-side interface that will call API routes
export class AppleIMAPProvider implements EmailProvider {
  readonly name = 'apple';
  private credentials: IMAPCredentials | null = null;
  private emailAddress: string = '';

  async initialize(credentialsEncrypted: string): Promise<void> {
    const decrypted = await decryptCredentials(credentialsEncrypted);
    this.credentials = decrypted as unknown as IMAPCredentials;
    this.emailAddress = this.credentials.username;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test connection via API route
      const response = await fetch('/api/email/test-imap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentials: this.credentials,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Apple IMAP connection test failed:', error);
      return false;
    }
  }

  async syncEmails(options?: SyncOptions): Promise<Email[]> {
    if (!this.credentials) {
      throw new Error('Provider not initialized');
    }

    // Sync emails via API route (IMAP operations must run server-side)
    const response = await fetch('/api/email/sync-imap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentials: this.credentials,
        options,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync emails');
    }

    return response.json();
  }

  async sendEmail(options: SendEmailOptions): Promise<string> {
    if (!this.credentials) {
      throw new Error('Provider not initialized');
    }

    // Send email via API route (SMTP operations must run server-side)
    const response = await fetch('/api/email/send-imap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentials: this.credentials,
        email: options,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    const data = await response.json();
    return data.messageId || 'sent';
  }
}

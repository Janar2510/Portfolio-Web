/**
 * Base Provider Interface
 *
 * All email providers must implement this interface
 */

import type { Email } from '@/lib/services/email';

export interface EmailProvider {
  /**
   * Provider identifier
   */
  readonly name: string;

  /**
   * Initialize the provider with encrypted credentials
   */
  initialize(credentialsEncrypted: string): Promise<void>;

  /**
   * Test the connection
   */
  testConnection(): Promise<boolean>;

  /**
   * Sync emails from the provider
   */
  syncEmails(options?: SyncOptions): Promise<Email[]>;

  /**
   * Send an email
   */
  sendEmail(options: SendEmailOptions): Promise<string>;

  /**
   * Refresh OAuth tokens (if applicable)
   */
  refreshToken?(): Promise<void>;
}

export interface SyncOptions {
  since?: Date;
  limit?: number;
  folder?: string;
}

export interface SendEmailOptions {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyHtml?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

export interface SyncResult {
  emails: Email[];
  syncState: Record<string, unknown>;
  hasMore: boolean;
}

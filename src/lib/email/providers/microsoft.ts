/**
 * Microsoft Graph API Provider
 *
 * Implements OAuth 2.0 flow for Microsoft 365/Outlook email
 */

import type { EmailProvider, SyncOptions, SendEmailOptions } from './base';
import { decryptCredentials, type OAuthCredentials } from '../encryption';
import type { Email } from '@/domain/email/email';

interface MicrosoftGraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  body: {
    contentType: string;
    content: string;
  };
  from: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
  toRecipients: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
  }>;
  ccRecipients?: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
  }>;
  sentDateTime: string;
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  conversationId: string;
}

export class MicrosoftGraphProvider implements EmailProvider {
  readonly name = 'outlook';
  private credentials: OAuthCredentials | null = null;
  private emailAddress: string = '';

  async initialize(credentialsEncrypted: string): Promise<void> {
    const decrypted = await decryptCredentials(credentialsEncrypted);
    this.credentials = decrypted as unknown as OAuthCredentials;

    // Get user email from Microsoft Graph
    const user = await this.getUserProfile();
    this.emailAddress = user.mail || user.userPrincipalName;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getUserProfile();
      return true;
    } catch (error) {
      console.error('Microsoft Graph connection test failed:', error);
      return false;
    }
  }

  async syncEmails(options?: SyncOptions): Promise<Email[]> {
    if (!this.credentials) {
      throw new Error('Provider not initialized');
    }

    // Check if token needs refresh
    if (
      this.credentials.expires_at &&
      this.credentials.expires_at < Date.now()
    ) {
      await this.refreshToken();
    }

    const messages = await this.fetchMessages(options);
    return messages.map(msg => this.mapMessageToEmail(msg));
  }

  async sendEmail(options: SendEmailOptions): Promise<string> {
    if (!this.credentials) {
      throw new Error('Provider not initialized');
    }

    // Check if token needs refresh
    if (
      this.credentials.expires_at &&
      this.credentials.expires_at < Date.now()
    ) {
      await this.refreshToken();
    }

    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.credentials.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject: options.subject,
            body: {
              contentType: options.bodyHtml ? 'HTML' : 'Text',
              content: options.bodyHtml || options.body,
            },
            toRecipients: options.to.map(email => ({
              emailAddress: { address: email },
            })),
            ccRecipients: options.cc?.map(email => ({
              emailAddress: { address: email },
            })),
            bccRecipients: options.bcc?.map(email => ({
              emailAddress: { address: email },
            })),
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to send email: ${error.error?.message || 'Unknown error'}`
      );
    }

    // Microsoft Graph doesn't return the message ID immediately
    // We'll need to fetch it or use a different approach
    return 'sent';
  }

  async refreshToken(): Promise<void> {
    if (!this.credentials?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';

    if (!clientId || !clientSecret) {
      throw new Error('Microsoft OAuth credentials not configured');
    }

    const response = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: this.credentials.refresh_token,
          grant_type: 'refresh_token',
          scope:
            'https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/User.Read',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.credentials = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || this.credentials.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
      token_type: data.token_type,
    };
  }

  private async getUserProfile(): Promise<{
    mail: string;
    userPrincipalName: string;
  }> {
    if (!this.credentials) {
      throw new Error('Provider not initialized');
    }

    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${this.credentials.access_token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshToken();
        return this.getUserProfile();
      }
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  private async fetchMessages(
    options?: SyncOptions
  ): Promise<MicrosoftGraphMessage[]> {
    if (!this.credentials) {
      throw new Error('Provider not initialized');
    }

    let url =
      'https://graph.microsoft.com/v1.0/me/messages?$top=50&$orderby=receivedDateTime desc';

    if (options?.since) {
      url += `&$filter=receivedDateTime ge ${options.since.toISOString()}`;
    }

    if (options?.folder) {
      url = url.replace(
        '/me/messages',
        `/me/mailFolders/${options.folder}/messages`
      );
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.credentials.access_token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await this.refreshToken();
        return this.fetchMessages(options);
      }
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    return data.value || [];
  }

  private mapMessageToEmail(msg: MicrosoftGraphMessage): Email {
    return {
      id: '', // Will be set by the service
      account_id: '', // Will be set by the service
      external_id: msg.id,
      thread_id: msg.conversationId,
      contact_id: null,
      deal_id: null,
      direction: 'inbound', // Could be determined from sender
      subject: msg.subject || '',
      body_preview: msg.bodyPreview?.substring(0, 200) || null,
      body_html: msg.body.contentType === 'html' ? msg.body.content : null,
      from_address: msg.from.emailAddress.address,
      to_addresses: msg.toRecipients.map(r => r.emailAddress.address),
      cc_addresses: msg.ccRecipients?.map(r => r.emailAddress.address) || null,
      has_attachments: msg.hasAttachments,
      sent_at: msg.sentDateTime,
      received_at: msg.receivedDateTime,
      is_read: msg.isRead,
      created_at: new Date().toISOString(),
    };
  }
}

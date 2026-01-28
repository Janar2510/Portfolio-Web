/**
 * Sync Emails via IMAP
 *
 * Server-side route to sync emails using IMAP
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  decryptCredentials,
  type IMAPCredentials,
} from '@/lib/email/encryption';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

export async function POST(request: NextRequest) {
  try {
    const { credentials, options } = await request.json();

    if (!credentials) {
      return NextResponse.json(
        { error: 'Credentials are required' },
        { status: 400 }
      );
    }

    // Connect to IMAP
    const config = {
      imap: {
        user: credentials.username,
        password: credentials.password,
        host: credentials.host,
        port: credentials.port,
        tls: credentials.use_tls,
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false }, // Use with caution
      },
    };

    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const searchCriteria = ['UNSEEN'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    const emails = [];

    for (const message of messages) {
      const all = message.parts.find(part => part.which === '');
      const id = message.attributes.uid;
      const idHeader = 'Imap-Id: ' + id + '\r\n';

      if (all && all.body) {
        const parsed = await simpleParser(idHeader + all.body);
        emails.push({
          id: parsed.messageId,
          subject: parsed.subject,
          from: parsed.from?.text,
          to: Array.isArray(parsed.to)
            ? parsed.to.map(addr => addr.text)
            : [parsed.to?.text],
          date: parsed.date,
          text: parsed.text,
          html: parsed.html,
        });
      }
    }

    connection.end();

    return NextResponse.json(emails);
  } catch (error) {
    console.error('IMAP sync error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to sync emails',
      },
      { status: 500 }
    );
  }
}

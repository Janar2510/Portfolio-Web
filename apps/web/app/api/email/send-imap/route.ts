import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  decryptCredentials,
  type IMAPCredentials,
} from '@/lib/email/encryption';

export async function POST(request: NextRequest) {
  try {
    const { credentials, email } = await request.json();

    if (!credentials || !email) {
      return NextResponse.json(
        { error: 'Credentials and email are required' },
        { status: 400 }
      );
    }

    // credentials should be the decrypted IMAPCredentials (which include SMTP info)
    const transporter = nodemailer.createTransport({
      host: credentials.host,
      port: credentials.port,
      secure: credentials.use_tls,
      auth: {
        user: credentials.username,
        pass: credentials.password,
      },
    });

    const info = await transporter.sendMail({
      from: `"${credentials.displayName || credentials.username}" <${credentials.username}>`,
      to: email.to.join(', '),
      cc: email.cc?.join(', '),
      bcc: email.bcc?.join(', '),
      subject: email.subject,
      text: email.body,
      html: email.bodyHtml,
    });

    return NextResponse.json({ messageId: info.messageId });
  } catch (error) {
    console.error('SMTP send error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 }
    );
  }
}

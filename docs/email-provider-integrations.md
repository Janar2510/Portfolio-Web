# Email Provider Integrations

## Overview

The email module supports multiple email providers through a unified provider abstraction layer. Currently supported providers:

- **Microsoft 365/Outlook**: OAuth 2.0 via Microsoft Graph API
- **Apple Mail/iCloud**: IMAP/SMTP with credential-based authentication

## Architecture

### Provider Abstraction

All providers implement the `EmailProvider` interface:

```typescript
interface EmailProvider {
  readonly name: string;
  initialize(credentialsEncrypted: string): Promise<void>;
  testConnection(): Promise<boolean>;
  syncEmails(options?: SyncOptions): Promise<Email[]>;
  sendEmail(options: SendEmailOptions): Promise<string>;
  refreshToken?(): Promise<void>;
}
```

### Credential Encryption

All credentials are encrypted at rest using AES-GCM encryption:

- **Algorithm**: AES-GCM (256-bit)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Storage**: Encrypted credentials stored in `email_accounts.credentials_encrypted`
- **Key Management**: Encryption key stored in `EMAIL_ENCRYPTION_KEY` environment variable

## Microsoft Graph OAuth Flow

### Setup

1. **Register Application in Azure AD**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to Azure Active Directory → App registrations
   - Create new registration
   - Set redirect URI: `https://yourdomain.com/api/email/oauth/microsoft/callback`
   - Add API permissions:
     - `Mail.ReadWrite`
     - `User.Read`
     - `offline_access`

2. **Environment Variables**:
```env
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=common  # or your tenant ID
MICROSOFT_REDIRECT_URI=https://yourdomain.com/api/email/oauth/microsoft/callback
```

### OAuth Flow

1. User clicks "Connect Microsoft" button
2. Redirects to `/api/email/oauth/microsoft`
3. User authenticates with Microsoft
4. Microsoft redirects to `/api/email/oauth/microsoft/callback` with authorization code
5. Server exchanges code for access/refresh tokens
6. Tokens are encrypted and stored in database
7. User is redirected back to accounts page

### Token Refresh

The provider automatically refreshes tokens when they expire:

- Checks `expires_at` before each API call
- Uses `refresh_token` to get new `access_token`
- Updates encrypted credentials in database

### API Endpoints

- **GET `/api/email/oauth/microsoft`**: Initiates OAuth flow
- **GET `/api/email/oauth/microsoft/callback`**: Handles OAuth callback

## Apple Mail IMAP Connection

### Setup

1. **Enable App-Specific Password**:
   - User must generate an app-specific password from Apple ID settings
   - Regular password won't work with IMAP

2. **IMAP Settings**:
   - Host: `imap.mail.me.com`
   - Port: `993`
   - TLS: Enabled
   - Username: iCloud email address
   - Password: App-specific password

3. **SMTP Settings** (for sending):
   - Host: `smtp.mail.me.com`
   - Port: `587`
   - TLS: Enabled

### Connection Flow

1. User enters email and app-specific password
2. Credentials are encrypted client-side
3. Encrypted credentials sent to `/api/email/connect-apple`
4. Server stores encrypted credentials
5. Connection tested via `/api/email/test-imap`

### API Endpoints

- **POST `/api/email/connect-apple`**: Stores encrypted IMAP credentials
- **POST `/api/email/test-imap`**: Tests IMAP connection
- **POST `/api/email/sync-imap`**: Syncs emails via IMAP
- **POST `/api/email/send-imap`**: Sends email via SMTP

## Credential Encryption

### Implementation

Credentials are encrypted using Web Crypto API (browser) or Node.js crypto (server):

```typescript
// Encrypt
const encrypted = await encryptCredentials({
  access_token: '...',
  refresh_token: '...',
  expires_at: 1234567890,
});

// Decrypt
const credentials = await decryptCredentials(encrypted);
```

### Security Considerations

1. **Key Management**:
   - Use environment variables for encryption key
   - In production, use a key management service (KMS)
   - Consider using Supabase Vault for key storage

2. **Key Rotation**:
   - Implement key rotation strategy
   - Re-encrypt credentials when key changes

3. **Access Control**:
   - Credentials only accessible to account owner
   - RLS policies enforce access control
   - Never log decrypted credentials

## Provider Factory

The provider factory creates provider instances:

```typescript
import { createProvider } from '@/lib/email/providers';

const provider = createProvider('outlook');
await provider.initialize(encryptedCredentials);
const emails = await provider.syncEmails();
```

## UI Components

### Email Accounts Page

**Route**: `/email/accounts`

**Features**:
- List all connected email accounts
- Connect Microsoft account (OAuth)
- Connect Apple Mail account (IMAP)
- Toggle account active/inactive
- Delete accounts
- View last sync time

**Components**:
- Account list with status indicators
- Microsoft OAuth connection button
- Apple Mail connection dialog
- Account management actions

## Environment Variables

```env
# Encryption
EMAIL_ENCRYPTION_KEY=your-encryption-key-change-in-production

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=https://yourdomain.com/api/email/oauth/microsoft/callback
```

## Future Enhancements

- [ ] Gmail OAuth integration
- [ ] Yahoo Mail IMAP support
- [ ] Custom IMAP/SMTP server support
- [ ] OAuth token refresh automation
- [ ] Email sync scheduling
- [ ] Batch email operations
- [ ] Email search and filtering
- [ ] Attachment handling
- [ ] Email threading
- [ ] Read receipts
- [ ] Email templates integration
- [ ] Email analytics

## Security Best Practices

1. **Never store credentials in plain text**
2. **Use HTTPS for all API calls**
3. **Implement rate limiting on OAuth endpoints**
4. **Validate OAuth state parameter**
5. **Use secure cookies for OAuth state**
6. **Rotate encryption keys regularly**
7. **Monitor for suspicious activity**
8. **Implement credential expiration**
9. **Use app-specific passwords for IMAP**
10. **Regular security audits**

## Troubleshooting

### Microsoft OAuth Issues

- **Invalid redirect URI**: Ensure redirect URI matches Azure AD configuration
- **Token refresh fails**: Check client secret and refresh token validity
- **Permission denied**: Verify API permissions in Azure AD

### Apple IMAP Issues

- **Connection refused**: Verify app-specific password is used
- **Authentication failed**: Check username and password
- **TLS errors**: Ensure TLS is enabled and port 993 is used

### Encryption Issues

- **Decryption fails**: Verify encryption key matches
- **Key not found**: Check environment variable is set
- **Browser compatibility**: Ensure Web Crypto API is supported

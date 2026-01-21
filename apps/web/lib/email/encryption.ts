/**
 * Credential Encryption Utilities
 * 
 * Uses Web Crypto API (browser) or Node.js crypto (server) for encryption/decryption.
 * Credentials are encrypted at rest in the database.
 */

// Encryption key should be stored in environment variable
// In production, use a key management service (KMS) or Supabase Vault
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'default-key-change-in-production';

// Check if we're in Node.js environment
function isNodeEnv(): boolean {
  return typeof process !== 'undefined' && !!process.versions?.node;
}

async function getCrypto(): Promise<Crypto> {
  if (isNodeEnv()) {
    const crypto = await import('crypto');
    return (crypto.webcrypto || globalThis.crypto) as Crypto;
  }
  return globalThis.crypto;
}

/**
 * Derives a key from the encryption key string
 */
async function deriveKey(keyString: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString);
  const crypto = await getCrypto();
  
  // Import the key material
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive a key for AES-GCM
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('email-credentials-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts credentials using AES-GCM
 */
export async function encryptCredentials(
  credentials: Record<string, unknown>
): Promise<string> {
  try {
    const crypto = await getCrypto();
    const key = await deriveKey(ENCRYPTION_KEY);
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(credentials));

    // Generate a random IV (initialization vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    if (isNodeEnv()) {
      const { Buffer } = await import('buffer');
      return Buffer.from(combined).toString('base64');
    }
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt credentials');
  }
}

/**
 * Decrypts credentials using AES-GCM
 */
export async function decryptCredentials(
  encryptedData: string
): Promise<Record<string, unknown>> {
  try {
    const crypto = await getCrypto();
    const key = await deriveKey(ENCRYPTION_KEY);
    
    // Decode from base64
    let combined: Uint8Array;
    if (isNodeEnv()) {
      const { Buffer } = await import('buffer');
      combined = new Uint8Array(Buffer.from(encryptedData, 'base64'));
    } else {
      combined = Uint8Array.from(
        atob(encryptedData),
        (c) => c.charCodeAt(0)
      );
    }

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    // Convert back to JSON
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decrypted);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt credentials');
  }
}

/**
 * Type-safe credential interfaces
 */
export interface OAuthCredentials {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
}

export interface IMAPCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
  use_tls: boolean;
}

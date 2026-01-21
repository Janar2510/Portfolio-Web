/**
 * Email Provider Factory
 * 
 * Creates and manages email provider instances
 */

import { MicrosoftGraphProvider } from './microsoft';
import { AppleIMAPProvider } from './apple';
import type { EmailProvider } from './base';
import type { EmailProvider as ProviderType } from '@/lib/services/email';

export function createProvider(provider: ProviderType): EmailProvider {
  switch (provider) {
    case 'outlook':
      return new MicrosoftGraphProvider();
    case 'apple':
      return new AppleIMAPProvider();
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export { MicrosoftGraphProvider } from './microsoft';
export { AppleIMAPProvider } from './apple';
export type { EmailProvider, SyncOptions, SendEmailOptions } from './base';

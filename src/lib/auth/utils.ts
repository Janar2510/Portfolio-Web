import { createClient } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

export function getAuthErrorMessage(error: AuthError | Error | null): string {
  if (!error) return 'An unknown error occurred';

  // Handle Supabase auth errors
  if ('message' in error) {
    const message = error.message.toLowerCase();
    const status = 'status' in error ? error.status : null;

    // Handle 401 Unauthorized specifically
    if (status === 401) {
      if (message.includes('signup') || message.includes('sign up')) {
        return 'Unable to create account. Please check your email and password, or try signing in if you already have an account.';
      }
      if (message.includes('login') || message.includes('sign in')) {
        return 'Invalid email or password. Please check your credentials and try again.';
      }
      return 'Authentication failed. Please check your credentials.';
    }

    if (message.includes('email') && message.includes('already registered')) {
      return 'This email is already registered. Please sign in instead.';
    }

    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }

    if (message.includes('email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }

    if (message.includes('password')) {
      return 'Password is too weak. Please use a stronger password.';
    }

    if (message.includes('token') || message.includes('expired')) {
      return 'This link has expired. Please request a new one.';
    }

    if (message.includes('invalid')) {
      return 'Invalid request. Please try again.';
    }
  }

  return error.message || 'An error occurred';
}

export function isEmailNotConfirmedError(
  error: AuthError | Error | null
): boolean {
  if (!error || !('message' in error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('email not confirmed') ||
    message.includes('email_not_confirmed')
  );
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

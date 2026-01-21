'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { getAuthErrorMessage } from '@/lib/auth/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function VerifyEmailPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleResend = async () => {
    setError(null);
    setLoading(true);

    if (!email) {
      setError(t('errors.emailRequired'));
      setLoading(false);
      return;
    }

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        setError(getAuthErrorMessage(resendError));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(t('errors.unknownError'));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('emailVerification')}</CardTitle>
          <CardDescription>{t('checkEmail')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
              {t('verificationSent')}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            We've sent a verification email to <strong>{email}</strong>. Please click
            the link in the email to verify your account.
          </p>
          <p className="text-sm text-muted-foreground">
            If you didn't receive the email, check your spam folder or click the
            button below to resend it.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleResend}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Loading...' : t('resendVerification')}
          </Button>
          <Link href="/sign-in" className="text-sm text-primary hover:underline">
            {t('backToSignIn')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

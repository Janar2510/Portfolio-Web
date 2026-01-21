'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { getAuthErrorMessage, validateEmail, isEmailNotConfirmedError } from '@/lib/auth/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SignInPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ message: string; isUnconfirmed: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check Supabase configuration on mount
  const [configError, setConfigError] = useState<string | null>(null);
  
  // Initialize Supabase client - use a function to get it safely
  const getSupabaseClient = () => {
    try {
      return createClient();
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  };
  
  // Check configuration on component mount
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      setConfigError('Supabase is not configured. Please check your environment variables.');
    } else if (key.length < 100) {
      setConfigError('Supabase API key appears to be invalid or incomplete.');
    }
  }, []);

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResending(true);
    setError(null);
    setErrorDetails(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Configuration error. Please refresh the page.');
      setResending(false);
      return;
    }

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        setError(getAuthErrorMessage(resendError));
      } else {
        setError(null);
        setErrorDetails(null);
        // Show success message
        alert('Verification email sent! Please check your inbox.');
      }
    } catch (err) {
      setError(t('errors.unknownError'));
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any event bubbling
    setError(null);
    setErrorDetails(null);
    setLoading(true);

    // Check Supabase configuration first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setError('Configuration error: Supabase credentials are missing. Please check your environment variables.');
      setLoading(false);
      console.error('Missing Supabase config:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey });
      return;
    }

    if (!validateEmail(email)) {
      setError(t('errors.invalidEmail'));
      setLoading(false);
      return;
    }

    if (!password) {
      setError(t('errors.passwordRequired'));
      setLoading(false);
      return;
    }

    // Get Supabase client
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client is not initialized');
      setError('Configuration error. Please refresh the page and try again. If the problem persists, check your Supabase environment variables.');
      setLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      console.error('Sign in request timed out after 30 seconds');
      setError('Request timed out. Please check your internet connection and try again.');
      setLoading(false);
    }, 30000);

    try {
      console.log('Attempting sign in for:', email);
      console.log('Supabase URL:', supabaseUrl?.substring(0, 50) || 'MISSING');
      
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error: signInError } = await signInPromise;

      // Clear timeout if request completes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      console.log('Sign in response received:', { 
        hasData: !!data, 
        hasError: !!signInError,
        hasSession: !!data?.session,
        errorMessage: signInError?.message,
        errorStatus: signInError ? ('status' in signInError ? signInError.status : 'unknown') : null
      });

      if (signInError) {
        console.error('Sign in error details:', signInError);
        const errorMessage = getAuthErrorMessage(signInError);
        const isUnconfirmed = isEmailNotConfirmedError(signInError);
        setError(errorMessage);
        setErrorDetails({ message: errorMessage, isUnconfirmed });
        setLoading(false);
        return;
      }

      if (data?.session) {
        console.log('Session created successfully:', {
          userId: data.session.user.id,
          expiresAt: data.session.expires_at,
          accessToken: data.session.access_token ? 'present' : 'missing'
        });
        
        // Verify session is stored
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        if (!verifySession) {
          console.error('WARNING: Session was created but not stored!');
          setError('Session was created but could not be stored. Please try again.');
          setLoading(false);
          return;
        }
        
        console.log('Session verified, ensuring cookies are set before redirect...');
        
        // Give Supabase time to set cookies (createBrowserClient handles this automatically)
        // Wait a bit longer to ensure cookies are written to the browser
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Double-check session is still available
        const { data: { session: finalCheck } } = await supabase.auth.getSession();
        if (!finalCheck) {
          console.error('Session lost after wait!');
          setError('Session was lost. Please try again.');
          setLoading(false);
          return;
        }
        
        console.log('Final session check passed, redirecting...');
        
        const redirectUrl = `/${locale}/dashboard`;
        const fullUrl = `${window.location.origin}${redirectUrl}`;
        
        console.log('Redirecting to:', redirectUrl);
        console.log('Full URL:', fullUrl);
        console.log('Cookies confirmed:', document.cookie.includes('sb-pcltfprbgwqmymmveloj'));
        
        // Wait a bit longer to ensure cookies are fully written and available
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify cookies one more time
        const finalCookies = document.cookie;
        const hasAuthCookie = finalCookies.includes('sb-pcltfprbgwqmymmveloj-auth-token');
        console.log('Final cookie check:', { hasAuthCookie, cookieLength: finalCookies.length });
        
        if (!hasAuthCookie) {
          console.error('Auth cookie missing after wait!');
          setError('Session cookie was not set. Please try again.');
          setLoading(false);
          return;
        }
        
        // Reset loading state
        setLoading(false);
        
        // Redirect - cookies should now be available for middleware
        console.log('Executing final redirect to:', fullUrl);
        window.location.href = fullUrl;
        
        // Return immediately
        return;
      } else {
        // No session but no error - this shouldn't happen, but handle it
        console.error('Sign in succeeded but no session was returned', data);
        setError('Sign in succeeded but no session was created. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      console.error('Sign in exception:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || t('errors.unknownError'));
      setErrorDetails(null);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('signIn')}</CardTitle>
          <CardDescription>{t('signInToAccount')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {configError && (
              <div className="rounded-md bg-yellow-500/15 p-3 text-sm text-yellow-600 dark:text-yellow-400">
                <p className="font-semibold">Configuration Error:</p>
                <p>{configError}</p>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive space-y-2">
                <p>{error}</p>
                {errorDetails?.isUnconfirmed && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Need to resend the verification email?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resending || !email}
                      className="w-full"
                    >
                      {resending ? 'Sending...' : 'Resend Verification Email'}
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : t('signIn')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('dontHaveAccount')}{' '}
              <Link href="/sign-up" className="text-primary hover:underline">
                {t('signUp')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import {
  getAuthErrorMessage,
  validateEmail,
  isEmailNotConfirmedError,
} from '@/lib/auth/utils';
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

import { ImageSlider } from '@/components/ui/ImageSlider';
import { motion } from 'framer-motion';

const sliderImages = [
  '/templates/editorial-minimal-hero.png',
  '/templates/playful-pop-hero.png',
  '/templates/system-root-hero.png',
  '/templates/system-root-hero-v2.png',
];

export default function SignInPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    isUnconfirmed: boolean;
  } | null>(null);
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
      setConfigError(
        'Supabase is not configured. Please check your environment variables.'
      );
    } else if (key && key.length < 100) {
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
      setError(
        'Configuration error: Supabase credentials are missing. Please check your environment variables.'
      );
      setLoading(false);
      console.error('Missing Supabase config:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
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
      setError(
        'Configuration error. Please refresh the page and try again. If the problem persists, check your Supabase environment variables.'
      );
      setLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      console.error('Sign in request timed out after 30 seconds');
      setError(
        'Request timed out. Please check your internet connection and try again.'
      );
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
        errorStatus: signInError
          ? 'status' in signInError
            ? signInError.status
            : 'unknown'
          : null,
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
          accessToken: data.session.access_token ? 'present' : 'missing',
        });

        // Verify session is stored
        const {
          data: { session: verifySession },
        } = await supabase.auth.getSession();
        if (!verifySession) {
          console.error('WARNING: Session was created but not stored!');
          setError(
            'Session was created but could not be stored. Please try again.'
          );
          setLoading(false);
          return;
        }

        console.log(
          'Session verified, ensuring cookies are set before redirect...'
        );

        // Give Supabase time to set cookies (createBrowserClient handles this automatically)
        await new Promise(resolve => setTimeout(resolve, 300));

        // Double-check session is still available
        const {
          data: { session: finalCheck },
        } = await supabase.auth.getSession();
        if (!finalCheck) {
          console.error('Session lost after wait!');
          setError('Session was lost. Please try again.');
          setLoading(false);
          return;
        }

        console.log('Final session check passed, redirecting...');

        const redirectUrl = `/${locale}/dashboard`;
        const fullUrl = `${window.location.origin}${redirectUrl}`;

        // Wait a bit longer to ensure cookies are fully written
        await new Promise(resolve => setTimeout(resolve, 500));

        // Reset loading state
        setLoading(false);

        // Redirect
        window.location.href = fullUrl;
        return;
      } else {
        console.error('Sign in succeeded but no session was returned', data);
        setError(
          'Sign in succeeded but no session was created. Please try again.'
        );
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
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Left Column: Image Slider (Visible on large screens) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-7/12 relative">
        <ImageSlider images={sliderImages} className="h-full w-full" />
        <div className="absolute inset-0 bg-navy-deep/20 z-[5]" />
        <div className="absolute top-1/2 left-12 -translate-y-1/2 z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h1 className="text-5xl font-display font-bold text-white mb-6 drop-shadow-lg leading-tight">
              Transforming portolios into{' '}
              <span className="text-secondary">digital experiences</span>.
            </h1>
            <p className="text-xl text-white/90 drop-shadow-md">
              Join thousands of stylists and creators building their
              professional presence with our editorial-grade tools.
            </p>
          </motion.div>
        </div>

        {/* Logo/Brand Name */}
        <div className="absolute top-10 left-12 z-20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg">
            <span className="text-navy-deep font-bold text-xl">S</span>
          </div>
          <span className="text-white font-display font-bold text-2xl tracking-tight">
            Supale
          </span>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-20 bg-background relative">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg">
                <span className="text-navy-deep font-bold text-xl">S</span>
              </div>
              <span className="text-foreground font-display font-bold text-2xl tracking-tight">
                Supale
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-display font-bold tracking-tight">
                {t('signIn')}
              </h2>
              <p className="text-muted-foreground">{t('signInToAccount')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {configError && (
                <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                  <p className="font-semibold mb-1">Configuration Required</p>
                  <p>{configError}</p>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 space-y-3"
                >
                  <p className="font-medium">{error}</p>
                  {errorDetails?.isUnconfirmed && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resending || !email}
                      className="w-full bg-background"
                    >
                      {resending ? 'Sending...' : 'Resend Verification Email'}
                    </Button>
                  )}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="h-12 px-4 rounded-xl border-border bg-muted/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
                    >
                      {t('forgotPassword')}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="h-12 px-4 rounded-xl border-border bg-muted/50 focus:bg-background transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-white font-semibold shadow-lg shadow-navy-deep/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#0F172A] hover:bg-[#1e293b]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  t('signIn')
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {t('dontHaveAccount')}{' '}
                <Link
                  href="/sign-up"
                  className="font-semibold text-secondary hover:underline underline-offset-4"
                >
                  {t('signUp')}
                </Link>
              </p>
            </form>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-8 text-center text-xs text-muted-foreground w-full px-8">
          &copy; {new Date().getFullYear()} Supale. All rights reserved.
        </div>
      </div>
    </div>
  );
}

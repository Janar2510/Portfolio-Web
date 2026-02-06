'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
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

import { GradientButton } from '@/components/ui/gradient-button';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

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
  const searchParams = useSearchParams();
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

    // Check for error parameters in URL (from auth callback redirects)
    const errorParam = searchParams.get('error');
    const errorDescParam = searchParams.get('error_description');

    if (errorParam && errorDescParam) {
      setError(errorDescParam);
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      newUrl.searchParams.delete('error_description');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

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


        // Reset loading state
        setLoading(false);

        // Get 'next' param from CURRENT URL search params (not the redirect url)
        // Note: we already imported useSearchParams at top level
        const nextParam = searchParams.get('next');

        // Validate next param:
        // 1. Must exist
        // 2. Must start with '/' (relative)
        // 3. Must NOT start with '//' (protocol relative - open redirect)
        // 4. Must include `/${locale}/` prefix OR start with `/${locale}` routes
        // 5. Must NOT include '/sign-in' (redirect loop)
        const isValidNext = nextParam &&
          nextParam.startsWith('/') &&
          !nextParam.startsWith('//') &&
          (nextParam.startsWith(`/${locale}`) || nextParam.startsWith('/')) &&
          !nextParam.includes('/sign-in');

        const safeNext = isValidNext ? nextParam : `/${locale}/builder/sites`;

        // HOTFIX: Safari SSR Cookie Sync
        // We explicitly hit the callback route to force an SSR session refresh
        // before the client-side navigation happens. This ensures cookies are ready.
        try {
          console.log('Syncing session with server...');
          await fetch(`/${locale}/auth/callback?next=${encodeURIComponent(safeNext)}`, {
            method: 'GET',
            cache: 'no-store',
            credentials: 'include', // Critical: sends cookies
          });
          console.log('Session synced.');
        } catch (e) {
          console.error('Session sync failed (non-fatal):', e);
        }

        // window.location.href handles relative paths correctly by appending to origin
        console.log('Redirecting to:', safeNext);
        window.location.href = safeNext;
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
      {/* Left Column: Visual Area (Visible on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative bg-[#0B0F19] items-center justify-center overflow-hidden">
        {/* Ambient Glows from HowItWorksSection */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        {/* Brand Name / Logo */}
        <div className="absolute top-10 left-12 z-20 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl font-display">S</span>
          </div>
          <span className="text-white font-display font-bold text-2xl tracking-tight">
            Supale
          </span>
        </div>

        <div className="relative z-10 max-w-xl px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl xl:text-7xl font-display font-bold text-white mb-8 leading-[1.1] tracking-tighter">
              Build your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Professional Face.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              The all-in-one platform for creatives to showcase work, manage clients, and grow their professional brand.
            </p>
          </motion.div>
        </div>

        {/* Decorative glass elements */}
        <div className="absolute bottom-20 left-12 right-12 flex gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-1 bg-white/5 rounded-full flex-1 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "linear" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 bg-[#0B0F19] relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-12">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl font-display">S</span>
              </div>
              <span className="text-white font-display font-bold text-2xl tracking-tight">
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
              <h2 className="text-4xl font-display font-bold tracking-tight text-white">
                {t('signIn')}
              </h2>
              <p className="text-muted-foreground font-light">{t('signInToAccount')}</p>
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
                  <Label htmlFor="email" className="text-sm font-medium text-white/70">
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
                    className="h-12 px-4 rounded-xl border-white/10 bg-white/5 focus:bg-white/10 text-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white/70">{t('password')}</Label>
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
                    className="h-12 px-4 rounded-xl border-white/10 bg-white/5 focus:bg-white/10 text-white transition-all"
                  />
                </div>
              </div>

              <GradientButton
                type="submit"
                className="w-full h-12 rounded-xl text-white font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_30px_-5px_hsl(var(--primary))]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  t('signIn')
                )}
              </GradientButton>

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

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import {
  getAuthErrorMessage,
  validateEmail,
  validatePassword,
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

const sliderImages = [
  '/templates/editorial-minimal-hero.png',
  '/templates/playful-pop-hero.png',
  '/templates/system-root-hero.png',
  '/templates/system-root-hero-v2.png',
];

export default function SignUpPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'en';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!validateEmail(email)) {
      setError(t('errors.invalidEmail'));
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0]);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('errors.passwordsDontMatch'));
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${currentLocale}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(getAuthErrorMessage(signUpError));
        setLoading(false);
        return;
      }

      if (data.user) {
        // Redirect to email verification page
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError(t('errors.unknownError'));
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
              Start your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Creative Journey.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              Join thousands of creatives building their professional presence with our editorial-grade tools. No coding required.
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

      {/* Right Column: Sign Up Form */}
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
                {t('signUp')}
              </h2>
              <p className="text-muted-foreground font-light">{t('createNewAccount')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20"
                >
                  {error}
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
                  <Label htmlFor="password" className="text-white/70">{t('password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="h-12 px-4 rounded-xl border-white/10 bg-white/5 focus:bg-white/10 text-white transition-all"
                  />
                  <p className="text-xs text-muted-foreground px-1">
                    Must be at least 8 characters with uppercase, lowercase, and
                    a number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/70">
                    {t('confirmPassword')}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
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
                    <span>Creating account...</span>
                  </div>
                ) : (
                  t('createAccount')
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
                {t('alreadyHaveAccount')}{' '}
                <Link
                  href="/sign-in"
                  className="font-semibold text-secondary hover:underline underline-offset-4"
                >
                  {t('signIn')}
                </Link>
              </p>
            </form>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-8 text-center text-xs text-muted-foreground w-full px-8">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { ProfileService } from '@/lib/services/profile';
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

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Tallinn',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function OnboardingPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [locale, setLocale] = useState<'en' | 'et'>('en');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const supabase = createClient();
  const profileService = new ProfileService();

  useEffect(() => {
    // Check if user is authenticated and if onboarding is already completed
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/sign-in');
        return;
      }

      try {
        const profile = await profileService.getProfile();
        if (profile?.onboarding_completed) {
          router.push('/dashboard');
          return;
        }

        // Pre-fill with existing data if available
        if (profile) {
          setDisplayName(profile.display_name || '');
          setTimezone(profile.timezone || 'UTC');
          setLocale(profile.locale || 'en');
        }
      } catch (err) {
        console.error('Error checking profile:', err);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!displayName.trim()) {
      setError(t('errors.displayNameRequired'));
      setLoading(false);
      return;
    }

    try {
      await profileService.updateProfile({
        display_name: displayName.trim(),
        timezone,
        locale,
        onboarding_completed: true,
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(t('errors.unknownError'));
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await profileService.updateProfile({
        onboarding_completed: true,
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error skipping onboarding:', err);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('onboarding')}</CardTitle>
          <CardDescription>{t('completeProfile')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('displayName')}</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t('timezone')}</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locale">{t('locale')}</Label>
              <select
                id="locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'en' | 'et')}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="en">English</option>
                <option value="et">Eesti</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('continue')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleSkip}
              disabled={loading}
            >
              {t('skip')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

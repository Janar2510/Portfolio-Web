'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function OnboardingCompletePage() {
  const t = useTranslations('onboarding.complete');
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            {/* Celebration Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-success-main/10 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-success-main" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{t('title')}</h1>
              <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
            </div>

            {/* Next Steps */}
            <div className="mt-8 space-y-4">
              <h2 className="text-lg font-semibold">{t('nextSteps')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">{t('tips.addPages')}</h3>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">
                    {t('tips.createProject')}
                  </h3>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">{t('tips.addContact')}</h3>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">{t('tips.connectEmail')}</h3>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  {t('goToDashboard')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild>
                <Link href="/portfolio">
                  {t('viewSite')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

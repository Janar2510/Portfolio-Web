'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

interface PublishStepProps {
  onPublish: () => void;
  onSkip?: () => void;
}

export function PublishStep({ onPublish, onSkip }: PublishStepProps) {
  const t = useTranslations('onboarding.publish');
  const router = useRouter();
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop'
  );

  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  const publishMutation = useMutation({
    mutationFn: async () => {
      const site = await portfolioService.getSite();
      if (!site) throw new Error('No site found');
      return await portfolioService.updateSite(site.id, {
        is_published: true,
      });
    },
    onSuccess: () => {
      router.push('/onboarding/complete');
    },
  });

  const handlePublish = async () => {
    await publishMutation.mutateAsync();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Preview Section */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Device Toggle */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={deviceView === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceView('desktop')}
          >
            <Monitor className="mr-2 h-4 w-4" />
            {t('devices.desktop')}
          </Button>
          <Button
            variant={deviceView === 'tablet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceView('tablet')}
          >
            <Tablet className="mr-2 h-4 w-4" />
            {t('devices.tablet')}
          </Button>
          <Button
            variant={deviceView === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceView('mobile')}
          >
            <Smartphone className="mr-2 h-4 w-4" />
            {t('devices.mobile')}
          </Button>
        </div>

        {/* Preview Frame */}
        <Card>
          <CardContent className="p-8">
            <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
              <p className="text-muted-foreground">{t('preview')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t('checklist.title')}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-main" />
                <span>{t('checklist.profile')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-main" />
                <span>{t('checklist.template')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-main" />
                <span>{t('checklist.styles')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-main" />
                <span>{t('checklist.content')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" onClick={onSkip}>
            {t('publishLater')}
          </Button>
          <Button
            size="lg"
            onClick={handlePublish}
            disabled={publishMutation.isPending}
            className="min-w-[200px]"
          >
            {publishMutation.isPending ? 'Publishing...' : t('publishNow')}
          </Button>
        </div>
      </div>
    </div>
  );
}

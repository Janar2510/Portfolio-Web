'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ContentStepProps {
  onContinue: () => void;
  onSkip?: () => void;
}

export function ContentStep({ onContinue, onSkip }: ContentStepProps) {
  const t = useTranslations('onboarding.content');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [bio, setBio] = useState('');

  const handleContinue = () => {
    // TODO: Save content to portfolio blocks
    onContinue();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Hero Title */}
        <div className="space-y-2">
          <Label htmlFor="heroTitle">{t('heroTitle')}</Label>
          <Input
            id="heroTitle"
            value={heroTitle}
            onChange={e => setHeroTitle(e.target.value)}
            placeholder={t('heroTitlePlaceholder')}
          />
        </div>

        {/* Hero Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="heroSubtitle">{t('heroSubtitle')}</Label>
          <Input
            id="heroSubtitle"
            value={heroSubtitle}
            onChange={e => setHeroSubtitle(e.target.value)}
            placeholder={t('heroSubtitlePlaceholder')}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">{t('bio')}</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder={t('bioPlaceholder')}
            rows={4}
          />
        </div>

        {/* Use Placeholder Option */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={onContinue}>
            {t('usePlaceholder')}
          </Button>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={handleContinue} className="min-w-[200px]">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

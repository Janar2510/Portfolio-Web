'use client';

import { ReactNode } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onSkip?: () => void;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  onSkip,
}: OnboardingLayoutProps) {
  const t = useTranslations('onboarding.navigation');
  const router = useRouter();

  const handleSkipAll = () => {
    if (onSkip) {
      onSkip();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-lg">Portfolio</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleSkipAll}>
              {t('skipAll')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipAll}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}

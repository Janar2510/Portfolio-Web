'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  canGoBack?: boolean;
  canSkip?: boolean;
  nextLabel?: string;
  isLoading?: boolean;
}

export function OnboardingNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  canGoBack = true,
  canSkip = true,
  nextLabel,
  isLoading = false,
}: OnboardingNavigationProps) {
  const t = useTranslations('onboarding.navigation');
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between border-t border-border bg-card/50 backdrop-blur-sm px-6 py-4 mt-8">
      <div className="flex items-center gap-2">
        {!isFirstStep && canGoBack && onBack && (
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {canSkip && onSkip && !isLastStep && (
          <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
            {t('skip')}
          </Button>
        )}
        <Button onClick={onNext} disabled={isLoading}>
          {nextLabel || (isLastStep ? t('finish') : t('continue'))}
          {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

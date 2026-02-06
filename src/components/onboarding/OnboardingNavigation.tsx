'use client';

import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
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
    <div className="flex items-center justify-between px-0 py-8 mt-12 border-t border-white/5">
      <div className="flex items-center gap-2">
        {!isFirstStep && canGoBack && onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isLoading}
            className="text-white/60 hover:text-white hover:bg-white/5 px-6"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {canSkip && onSkip && !isLastStep && (
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={isLoading}
            className="text-white/40 hover:text-white hover:bg-white/5"
          >
            {t('skip')}
          </Button>
        )}
        <GradientButton
          onClick={onNext}
          disabled={isLoading}
          className="min-w-[160px] shadow-lg shadow-primary/20"
        >
          {nextLabel || (isLastStep ? t('finish') : t('continue'))}
          {!isLastStep && <ChevronRight className="ml-2 h-5 w-5" />}
        </GradientButton>
      </div>
    </div>
  );
}

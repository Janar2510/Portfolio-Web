'use client';

import { useTranslations } from 'next-intl';
import { ONBOARDING_STEPS } from '@/lib/onboarding/steps';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  const t = useTranslations('onboarding.progress');
  // Get locale from next-intl
  const locale = typeof window !== 'undefined' 
    ? window.location.pathname.split('/')[1] === 'et' ? 'et' : 'en'
    : 'en';

  const completedSteps = currentStep - 1;
  const percentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="px-6 py-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-3">
        {ONBOARDING_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all',
                    isCompleted
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : isCurrent
                      ? 'bg-primary-100 border-primary-500 text-primary-700 animate-pulse'
                      : 'bg-background border-border text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{stepNumber}</span>
                  )}
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 transition-all',
                      isCompleted ? 'bg-primary-500' : 'bg-border'
                    )}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Labels */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {ONBOARDING_STEPS.map((step) => {
          const stepNumber = step.number;
          const isCurrent = stepNumber === currentStep;
          return (
            <div
              key={step.id}
              className={cn(
                'text-center flex-1',
                isCurrent && 'text-primary-600 font-medium'
              )}
            >
              <div className="truncate">{step.name[locale as 'en' | 'et']}</div>
            </div>
          );
        })}
      </div>

      {/* Progress Text */}
      <div className="text-center mt-2 text-sm text-muted-foreground">
        {t('step')} {currentStep} {t('of')} {totalSteps} • {percentage}% {t('complete')}
      </div>
    </div>
  );
}

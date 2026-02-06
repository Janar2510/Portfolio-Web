'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { ONBOARDING_STEPS } from '@/lib/onboarding/steps';
import { OnboardingLayout } from './OnboardingLayout';
import { OnboardingNavigation } from './OnboardingNavigation';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileStep } from './steps/ProfileStep';
import { TemplateStep } from './steps/TemplateStep';
import { CustomizeStep } from './steps/CustomizeStep';
import { ContentStep } from './steps/ContentStep';
import { TourStep } from './steps/TourStep';
import { PublishStep } from './steps/PublishStep';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import type { OnboardingStepId, UserType, PrimaryGoal } from '@/lib/onboarding/steps';

export function OnboardingFlow() {
  const router = useRouter();
  const { progress, isLoading, error, updateProgress, logEvent } = useOnboarding();
  const {
    setCurrentStep,
    setUserType,
    setPrimaryGoal,
    setSelectedTemplate,
    updateStep,
    skipStep,
    completeOnboarding,
    skipOnboarding,
  } = useOnboardingStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  // Initialize from progress
  useEffect(() => {
    if (progress && !isLoading) {
      const stepIndex = progress.current_step - 1;
      setCurrentStepIndex(
        Math.max(0, Math.min(stepIndex, ONBOARDING_STEPS.length - 1))
      );
    }
  }, [progress, isLoading]);

  const handleNext = async () => {
    if (!progress || isNavigating) return;
    setIsNavigating(true);

    try {
      // Mark current step as completed in store
      updateStep(currentStep.id, true);

      // Prepare updates
      const isFinalStep = currentStepIndex >= ONBOARDING_STEPS.length - 1;
      const updates: any = {
        steps_completed: {
          ...progress.steps_completed,
          [currentStep.id]: true,
        },
      };

      if (!isFinalStep) {
        updates.current_step = currentStepIndex + 2;
      } else {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
      }

      // Single database update
      await updateProgress(updates);

      // Log event
      await logEvent({
        event_type: isFinalStep ? 'onboarding_completed' : 'step_completed',
        step_name: currentStep.id,
      });

      // Navigate
      if (!isFinalStep) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        setCurrentStep(nextIndex + 1);
      } else {
        completeOnboarding();
        router.push('/onboarding/complete');
      }
    } finally {
      // Small timeout to prevent accidental double clicks from skipping multiple steps
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  const handleBack = async () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      if (progress) {
        setCurrentStep(prevIndex + 1);
        await updateProgress({
          current_step: prevIndex + 1,
        });
      }
    }
  };

  const handleSkip = async () => {
    if (!progress || isNavigating) return;
    setIsNavigating(true);

    try {
      const isFinalStep = currentStepIndex >= ONBOARDING_STEPS.length - 1;

      const updates: any = {
        steps_skipped: [...progress.steps_skipped, currentStep.id],
      };

      if (isFinalStep) {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
      }

      await updateProgress(updates);

      await logEvent({
        event_type: 'step_skipped',
        step_name: currentStep.id,
      });

      if (!isFinalStep) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        setCurrentStep(nextIndex + 1);
      } else {
        completeOnboarding();
        router.push('/onboarding/complete');
      }
    } finally {
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  const handleSkipAll = async () => {
    skipOnboarding();
    await updateProgress({
      status: 'skipped',
    });
    await logEvent({
      event_type: 'onboarding_abandoned',
    });
    router.push('/onboarding/complete');
  };

  const handleUserTypeSelect = async (type: UserType) => {
    setUserType(type);
    if (progress) {
      await updateProgress({
        user_type: type,
      });
    }
  };

  const handleGoalSelect = async (goal: PrimaryGoal) => {
    setPrimaryGoal(goal);
    if (progress) {
      await updateProgress({
        primary_goal: goal,
      });
    }
  };

  const handleTemplateSelect = async (templateId: string | null) => {
    setSelectedTemplate(templateId);
    if (progress) {
      await updateProgress({
        selected_template_id: templateId,
      });
    }
  };

  // Logging for diagnostics
  useEffect(() => {
    if (progress) {
      console.log('[OnboardingFlow] Progress status:', progress.status);
    }
  }, [progress]);

  // If onboarding is already completed or skipped, redirect
  // DISABLED: Rely on middleware/layout for redirection to prevent loops
  /*
  useEffect(() => {
    if (progress && (progress.status === 'completed' || progress.status === 'skipped')) {
      router.push('/dashboard');
    }
  }, [progress, router]);
  */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center p-8 bg-white/5 border border-white/10 rounded-[2rem] max-w-md backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Rocket className="h-8 w-8 text-red-500/50" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Onboarding paused</h2>
          <p className="text-white/40 mb-8">
            {error.message.includes('onboarding_progress')
              ? 'Database tables are missing. Please run the latest migrations.'
              : 'We encountered an unexpected error while loading your progress.'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all font-bold"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Use a constant to satisfy TS narrowing
  const currentProgress = progress;

  return (
    <OnboardingLayout
      currentStep={currentStep.number}
      totalSteps={ONBOARDING_STEPS.length}
      onSkip={handleSkipAll}
    >
      <div className="space-y-6">
        {currentStep.id === 'welcome' && (
          <WelcomeStep
            userType={currentProgress.user_type}
            primaryGoal={currentProgress.primary_goal}
            onUserTypeSelect={handleUserTypeSelect}
            onGoalSelect={handleGoalSelect}
            onContinue={handleNext}
          />
        )}

        {currentStep.id === 'profile' && (
          <ProfileStep onContinue={handleNext} onSkip={handleSkip} hideInternalButton />
        )}

        {currentStep.id === 'template' && (
          <TemplateStep
            selectedTemplateId={currentProgress.selected_template_id}
            onTemplateSelect={handleTemplateSelect}
            onContinue={handleNext}
            onSkip={handleSkip}
            hideInternalButton
          />
        )}

        {currentStep.id === 'customize' && (
          <CustomizeStep
            selectedTemplateId={currentProgress.selected_template_id}
            onContinue={handleNext}
            onSkip={handleSkip}
            hideInternalButton
          />
        )}

        {currentStep.id === 'content' && (
          <ContentStep onContinue={handleNext} onSkip={handleSkip} hideInternalButton />
        )}

        {currentStep.id === 'tour' && (
          <TourStep onContinue={handleNext} onSkip={handleSkip} />
        )}

        {currentStep.id === 'publish' && (
          <PublishStep onPublish={handleNext} onSkip={handleSkip} hideInternalButton />
        )}

        {currentStep.id !== 'welcome' && currentStep.id !== 'tour' && (
          <OnboardingNavigation
            currentStep={currentStep.number}
            totalSteps={ONBOARDING_STEPS.length}
            onBack={currentStep.number > 1 ? handleBack : undefined}
            onNext={handleNext}
            onSkip={!currentStep.required ? handleSkip : undefined}
            canGoBack={currentStep.number > 1}
            canSkip={!currentStep.required}
            isLoading={isNavigating}
          />
        )}
      </div>
    </OnboardingLayout>
  );
}

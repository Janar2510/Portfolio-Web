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
import type { OnboardingStepId } from '@/lib/onboarding/steps';

export function OnboardingFlow() {
  const router = useRouter();
  const { progress, isLoading, updateProgress, logEvent } = useOnboarding();
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
  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  // Initialize from progress
  useEffect(() => {
    if (progress && !isLoading) {
      const stepIndex = progress.current_step - 1;
      setCurrentStepIndex(Math.max(0, Math.min(stepIndex, ONBOARDING_STEPS.length - 1)));
    }
  }, [progress, isLoading]);

  const handleNext = async () => {
    if (!progress) return;

    // Mark current step as completed
    updateStep(currentStep.id, true);
    await updateProgress({
      steps_completed: {
        ...progress.steps_completed,
        [currentStep.id]: true,
      },
      current_step: currentStepIndex + 2,
    });
    await logEvent({
      event_type: 'step_completed',
      step_name: currentStep.id,
    });

    // Move to next step
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setCurrentStep(nextIndex + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
      await updateProgress({
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      router.push('/onboarding/complete');
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
    if (!progress) return;

    skipStep(currentStep.id);
    await updateProgress({
      steps_skipped: [...progress.steps_skipped, currentStep.id],
    });
    await logEvent({
      event_type: 'step_skipped',
      step_name: currentStep.id,
    });

    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setCurrentStep(nextIndex + 1);
    } else {
      router.push('/dashboard');
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
    router.push('/dashboard');
  };

  const handleUserTypeSelect = async (type: typeof progress.user_type) => {
    setUserType(type);
    if (progress) {
      await updateProgress({
        user_type: type,
      });
    }
  };

  const handleGoalSelect = async (goal: typeof progress.primary_goal) => {
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

  // If onboarding is already completed or skipped, redirect
  if (progress.status === 'completed' || progress.status === 'skipped') {
    router.push('/dashboard');
    return null;
  }

  return (
    <OnboardingLayout
      currentStep={currentStep.number}
      totalSteps={ONBOARDING_STEPS.length}
      onSkip={handleSkipAll}
    >
      <div className="space-y-6">
        {currentStep.id === 'welcome' && (
          <WelcomeStep
            userType={progress.user_type}
            primaryGoal={progress.primary_goal}
            onUserTypeSelect={handleUserTypeSelect}
            onGoalSelect={handleGoalSelect}
            onContinue={handleNext}
          />
        )}

        {currentStep.id === 'profile' && (
          <ProfileStep
            onContinue={handleNext}
            onSkip={handleSkip}
          />
        )}

        {currentStep.id === 'template' && (
          <TemplateStep
            selectedTemplateId={progress.selected_template_id}
            onTemplateSelect={handleTemplateSelect}
            onContinue={handleNext}
            onSkip={handleSkip}
          />
        )}

        {currentStep.id === 'customize' && (
          <CustomizeStep
            selectedTemplateId={progress.selected_template_id}
            onContinue={handleNext}
            onSkip={handleSkip}
          />
        )}

        {currentStep.id === 'content' && (
          <ContentStep
            onContinue={handleNext}
            onSkip={handleSkip}
          />
        )}

        {currentStep.id === 'tour' && (
          <TourStep
            onContinue={handleNext}
            onSkip={handleSkip}
          />
        )}

        {currentStep.id === 'publish' && (
          <PublishStep
            onPublish={handleNext}
            onSkip={handleSkip}
          />
        )}

        {currentStep.id !== 'welcome' && (
          <OnboardingNavigation
            currentStep={currentStep.number}
            totalSteps={ONBOARDING_STEPS.length}
            onBack={currentStep.number > 1 ? handleBack : undefined}
            onNext={handleNext}
            onSkip={!currentStep.required ? handleSkip : undefined}
            canGoBack={currentStep.number > 1}
            canSkip={!currentStep.required}
          />
        )}
      </div>
    </OnboardingLayout>
  );
}

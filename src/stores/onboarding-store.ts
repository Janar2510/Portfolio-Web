import { create } from 'zustand';
import type {
  OnboardingStepId,
  UserType,
  PrimaryGoal,
} from '@/lib/onboarding/steps';

export interface OnboardingProgress {
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  current_step: number;
  current_substep: number;
  steps_completed: Record<OnboardingStepId, boolean>;
  user_type: UserType | null;
  primary_goal: PrimaryGoal | null;
  selected_template_id: string | null;
  steps_skipped: OnboardingStepId[];
  completed_at?: string;
  updated_at?: string;
}

interface OnboardingStore {
  progress: OnboardingProgress | null;
  isLoading: boolean;
  setProgress: (progress: OnboardingProgress) => void;
  updateStep: (stepId: OnboardingStepId, completed: boolean) => void;
  setCurrentStep: (step: number) => void;
  setUserType: (type: UserType) => void;
  setPrimaryGoal: (goal: PrimaryGoal) => void;
  setSelectedTemplate: (templateId: string | null) => void;
  skipStep: (stepId: OnboardingStepId) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  completed_at?: string;
}

const defaultProgress: OnboardingProgress = {
  status: 'not_started',
  current_step: 1,
  current_substep: 0,
  steps_completed: {
    welcome: false,
    profile: false,
    template: false,
    customize: false,
    content: false,
    tour: false,
    publish: false,
  },
  user_type: null,
  primary_goal: null,
  selected_template_id: null,
  steps_skipped: [],
};

export const useOnboardingStore = create<OnboardingStore>(set => ({
  progress: null,
  isLoading: true,
  setProgress: progress => set({ progress, isLoading: false }),
  updateStep: (stepId, completed) =>
    set(state => {
      if (!state.progress) return state;
      return {
        progress: {
          ...state.progress,
          steps_completed: {
            ...state.progress.steps_completed,
            [stepId]: completed,
          },
        },
      };
    }),
  setCurrentStep: step =>
    set(state => {
      if (!state.progress) return state;
      return {
        progress: {
          ...state.progress,
          current_step: step,
          status: 'in_progress',
        },
      };
    }),
  setUserType: type =>
    set(state => {
      if (!state.progress) return state;
      return {
        progress: {
          ...state.progress,
          user_type: type,
        },
      };
    }),
  setPrimaryGoal: goal =>
    set(state => {
      if (!state.progress) return state;
      return {
        progress: {
          ...state.progress,
          primary_goal: goal,
        },
      };
    }),
  setSelectedTemplate: templateId =>
    set(state => {
      if (!state.progress) return state;
      return {
        progress: {
          ...state.progress,
          selected_template_id: templateId,
        },
      };
    }),
  skipStep: stepId =>
    set(state => {
      if (!state.progress) return state;
      return {
        progress: {
          ...state.progress,
          steps_skipped: [...state.progress.steps_skipped, stepId],
        },
      };
    }),
  completeOnboarding: () =>
    set(state => {
      if (!state.progress) return state;
      return {
        progress: {
          ...state.progress,
          status: 'completed',
        },
      };
    }),
  skipOnboarding: () =>
    set(state => {
      if (!state.progress) return state;
      return {
        progress: {
          ...state.progress,
          status: 'skipped',
        },
      };
    }),
}));

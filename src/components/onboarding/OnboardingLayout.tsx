'use client';

import { ReactNode } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { X, Globe } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';
import NeuralBackground from '@/components/landing/hero/NeuralBackground';
import { cn } from '@/lib/utils';

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
    <div className="fixed inset-0 z-50 bg-[#0B0F19] text-white flex flex-col font-sans overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <NeuralBackground className="opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      {/* Header - Glassmorphic */}
      <div className="relative z-20 border-b border-white/5 bg-white/5 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#68A9A5] to-[#2563EB] flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl font-display tracking-tight">Supale</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-white/40 font-medium uppercase tracking-widest">
                {t('step')} {currentStep} {t('of')} {totalSteps}
              </span>
              <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(104,169,165,0.4)]"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipAll}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                {t('skipAll')}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkipAll}
                className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-12 md:py-20 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>

      {/* Global Decorative Shaders */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
    </div>
  );
}

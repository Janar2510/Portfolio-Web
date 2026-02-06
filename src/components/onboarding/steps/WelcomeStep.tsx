'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UserType, PrimaryGoal } from '@/lib/onboarding/steps';
import { Briefcase, Building2, Palette, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GradientButton } from '@/components/ui/gradient-button';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  userType: UserType | null;
  primaryGoal: PrimaryGoal | null;
  onUserTypeSelect: (type: UserType) => void;
  onGoalSelect: (goal: PrimaryGoal) => void;
  onContinue: () => void;
}

export function WelcomeStep({
  userType,
  primaryGoal,
  onUserTypeSelect,
  onGoalSelect,
  onContinue,
}: WelcomeStepProps) {
  const t = useTranslations('onboarding.welcome');

  const userTypes: Array<{
    id: UserType;
    icon: React.ReactNode;
    label: string;
    desc: string;
  }> = [
      {
        id: 'freelancer',
        icon: <User className="h-6 w-6" />,
        label: t('userType.freelancer'),
        desc: t('userType.freelancerDesc'),
      },
      {
        id: 'agency',
        icon: <Building2 className="h-6 w-6" />,
        label: t('userType.agency'),
        desc: t('userType.agencyDesc'),
      },
      {
        id: 'business',
        icon: <Briefcase className="h-6 w-6" />,
        label: t('userType.business'),
        desc: t('userType.businessDesc'),
      },
      {
        id: 'creative',
        icon: <Palette className="h-6 w-6" />,
        label: t('userType.creative'),
        desc: t('userType.creativeDesc'),
      },
    ];

  const goals: Array<{ id: PrimaryGoal; label: string; desc: string }> = [
    {
      id: 'portfolio',
      label: t('goal.portfolio'),
      desc: t('goal.portfolioDesc'),
    },
    {
      id: 'clients',
      label: t('goal.clients'),
      desc: t('goal.clientsDesc'),
    },
    {
      id: 'both',
      label: t('goal.both'),
      desc: t('goal.bothDesc'),
    },
  ];

  const canContinue = userType !== null && primaryGoal !== null;

  return (
    <div className="space-y-12 py-4">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold font-display tracking-tight text-white"
        >
          {t('title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/60 leading-relaxed"
        >
          {t('subtitle')}
        </motion.p>
      </div>

      {/* User Type Selection */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-px bg-white/10 flex-1" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">{t('userType.label')}</h2>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index + 0.2 }}
            >
              <Card
                className={cn(
                  'relative group cursor-pointer transition-all duration-500 overflow-hidden bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 rounded-[2rem]',
                  userType === type.id &&
                  'bg-white/10 border-primary/50 ring-2 ring-primary/20 shadow-xl shadow-primary/10'
                )}
                onClick={() => {
                  onUserTypeSelect(type.id);
                  onGoalSelect('portfolio');
                }}
              >
                {/* Selection Pulse */}
                {userType === type.id && (
                  <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(104,169,165,0.5)]" />
                )}

                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div
                      className={cn(
                        'p-4 rounded-2xl transition-all duration-500 shadow-inner',
                        userType === type.id
                          ? 'bg-primary text-white scale-110'
                          : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/80'
                      )}
                    >
                      {type.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className={cn(
                        "text-2xl font-bold font-display transition-colors",
                        userType === type.id ? "text-white" : "text-white/80 group-hover:text-white"
                      )}>
                        {type.label}
                      </h3>
                      <p className="text-white/50 group-hover:text-white/70 leading-relaxed text-base">
                        {type.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>

                {/* Decorative Gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity",
                  userType === type.id && "opacity-100"
                )} />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center pt-8"
      >
        <GradientButton
          size="lg"
          onClick={onContinue}
          disabled={!canContinue}
          className="min-w-[240px] h-16 rounded-2xl text-lg shadow-2xl shadow-primary/40 group"
        >
          {t('continue') || 'Continue'}
          <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </GradientButton>
      </motion.div>
    </div>
  );
}

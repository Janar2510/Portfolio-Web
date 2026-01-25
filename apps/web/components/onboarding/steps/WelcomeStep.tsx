'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UserType, PrimaryGoal } from '@/lib/onboarding/steps';
import { Briefcase, Building2, Palette, User } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* User Type Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('userType.label')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userTypes.map(type => (
            <Card
              key={type.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                userType === type.id &&
                  'ring-2 ring-primary-500 border-primary-500'
              )}
              onClick={() => onUserTypeSelect(type.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-lg',
                      userType === type.id
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{type.label}</h3>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Goal Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('goal.label')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map(goal => (
            <Card
              key={goal.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                primaryGoal === goal.id &&
                  'ring-2 ring-primary-500 border-primary-500'
              )}
              onClick={() => onGoalSelect(goal.id)}
            >
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{goal.label}</h3>
                <p className="text-sm text-muted-foreground">{goal.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!canContinue}
          className="min-w-[200px]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

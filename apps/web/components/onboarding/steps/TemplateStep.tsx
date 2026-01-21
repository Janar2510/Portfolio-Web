'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateChooser } from '@/components/portfolio/TemplateChooser';
import { cn } from '@/lib/utils';

interface TemplateStepProps {
  selectedTemplateId: string | null;
  onTemplateSelect: (templateId: string | null) => void;
  onContinue: () => void;
  onSkip?: () => void;
}

export function TemplateStep({
  selectedTemplateId,
  onTemplateSelect,
  onContinue,
  onSkip,
}: TemplateStepProps) {
  const t = useTranslations('onboarding.template');

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Template Selection */}
      <div className="space-y-6">
        <TemplateChooser
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={onTemplateSelect}
        />

        {/* Start from Scratch Option */}
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selectedTemplateId === null && 'ring-2 ring-primary-500 border-primary-500'
          )}
          onClick={() => onTemplateSelect(null)}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'p-3 rounded-lg',
                  selectedTemplateId === null
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{t('scratch')}</h3>
                <p className="text-sm text-muted-foreground">{t('scratchDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={onContinue}
          className="min-w-[200px]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

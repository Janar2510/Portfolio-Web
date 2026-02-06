'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/domain/builder/portfolio';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateChooser } from '@/components/portfolio/TemplateChooser';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GradientButton } from '@/components/ui/gradient-button';
import { ArrowRight, Plus, Check } from 'lucide-react';

interface TemplateStepProps {
  selectedTemplateId: string | null;
  onTemplateSelect: (templateId: string | null) => void;
  onContinue: () => void;
  onSkip?: () => void;
  hideInternalButton?: boolean;
}

export function TemplateStep({
  selectedTemplateId,
  onTemplateSelect,
  onContinue,
  onSkip,
  hideInternalButton,
}: TemplateStepProps) {
  const t = useTranslations('onboarding.template');

  return (
    <div className="space-y-12 py-4">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold font-display tracking-tight text-white"
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

      {/* Template Selection */}
      <div className="space-y-10">
        <TemplateChooser
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={onTemplateSelect}
        />

        <div className="flex items-center gap-4 py-8">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/20">or</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Start from Scratch Option */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className={cn(
              'group relative cursor-pointer transition-all duration-500 overflow-hidden bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 rounded-[2.5rem]',
              selectedTemplateId === null &&
              'bg-white/10 border-primary ring-2 ring-primary/20 shadow-xl shadow-primary/10'
            )}
            onClick={() => onTemplateSelect(null)}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div
                  className={cn(
                    'p-4 rounded-2xl transition-all duration-500 shadow-inner',
                    selectedTemplateId === null
                      ? 'bg-primary text-white scale-110'
                      : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/80'
                  )}
                >
                  <Plus className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className={cn(
                    "text-2xl font-bold font-display transition-colors",
                    selectedTemplateId === null ? "text-white" : "text-white/80 group-hover:text-white"
                  )}>
                    {t('scratch')}
                  </h3>
                  <p className="text-white/50 group-hover:text-white/70 leading-relaxed">
                    {t('scratchDesc')}
                  </p>
                </div>

                {selectedTemplateId === null && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-primary text-white rounded-full p-2"
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Continue Button */}
      {!hideInternalButton && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-8"
        >
          <GradientButton
            size="lg"
            onClick={onContinue}
            className="min-w-[240px] h-16 rounded-2xl text-lg shadow-2xl shadow-primary/40 group"
          >
            {t('continue') || 'Continue'}
            <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </GradientButton>
        </motion.div>
      )}
    </div>
  );
}

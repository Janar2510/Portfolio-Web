'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Sparkles, ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';
import { TOUR_HIGHLIGHTS } from '@/lib/onboarding/steps';

interface TourStepProps {
  onContinue: () => void;
  onSkip?: () => void;
}

export function TourStep({ onContinue, onSkip }: TourStepProps) {
  const t = useTranslations('onboarding.tour');
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const locale = useLocale();

  const highlight = TOUR_HIGHLIGHTS[currentHighlight];
  const isFirst = currentHighlight === 0;
  const isLast = currentHighlight === TOUR_HIGHLIGHTS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onContinue();
    } else {
      setCurrentHighlight(currentHighlight + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentHighlight(currentHighlight - 1);
    }
  };

  return (
    <div className="space-y-12 py-4 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
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
          className="text-xl text-white/60"
        >
          {t('subtitle')}
        </motion.p>
      </div>

      {/* Tour Highlight Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-[#68A9A5]/10 to-[#2563EB]/10 rounded-[3rem] blur-2xl opacity-50" />
        <Card className="relative bg-white/5 border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
          <CardContent className="p-10">
            <div className="space-y-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHighlight}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 text-center"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-white/5 text-[#68A9A5] mb-4">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-bold font-display text-white">
                    {highlight.title[locale as 'en' | 'et']}
                  </h2>
                  <p className="text-lg text-white/50 leading-relaxed max-w-lg mx-auto">
                    {highlight.description[locale as 'en' | 'et']}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-3">
                {TOUR_HIGHLIGHTS.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={false}
                    animate={{
                      width: index === currentHighlight ? 40 : 8,
                      backgroundColor: index === currentHighlight ? '#68A9A5' : 'rgba(255,255,255,0.1)'
                    }}
                    className="h-2 rounded-full transition-colors duration-500"
                    style={{
                      boxShadow: index === currentHighlight ? '0 0 15px rgba(104,169,165,0.4)' : 'none'
                    }}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={isFirst}
                  className="text-white/40 hover:text-white hover:bg-white/5 px-6 rounded-full"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('previous')}
                </Button>

                <div className="flex items-center gap-4">
                  {onSkip && !isLast && (
                    <Button
                      variant="ghost"
                      onClick={onSkip}
                      className="text-white/20 hover:text-white/40 rounded-full"
                    >
                      {t('skip')}
                    </Button>
                  )}
                  {isLast ? (
                    <GradientButton
                      onClick={handleNext}
                      className="min-w-[140px] px-8 rounded-full shadow-lg shadow-[#68A9A5]/20 group"
                    >
                      {t('finish')}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </GradientButton>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleNext}
                      className="min-w-[120px] px-8 rounded-full border-white/10 text-white hover:bg-[#68A9A5] hover:border-[#68A9A5] transition-all"
                    >
                      {t('next')}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

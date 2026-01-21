'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TOUR_HIGHLIGHTS } from '@/lib/onboarding/steps';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStepProps {
  onContinue: () => void;
  onSkip?: () => void;
}

export function TourStep({ onContinue, onSkip }: TourStepProps) {
  const t = useTranslations('onboarding.tour');
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const locale = 'et'; // TODO: Get from context

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
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Tour Highlight Card */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  {highlight.title[locale as 'en' | 'et']}
                </h2>
                <p className="text-muted-foreground">
                  {highlight.description[locale as 'en' | 'et']}
                </p>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-2">
                {TOUR_HIGHLIGHTS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentHighlight
                        ? 'bg-primary-500 w-8'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirst}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('previous')}
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={onSkip}>
                    {t('skip')}
                  </Button>
                  <Button onClick={handleNext}>
                    {isLast ? t('finish') : t('next')}
                    {!isLast && <ChevronRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

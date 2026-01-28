'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';

export function FAQSection() {
  const t = useTranslations('landing.faq');

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <h2 className="text-5xl md:text-7xl font-bold font-display text-navy-900 mb-6">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('subtitle')}
            </p>
            <div className="p-6 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
              <h4 className="font-semibold mb-2">{t('stillHaveQuestions')}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {t('helpText')}
              </p>
              <a
                href="mailto:support@supale.ee"
                className="text-teal-600 font-medium hover:underline"
              >
                {t('contactSupport')}
              </a>
            </div>
          </div>

          <div className="flex items-center">
            <Accordion type="single" collapsible className="w-full">
              {faqKeys.map((key, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-teal-600">
                    {t(`items.${key}.question`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {t(`items.${key}.answer`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}

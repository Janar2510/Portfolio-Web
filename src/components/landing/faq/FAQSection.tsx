'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function FAQSection() {
  const t = useTranslations('landing.faq');

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  return (
    <section id="faq" className="py-32 bg-background relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 max-w-6xl mx-auto">
          <div className="lg:col-span-4">
            <h2 className="text-5xl md:text-6xl font-bold font-display text-foreground mb-8 leading-tight tracking-tight">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-12 font-light leading-relaxed">
              {t('subtitle')}
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-8 bg-surface border border-border rounded-3xl group transition-all duration-300 hover:border-primary/30"
            >
              <h4 className="text-xl font-bold mb-3 text-foreground font-display">{t('stillHaveQuestions')}</h4>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {t('helpText')}
              </p>
              <a
                href="mailto:support@supale.ee"
                className="inline-flex items-center text-primary font-bold hover:gap-2 transition-all duration-300"
              >
                {t('contactSupport')}
              </a>
            </motion.div>
          </div>

          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqKeys.map((key, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border bg-surface/50 rounded-2xl px-6 transition-all duration-300 hover:border-primary/20 data-[state=open]:border-primary/40 data-[state=open]:bg-surface"
                >
                  <AccordionTrigger className="text-left py-6 font-bold text-lg text-foreground hover:text-primary transition-colors hover:no-underline">
                    {t(`items.${key}.question`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 text-base font-light leading-relaxed">
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

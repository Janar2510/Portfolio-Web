'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

const PricingSwitch = ({
  onSwitch,
  t,
}: {
  onSwitch: (isYearly: boolean) => void;
  t: (key: string) => string;
}) => {
  const [isYearly, setIsYearly] = useState(false);

  const handleSwitch = (yearly: boolean) => {
    setIsYearly(yearly);
    onSwitch(yearly);
  };

  return (
    <div className="flex justify-center mb-12">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-surface border border-primary/20 p-1">
        <button
          onClick={() => handleSwitch(false)}
          className={cn(
            'relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors',
            !isYearly ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          )}
        >
          {!isYearly && (
            <motion.span
              layoutId="pricing-switch"
              className="absolute top-0 left-0 h-10 w-full rounded-full shadow-lg shadow-primary/20 bg-primary"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">{t('monthly')}</span>
        </button>

        <button
          onClick={() => handleSwitch(true)}
          className={cn(
            'relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors',
            isYearly ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          )}
        >
          {isYearly && (
            <motion.span
              layoutId="pricing-switch"
              className="absolute top-0 left-0 h-10 w-full rounded-full shadow-lg shadow-primary/20 bg-primary"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            {t('yearly')}{' '}
            <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded italic">
              {t('savePercent')}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

const TimelineReveal = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('landing.pricing');
  const tNav = useTranslations('landing.nav');
  const { user, loading } = useAuth();

  const plans = [
    {
      planKey: 'free',
      price: { monthly: 0, yearly: 0 },
      features: [
        { key: 'portfolioSites', count: 1, included: true },
        { key: 'pages', count: 3, included: true },
        { key: 'brandingIncluded', included: true },
        { key: 'customDomain', included: false },
        { key: 'basicAnalytics', included: false },
      ],
      href: '/sign-up',
      popular: false,
    },
    {
      planKey: 'starter',
      price: { monthly: 9, yearly: 90 },
      features: [
        { key: 'portfolioSites', count: 1, included: true },
        { key: 'pages', count: 10, included: true },
        { key: 'customDomain', included: true },
        { key: 'basicAnalytics', included: true },
      ],
      href: '/sign-up?plan=starter',
      popular: false,
    },
    {
      planKey: 'professional',
      price: { monthly: 19, yearly: 190 },
      features: [
        { key: 'portfolioSites', count: 1, included: true },
        { key: 'unlimitedPages', included: true },
        { key: 'customDomain', included: true },
        { key: 'advancedAnalytics', included: true },
        { key: 'prioritySupport', included: true },
      ],
      href: '/sign-up?plan=professional',
      popular: true,
    },
    {
      planKey: 'business',
      price: { monthly: 39, yearly: 390 },
      features: [
        { key: 'portfolioSites', count: 3, included: true },
        { key: 'unlimitedPages', included: true },
        { key: 'customDomains', included: true },
        { key: 'advancedAnalytics', included: true },
      ],
      href: '/contact',
      popular: false,
    },
  ];

  const getFeatureName = (feature: { key: string; count?: number }) => {
    if (feature.count !== undefined) {
      return t(`features.${feature.key}`, { count: feature.count });
    }
    return t(`features.${feature.key}`);
  };

  return (
    <section
      id="pricing"
      className="py-32 bg-background relative overflow-hidden flex flex-col items-center justify-center"
      ref={pricingRef}
    >
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.05)_0%,transparent_70%)] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 px-4">
          <TimelineReveal>
            <h2 className="text-5xl md:text-7xl font-bold font-display text-foreground mb-6 tracking-tight">
              {t('title')}{' '}
              <span className="text-primary relative inline-block">
                {t('titleHighlight')}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h2>
          </TimelineReveal>

          <TimelineReveal delay={0.2}>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-light leading-relaxed">
              {t('subtitle')}
            </p>
          </TimelineReveal>

          <TimelineReveal delay={0.3}>
            <PricingSwitch onSwitch={setIsYearly} t={t} />
          </TimelineReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <TimelineReveal key={plan.planKey} delay={0.1 * index}>
              <Card
                className={cn(
                  'relative h-full text-foreground border transition-all duration-300 group hover:-translate-y-2 hover:shadow-xl',
                  'bg-card backdrop-blur-sm',
                  plan.popular
                    ? 'border-primary shadow-lg scale-105 z-10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-20 shadow-lg">
                    {t('mostPopular')}
                  </div>
                )}

                <CardHeader className="text-left pb-4">
                  <h3 className="text-2xl font-bold mb-1 font-display group-hover:text-primary transition-colors">
                    {t(`plans.${plan.planKey}.name`)}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      €{isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground text-sm font-medium">
                      /{isYearly ? t('year') : t('month')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 leading-relaxed line-clamp-2">
                    {t(`plans.${plan.planKey}.description`)}
                  </p>
                </CardHeader>

                <CardContent className="pt-0 flex flex-col h-full gap-8">
                  <GradientButton
                    asChild
                    variant={plan.popular ? 'default' : 'variant'}
                    className={cn(
                      "w-full font-bold rounded-xl",
                      !plan.popular && "bg-transparent border-2 border-primary text-primary hover:bg-primary/5"
                    )}
                  >
                    <Link href={!loading && user ? "/builder/sites" : plan.href}>
                      {!loading && user ? tNav('dashboard') : t(`plans.${plan.planKey}.cta`)}
                    </Link>
                  </GradientButton>

                  <div className="flex-1 border-t border-border pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                      {t('whatsIncluded')}
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map(feature => (
                        <li
                          key={feature.key}
                          className="flex items-start gap-3 text-sm"
                        >
                          {feature.included ? (
                            <Check className="size-4 text-primary shrink-0 mt-0.5" />
                          ) : (
                            <X className="size-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={cn(
                              'transition-colors',
                              feature.included
                                ? 'text-foreground'
                                : 'text-muted-foreground/60'
                            )}
                          >
                            {getFeatureName(feature)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TimelineReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

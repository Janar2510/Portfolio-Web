'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { GradientButton } from '@/components/ui/gradient-button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

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
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-[#141C33] border border-[#354F6F]/30 p-1">
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
              className="absolute top-0 left-0 h-10 w-full rounded-full shadow-lg shadow-teal-500/20 bg-gradient-to-t from-[#3D726E] to-[#68A9A5]"
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
              className="absolute top-0 left-0 h-10 w-full rounded-full shadow-lg shadow-teal-500/20 bg-gradient-to-t from-[#3D726E] to-[#68A9A5]"
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
      // Use translation with count parameter
      return t(`features.${feature.key}`, { count: feature.count });
    }
    return t(`features.${feature.key}`);
  };

  return (
    <section
      id="pricing"
      className="py-32 bg-[#141C33] relative overflow-hidden min-h-screen flex flex-col items-center justify-center"
      ref={pricingRef}
    >
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,#3D726E_0%,transparent_70%)] opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_100%,#212D50_0%,transparent_70%)] opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 px-4">
          <TimelineReveal>
            <h2 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 tracking-tight">
              {t('title')}{' '}
              <span className="text-[#68A9A5]">{t('titleHighlight')}</span>
            </h2>
          </TimelineReveal>

          <TimelineReveal delay={0.2}>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
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
                  'relative h-full text-white border-transparent transition-all duration-300 group hover:translate-y-[-8px]',
                  'bg-gradient-to-b from-[#212D50]/80 to-[#141C33]/90 backdrop-blur-xl',
                  plan.popular
                    ? 'ring-2 ring-[#68A9A5] shadow-[0_0_40px_-10px_rgba(104,169,165,0.4)] z-10'
                    : 'border border-[#354F6F]/30'
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#68A9A5] to-[#3D726E] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-20 shadow-lg">
                    {t('mostPopular')}
                  </div>
                )}

                <CardHeader className="text-left pb-4">
                  <h3 className="text-2xl font-bold mb-1 group-hover:text-[#68A9A5] transition-colors">
                    {t(`plans.${plan.planKey}.name`)}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      €{isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-gray-400 text-sm">
                      /{isYearly ? t('year') : t('month')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-4 leading-relaxed line-clamp-2">
                    {t(`plans.${plan.planKey}.description`)}
                  </p>
                </CardHeader>

                <CardContent className="pt-0 flex flex-col h-full gap-8">
                  <GradientButton
                    asChild
                    variant={plan.popular ? 'default' : 'variant'}
                    className="w-full h-[50px] font-bold"
                  >
                    <Link href={plan.href}>
                      {t(`plans.${plan.planKey}.cta`)}
                    </Link>
                  </GradientButton>

                  <div className="flex-1 border-t border-[#354F6F]/20 pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#68A9A5] mb-4">
                      {t('whatsIncluded')}
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map(feature => (
                        <li
                          key={feature.key}
                          className="flex items-start gap-3 text-sm"
                        >
                          {feature.included ? (
                            <Check className="size-4 text-[#68A9A5] shrink-0 mt-0.5" />
                          ) : (
                            <X className="size-4 text-gray-500/30 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={cn(
                              'transition-colors',
                              feature.included
                                ? 'text-gray-200'
                                : 'text-gray-500/60'
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

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 size-1 bg-white rounded-full blur-[1px] animate-pulse" />
        <div className="absolute top-1/3 right-1/3 size-1 bg-white rounded-full blur-[1px] animate-pulse delay-700" />
        <div className="absolute bottom-1/4 right-1/4 size-1 bg-white rounded-full blur-[1px] animate-pulse delay-1000" />
      </div>
    </section>
  );
}

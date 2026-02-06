'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import {
  Layout,
  Users,
  BarChart3,
  Mail,
  Globe,
  Shield,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function FeaturesSection() {
  const t = useTranslations('landing.features');

  const features = [
    {
      titleKey: 'portfolioBuilder',
      icon: <Layout className="w-8 h-8 text-primary" />,
      className: 'md:col-span-2 md:row-span-1 min-h-[400px]',
      shaderIndex: 0,
    },
    {
      titleKey: 'customDomain',
      icon: <Globe className="w-8 h-8 text-primary" />,
      className: 'md:col-span-1 md:row-span-1',
      shaderIndex: 4,
    },
    {
      titleKey: 'crm',
      icon: <Users className="w-8 h-8 text-primary" />,
      className: 'md:col-span-1 md:row-span-1',
      shaderIndex: 2,
    },
    {
      titleKey: 'analytics',
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      className: 'md:col-span-2 md:row-span-1 min-h-[400px]',
      shaderIndex: 1,
    },
  ];

  const getShaderConfig = (index: number) => {
    // Updated for Light Mode Aesthetic (Zinc + Blue)
    const configs = [
      {
        proportion: 0.35,
        softness: 0.9,
        distortion: 0.15,
        swirl: 0.7,
        swirlIterations: 10,
        shape: 'checks' as const,
        shapeScale: 0.08,
        colors: ['#0B0F19', '#141C33', '#68A9A5', '#212D50'],
      },
      {
        proportion: 0.4,
        softness: 1.2,
        distortion: 0.2,
        swirl: 0.9,
        swirlIterations: 12,
        shape: 'stripes' as const,
        shapeScale: 0.12,
        colors: ['#141C33', '#68A9A5', '#212D50', '#0B0F19'],
      },
      {
        proportion: 0.38,
        softness: 0.95,
        distortion: 0.18,
        swirl: 0.8,
        swirlIterations: 11,
        shape: 'checks' as const,
        shapeScale: 0.1,
        colors: ['#68A9A5', '#212D50', '#0B0F19', '#141C33'],
      },
      {
        proportion: 0.45,
        softness: 1.1,
        distortion: 0.22,
        swirl: 0.85,
        swirlIterations: 14,
        shape: 'stripes' as const,
        shapeScale: 0.09,
        colors: ['#212D50', '#0B0F19', '#141C33', '#68A9A5'],
      },
      {
        proportion: 0.3,
        softness: 0.85,
        distortion: 0.16,
        swirl: 0.75,
        swirlIterations: 9,
        shape: 'checks' as const,
        shapeScale: 0.11,
        colors: ['#0B0F19', '#68A9A5', '#141C33', '#212D50'],
      },
    ];
    return configs[index % configs.length];
  };

  return (
    <section
      id="features"
      className="relative py-24 px-4 bg-background overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold font-display text-foreground mb-6">
              {t('title')}{' '}
              <span className="text-primary relative inline-block">
                {t('titleHighlight')}
                <span className="absolute inset-x-0 bottom-2 h-3 bg-accent/10 -z-10 -rotate-1"></span>
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const shaderConfig = getShaderConfig(feature.shaderIndex);
            return (
              <motion.div
                key={index}
                className={cn(
                  'relative group rounded-[2rem] overflow-hidden border border-border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 bg-card',
                  feature.className
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-card via-card to-accent/5 transition-colors duration-500">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${shaderConfig.colors[2]}, transparent 70%)`
                    }}
                  />
                  <div className="absolute inset-0 bg-card/50 group-hover:bg-card/30 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-12 h-full flex flex-col">
                  <div className="p-4 bg-background w-fit rounded-2xl shadow-sm border border-border group-hover:scale-110 transition-transform duration-500 mb-8">
                    {feature.icon}
                  </div>

                  <div className="mt-auto">
                    <h3
                      className={cn(
                        'font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-4 font-display',
                        feature.className?.includes('col-span-2')
                          ? 'text-3xl md:text-5xl'
                          : 'text-2xl md:text-3xl'
                      )}
                    >
                      {t(`${feature.titleKey}.title`)}
                    </h3>

                    <p className="text-lg leading-relaxed text-muted-foreground font-light max-w-md">
                      {t(`${feature.titleKey}.description`)}
                    </p>
                  </div>

                  <div className="absolute top-8 right-8 text-muted-foreground/20 group-hover:text-primary transition-all duration-500 transform group-hover:translate-x-1 group-hover:-translate-y-1">
                    <ArrowUpRight className="w-8 h-8" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

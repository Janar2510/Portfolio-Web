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
      icon: <Layout className="w-8 h-8 text-white" />,
      className: 'md:col-span-2 md:row-span-1 min-h-[400px]',
      shaderIndex: 0,
    },
    {
      titleKey: 'customDomain',
      icon: <Globe className="w-8 h-8 text-white" />,
      className: 'md:col-span-1 md:row-span-1',
      shaderIndex: 4,
    },
  ];

  const getShaderConfig = (index: number) => {
    const configs = [
      {
        proportion: 0.35,
        softness: 0.9,
        distortion: 0.15,
        swirl: 0.7,
        swirlIterations: 10,
        shape: 'checks' as const,
        shapeScale: 0.08,
        colors: ['#06070B', '#121526', '#00E5BC', '#B066FF'],
      },
      {
        proportion: 0.4,
        softness: 1.2,
        distortion: 0.2,
        swirl: 0.9,
        swirlIterations: 12,
        shape: 'stripes' as const,
        shapeScale: 0.12,
        colors: ['#121526', '#00E5BC', '#B066FF', '#06070B'],
      },
      {
        proportion: 0.38,
        softness: 0.95,
        distortion: 0.18,
        swirl: 0.8,
        swirlIterations: 11,
        shape: 'checks' as const,
        shapeScale: 0.1,
        colors: ['#00E5BC', '#B066FF', '#06070B', '#121526'],
      },
      {
        proportion: 0.45,
        softness: 1.1,
        distortion: 0.22,
        swirl: 0.85,
        swirlIterations: 14,
        shape: 'stripes' as const,
        shapeScale: 0.09,
        colors: ['#B066FF', '#06070B', '#121526', '#00E5BC'],
      },
      {
        proportion: 0.3,
        softness: 0.85,
        distortion: 0.16,
        swirl: 0.75,
        swirlIterations: 9,
        shape: 'checks' as const,
        shapeScale: 0.11,
        colors: ['#06070B', '#00E5BC', '#121526', '#B066FF'],
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-7 : 6xl font-bold font-display text-white mb-6">
              {t('title')}{' '}
              <span className="text-primary drop-shadow-[0_0_10px_rgba(0,229,188,0.3)]">
                {t('titleHighlight')}
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
                  'relative group rounded-[2.5rem] overflow-hidden border border-white/5 transition-all duration-500 hover:border-primary/30',
                  feature.className
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background to-primary/10 transition-colors duration-500">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${shaderConfig.colors[0]}, transparent 70%)`
                    }}
                  />
                  <div className="absolute inset-0 bg-background/80 group-hover:bg-background/70 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-12 h-full flex flex-col">
                  <div className="p-4 bg-white/5 w-fit rounded-2xl backdrop-blur-md border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500 mb-8">
                    <div className="group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3
                      className={cn(
                        'font-bold text-white group-hover:text-primary transition-colors duration-300 mb-4',
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

                  <div className="absolute top-8 right-8 text-white/20 group-hover:text-primary/80 transition-all duration-500 transform group-hover:translate-x-1 group-hover:-translate-y-1">
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

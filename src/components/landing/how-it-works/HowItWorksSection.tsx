'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Check, Import, Palette, BarChart3, Rocket } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function HowItWorksSection() {
  const t = useTranslations('landing.howItWorks');

  const steps = [
    {
      stepKey: 'step1',
      icon: <Import className="w-8 h-8 text-white" />,
    },
    {
      stepKey: 'step2',
      icon: <Palette className="w-8 h-8 text-white" />,
    },
  ];

  const getShaderConfig = (index: number) => {
    const configs = [
      {
        proportion: 0.3,
        softness: 0.8,
        distortion: 0.15,
        swirl: 0.6,
        swirlIterations: 8,
        shape: 'checks' as const,
        shapeScale: 0.08,
        colors: ['#141C33', '#212D50', '#354F6F', '#3D726E'],
      },
      {
        proportion: 0.4,
        softness: 1.2,
        distortion: 0.2,
        swirl: 0.9,
        swirlIterations: 12,
        shape: 'stripes' as const,
        shapeScale: 0.12,
        colors: ['#212D50', '#354F6F', '#3D726E', '#68A9A5'],
      },
      {
        proportion: 0.35,
        softness: 0.9,
        distortion: 0.18,
        swirl: 0.7,
        swirlIterations: 10,
        shape: 'checks' as const,
        shapeScale: 0.1,
        colors: ['#354F6F', '#3D726E', '#68A9A5', '#212D50'],
      },
      {
        proportion: 0.45,
        softness: 1.1,
        distortion: 0.22,
        swirl: 0.8,
        swirlIterations: 15,
        shape: 'stripes' as const,
        shapeScale: 0.09,
        colors: ['#3D726E', '#68A9A5', '#141C33', '#354F6F'],
      },
    ];
    return configs[index % configs.length];
  };

  return (
    <section
      id="how-it-works"
      className="relative py-32 px-4 bg-background overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 tracking-tighter">
              {t('title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {t('titleHighlight')}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const shaderConfig = getShaderConfig(index);
            return (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative h-80 rounded-[2.5rem] overflow-hidden border border-white/5 transition-all duration-500 group-hover:border-primary/30 glass-card">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background to-primary/10 transition-colors duration-500">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${shaderConfig.colors[0]}, transparent 70%)`
                      }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-background/80 group-hover:bg-background/60 transition-colors duration-500" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-10 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500">
                        {step.icon}
                      </div>
                      <span className="text-6xl font-black text-white/5 font-display group-hover:text-primary/10 transition-colors duration-500 tracking-tighter">
                        {t(`steps.${step.stepKey}.number` || String(index + 1))}
                      </span>
                    </div>

                    <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300">
                      {t(`steps.${step.stepKey}.title`)}
                    </h3>

                    <p className="text-lg leading-relaxed text-muted-foreground font-light max-w-sm">
                      {t(`steps.${step.stepKey}.description`)}
                    </p>

                    <div className="mt-auto flex items-center text-sm font-bold text-white/50 group-hover:text-white transition-all duration-300 overflow-hidden">
                      <span className="transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500">
                        {t('getStarted')}
                      </span>
                      <div className="w-8 h-[2px] bg-[#68A9A5] ml-3 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 delay-100" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <GradientButton asChild className="shadow-lg shadow-teal-500/20">
            <Link href="/register">{t('cta')}</Link>
          </GradientButton>
        </motion.div>
      </div>
    </section>
  );
}

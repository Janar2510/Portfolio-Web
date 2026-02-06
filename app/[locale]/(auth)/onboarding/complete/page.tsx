'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { GradientButton } from '@/components/ui/gradient-button';
import NeuralBackground from '@/components/landing/hero/NeuralBackground';
import { motion } from 'framer-motion';

export default function OnboardingCompletePage() {
  const t = useTranslations('onboarding.complete');

  return (
    <div className="relative min-h-screen bg-background text-white flex flex-col font-sans overflow-x-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <NeuralBackground className="opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-white/5 border-white/5 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl relative">
            {/* Decorative Shaders */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

            <CardContent className="p-12 md:p-16 relative">
              <div className="text-center space-y-10">
                {/* Celebration Icon */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative group"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors animate-pulse" />
                  <CheckCircle2 className="h-12 w-12 text-primary relative z-10" />
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary/50 animate-bounce" />
                </motion.div>

                <div className="space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-5xl font-bold font-display tracking-tight text-white"
                  >
                    {t('title')}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl text-white/40 max-w-md mx-auto leading-relaxed"
                  >
                    {t('subtitle')}
                  </motion.p>
                </div>

                {/* Next Steps Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6 text-left"
                >
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/20 text-center">
                    {t('nextSteps')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'pages', label: t('tips.addPages') },
                      { id: 'projects', label: t('tips.createProject') },
                      { id: 'contact', label: t('tips.addContact') },
                      { id: 'email', label: t('tips.connectEmail') },
                    ].map((step, i) => (
                      <div
                        key={step.id}
                        className="p-5 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 hover:border-white/10 transition-all duration-300"
                      >
                        <p className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
                >
                  <GradientButton asChild className="w-full sm:w-auto h-16 rounded-2xl px-10 text-lg shadow-2xl shadow-primary/20 group order-first sm:order-none">
                    <Link href="/dashboard">
                      {t('goToDashboard')}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </GradientButton>
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full sm:w-auto h-14 rounded-2xl px-8 text-white/40 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Link href="/portfolio">
                      {t('viewSite')}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/10">
          Powered by Supale AI
        </p>
      </div>
    </div>
  );
}

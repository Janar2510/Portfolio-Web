'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/domain/builder/portfolio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Monitor, Tablet, Smartphone, ArrowRight, Rocket, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { GradientButton } from '@/components/ui/gradient-button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PublishStepProps {
  onPublish: () => void;
  onSkip?: () => void;
  hideInternalButton?: boolean;
}

export function PublishStep({ onPublish, onSkip, hideInternalButton }: PublishStepProps) {
  const t = useTranslations('onboarding.publish');
  const router = useRouter();
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop'
  );

  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  const publishMutation = useMutation({
    mutationFn: async () => {
      const site = await portfolioService.getSite();
      if (!site) throw new Error('No site found');
      return await portfolioService.updateSite(site.id, {
        status: 'published',
      });
    },
    onSuccess: () => {
      router.push('/onboarding/complete');
    },
  });

  const handlePublish = async () => {
    await publishMutation.mutateAsync();
  };

  return (
    <div className="space-y-12 py-4 max-w-4xl mx-auto">
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

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-10"
      >
        {/* Device Selection & Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-center p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit mx-auto backdrop-blur-md">
            {[
              { id: 'desktop', icon: Monitor, label: t('devices.desktop') },
              { id: 'tablet', icon: Tablet, label: t('devices.tablet') },
              { id: 'mobile', icon: Smartphone, label: t('devices.mobile') },
            ].map((device) => (
              <button
                key={device.id}
                onClick={() => setDeviceView(device.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm",
                  deviceView === device.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
                )}
              >
                <device.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{device.label}</span>
              </button>
            ))}
          </div>

          <div className="relative group mx-auto transition-all duration-700" style={{
            maxWidth: deviceView === 'desktop' ? '100%' : deviceView === 'tablet' ? '768px' : '375px',
          }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative bg-background border border-white/10 rounded-[2.5rem] overflow-hidden aspect-video shadow-2xl">
              <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
                <div className="p-4 rounded-full bg-white/5 mb-4">
                  <Monitor className="h-12 w-12 text-white/10" />
                </div>
                <p className="text-white/20 font-bold uppercase tracking-[0.2em]">{t('preview')}</p>
                <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/10 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white/10 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white/10 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 p-8 bg-white/5 border border-white/5 rounded-[2.5rem] backdrop-blur-sm">
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {t('checklist.title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                t('checklist.profile'),
                t('checklist.template'),
                t('checklist.styles'),
                t('checklist.content')
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/30 transition-colors">
                  <div className="p-1 rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 text-center md:text-left md:pl-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Ready to go</span>
            </div>
            <h2 className="text-3xl font-bold font-display text-white">Your portfolio is ready for the world.</h2>
            <p className="text-white/40 leading-relaxed">
              Launch your professional site now and start sharing your journey with clients and collaborators.
            </p>
          </div>
        </div>

        {/* Final Actions */}
        {!hideInternalButton && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-white/40 hover:text-white hover:bg-white/5 rounded-full px-10 h-14 font-bold"
            >
              {t('publishLater')}
            </Button>
            <GradientButton
              size="lg"
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="min-w-[280px] h-16 rounded-2xl text-lg shadow-2xl shadow-primary/40 group text-white"
            >
              <Rocket className="mr-3 h-6 w-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              {publishMutation.isPending ? 'Publishing...' : t('publishNow')}
              <ArrowRight className="ml-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </GradientButton>
          </div>
        )}
      </motion.div>
    </div>
  );
}

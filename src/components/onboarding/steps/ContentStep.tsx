'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GradientButton } from '@/components/ui/gradient-button';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, User, MessageSquare, Type } from 'lucide-react';

interface ContentStepProps {
  onContinue: () => void;
  onSkip?: () => void;
  hideInternalButton?: boolean;
}

export function ContentStep({ onContinue, onSkip, hideInternalButton }: ContentStepProps) {
  const t = useTranslations('onboarding.content');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [bio, setBio] = useState('');

  const handleContinue = () => {
    // TODO: Save content to portfolio blocks
    onContinue();
  };

  return (
    <div className="space-y-12 py-4 max-w-2xl mx-auto">
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-10"
      >
        <div className="grid grid-cols-1 gap-8 p-8 bg-white/5 border border-white/5 rounded-[2.5rem] backdrop-blur-sm">
          {/* Hero Title */}
          <div className="space-y-3">
            <Label htmlFor="heroTitle" className="text-sm font-bold uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
              <Type className="h-4 w-4" />
              {t('heroTitle')}
            </Label>
            <Input
              id="heroTitle"
              value={heroTitle}
              onChange={e => setHeroTitle(e.target.value)}
              placeholder={t('heroTitlePlaceholder')}
              className="h-14 bg-background/50 border-white/5 rounded-2xl text-white placeholder:text-white/20 px-6 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium text-lg"
            />
          </div>

          {/* Hero Subtitle */}
          <div className="space-y-3">
            <Label htmlFor="heroSubtitle" className="text-sm font-bold uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('heroSubtitle')}
            </Label>
            <Input
              id="heroSubtitle"
              value={heroSubtitle}
              onChange={e => setHeroSubtitle(e.target.value)}
              placeholder={t('heroSubtitlePlaceholder')}
              className="h-14 bg-background/50 border-white/5 rounded-2xl text-white placeholder:text-white/20 px-6 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium text-lg"
            />
          </div>

          {/* Bio */}
          <div className="space-y-3">
            <Label htmlFor="bio" className="text-sm font-bold uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('bio')}
            </Label>
            <textarea
              id="bio"
              rows={5}
              className="flex min-h-[140px] w-full rounded-2xl border border-white/5 bg-background/50 px-6 py-4 text-white ring-offset-background placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 active:border-primary/50 transition-all disabled:cursor-not-allowed disabled:opacity-50 text-base"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder={t('bioPlaceholder')}
            />
          </div>
        </div>

        {/* Use Placeholder Option */}
        {!hideInternalButton && (
          <div className="flex justify-center flex-col items-center gap-4">
            <Button
              variant="ghost"
              onClick={onContinue}
              className="text-white/40 hover:text-white hover:bg-white/5 rounded-full px-8 h-12"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t('usePlaceholder')}
            </Button>

            <GradientButton
              size="lg"
              onClick={handleContinue}
              className="min-w-[240px] h-16 rounded-2xl text-lg shadow-2xl shadow-primary/40 group text-white"
            >
              Continue
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </GradientButton>
          </div>
        )}
      </motion.div>
    </div>
  );
}

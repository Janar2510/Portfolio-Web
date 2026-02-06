'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ProfileService } from '@/lib/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactAvatar } from '@/components/ui/contact-avatar';
import { Upload, Camera, ArrowRight, User } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { motion } from 'framer-motion';

interface ProfileStepProps {
  onContinue: () => void;
  onSkip?: () => void;
  hideInternalButton?: boolean;
}

export function ProfileStep({ onContinue, onSkip, hideInternalButton }: ProfileStepProps) {
  const t = useTranslations('onboarding.profile');
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const supabase = createClient();
  const profileService = new ProfileService(supabase);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: {
      display_name?: string;
      tagline?: string;
      avatar_url?: string;
    }) => {
      return await profileService.updateProfile(data);
    },
    onSuccess: () => {
      onContinue();
    },
  });

  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarFile(file);
      // Create preview for immediate feedback
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      // Actual upload
      const publicUrl = await profileService.uploadAvatar(file);
      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Avatar upload failed:', error);
    }
  };

  const handleContinue = async () => {
    if (!displayName.trim() && !avatarUrl) {
      // Can continue if nothing provided, using onSkip or just default
      onContinue();
      return;
    }

    await updateProfileMutation.mutateAsync({
      display_name: displayName.trim() || undefined,
      avatar_url: avatarUrl || undefined,
    });
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
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity" />
            <div className="relative">
              <ContactAvatar
                name={displayName || 'User'}
                avatarUrl={avatarUrl}
                size="lg"
                className="w-32 h-32 rounded-full border-4 border-background shadow-2xl"
              />
              <label
                htmlFor="avatar"
                className="absolute bottom-1 right-1 p-2.5 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:bg-primary/80 transition-all hover:scale-110 active:scale-95 border-2 border-background"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
              </label>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-white/80">{t('avatar')}</p>
            <p className="text-xs text-white/40">{t('avatarHint')}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-8 p-8 bg-white/5 border border-white/5 rounded-[2.5rem] backdrop-blur-sm">
          <div className="space-y-3">
            <Label htmlFor="displayName" className="text-sm font-bold uppercase tracking-widest text-white/40 ml-1">
              {t('displayName')}
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t('displayNamePlaceholder')}
              className="h-14 bg-background/50 border-white/5 rounded-2xl text-white placeholder:text-white/20 px-6 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="tagline" className="text-sm font-bold uppercase tracking-widest text-white/40 ml-1">
              {t('tagline')}
            </Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder={t('taglinePlaceholder')}
              className="h-14 bg-[#0B0F19]/50 border-white/5 rounded-2xl text-white placeholder:text-white/20 px-6 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium text-lg"
            />
          </div>
        </div>

        {/* Action Button */}
        {!hideInternalButton && (
          <div className="flex justify-center pt-4">
            <GradientButton
              size="lg"
              onClick={handleContinue}
              disabled={updateProfileMutation.isPending}
              className="min-w-[240px] h-16 rounded-2xl text-lg shadow-2xl shadow-primary/40 group"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Continue'}
              {!updateProfileMutation.isPending && <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />}
            </GradientButton>
          </div>
        )}
      </motion.div>
    </div>
  );
}

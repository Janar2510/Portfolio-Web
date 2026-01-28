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
import { Upload } from 'lucide-react';

interface ProfileStepProps {
  onContinue: () => void;
  onSkip?: () => void;
}

export function ProfileStep({ onContinue, onSkip }: ProfileStepProps) {
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
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <ContactAvatar
            name={displayName || 'User'}
            avatarUrl={avatarUrl}
            size="lg"
          />
          <div>
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
                <Upload className="h-4 w-4" />
                <span>{t('avatar')}</span>
              </div>
            </Label>
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
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {t('avatarHint')}
            </p>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">{t('displayName')}</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder={t('displayNamePlaceholder')}
          />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline">{t('tagline')}</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder={t('taglinePlaceholder')}
          />
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={updateProfileMutation.isPending}
            className="min-w-[200px]"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

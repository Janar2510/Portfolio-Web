"use client";

import { useMemo, useState } from 'react';
import { useEditorStore } from '@/stores/portfolio';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function MediaStep() {
  const { draftConfig, updateAssets } = useEditorStore();
  const [projectsValue, setProjectsValue] = useState<string | null>(null);

  const assets = useMemo(() => draftConfig?.assets || {}, [draftConfig]);

  if (!draftConfig) {
    return (
      <div className="text-sm text-muted-foreground" style={{ padding: 'var(--space-4)' }}>
        Pick a template to start adding images.
      </div>
    );
  }

  const handleProjectImagesChange = (value: string) => {
    setProjectsValue(value);
    const urls = value
      .split('\n')
      .map(url => url.trim())
      .filter(Boolean);
    updateAssets({
      logo: assets.logo,
      avatar: assets.avatar,
      heroImage: assets.heroImage,
      projectImages: urls,
    });
  };

  return (
    <div
      className="flex flex-col"
      style={{ gap: 'var(--card-gap)', padding: 'var(--space-4)' }}
    >
      <GradientBorderCard>
        <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <div>
            <h3 className="text-sm font-semibold">Brand images</h3>
            <p className="text-xs text-muted-foreground">
              Add your logo and hero image.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="logo-url" className="text-xs">
              Logo URL
            </Label>
            <Input
              id="logo-url"
              value={assets.logo || ''}
              onChange={event =>
                updateAssets({
                  logo: event.target.value,
                  avatar: assets.avatar,
                  heroImage: assets.heroImage,
                  projectImages: assets.projectImages || [],
                })
              }
            />
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="hero-url" className="text-xs">
              Hero image URL
            </Label>
            <Input
              id="hero-url"
              value={assets.heroImage || ''}
              onChange={event =>
                updateAssets({
                  logo: assets.logo,
                  avatar: assets.avatar,
                  heroImage: event.target.value,
                  projectImages: assets.projectImages || [],
                })
              }
            />
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="avatar-url" className="text-xs">
              Avatar URL
            </Label>
            <Input
              id="avatar-url"
              value={assets.avatar || ''}
              onChange={event =>
                updateAssets({
                  logo: assets.logo,
                  avatar: event.target.value,
                  heroImage: assets.heroImage,
                  projectImages: assets.projectImages || [],
                })
              }
            />
          </div>
        </div>
      </GradientBorderCard>

      <GradientBorderCard>
        <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <div>
            <h3 className="text-sm font-semibold">Project images</h3>
            <p className="text-xs text-muted-foreground">
              Paste one image URL per line for your portfolio grid.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="project-images" className="text-xs">
              Project image URLs
            </Label>
            <Textarea
              id="project-images"
              value={
                projectsValue ?? (assets.projectImages || []).join('\n')
              }
              onChange={event => handleProjectImagesChange(event.target.value)}
              rows={6}
            />
          </div>
        </div>
      </GradientBorderCard>
    </div>
  );
}

"use client";

import { PRESET_FONTS, PRESET_PALETTES } from '@/lib/portfolio/constants';
import { useEditorStore } from '@/stores/portfolio';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Button } from '@/components/ui/button';

export function ThemeStep() {
  const { draftConfig, updateThemePalette, updateThemeFonts } =
    useEditorStore();

  if (!draftConfig) {
    return (
      <div className="text-sm text-muted-foreground" style={{ padding: 'var(--space-4)' }}>
        Pick a template to start customizing your theme.
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{ gap: 'var(--card-gap)', padding: 'var(--space-4)' }}
    >
      <GradientBorderCard>
        <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <div>
            <h3 className="text-sm font-semibold">Color palette</h3>
            <p className="text-xs text-muted-foreground">
              Pick the vibe that matches your brand.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            {PRESET_PALETTES.map(palette => (
              <Button
                key={palette.id}
                variant="outline"
                onClick={() => updateThemePalette(palette.colors)}
                className="justify-between"
              >
                <span className="text-xs font-medium">{palette.name}</span>
                <span className="text-xs text-muted-foreground">
                  {palette.id}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </GradientBorderCard>

      <GradientBorderCard>
        <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <div>
            <h3 className="text-sm font-semibold">Fonts</h3>
            <p className="text-xs text-muted-foreground">
              Choose typography for headings and body text.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            {PRESET_FONTS.map(font => (
              <Button
                key={font.id}
                variant="outline"
                onClick={() =>
                  updateThemeFonts({
                    headingFont: font.fonts.heading,
                    bodyFont: font.fonts.body,
                  })
                }
                className="justify-between"
              >
                <span className="text-xs font-medium">{font.name}</span>
                <span className="text-xs text-muted-foreground">
                  {font.id}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </GradientBorderCard>
    </div>
  );
}

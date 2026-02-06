'use client';

import { useStylesStore } from '@/stores/portfolio';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

import { PRESET_PALETTES, PRESET_FONTS } from '@/lib/portfolio/constants';

export function ThemePresetsPanel() {
    const { styles, setStyles } = useStylesStore();

    const applyPalette = (palette: typeof PRESET_PALETTES[0]) => {
        setStyles({
            ...styles,
            colors: palette.colors
        } as any);
    };

    const applyFonts = (fontSet: typeof PRESET_FONTS[0]) => {
        setStyles({
            ...styles,
            typography: {
                ...styles?.typography,
                ...fontSet.fonts
            }
        } as any);
    };

    // Helper to detect current palette (approximate)
    const currentPrimary = styles?.colors?.primary;
    // @ts-ignore - store types might vary slightly
    const currentFont = styles?.typography?.body;

    return (
        <div className="p-4 space-y-8">
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Color Palette</h3>
                <div className="grid grid-cols-1 gap-3">
                    {PRESET_PALETTES.map((palette) => (
                        <button
                            key={palette.id}
                            onClick={() => applyPalette(palette)}
                            className={cn(
                                "group flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/50 transition-all text-left",
                                currentPrimary === palette.colors.primary ? "ring-1 ring-primary border-primary bg-primary/5" : "bg-card"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-1">
                                    <div className="w-6 h-6 rounded-full border border-border" style={{ background: palette.colors.background }} />
                                    <div className="w-6 h-6 rounded-full border border-border" style={{ background: palette.colors.primary }} />
                                    <div className="w-6 h-6 rounded-full border border-border" style={{ background: palette.colors.accent }} />
                                </div>
                                <span className="font-medium text-sm">{palette.name}</span>
                            </div>
                            {currentPrimary === palette.colors.primary && <Check className="w-4 h-4 text-primary" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Typography</h3>
                <div className="grid grid-cols-1 gap-3">
                    {PRESET_FONTS.map((font) => (
                        <button
                            key={font.id}
                            onClick={() => applyFonts(font)}
                            className={cn(
                                "group flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/50 transition-all text-left",
                                currentFont === font.fonts.body ? "ring-1 ring-primary border-primary bg-primary/5" : "bg-card"
                            )}
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-base" style={{ fontFamily: font.fonts.heading }}>Abc</span>
                                <span className="text-xs text-muted-foreground">{font.name}</span>
                            </div>
                            {currentFont === font.fonts.body && <Check className="w-4 h-4 text-primary" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

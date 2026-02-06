'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    colorPalettes,
    filterPalettesByCategory,
    getPaletteCategories,
    type ColorPalette
} from '@/lib/editor/color-palettes';
import { ThemeColors } from '@/domain/sites/theme-schema';

interface ColorPalettePickerProps {
    value: ThemeColors;
    onChange: (colors: ThemeColors) => void;
}

export function ColorPalettePicker({ value, onChange }: ColorPalettePickerProps) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const categories = getPaletteCategories();
    const filteredPalettes = filterPalettesByCategory(selectedCategory);

    const isSelected = (palette: ColorPalette) => {
        return JSON.stringify(palette.colors) === JSON.stringify(value);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-base font-semibold">Color Palette</Label>
                <p className="text-sm text-muted-foreground mt-1">
                    Choose a pre-defined color scheme or customize your own
                </p>
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="w-full justify-start overflow-x-auto">
                    {categories.map((category) => (
                        <TabsTrigger key={category} value={category} className="capitalize">
                            {category}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPalettes.map((palette) => (
                            <Card
                                key={palette.id}
                                className={`
                  relative cursor-pointer transition-all duration-200
                  hover:scale-[1.02] hover:shadow-lg
                  ${isSelected(palette)
                                        ? 'ring-2 ring-[hsl(var(--brand-violet))] shadow-glow-soft'
                                        : 'hover:border-[hsl(var(--brand-violet))]'
                                    }
                `}
                                onClick={() => onChange(palette.colors)}
                            >
                                {/* Selection indicator */}
                                {isSelected(palette) && (
                                    <div className="absolute top-3 right-3 bg-[hsl(var(--brand-violet))] text-white rounded-full p-1 shadow-md z-10">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}

                                {/* Color swatches */}
                                <div className="grid grid-cols-6 gap-0 rounded-t-lg overflow-hidden">
                                    <div
                                        className="h-12"
                                        style={{ backgroundColor: palette.colors.primary }}
                                        title="Primary"
                                    />
                                    <div
                                        className="h-12"
                                        style={{ backgroundColor: palette.colors.secondary }}
                                        title="Secondary"
                                    />
                                    <div
                                        className="h-12"
                                        style={{ backgroundColor: palette.colors.background }}
                                        title="Background"
                                    />
                                    <div
                                        className="h-12"
                                        style={{ backgroundColor: palette.colors.surface }}
                                        title="Surface"
                                    />
                                    <div
                                        className="h-12"
                                        style={{ backgroundColor: palette.colors.text }}
                                        title="Text"
                                    />
                                    <div
                                        className="h-12"
                                        style={{ backgroundColor: palette.colors.textMuted }}
                                        title="Text Muted"
                                    />
                                </div>

                                {/* Palette info */}
                                <div className="p-4">
                                    <h4 className="font-semibold text-sm mb-1">{palette.name}</h4>
                                    <p className="text-xs text-muted-foreground">{palette.description}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Custom color editor (future enhancement) */}
            <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                    💡 Tip: Click any palette to apply it instantly. Custom color editing coming soon!
                </p>
            </div>
        </div>
    );
}

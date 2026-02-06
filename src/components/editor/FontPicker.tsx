'use client';

import { useState, useEffect } from 'react';
import { Check, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    googleFonts,
    getFontsByCategory,
    getFontPairings,
    loadGoogleFont,
    type FontOption
} from '@/lib/fonts/google-fonts';
import { ThemeFonts } from '@/domain/sites/theme-schema';

interface FontPickerProps {
    value: ThemeFonts;
    onChange: (fonts: ThemeFonts) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<FontOption['category'] | 'all'>('all');
    const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

    // Load selected fonts
    useEffect(() => {
        if (value.heading && !loadedFonts.has(value.heading)) {
            loadGoogleFont(value.heading).then(() => {
                setLoadedFonts(prev => new Set(prev).add(value.heading));
            });
        }
        if (value.body && !loadedFonts.has(value.body)) {
            loadGoogleFont(value.body).then(() => {
                setLoadedFonts(prev => new Set(prev).add(value.body));
            });
        }
    }, [value, loadedFonts]);

    const filteredFonts = googleFonts.filter((font) => {
        const matchesSearch = font.family.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleFontSelect = (fontFamily: string, type: 'heading' | 'body') => {
        // Load font before applying
        if (!loadedFonts.has(fontFamily)) {
            loadGoogleFont(fontFamily).then(() => {
                setLoadedFonts(prev => new Set(prev).add(fontFamily));
                onChange({
                    ...value,
                    [type]: fontFamily,
                });
            });
        } else {
            onChange({
                ...value,
                [type]: fontFamily,
            });
        }
    };

    const headingPairings = getFontPairings(value.heading);

    return (
        <div className="space-y-6">
            <div>
                <Label className="text-base font-semibold">Typography</Label>
                <p className="text-sm text-muted-foreground mt-1">
                    Choose fonts for headings and body text
                </p>
            </div>

            {/* Current selection */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-[hsl(var(--bg-elevated))]">
                    <Label className="text-xs text-muted-foreground mb-2 block">Heading Font</Label>
                    <p
                        className="text-2xl font-bold truncate"
                        style={{ fontFamily: value.heading }}
                    >
                        {value.heading}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">The quick brown fox</p>
                </Card>

                <Card className="p-4 bg-[hsl(var(--bg-elevated))]">
                    <Label className="text-xs text-muted-foreground mb-2 block">Body Font</Label>
                    <p
                        className="text-2xl font-bold truncate"
                        style={{ fontFamily: value.body }}
                    >
                        {value.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">The quick brown fox</p>
                </Card>
            </div>

            {/* Font pairings suggestion */}
            {headingPairings.length > 0 && (
                <div className="p-4 bg-[hsl(var(--bg-surface))] rounded-lg border">
                    <Label className="text-sm font-semibold mb-3 block">
                        💡 Suggested pairings for {value.heading}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {headingPairings.map((font) => (
                            <button
                                key={font.family}
                                onClick={() => handleFontSelect(font.family, 'body')}
                                className={`
                  px-3 py-1.5 rounded-lg text-sm transition-all
                  ${value.body === font.family
                                        ? 'bg-[hsl(var(--brand-violet))] text-white'
                                        : 'bg-[hsl(var(--bg-elevated))] hover:bg-[hsl(var(--brand-violet))] hover:text-white'
                                    }
                `}
                            >
                                {font.family}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Font browser */}
            <Tabs value="browse" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="browse" className="flex-1">Browse Fonts</TabsTrigger>
                    <TabsTrigger value="heading" className="flex-1">For Headings</TabsTrigger>
                    <TabsTrigger value="body" className="flex-1">For Body</TabsTrigger>
                </TabsList>

                <TabsContent value="browse" className="space-y-4">
                    {/* Search and filter */}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search fonts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as any)}
                            className="px-4 py-2 rounded-lg border bg-background"
                        >
                            <option value="all">All Categories</option>
                            <option value="sans-serif">Sans Serif</option>
                            <option value="serif">Serif</option>
                            <option value="display">Display</option>
                            <option value="monospace">Monospace</option>
                        </select>
                    </div>

                    {/* Font list */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {filteredFonts.map((font) => (
                            <FontCard
                                key={font.family}
                                font={font}
                                isHeadingSelected={value.heading === font.family}
                                isBodySelected={value.body === font.family}
                                onSelectHeading={() => handleFontSelect(font.family, 'heading')}
                                onSelectBody={() => handleFontSelect(font.family, 'body')}
                                loadedFonts={loadedFonts}
                                onLoadFont={(family) => {
                                    loadGoogleFont(family).then(() => {
                                        setLoadedFonts(prev => new Set(prev).add(family));
                                    });
                                }}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="heading" className="space-y-2 max-h-[500px] overflow-y-auto">
                    {googleFonts.map((font) => (
                        <FontCard
                            key={font.family}
                            font={font}
                            isHeadingSelected={value.heading === font.family}
                            isBodySelected={false}
                            onSelectHeading={() => handleFontSelect(font.family, 'heading')}
                            onSelectBody={() => { }}
                            loadedFonts={loadedFonts}
                            onLoadFont={(family) => {
                                loadGoogleFont(family).then(() => {
                                    setLoadedFonts(prev => new Set(prev).add(family));
                                });
                            }}
                            showOnlyHeading
                        />
                    ))}
                </TabsContent>

                <TabsContent value="body" className="space-y-2 max-h-[500px] overflow-y-auto">
                    {googleFonts.map((font) => (
                        <FontCard
                            key={font.family}
                            font={font}
                            isHeadingSelected={false}
                            isBodySelected={value.body === font.family}
                            onSelectHeading={() => { }}
                            onSelectBody={() => handleFontSelect(font.family, 'body')}
                            loadedFonts={loadedFonts}
                            onLoadFont={(family) => {
                                loadGoogleFont(family).then(() => {
                                    setLoadedFonts(prev => new Set(prev).add(family));
                                });
                            }}
                            showOnlyBody
                        />
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface FontCardProps {
    font: FontOption;
    isHeadingSelected: boolean;
    isBodySelected: boolean;
    onSelectHeading: () => void;
    onSelectBody: () => void;
    loadedFonts: Set<string>;
    onLoadFont: (family: string) => void;
    showOnlyHeading?: boolean;
    showOnlyBody?: boolean;
}

function FontCard({
    font,
    isHeadingSelected,
    isBodySelected,
    onSelectHeading,
    onSelectBody,
    loadedFonts,
    onLoadFont,
    showOnlyHeading,
    showOnlyBody,
}: FontCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered && !loadedFonts.has(font.family)) {
            onLoadFont(font.family);
        }
    }, [isHovered, font.family, loadedFonts, onLoadFont]);

    return (
        <Card
            className="p-4 hover:border-[hsl(var(--brand-violet))] transition-all cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{font.family}</h4>
                        <span className="text-xs text-muted-foreground capitalize">
                            {font.category}
                        </span>
                    </div>
                    <p
                        className="text-2xl mb-2 truncate"
                        style={{ fontFamily: loadedFonts.has(font.family) ? font.family : 'inherit' }}
                    >
                        The quick brown fox jumps
                    </p>
                    <p className="text-xs text-muted-foreground">{font.description}</p>
                </div>

                <div className="flex flex-col gap-2">
                    {!showOnlyBody && (
                        <button
                            onClick={onSelectHeading}
                            className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                ${isHeadingSelected
                                    ? 'bg-[hsl(var(--brand-violet))] text-white'
                                    : 'bg-[hsl(var(--bg-elevated))] hover:bg-[hsl(var(--brand-violet))] hover:text-white'
                                }
              `}
                        >
                            {isHeadingSelected && <Check className="w-3 h-3 inline mr-1" />}
                            Heading
                        </button>
                    )}
                    {!showOnlyHeading && (
                        <button
                            onClick={onSelectBody}
                            className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                ${isBodySelected
                                    ? 'bg-[hsl(var(--brand-violet))] text-white'
                                    : 'bg-[hsl(var(--bg-elevated))] hover:bg-[hsl(var(--brand-violet))] hover:text-white'
                                }
              `}
                        >
                            {isBodySelected && <Check className="w-3 h-3 inline mr-1" />}
                            Body
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
}

'use client';

import { useState } from 'react';
import { Palette, Type, Image as ImageIcon, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPalettePicker } from './ColorPalettePicker';
import { FontPicker } from './FontPicker';
import { LogoUploader } from './LogoUploader';
import { Theme, defaultTheme } from '@/domain/sites/theme-schema';

interface ThemeCustomizerProps {
    value: Theme;
    onChange: (theme: Theme) => void;
    onSave?: () => void;
    onClose?: () => void;
    isSaving?: boolean;
}

export function ThemeCustomizer({
    value,
    onChange,
    onSave,
    onClose,
    isSaving = false,
}: ThemeCustomizerProps) {
    const [activeTab, setActiveTab] = useState('colors');

    const handleReset = () => {
        if (confirm('Reset theme to default? This will discard all customizations.')) {
            onChange(defaultTheme);
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between bg-[hsl(var(--bg-surface))]">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Theme Customizer</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Customize colors, fonts, and branding
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                    >
                        Reset to Default
                    </Button>

                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                            <TabsTrigger value="colors" className="gap-2">
                                <Palette className="w-4 h-4" />
                                Colors
                            </TabsTrigger>
                            <TabsTrigger value="fonts" className="gap-2">
                                <Type className="w-4 h-4" />
                                Typography
                            </TabsTrigger>
                            <TabsTrigger value="logo" className="gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Logo
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="colors" className="space-y-6">
                            <Card className="surface">
                                <CardHeader>
                                    <CardTitle>Color Palette</CardTitle>
                                    <CardDescription>
                                        Choose a pre-defined color scheme or customize individual colors
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ColorPalettePicker
                                        value={value.colors}
                                        onChange={(colors) => onChange({ ...value, colors })}
                                    />
                                </CardContent>
                            </Card>

                            {/* Live preview */}
                            <Card className="surface">
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                    <CardDescription>
                                        See how your color palette looks in action
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="p-8 rounded-lg space-y-4"
                                        style={{ backgroundColor: value.colors.background }}
                                    >
                                        <div
                                            className="p-6 rounded-lg"
                                            style={{ backgroundColor: value.colors.surface }}
                                        >
                                            <h3
                                                className="text-2xl font-bold mb-2"
                                                style={{ color: value.colors.text }}
                                            >
                                                Heading Text
                                            </h3>
                                            <p
                                                className="mb-4"
                                                style={{ color: value.colors.textMuted }}
                                            >
                                                This is body text with muted color for secondary information.
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    className="px-4 py-2 rounded-lg font-medium text-white"
                                                    style={{ backgroundColor: value.colors.primary }}
                                                >
                                                    Primary Button
                                                </button>
                                                <button
                                                    className="px-4 py-2 rounded-lg font-medium text-white"
                                                    style={{ backgroundColor: value.colors.secondary }}
                                                >
                                                    Secondary Button
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="fonts" className="space-y-6">
                            <Card className="surface">
                                <CardHeader>
                                    <CardTitle>Typography</CardTitle>
                                    <CardDescription>
                                        Select fonts for headings and body text
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FontPicker
                                        value={value.fonts}
                                        onChange={(fonts) => onChange({ ...value, fonts })}
                                    />
                                </CardContent>
                            </Card>

                            {/* Font preview */}
                            <Card className="surface">
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                    <CardDescription>
                                        See how your fonts look together
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6 p-6 bg-[hsl(var(--bg-elevated))] rounded-lg">
                                        <div>
                                            <h1
                                                className="text-4xl font-bold mb-2"
                                                style={{ fontFamily: value.fonts.heading }}
                                            >
                                                Main Heading
                                            </h1>
                                            <h2
                                                className="text-2xl font-semibold mb-2"
                                                style={{ fontFamily: value.fonts.heading }}
                                            >
                                                Subheading
                                            </h2>
                                            <h3
                                                className="text-xl font-semibold"
                                                style={{ fontFamily: value.fonts.heading }}
                                            >
                                                Section Title
                                            </h3>
                                        </div>
                                        <div style={{ fontFamily: value.fonts.body }}>
                                            <p className="mb-4">
                                                This is body text using your selected font. It should be easy to read
                                                and comfortable for longer paragraphs. The quick brown fox jumps over
                                                the lazy dog.
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                This is smaller text, often used for captions or secondary information.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="logo" className="space-y-6">
                            <Card className="surface">
                                <CardHeader>
                                    <CardTitle>Brand Logo</CardTitle>
                                    <CardDescription>
                                        Upload your logo to appear in the site header
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <LogoUploader
                                        value={value.logo}
                                        onChange={(logo) => onChange({ ...value, logo })}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Footer */}
            {onSave && (
                <div className="border-t px-6 py-4 bg-[hsl(var(--bg-surface))] flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Changes will be applied to your site immediately
                    </p>

                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                        className="gap-2 min-w-[120px]"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Theme
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}

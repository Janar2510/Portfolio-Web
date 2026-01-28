/**
 * Colors Panel Component
 * Color palette editor with color picker
 */

'use client';

import { useStylesStore } from '@/stores/portfolio';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Moon, Save } from 'lucide-react';
import { useState } from 'react';

const COLOR_PRESETS = [
  {
    name: 'Burnt Sienna',
    colors: {
      primary: '#D35400',
      secondary: '#E67E22',
      accent: '#F39C12',
      background: '#FFFFFF',
      text: '#2C3E50',
      surface: '#FDF2E9',
      border: '#FAE5D3',
    },
  },
  {
    name: 'Cornflower Dip',
    colors: {
      primary: '#4A90E2',
      secondary: '#357ABD',
      accent: '#D4E6F1',
      background: '#FFFFFF',
      text: '#1F2937',
      surface: '#F0F8FF',
      border: '#EBF5FB',
    },
  },
  {
    name: 'Olive & Sage',
    colors: {
      primary: '#556B2F',
      secondary: '#8FBC8F',
      accent: '#F5F5DC',
      background: '#FFFFF0',
      text: '#2F4F4F',
      surface: '#F0FFF0',
      border: '#E0EEE0',
    },
  },
  {
    name: 'Pitch Black',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      background: '#FFFFFF',
      text: '#000000',
      surface: '#FAFAFA',
      border: '#E5E5E5',
    },
  },
  {
    name: 'Blue Marker',
    colors: {
      primary: '#2962FF',
      secondary: '#448AFF',
      accent: '#82B1FF',
      background: '#FFFFFF',
      text: '#0D47A1',
      surface: '#E3F2FD',
      border: '#BBDEFB',
    },
  },
  {
    name: 'Pastel Pink',
    colors: {
      primary: '#E91E63',
      secondary: '#EC407A',
      accent: '#F8BBD0',
      background: '#FFF0F5',
      text: '#880E4F',
      surface: '#FCE4EC',
      border: '#F8BBD0',
    },
  },
];

export function ColorsPanel() {
  const {
    styles,
    updateColors,
    savePreset,
    presets,
    applyPreset,
    darkModeEnabled,
    setDarkModeEnabled,
  } = useStylesStore();
  const [presetName, setPresetName] = useState('');

  if (!styles) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No styles loaded
      </div>
    );
  }

  const handleColorChange = (key: string, value: string) => {
    updateColors({ [key]: value });
  };

  const handlePresetSave = () => {
    if (!presetName.trim() || !styles) return;

    savePreset({
      name: presetName,
      colors: styles.colors,
    });
    setPresetName('');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Color Palette */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-4">Color Palette</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Primary */}
            <div className="space-y-2">
              <Label htmlFor="color-primary" className="text-xs">
                Primary
              </Label>
              <div className="flex gap-2">
                <Input
                  id="color-primary"
                  type="color"
                  value={styles.colors.primary}
                  onChange={e => handleColorChange('primary', e.target.value)}
                  className="h-10 w-16"
                />
                <Input
                  type="text"
                  value={styles.colors.primary}
                  onChange={e => handleColorChange('primary', e.target.value)}
                  className="flex-1"
                  placeholder="#008080"
                />
              </div>
            </div>

            {/* Secondary */}
            <div className="space-y-2">
              <Label htmlFor="color-secondary" className="text-xs">
                Secondary
              </Label>
              <div className="flex gap-2">
                <Input
                  id="color-secondary"
                  type="color"
                  value={styles.colors.secondary}
                  onChange={e => handleColorChange('secondary', e.target.value)}
                  className="h-10 w-16"
                />
                <Input
                  type="text"
                  value={styles.colors.secondary}
                  onChange={e => handleColorChange('secondary', e.target.value)}
                  className="flex-1"
                  placeholder="#E6A600"
                />
              </div>
            </div>

            {/* Accent */}
            <div className="space-y-2">
              <Label htmlFor="color-accent" className="text-xs">
                Accent
              </Label>
              <div className="flex gap-2">
                <Input
                  id="color-accent"
                  type="color"
                  value={styles.colors.accent}
                  onChange={e => handleColorChange('accent', e.target.value)}
                  className="h-10 w-16"
                />
                <Input
                  type="text"
                  value={styles.colors.accent}
                  onChange={e => handleColorChange('accent', e.target.value)}
                  className="flex-1"
                  placeholder="#6366F1"
                />
              </div>
            </div>

            {/* Background */}
            <div className="space-y-2">
              <Label htmlFor="color-background" className="text-xs">
                Background
              </Label>
              <div className="flex gap-2">
                <Input
                  id="color-background"
                  type="color"
                  value={styles.colors.background}
                  onChange={e =>
                    handleColorChange('background', e.target.value)
                  }
                  className="h-10 w-16"
                />
                <Input
                  type="text"
                  value={styles.colors.background}
                  onChange={e =>
                    handleColorChange('background', e.target.value)
                  }
                  className="flex-1"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <Label htmlFor="color-text" className="text-xs">
                Text
              </Label>
              <div className="flex gap-2">
                <Input
                  id="color-text"
                  type="color"
                  value={styles.colors.text}
                  onChange={e => handleColorChange('text', e.target.value)}
                  className="h-10 w-16"
                />
                <Input
                  type="text"
                  value={styles.colors.text}
                  onChange={e => handleColorChange('text', e.target.value)}
                  className="flex-1"
                  placeholder="#171C20"
                />
              </div>
            </div>

            {/* Surface */}
            <div className="space-y-2">
              <Label htmlFor="color-surface" className="text-xs">
                Surface
              </Label>
              <div className="flex gap-2">
                <Input
                  id="color-surface"
                  type="color"
                  value={styles.colors.surface}
                  onChange={e => handleColorChange('surface', e.target.value)}
                  className="h-10 w-16"
                />
                <Input
                  type="text"
                  value={styles.colors.surface}
                  onChange={e => handleColorChange('surface', e.target.value)}
                  className="flex-1"
                  placeholder="#F8FAFB"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Colors */}
        <div className="space-y-2">
          <Label className="text-xs">Additional Colors</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color-border" className="text-xs">
                Border
              </Label>
              <div className="flex gap-2">
                <Input
                  id="color-border"
                  type="color"
                  value={styles.colors.border}
                  onChange={e => handleColorChange('border', e.target.value)}
                  className="h-10 w-16"
                />
                <Input
                  type="text"
                  value={styles.colors.border}
                  onChange={e => handleColorChange('border', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-2">Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {COLOR_PRESETS.map(preset => (
              <Card
                key={preset.name}
                className="cursor-pointer hover:ring-2 hover:ring-primary transition-all group"
                onClick={() => updateColors(preset.colors)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {preset.name}
                    </span>
                  </div>
                  <div className="flex items-center -space-x-2">
                    <div
                      className="h-8 w-8 rounded-full border-2 border-background ring-1 ring-border"
                      style={{ backgroundColor: preset.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="h-8 w-8 rounded-full border-2 border-background ring-1 ring-border"
                      style={{ backgroundColor: preset.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="h-8 w-8 rounded-full border-2 border-background ring-1 ring-border"
                      style={{ backgroundColor: preset.colors.accent }}
                      title="Accent"
                    />
                    <div
                      className="h-8 w-8 rounded-full border-2 border-background ring-1 ring-border"
                      style={{ backgroundColor: preset.colors.background }}
                      title="Background"
                    />
                    <div
                      className="h-8 w-8 rounded-full border-2 border-background ring-1 ring-border"
                      style={{
                        backgroundColor: preset.colors.surface || '#f3f4f6',
                      }}
                      title="Surface"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Saved Presets */}
        {presets.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Saved Presets</h3>
            <div className="space-y-2">
              {presets.map(preset => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 cursor-pointer"
                  onClick={() => preset.colors && updateColors(preset.colors)}
                >
                  <span className="text-sm">{preset.name}</span>
                  {preset.colors && (
                    <div className="flex gap-1">
                      {Object.values(preset.colors)
                        .filter((c): c is string => typeof c === 'string')
                        .slice(0, 3)
                        .map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Current as Preset */}
        <div className="space-y-2">
          <Label htmlFor="preset-name" className="text-xs">
            Save Current as Preset
          </Label>
          <div className="flex gap-2">
            <Input
              id="preset-name"
              type="text"
              placeholder="Preset name"
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handlePresetSave}
              disabled={!presetName.trim()}
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dark Mode */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <Label className="text-xs">Dark Mode</Label>
          </div>
          <Button
            variant={darkModeEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDarkModeEnabled(!darkModeEnabled)}
          >
            {darkModeEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Enable and customize dark mode colors
        </p>
      </div>
    </div>
  );
}

/**
 * Typography Panel Component
 * Font selection and typography settings
 */

'use client';

import { useStylesStore } from '@/stores/portfolio';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';

const FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Lora', label: 'Lora' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Fira Code', label: 'Fira Code' },
];

export function TypographyPanel() {
  const { styles, updateTypography } = useStylesStore();

  if (!styles) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No styles loaded
      </div>
    );
  }

  const handleChange = (key: string, value: string | number) => {
    updateTypography({ [key]: value });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Fonts */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-4">Fonts</h3>
          <div className="space-y-4">
            {/* Heading Font */}
            <div className="space-y-2">
              <Label htmlFor="font-heading" className="text-xs">
                Heading Font
              </Label>
              <Select
                value={styles.typography.headingFont}
                onValueChange={value => handleChange('headingFont', value)}
              >
                <SelectTrigger id="font-heading">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Body Font */}
            <div className="space-y-2">
              <Label htmlFor="font-body" className="text-xs">
                Body Font
              </Label>
              <Select
                value={styles.typography.bodyFont}
                onValueChange={value => handleChange('bodyFont', value)}
              >
                <SelectTrigger id="font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mono Font */}
            <div className="space-y-2">
              <Label htmlFor="font-mono" className="text-xs">
                Monospace Font
              </Label>
              <Select
                value={styles.typography.monoFont}
                onValueChange={value => handleChange('monoFont', value)}
              >
                <SelectTrigger id="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.filter(
                    f => f.value.includes('Mono') || f.value.includes('Code')
                  ).map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Font Sizes */}
        <div>
          <h3 className="font-semibold text-sm mb-4">Sizes</h3>
          <div className="space-y-4">
            {/* Base Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Base Size</Label>
                <span className="text-xs text-muted-foreground">
                  {styles.typography.baseSize}px
                </span>
              </div>
              <Slider
                value={[styles.typography.baseSize]}
                onValueChange={([value]) => handleChange('baseSize', value)}
                min={12}
                max={20}
                step={1}
              />
            </div>

            {/* Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Type Scale</Label>
                <span className="text-xs text-muted-foreground">
                  {styles.typography.scale}
                </span>
              </div>
              <Slider
                value={[styles.typography.scale]}
                onValueChange={([value]) => handleChange('scale', value)}
                min={1.125}
                max={1.5}
                step={0.125}
              />
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Line Height</Label>
                <span className="text-xs text-muted-foreground">
                  {styles.typography.lineHeight}
                </span>
              </div>
              <Slider
                value={[styles.typography.lineHeight]}
                onValueChange={([value]) => handleChange('lineHeight', value)}
                min={1.2}
                max={2}
                step={0.1}
              />
            </div>
          </div>
        </div>

        {/* Font Weights */}
        <div>
          <h3 className="font-semibold text-sm mb-4">Weights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Heading Weight</Label>
              <Select
                value={styles.typography.headingWeight?.toString() || '700'}
                onValueChange={value =>
                  handleChange('headingWeight', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">Regular (400)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="600">Semi Bold (600)</SelectItem>
                  <SelectItem value="700">Bold (700)</SelectItem>
                  <SelectItem value="800">Extra Bold (800)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Body Weight</Label>
              <Select
                value={styles.typography.bodyWeight?.toString() || '400'}
                onValueChange={value =>
                  handleChange('bodyWeight', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light (300)</SelectItem>
                  <SelectItem value="400">Regular (400)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="600">Semi Bold (600)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="font-semibold text-sm mb-4">Preview</h3>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div
              style={{
                fontFamily: styles.typography.headingFont,
                fontSize: `${styles.typography.baseSize * Math.pow(styles.typography.scale, 3)}px`,
                fontWeight: styles.typography.headingWeight,
                lineHeight: styles.typography.lineHeight,
              }}
            >
              Heading Example
            </div>
            <div
              style={{
                fontFamily: styles.typography.bodyFont,
                fontSize: `${styles.typography.baseSize}px`,
                fontWeight: styles.typography.bodyWeight,
                lineHeight: styles.typography.lineHeight,
              }}
            >
              Body text example. This is how your content will look with the
              selected typography settings.
            </div>
            <div
              style={{
                fontFamily: styles.typography.monoFont,
                fontSize: `${styles.typography.baseSize}px`,
              }}
            >
              <code>Code example</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

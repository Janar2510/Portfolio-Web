/**
 * Spacing Panel Component
 * Spacing and layout controls
 */

'use client';

import { useStylesStore } from '@/stores/portfolio';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export function SpacingPanel() {
  const { styles, updateSpacing } = useStylesStore();

  if (!styles) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No styles loaded
      </div>
    );
  }

  const handleChange = (key: string, value: string | number) => {
    updateSpacing({ [key]: value });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Spacing Scale */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-4">Spacing Scale</h3>
          <div className="space-y-2">
            <Label className="text-xs">Scale Preset</Label>
            <Select
              value={styles.spacing.scale}
              onValueChange={(value) => handleChange('scale', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="relaxed">Relaxed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Section Padding */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Section Padding</Label>
            <span className="text-xs text-muted-foreground">
              {styles.spacing.sectionPadding}px
            </span>
          </div>
          <Slider
            value={[parseInt(styles.spacing.sectionPadding) || 80]}
            onValueChange={([value]) => handleChange('sectionPadding', value.toString())}
            min={0}
            max={200}
            step={10}
          />
        </div>

        {/* Container Width */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Container Width</Label>
            <span className="text-xs text-muted-foreground">
              {styles.spacing.containerWidth}px
            </span>
          </div>
          <Slider
            value={[parseInt(styles.spacing.containerWidth) || 1200]}
            onValueChange={([value]) => handleChange('containerWidth', value.toString())}
            min={800}
            max={1600}
            step={50}
          />
        </div>

        {/* Border Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Border Radius</Label>
            <span className="text-xs text-muted-foreground">
              {styles.spacing.borderRadius}px
            </span>
          </div>
          <Slider
            value={[parseInt(styles.spacing.borderRadius) || 8]}
            onValueChange={([value]) => handleChange('borderRadius', value.toString())}
            min={0}
            max={32}
            step={2}
          />
        </div>
      </div>
    </div>
  );
}

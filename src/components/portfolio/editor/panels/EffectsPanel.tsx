/**
 * Effects Panel Component
 * Animations, shadows, and visual effects
 */

'use client';

import { useStylesStore } from '@/stores/portfolio';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Zap, Layers } from 'lucide-react';

export function EffectsPanel() {
  const { styles, updateEffects } = useStylesStore();

  if (!styles) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No styles loaded
      </div>
    );
  }

  const handleToggle = (key: string, value: boolean) => {
    updateEffects({ [key]: value });
  };

  const handleSelect = (key: string, value: string) => {
    updateEffects({ [key]: value });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Shadows */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Shadows
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="shadows" className="text-xs cursor-pointer">
                Enable Shadows
              </Label>
              <Checkbox
                id="shadows"
                checked={styles.effects.shadows}
                onCheckedChange={checked =>
                  handleToggle('shadows', checked === true)
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Animations
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="animations" className="text-xs cursor-pointer">
                Enable Animations
              </Label>
              <Checkbox
                id="animations"
                checked={styles.effects.animations}
                onCheckedChange={checked =>
                  handleToggle('animations', checked === true)
                }
              />
            </div>

            {styles.effects.animations && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label className="text-xs">Animation Speed</Label>
                <Select
                  value={styles.effects.animationSpeed}
                  onValueChange={value => handleSelect('animationSpeed', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label
                htmlFor="scrollAnimations"
                className="text-xs cursor-pointer"
              >
                Scroll Animations
              </Label>
              <Checkbox
                id="scrollAnimations"
                checked={styles.effects.scrollAnimations}
                onCheckedChange={checked =>
                  handleToggle('scrollAnimations', checked === true)
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effects */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Hover Effects
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="hoverEffects" className="text-xs cursor-pointer">
                Enable Hover Effects
              </Label>
              <Checkbox
                id="hoverEffects"
                checked={styles.effects.hoverEffects}
                onCheckedChange={checked =>
                  handleToggle('hoverEffects', checked === true)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

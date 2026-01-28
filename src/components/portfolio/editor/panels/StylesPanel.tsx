/**
 * Styles Panel Component
 * Global styles editor sidebar with tabs
 */

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, Layout, Sparkles } from 'lucide-react';
import { ColorsPanel } from './ColorsPanel';
import { TypographyPanel } from './TypographyPanel';
import { SpacingPanel } from './SpacingPanel';
import { EffectsPanel } from './EffectsPanel';

export function StylesPanel() {
  return (
    <Tabs defaultValue="colors" className="h-full flex flex-col">
      <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
        <TabsTrigger value="colors" className="flex items-center gap-2 text-xs">
          <Palette className="h-3 w-3" />
          Colors
        </TabsTrigger>
        <TabsTrigger
          value="typography"
          className="flex items-center gap-2 text-xs"
        >
          <Type className="h-3 w-3" />
          Fonts
        </TabsTrigger>
        <TabsTrigger
          value="spacing"
          className="flex items-center gap-2 text-xs"
        >
          <Layout className="h-3 w-3" />
          Spacing
        </TabsTrigger>
        <TabsTrigger
          value="effects"
          className="flex items-center gap-2 text-xs"
        >
          <Sparkles className="h-3 w-3" />
          Effects
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-auto">
        <TabsContent value="colors" className="mt-0">
          <ColorsPanel />
        </TabsContent>
        <TabsContent value="typography" className="mt-0">
          <TypographyPanel />
        </TabsContent>
        <TabsContent value="spacing" className="mt-0">
          <SpacingPanel />
        </TabsContent>
        <TabsContent value="effects" className="mt-0">
          <EffectsPanel />
        </TabsContent>
      </div>
    </Tabs>
  );
}

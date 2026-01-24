/**
 * Editor Sidebar Component
 * Left sidebar with block library, pages, and styles tabs
 */

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlocksPanel } from './panels/BlocksPanel';
import { PagesPanel } from './panels/PagesPanel';
import { StylesPanel } from './panels/StylesPanel';
import { SettingsPanel } from './panels/SettingsPanel';
import { TemplatesPanel } from './panels/TemplatesPanel';
import { useEditorStore } from '@/stores/portfolio';
import { cn } from '@/lib/utils';

interface EditorSidebarProps {
  className?: string;
}

export function EditorSidebar({ className }: EditorSidebarProps) {
  const { sidebarTab, setSidebarTab } = useEditorStore();

  return (
    <div className={cn('bg-background border-r flex flex-col', className)}>
      <Tabs
        value={sidebarTab}
        onValueChange={(value) =>
          setSidebarTab(value as 'blocks' | 'styles' | 'pages' | 'settings' | 'templates')
        }
        className="flex flex-col h-full"
      >
        <TabsList className="grid grid-cols-5 w-full rounded-none border-b">
          <TabsTrigger value="blocks" className="text-xs">
            Blocks
          </TabsTrigger>
          <TabsTrigger value="pages" className="text-xs">
            Pages
          </TabsTrigger>
          <TabsTrigger value="styles" className="text-xs">
            Styles
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            Settings
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">
            Templates
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="blocks" className="mt-0 h-full">
            <BlocksPanel />
          </TabsContent>
          <TabsContent value="pages" className="mt-0 h-full">
            <PagesPanel />
          </TabsContent>
          <TabsContent value="styles" className="mt-0 h-full">
            <StylesPanel />
          </TabsContent>
          <TabsContent value="settings" className="mt-0 h-full">
            <SettingsPanel />
          </TabsContent>
          <TabsContent value="templates" className="mt-0 h-full">
            <TemplatesPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

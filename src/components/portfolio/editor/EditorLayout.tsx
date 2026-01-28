/**
 * Editor Layout Component
 * Main layout for the visual editor with sidebar, canvas, and settings panel
 */

'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SiteService } from '@/domain/builder/services';
import { SiteDocument } from '@/domain/templates/contracts';
import {
  useEditorStore,
  useBlocksStore,
  useStylesStore,
} from '@/stores/portfolio';
import { EditorSidebar } from './EditorSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { EditorSettingsPanel } from './EditorSettingsPanel';
import { cn } from '@/lib/utils';
import '@/domain/builder/blocks/definitions'; // Register blocks
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { getBlockIdFromDragId } from '@/lib/blocks/dnd';
import { useAddBlock } from '@/hooks/portfolio/use-editor';

interface EditorLayoutProps {
  pageId: string;
  siteId: string;
}

export function EditorLayout({ pageId, siteId }: EditorLayoutProps) {
  const supabase = createClient();
  const {
    currentPage,
    setCurrentPage,
    sidebarOpen,
    settingsPanelOpen,
    setSettingsPanelOpen,
    previewMode,
    view,
    setIsLoading,
  } = useEditorStore();

  const { setBlocks, setIsLoading: setBlocksLoading } = useBlocksStore();
  const { setStyles, setIsLoading: setStylesLoading } = useStylesStore();

  // Fetch Site Document (contains everything in config_draft)
  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ['portfolio-site', siteId],
    queryFn: async () => {
      const siteService = new SiteService();
      return await siteService.getSite(siteId);
    },
    enabled: !!siteId,
  });

  // Backward compatibility: Map config_draft to pages/blocks/styles for the stores
  useEffect(() => {
    if (site?.draft_config) {
      const { sections, theme } = site.draft_config;

      // 1. Set "Page" (mocked since it's single page for now)
      setCurrentPage({
        id: 'home',
        site_id: siteId,
        title: 'Home',
        slug: 'home'
      } as any);

      // 2. Set Blocks
      const mappedBlocks = (sections.order || []).map((id: string, index: number) => ({
        id,
        block_type: id.split('-')[0], // Assuming ID starts with block type
        content: sections.content[id] || {},
        settings: {},
        styles: {},
        sort_order: index,
        is_visible: sections.visibility[id] !== false
      }));
      setBlocks(mappedBlocks as any);

      // 3. Set Styles
      setStyles({
        id: 'styles',
        site_id: siteId,
        colors: theme.palette,
        typography: theme.fonts,
        spacing: { scale: 'default' },
        assets: site.draft_config.assets || {},
        siteTitle: site.draft_config.siteTitle,
        bio: site.draft_config.bio,
      } as any);
    }
  }, [site, setCurrentPage, setBlocks, setStyles, siteId]);

  useEffect(() => {
    setIsLoading(siteLoading);
  }, [siteLoading, setIsLoading]);

  // Drag and Drop Logic
  const { blocks, moveBlock } = useBlocksStore();
  const addBlockMutation = useAddBlock();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    if (active.id?.toString().startsWith('sidebar-block-')) {
      // It's a sidebar item
      const blockType = active.id.toString().replace('sidebar-block-', '');
      // Create a mock block for the drag overlay
      setDraggedBlock({
        id: 'temp',
        block_type: blockType,
        content: {},
      });
    } else {
      // It's a canvas block
      const blockId = getBlockIdFromDragId(active.id as string);
      const block = blocks.find(b => b.id === blockId);
      setDraggedBlock(block);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setDraggedBlock(null);

    if (!over) return;

    // Handle dropping a sidebar item
    if (active.id?.toString().startsWith('sidebar-block-')) {
      const blockType = active.id.toString().replace('sidebar-block-', '');
      const overBlockId = getBlockIdFromDragId(over.id as string);

      // Check if dropped relative to another block
      const newIndex = blocks.findIndex(block => block.id === overBlockId);

      if (newIndex !== -1) {
        const afterBlockId = blocks[newIndex].id;
        addBlockMutation.mutate({
          blockType,
          afterBlockId,
        });
      } else {
        // Dropped on container generally
        addBlockMutation.mutate({
          blockType,
          afterBlockId: undefined,
        });
      }
      return;
    }

    // Handle sorting existing blocks
    if (active.id !== over.id) {
      const activeBlockId = getBlockIdFromDragId(active.id as string);
      const overBlockId = getBlockIdFromDragId(over.id as string);

      const oldIndex = blocks.findIndex(block => block.id === activeBlockId);
      const newIndex = blocks.findIndex(block => block.id === overBlockId);

      if (oldIndex !== -1 && newIndex !== -1) {
        moveBlock(activeBlockId, newIndex);
        // Note: You should also probably call an API to persist this order
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setDraggedBlock(null);
  };

  if (siteLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Site not found</p>
        </div>
      </div>
    );
  }

  const mockPage = { id: 'home', title: 'Home' };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col h-screen bg-background">
        {/* Toolbar */}
        <EditorToolbar page={mockPage as any} siteId={siteId} />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <EditorSidebar
            className={cn(
              'transition-all duration-300 ease-in-out',
              sidebarOpen && view !== 'preview' ? 'w-64' : 'w-0 overflow-hidden'
            )}
          />

          {/* Canvas */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <EditorCanvas page={mockPage as any} previewMode={previewMode} view={view} />
          </div>

          {/* Settings Panel */}
          <EditorSettingsPanel
            className={cn(
              'transition-all duration-300 ease-in-out border-l',
              settingsPanelOpen && view !== 'preview'
                ? 'w-80'
                : 'w-0 overflow-hidden'
            )}
          />
        </div>

        {/* Global Drag Overlay */}
        <DragOverlay>
          {draggedBlock ? (
            <div className="p-4 bg-background border rounded shadow-lg opacity-80 w-64 pointer-events-none">
              {draggedBlock.block_type || 'Block'}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

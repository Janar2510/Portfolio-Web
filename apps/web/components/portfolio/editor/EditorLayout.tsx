/**
 * Editor Layout Component
 * Main layout for the visual editor with sidebar, canvas, and settings panel
 */

'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { useEditorStore, useBlocksStore, useStylesStore } from '@/stores/portfolio';
import { EditorSidebar } from './EditorSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { EditorSettingsPanel } from './EditorSettingsPanel';
import { cn } from '@/lib/utils';
import '@/lib/portfolio/blocks/definitions'; // Register blocks
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
  const portfolioService = new PortfolioService(supabase);

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

  // Fetch page
  const { data: page, isLoading: pageLoading } = useQuery({
    queryKey: ['portfolio-page', pageId],
    queryFn: async () => {
      return await portfolioService.getPageById(pageId);
    },
    enabled: !!pageId,
  });

  // Fetch blocks
  const { data: fetchedBlocks = [], isLoading: blocksLoading } = useQuery({
    queryKey: ['portfolio-blocks', pageId],
    queryFn: async () => {
      if (!pageId) return [];
      return await portfolioService.getBlocks(pageId);
    },
    enabled: !!pageId,
  });

  // Fetch styles
  const { data: styles, isLoading: stylesLoading } = useQuery({
    queryKey: ['portfolio-styles', siteId],
    queryFn: async () => {
      return await portfolioService.getStyles(siteId);
    },
    enabled: !!siteId,
  });

  // Update stores when data loads
  useEffect(() => {
    if (page) {
      setCurrentPage(page);
    }
  }, [page, setCurrentPage]);

  useEffect(() => {
    setBlocks(fetchedBlocks);
    setBlocksLoading(blocksLoading);
  }, [fetchedBlocks, blocksLoading, setBlocks, setBlocksLoading]);

  // Transform and update styles
  useEffect(() => {
    if (styles) {
      // Map DB style shape to Store style shape
      const appStyles: any = {
        id: styles.id,
        site_id: styles.site_id,
        colors: styles.color_palette,
        colors_dark: null,
        typography: styles.typography,
        // Default values for fields missing in DB for now
        spacing: {
          scale: styles.spacing_scale || 'default',
          sectionPadding: 'default',
          containerWidth: 'default',
          borderRadius: 'default',
        },
        effects: {
          shadows: false,
          animations: true,
          animationSpeed: 'normal',
          hoverEffects: true,
          scrollAnimations: true,
          ...(styles.custom_css ? { custom_css: styles.custom_css } : {}),
        },
        layout: {
          headerStyle: 'sticky',
          footerStyle: 'standard',
          navPosition: 'top',
        },
        custom_css: styles.custom_css,
        saved_presets: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setStyles(appStyles);
    } else if (!stylesLoading && !styles) {
      // Fallback: Initialize with default styles if none found (e.g. for new manually created sites)
      const defaultStyles: any = {
        id: 'default',
        site_id: siteId,
        colors: {
          primary: '#000000',
          secondary: '#ffffff',
          accent: '#3b82f6',
          background: '#ffffff',
          text: '#000000',
          surface: '#f3f4f6',
          border: '#e5e7eb',
        },
        typography: {
          fontFamily: 'Inter',
        },
        spacing: {
          scale: 'default',
        },
        effects: {},
        layout: {},
        custom_css: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setStyles(defaultStyles);
    }

    setStylesLoading(stylesLoading);
  }, [styles, stylesLoading, setStyles, setStylesLoading, siteId]);

  useEffect(() => {
    setIsLoading(pageLoading || blocksLoading || stylesLoading);
  }, [pageLoading, blocksLoading, stylesLoading, setIsLoading]);

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
      const block = blocks.find((b) => b.id === blockId);
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
      const newIndex = blocks.findIndex((block) => block.id === overBlockId);

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

      const oldIndex = blocks.findIndex((block) => block.id === activeBlockId);
      const newIndex = blocks.findIndex((block) => block.id === overBlockId);

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

  if (pageLoading || blocksLoading || stylesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </div>
    );
  }

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
        <EditorToolbar page={page} siteId={siteId} />

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
            <EditorCanvas
              page={page}
              previewMode={previewMode}
              view={view}
            />
          </div>

          {/* Settings Panel */}
          <EditorSettingsPanel
            className={cn(
              'transition-all duration-300 ease-in-out border-l',
              settingsPanelOpen && view !== 'preview' ? 'w-80' : 'w-0 overflow-hidden'
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

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PagesList } from './PagesList';
import { BlockToolbar } from './BlockToolbar';
import { BlockEditingPanel } from './BlockEditingPanel';
import { StyleCustomizationPanel } from './StyleCustomizationPanel';
import { BlockEditor } from '../editor/BlockEditor';
import { PortfolioService } from '@/lib/services/portfolio';
import type {
  PortfolioPage,
  PortfolioBlock,
  PortfolioStyle,
} from '@/lib/services/portfolio';
import type { BlockType } from '@/lib/blocks/schema';
import {
  getDefaultBlockContent,
  getDefaultBlockSettings,
} from '@/lib/blocks/schema';
import { Button } from '@/components/ui/button';
import { Palette, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface PageBuilderProps {
  siteId: string;
}

export function PageBuilder({ siteId }: PageBuilderProps) {
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<PortfolioBlock | null>(null);
  const [isEditingBlockOpen, setIsEditingBlockOpen] = useState(false);
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);
  const queryClient = useQueryClient();

  // Fetch pages
  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ['portfolio-pages', siteId],
    queryFn: async () => {
      return await portfolioService.getPages(siteId);
    },
  });

  // Fetch blocks for current page
  const { data: blocks = [], isLoading: blocksLoading } = useQuery({
    queryKey: ['portfolio-blocks', currentPageId],
    queryFn: async () => {
      if (!currentPageId) return [];
      return await portfolioService.getBlocks(currentPageId);
    },
    enabled: !!currentPageId,
  });

  // Fetch styles
  const { data: styles } = useQuery({
    queryKey: ['portfolio-styles', siteId],
    queryFn: async () => {
      return await portfolioService.getStyles(siteId);
    },
  });

  // Set first page as current on load
  useEffect(() => {
    if (pages.length > 0 && !currentPageId) {
      setCurrentPageId(pages[0].id);
    }
  }, [pages, currentPageId]);

  // Page mutations
  const createPageMutation = useMutation({
    mutationFn: async (data: {
      slug: string;
      title: string;
      is_homepage?: boolean;
    }) => {
      return await portfolioService.createPage(siteId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-pages', siteId] });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({
      pageId,
      data,
    }: {
      pageId: string;
      data: Partial<PortfolioPage>;
    }) => {
      return await portfolioService.updatePage(pageId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-pages', siteId] });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      return await portfolioService.deletePage(pageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-pages', siteId] });
      if (currentPageId === pages.find(p => p.id === currentPageId)?.id) {
        setCurrentPageId(null);
      }
    },
  });

  // Block mutations
  const createBlockMutation = useMutation({
    mutationFn: async ({
      pageId,
      blockType,
      afterBlockId,
    }: {
      pageId: string;
      blockType: BlockType;
      afterBlockId?: string;
    }) => {
      const afterIndex = afterBlockId
        ? blocks.findIndex(b => b.id === afterBlockId)
        : -1;
      const sortOrder = afterIndex >= 0 ? afterIndex + 1 : blocks.length;

      return await portfolioService.createBlock(pageId, {
        block_type: blockType,
        content: getDefaultBlockContent(blockType),
        settings: getDefaultBlockSettings(blockType),
        sort_order: sortOrder,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-blocks', currentPageId],
      });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async ({
      blockId,
      updates,
    }: {
      blockId: string;
      updates: Partial<PortfolioBlock>;
    }) => {
      return await portfolioService.updateBlock(blockId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-blocks', currentPageId],
      });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      return await portfolioService.deleteBlock(blockId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-blocks', currentPageId],
      });
    },
  });

  // Style mutation
  const updateStyleMutation = useMutation({
    mutationFn: async (styleData: Partial<PortfolioStyle>) => {
      if (styles) {
        return await portfolioService.updateStyles(siteId, styleData);
      } else {
        return await portfolioService.createStyles(
          siteId,
          styleData as PortfolioStyle
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-styles', siteId] });
    },
  });

  const handleBlockAdd = (blockType: BlockType, afterBlockId?: string) => {
    if (!currentPageId) return;
    createBlockMutation.mutate({
      pageId: currentPageId,
      blockType,
      afterBlockId,
    });
  };

  const handleBlockUpdate = (
    blockId: string,
    updates: Partial<PortfolioBlock>
  ) => {
    updateBlockMutation.mutate({ blockId, updates });
  };

  const handleBlockEdit = (block: PortfolioBlock) => {
    setEditingBlock(block);
    setIsEditingBlockOpen(true);
  };

  const handleBlockSave = (
    blockId: string,
    content: Record<string, unknown>,
    settings: Record<string, unknown>
  ) => {
    updateBlockMutation.mutate({
      blockId,
      updates: { content, settings },
    });
  };

  const handleBlocksReorder = (newBlocks: PortfolioBlock[]) => {
    // Update sort_order for all blocks
    newBlocks.forEach((block, index) => {
      if (block.sort_order !== index) {
        updateBlockMutation.mutate({
          blockId: block.id,
          updates: { sort_order: index },
        });
      }
    });
  };

  if (pagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Pages List */}
      <div className="w-64 flex-shrink-0">
        <PagesList
          pages={pages}
          currentPageId={currentPageId || undefined}
          onPageSelect={setCurrentPageId}
          onPageCreate={async data => {
            await createPageMutation.mutateAsync(data);
            const updatedPages = await portfolioService.getPages(siteId);
            if (updatedPages.length > 0) {
              setCurrentPageId(updatedPages[updatedPages.length - 1].id);
            }
          }}
          onPageUpdate={async (pageId, data) => {
            await updatePageMutation.mutateAsync({ pageId, data });
          }}
          onPageDelete={async pageId => {
            await deletePageMutation.mutateAsync(pageId);
          }}
        />
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between border-b bg-background px-4 py-2">
          <div className="flex items-center gap-2">
            <BlockToolbar
              onBlockAdd={blockType => handleBlockAdd(blockType)}
              disabled={!currentPageId || isPreviewMode}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
            >
              <Palette className="mr-2 h-4 w-4" />
              Styles
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-muted/20">
            {!currentPageId ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium">No page selected</p>
                  <p className="text-sm">
                    Select a page from the sidebar to start editing
                  </p>
                </div>
              </div>
            ) : blocksLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-muted-foreground">Loading blocks...</div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl bg-background">
                <BlockEditor
                  blocks={blocks}
                  onBlocksChange={handleBlocksReorder}
                  onBlockUpdate={handleBlockUpdate}
                  onBlockDelete={blockId => deleteBlockMutation.mutate(blockId)}
                  onBlockAdd={(blockType, afterBlockId) =>
                    handleBlockAdd(blockType, afterBlockId)
                  }
                  onBlockEdit={handleBlockEdit}
                  isEditing={!isPreviewMode}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar - Style Panel */}
          {isStylePanelOpen && (
            <div className="w-80 flex-shrink-0">
              <StyleCustomizationPanel
                style={styles || null}
                onSave={async styleData => {
                  await updateStyleMutation.mutateAsync(styleData);
                }}
                isOpen={isStylePanelOpen}
                onClose={() => setIsStylePanelOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Block Editing Dialog */}
      <BlockEditingPanel
        block={editingBlock}
        isOpen={isEditingBlockOpen}
        onClose={() => {
          setIsEditingBlockOpen(false);
          setEditingBlock(null);
        }}
        onSave={handleBlockSave}
      />
    </div>
  );
}

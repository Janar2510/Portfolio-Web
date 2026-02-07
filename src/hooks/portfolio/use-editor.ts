/**
 * Editor Hooks
 * React hooks for editor functionality
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SiteService, PublishingService } from '@/domain/builder/services';
import {
  useEditorStore,
  useBlocksStore,
  useHistoryStore,
  useStylesStore,
} from '@/stores/portfolio';
import type { PortfolioBlock } from '@/domain/builder/portfolio';

export function useSavePage() {
  const queryClient = useQueryClient();
  const { currentPage, setHasUnsavedChanges, draftConfig } = useEditorStore();
  const { blocks } = useBlocksStore();
  const { styles } = useStylesStore();
  const { addHistoryEntry } = useHistoryStore();

  return useMutation({
    mutationFn: async () => {
      const siteService = new SiteService();

      if (draftConfig && currentPage) {
        await siteService.updateDraft(currentPage.site_id, draftConfig);
      } else {
        if (!currentPage) throw new Error('No page selected');
        if (!styles) throw new Error('Styles not initialized');

        // Save everything to config_draft (legacy block editor)
        await siteService.updateDraft(currentPage.site_id, {
          siteTitle: styles.siteTitle,
          bio: styles.bio,
          theme: {
            fonts: styles.typography as any,
            palette: styles.colors as any,
          },
          assets: styles.assets as any,
          sections: {
            order: blocks.map(b => b.id),
            visibility: Object.fromEntries(
              blocks.map(b => [b.id, !!b.is_visible])
            ),
            content: Object.fromEntries(blocks.map(b => [b.id, b.content])),
          },
        });
      }

      // Add history entry to store
      if (currentPage) {
        addHistoryEntry({
          site_id: currentPage.site_id,
          entity_type: 'page',
          entity_id: currentPage.id,
          action: 'update',
          previous_state: null,
          new_state: { blocks },
          description: 'Page saved',
          changed_by: null,
          session_id: null,
          is_undoable: true,
        });
      }

      setHasUnsavedChanges(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-site', currentPage?.site_id],
      });
    },
  });
}

export function useAddBlock() {
  // For now, localized to store only, then call useSavePage
  const { addBlock, blocks } = useBlocksStore();
  const { setHasUnsavedChanges } = useEditorStore();

  return useMutation({
    mutationFn: async ({
      blockType,
    }: {
      blockType: string;
      afterBlockId?: string;
    }) => {
      const id = `${blockType}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate position for new block (stack vertically with spacing)
      const existingBlockCount = blocks.length;
      const defaultYOffset = existingBlockCount * 220; // 200px height + 20px gap

      const newBlock: PortfolioBlock = {
        id,
        page_id: 'home',
        block_type: blockType,
        content: {},
        settings: {},
        styles: {},
        // Default freeform layout for Canva-like editing
        layout: {
          x: 20,
          y: 20 + defaultYOffset,
          width: 600,
          height: 200,
          zIndex: 10 + existingBlockCount,
        },
        sort_order: existingBlockCount,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addBlock(newBlock);
      setHasUnsavedChanges(true);
      return newBlock;
    }
  });
}

export function useUpdateBlock() {
  const { updateBlock } = useBlocksStore();
  const { setHasUnsavedChanges } = useEditorStore();

  return useMutation({
    mutationFn: async ({
      blockId,
      updates,
    }: {
      blockId: string;
      updates: Partial<PortfolioBlock>;
    }) => {
      updateBlock(blockId, updates);
      setHasUnsavedChanges(true);
    }
  });
}

export function useDeleteBlock() {
  const { deleteBlock, setSelectedBlock } = useBlocksStore();
  const { setHasUnsavedChanges } = useEditorStore();

  return useMutation({
    mutationFn: async (blockId: string) => {
      deleteBlock(blockId);
      setSelectedBlock(null);
      setHasUnsavedChanges(true);
    }
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  const { addHistoryEntry } = useHistoryStore();

  return useMutation({
    mutationFn: async ({
      siteId,
      updates,
    }: {
      siteId: string;
      updates: any;
    }) => {
      const siteService = new SiteService();
      const updated = await siteService.updateSite(siteId, updates);

      addHistoryEntry({
        site_id: siteId,
        entity_type: 'site',
        entity_id: siteId,
        action: 'update',
        previous_state: null,
        new_state: updated as any,
        description: 'Site updated',
        changed_by: null,
        session_id: null,
        is_undoable: true,
      });

      return updated;
    },
    onSuccess: (_, { siteId }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site', siteId] });
    },
  });
}

export function useUpdatePage() {
  const { siteId } = useEditorStore();
  const updateSite = useUpdateSite();

  return useMutation({
    mutationFn: async ({
      updates,
    }: {
      pageId: string;
      updates: any;
    }) => {
      if (!siteId) throw new Error('No site ID');
      // For single-page MVP, page settings are site settings
      return await updateSite.mutateAsync({ siteId, updates });
    }
  });
}

export function useDuplicateBlock() {
  const { blocks, addBlock } = useBlocksStore();
  const { setHasUnsavedChanges } = useEditorStore();

  return useMutation({
    mutationFn: async (blockId: string) => {
      const block = blocks.find(b => b.id === blockId);
      if (!block) throw new Error('Block not found');

      const newId = `${block.block_type}-${Math.random().toString(36).substr(2, 9)}`;
      const existingLayout = block.layout || {};

      // Offset the duplicate by 30px to make it visible
      const newBlock: PortfolioBlock = {
        ...block,
        id: newId,
        layout: {
          x: (existingLayout.x ?? 20) + 30,
          y: (existingLayout.y ?? 20) + 30,
          width: existingLayout.width ?? 600,
          height: existingLayout.height ?? 200,
          zIndex: (existingLayout.zIndex ?? 10) + 1,
        },
        sort_order: blocks.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addBlock(newBlock);
      setHasUnsavedChanges(true);
      return newBlock;
    }
  });
}

export function usePublishSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthorized');

      const publishingService = new PublishingService();
      await publishingService.publish(siteId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site'] });
    },
  });
}

export function useUnpublishSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const siteService = new SiteService();
      await siteService.updateSite(siteId, {
        status: 'draft',
        published_config: undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site'] });
    },
  });
}

export function useReplacePageContent() {
  const { setBlocks } = useBlocksStore();
  const { setHasUnsavedChanges } = useEditorStore();

  return useMutation({
    mutationFn: async (
      newBlocksData: Array<{
        block_type: string;
        content: Record<string, unknown>;
      }>
    ) => {
      const createdBlocks: PortfolioBlock[] = newBlocksData.map((b, index) => ({
        id: `${b.block_type}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        page_id: 'home',
        block_type: b.block_type,
        content: b.content,
        settings: {},
        styles: {},
        // Freeform layout - stack blocks vertically
        layout: {
          x: 20,
          y: 20 + (index * 220),
          width: 600,
          height: 200,
          zIndex: 10 + index,
        },
        sort_order: index,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      setBlocks(createdBlocks);
      setHasUnsavedChanges(true);
      return createdBlocks;
    }
  });
}

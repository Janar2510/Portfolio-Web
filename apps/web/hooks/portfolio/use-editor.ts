/**
 * Editor Hooks
 * React hooks for editor functionality
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import {
  useEditorStore,
  useBlocksStore,
  useHistoryStore,
} from '@/stores/portfolio';
import type { PortfolioBlock, PortfolioPage } from '@/lib/services/portfolio';
import { createBlock } from '@/lib/portfolio/blocks/registry';

export function useSavePage() {
  const queryClient = useQueryClient();
  const { currentPage, setHasUnsavedChanges } = useEditorStore();
  const { blocks } = useBlocksStore();
  const { addHistoryEntry } = useHistoryStore();

  return useMutation({
    mutationFn: async () => {
      if (!currentPage) throw new Error('No page selected');

      const supabase = createClient();
      const portfolioService = new PortfolioService(supabase);

      // Save all blocks
      const updates = blocks.map((block, index) =>
        portfolioService.updateBlock(block.id, {
          ...block,
          sort_order: index,
        })
      );

      await Promise.all(updates);

      // Add history entry to store
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

      setHasUnsavedChanges(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-blocks', currentPage?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['portfolio-page', currentPage?.id],
      });
    },
  });
}

export function useAddBlock() {
  const queryClient = useQueryClient();
  const { currentPage } = useEditorStore();
  const { blocks, addBlock } = useBlocksStore();
  const { addHistoryEntry } = useHistoryStore();

  return useMutation({
    mutationFn: async ({
      blockType,
      content,
      settings,
      afterBlockId,
    }: {
      blockType: string;
      content?: Record<string, unknown>;
      settings?: Record<string, unknown>;
      afterBlockId?: string;
    }) => {
      if (!currentPage) throw new Error('No page selected');

      const supabase = createClient();
      const portfolioService = new PortfolioService(supabase);

      // Create block data
      const blockData = createBlock(blockType as any);

      // Determine sort order
      let sortOrder = blocks.length;
      if (afterBlockId) {
        const afterIndex = blocks.findIndex(b => b.id === afterBlockId);
        if (afterIndex !== -1) {
          sortOrder = afterIndex + 1;
        }
      }

      // Create block in database
      const newBlock = await portfolioService.createBlock(currentPage.id, {
        block_type: blockData.block_type,
        content: content || blockData.content,
        settings: settings || blockData.settings || {},
        sort_order: sortOrder,
      });

      // Add to store
      addBlock(newBlock);

      // Add history entry to store
      addHistoryEntry({
        site_id: currentPage.site_id,
        entity_type: 'block',
        entity_id: newBlock.id,
        action: 'create',
        previous_state: null,
        new_state: newBlock as unknown as Record<string, unknown>,
        description: `Added ${blockType} block`,
        changed_by: null,
        session_id: null,
        is_undoable: true,
      });

      return newBlock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-blocks', currentPage?.id],
      });
    },
  });
}

export function useUpdateBlock() {
  const queryClient = useQueryClient();
  const { currentPage } = useEditorStore();
  const { updateBlock } = useBlocksStore();
  const { addHistoryEntry } = useHistoryStore();

  return useMutation({
    mutationFn: async ({
      blockId,
      updates,
    }: {
      blockId: string;
      updates: Partial<PortfolioBlock>;
    }) => {
      if (!currentPage) throw new Error('No page selected');

      const supabase = createClient();
      const portfolioService = new PortfolioService(supabase);

      // Get current block state for history
      const { data: currentBlock } = await supabase
        .from('portfolio_blocks')
        .select('*')
        .eq('id', blockId)
        .single();

      // Update in database
      const updated = await portfolioService.updateBlock(blockId, updates);

      // Update in store
      updateBlock(blockId, updates);

      // Add history entry to store
      addHistoryEntry({
        site_id: currentPage.site_id,
        entity_type: 'block',
        entity_id: blockId,
        action: 'update',
        previous_state: currentBlock || null,
        new_state: updated as unknown as Record<string, unknown>,
        description: 'Block updated',
        changed_by: null,
        session_id: null,
        is_undoable: true,
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-blocks', currentPage?.id],
      });
    },
  });
}

export function useDeleteBlock() {
  const queryClient = useQueryClient();
  const { currentPage } = useEditorStore();
  const { deleteBlock, setSelectedBlock } = useBlocksStore();
  const { addHistoryEntry } = useHistoryStore();

  return useMutation({
    mutationFn: async (blockId: string) => {
      if (!currentPage) throw new Error('No page selected');

      const supabase = createClient();
      const portfolioService = new PortfolioService(supabase);

      // Get current block state for history
      const { data: currentBlock } = await supabase
        .from('portfolio_blocks')
        .select('*')
        .eq('id', blockId)
        .single();

      // Delete from database
      await portfolioService.deleteBlock(blockId);

      // Remove from store
      deleteBlock(blockId);
      setSelectedBlock(null);

      // Add history entry to store
      addHistoryEntry({
        site_id: currentPage.site_id,
        entity_type: 'block',
        entity_id: blockId,
        action: 'delete',
        previous_state: currentBlock || null,
        new_state: null,
        description: 'Block deleted',
        changed_by: null,
        session_id: null,
        is_undoable: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-blocks', currentPage?.id],
      });
    },
  });
}

export function useDuplicateBlock() {
  const queryClient = useQueryClient();
  const { currentPage } = useEditorStore();
  const { blocks, addBlock } = useBlocksStore();
  const { addHistoryEntry } = useHistoryStore();

  return useMutation({
    mutationFn: async (blockId: string) => {
      if (!currentPage) throw new Error('No page selected');

      const block = blocks.find(b => b.id === blockId);
      if (!block) throw new Error('Block not found');

      const supabase = createClient();
      const portfolioService = new PortfolioService(supabase);

      // Create duplicate in database
      const index = blocks.findIndex(b => b.id === blockId);
      const newBlock = await portfolioService.createBlock(currentPage.id, {
        block_type: block.block_type,
        content: block.content,
        settings: block.settings,
        sort_order: index + 1,
      });

      // Update local state
      addBlock(newBlock);

      // Add history entry
      addHistoryEntry({
        site_id: currentPage.site_id,
        entity_type: 'block',
        entity_id: newBlock.id,
        action: 'duplicate',
        previous_state: null,
        new_state: newBlock as unknown as Record<string, unknown>,
        description: `Duplicated ${block.block_type} block`,
        changed_by: null,
        session_id: null,
        is_undoable: true,
      });

      return newBlock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-blocks', currentPage?.id],
      });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  const { currentPage, setCurrentPage } = useEditorStore();
  const { addHistoryEntry } = useHistoryStore();

  return useMutation({
    mutationFn: async ({
      pageId,
      updates,
    }: {
      pageId: string;
      updates: Partial<PortfolioPage>;
    }) => {
      const supabase = createClient();
      const portfolioService = new PortfolioService(supabase);

      const { data: prevState } = await supabase
        .from('portfolio_pages')
        .select('*')
        .eq('id', pageId)
        .single();
      const updated = await portfolioService.updatePage(pageId, updates as any);

      if (currentPage?.id === pageId) setCurrentPage(updated);

      addHistoryEntry({
        site_id: updated.site_id,
        entity_type: 'page',
        entity_id: pageId,
        action: 'update',
        previous_state: prevState || null,
        new_state: updated as any,
        description: 'Page updated',
        changed_by: null,
        session_id: null,
        is_undoable: true,
      });

      return updated;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-pages', data.site_id],
      });
      queryClient.invalidateQueries({ queryKey: ['portfolio-page', data.id] });
    },
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
      const supabase = createClient();
      const portfolioService = new PortfolioService(supabase);

      const { data: prevState } = await supabase
        .from('portfolio_sites')
        .select('*')
        .eq('id', siteId)
        .single();
      const updated = await portfolioService.updateSite(siteId, updates);

      addHistoryEntry({
        site_id: siteId,
        entity_type: 'site',
        entity_id: siteId,
        action: 'update',
        previous_state: prevState || null,
        new_state: updated as any,
        description: 'Site updated',
        changed_by: null,
        session_id: null,
        is_undoable: true,
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site'] });
    },
  });
}

export function usePublishSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const supabase = createClient();
      const portfolioService = new PortfolioService(supabase);

      const updated = await portfolioService.updateSite(siteId, {
        is_published: true,
      });

      return updated;
    },
    onSuccess: (_, siteId) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site'] });
    },
  });
}

export function useUnpublishSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const supabase = createClient();
      const portfolioService = new PortfolioService(supabase);

      await portfolioService.unpublishSite(siteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site'] });
    },
  });
}

export function useReplacePageContent() {
  const queryClient = useQueryClient();
  const { currentPage } = useEditorStore();
  const { setBlocks } = useBlocksStore();
  const { addHistoryEntry } = useHistoryStore();

  return useMutation({
    mutationFn: async (
      newBlocksData: Array<{
        block_type: string;
        content: Record<string, unknown>;
        settings?: Record<string, unknown>;
      }>
    ) => {
      if (!currentPage) throw new Error('No page selected');

      const supabase = createClient();
      const portfolioService = new PortfolioService(supabase);

      // 1. Delete all existing blocks
      await portfolioService.deletePageBlocks(currentPage.id);

      // 2. Create new blocks
      const createdBlocks: PortfolioBlock[] = [];
      for (const [index, blockData] of newBlocksData.entries()) {
        const newBlock = await portfolioService.createBlock(currentPage.id, {
          block_type: blockData.block_type,
          content: blockData.content,
          settings: blockData.settings || {},
          sort_order: index,
        });
        createdBlocks.push(newBlock);
      }

      // 3. Update store
      setBlocks(createdBlocks);

      // 4. History (This is a major change, so we log it)
      addHistoryEntry({
        site_id: currentPage.site_id,
        entity_type: 'page',
        entity_id: currentPage.id,
        action: 'replace_content',
        previous_state: null, // detailed implementation would capture previous state first
        new_state: { blocks: createdBlocks },
        description: 'Applied template',
        changed_by: null,
        session_id: null,
        is_undoable: true,
      });

      return createdBlocks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['portfolio-blocks', currentPage?.id],
      });
    },
  });
}

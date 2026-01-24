/**
 * Blocks Store
 * Block management and operations
 */

import { create } from 'zustand';
import type { PortfolioBlock } from '@/lib/services/portfolio';

interface BlocksStore {
  // Blocks array
  blocks: PortfolioBlock[];
  setBlocks: (blocks: PortfolioBlock[]) => void;

  // Block operations
  addBlock: (block: PortfolioBlock) => void;
  updateBlock: (id: string, updates: Partial<PortfolioBlock>) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (id: string, newIndex: number) => void;
  reorderBlocks: (blockIds: string[]) => void;

  // Block selection
  selectedBlock: PortfolioBlock | null;
  setSelectedBlock: (block: PortfolioBlock | null) => void;

  // Hovered block
  hoveredBlockId: string | null;
  setHoveredBlockId: (id: string | null) => void;

  // Clipboard
  clipboard: PortfolioBlock | null;
  copyBlock: (block: PortfolioBlock) => void;
  pasteBlock: (afterBlockId?: string) => PortfolioBlock | null;
  clearClipboard: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useBlocksStore = create<BlocksStore>((set, get) => ({
  // Blocks array
  blocks: [],
  setBlocks: (blocks) => set({ blocks }),

  // Block operations
  addBlock: (block) =>
    set((state) => ({
      blocks: [...state.blocks, block],
      hasUnsavedChanges: true,
    })),

  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
      selectedBlock:
        state.selectedBlock?.id === id
          ? { ...state.selectedBlock, ...updates }
          : state.selectedBlock,
      hasUnsavedChanges: true,
    })),

  deleteBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
      selectedBlock:
        state.selectedBlock?.id === id ? null : state.selectedBlock,
      hasUnsavedChanges: true,
    })),

  duplicateBlock: (id) =>
    set((state) => {
      const block = state.blocks.find((b) => b.id === id);
      if (!block) return state;

      const duplicated: PortfolioBlock = {
        ...block,
        id: crypto.randomUUID(),
        sort_order: block.sort_order + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const index = state.blocks.findIndex((b) => b.id === id);
      const newBlocks = [...state.blocks];
      newBlocks.splice(index + 1, 0, duplicated);

      // Reorder all blocks after insertion
      const reorderedBlocks = newBlocks.map((b, i) => ({
        ...b,
        sort_order: i,
      }));

      return {
        blocks: reorderedBlocks,
        hasUnsavedChanges: true,
      };
    }),

  moveBlock: (id, newIndex) =>
    set((state) => {
      const blocks = [...state.blocks];
      const currentIndex = blocks.findIndex((b) => b.id === id);
      if (currentIndex === -1) return state;

      const [block] = blocks.splice(currentIndex, 1);
      blocks.splice(newIndex, 0, block);

      // Reorder all blocks
      const reorderedBlocks = blocks.map((b, i) => ({
        ...b,
        sort_order: i,
      }));

      return {
        blocks: reorderedBlocks,
        hasUnsavedChanges: true,
      };
    }),

  reorderBlocks: (blockIds) =>
    set((state) => {
      const blockMap = new Map(state.blocks.map((b) => [b.id, b]));
      const reorderedBlocks = blockIds
        .map((id) => blockMap.get(id))
        .filter((b): b is PortfolioBlock => b !== undefined)
        .map((b, i) => ({ ...b, sort_order: i }));

      return {
        blocks: reorderedBlocks,
        hasUnsavedChanges: true,
      };
    }),

  // Block selection
  selectedBlock: null,
  setSelectedBlock: (block) => set({ selectedBlock: block }),

  // Hovered block
  hoveredBlockId: null,
  setHoveredBlockId: (id) => set({ hoveredBlockId: id }),

  // Clipboard
  clipboard: null,
  copyBlock: (block) => set({ clipboard: block }),
  pasteBlock: (afterBlockId) => {
    const { clipboard, blocks } = get();
    if (!clipboard) return null;

    const duplicated: PortfolioBlock = {
      ...clipboard,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (afterBlockId) {
      const index = blocks.findIndex((b) => b.id === afterBlockId);
      if (index !== -1) {
        duplicated.sort_order = blocks[index].sort_order + 1;
        set((state) => {
          const newBlocks = [...state.blocks];
          newBlocks.splice(index + 1, 0, duplicated);
          const reordered = newBlocks.map((b, i) => ({
            ...b,
            sort_order: i,
          }));
          return {
            blocks: reordered,
            hasUnsavedChanges: true,
          };
        });
      }
    } else {
      duplicated.sort_order = blocks.length;
      set((state) => ({
        blocks: [...state.blocks, duplicated],
        hasUnsavedChanges: true,
      }));
    }

    return duplicated;
  },
  clearClipboard: () => set({ clipboard: null }),

  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

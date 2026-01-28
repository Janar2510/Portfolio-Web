/**
 * Drag and Drop Utilities
 * Helper functions for dnd-kit integration
 */

import type { Active, Over } from '@dnd-kit/core';

export interface DragEndEvent {
  active: Active;
  over: Over | null;
}

export function getDragId(blockId: string): string {
  return `block-${blockId}`;
}

export function getBlockIdFromDragId(dragId: string): string {
  return dragId.replace('block-', '');
}

export function isValidBlockDragId(dragId: string): boolean {
  return dragId.startsWith('block-');
}

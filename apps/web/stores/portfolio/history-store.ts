/**
 * History Store
 * Undo/redo and version history management
 */

import { create } from 'zustand';
import type { PortfolioEditHistory, PortfolioVersion } from '@/lib/portfolio/types';

interface HistoryState {
  // Edit history
  history: PortfolioEditHistory[];
  historyIndex: number; // Current position in history
  maxHistorySize: number;

  // Versions
  versions: PortfolioVersion[];
  currentVersionId: string | null;

  // Actions
  addHistoryEntry: (entry: Omit<PortfolioEditHistory, 'id' | 'created_at'>) => void;
  undo: () => PortfolioEditHistory | null;
  redo: () => PortfolioEditHistory | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;

  // Versions
  addVersion: (version: Omit<PortfolioVersion, 'id' | 'created_at'>) => void;
  setCurrentVersion: (id: string | null) => void;
  getVersion: (id: string) => PortfolioVersion | null;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  // Edit history
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,

  // Versions
  versions: [],
  currentVersionId: null,

  // Actions
  addHistoryEntry: (entry) =>
    set((state) => {
      const newEntry: PortfolioEditHistory = {
        ...entry,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      // Remove any history after current index (when undoing then making new changes)
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newEntry);

      // Limit history size
      const limitedHistory =
        newHistory.length > state.maxHistorySize
          ? newHistory.slice(-state.maxHistorySize)
          : newHistory;

      return {
        history: limitedHistory,
        historyIndex: limitedHistory.length - 1,
      };
    }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return null;

    const newIndex = historyIndex - 1;
    set({ historyIndex: newIndex });
    return history[newIndex];
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return null;

    const newIndex = historyIndex + 1;
    set({ historyIndex: newIndex });
    return history[newIndex];
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  clearHistory: () =>
    set({
      history: [],
      historyIndex: -1,
    }),

  // Versions
  addVersion: (version) =>
    set((state) => {
      const newVersion: PortfolioVersion = {
        ...version,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      return {
        versions: [...state.versions, newVersion],
      };
    }),

  setCurrentVersion: (id) => set({ currentVersionId: id }),

  getVersion: (id) => {
    const { versions } = get();
    return versions.find((v) => v.id === id) || null;
  },

  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

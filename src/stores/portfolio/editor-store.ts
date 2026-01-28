/**
 * Editor Store
 * Main editor state management
 */

import { create } from 'zustand';
import type { PortfolioPage, PortfolioBlock } from '@/domain/builder/portfolio';

export type PreviewMode = 'desktop' | 'tablet' | 'mobile';
export type EditorView = 'canvas' | 'preview' | 'split';

interface EditorStore {
  // Current page
  currentPage: PortfolioPage | null;
  setCurrentPage: (page: PortfolioPage | null) => void;

  // Site ID
  siteId: string | null;
  setSiteId: (id: string | null) => void;

  // Selected block
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;

  // Preview mode
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;

  // Editor view
  view: EditorView;
  setView: (view: EditorView) => void;

  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarTab: 'blocks' | 'styles' | 'pages' | 'settings' | 'templates';
  setSidebarTab: (tab: 'blocks' | 'styles' | 'pages' | 'settings' | 'templates') => void;

  // Settings panel
  settingsPanelOpen: boolean;
  setSettingsPanelOpen: (open: boolean) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Unsaved changes
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  // Auto-save
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  lastSavedAt: string | null;
  setLastSavedAt: (timestamp: string | null) => void;
}

export const useEditorStore = create<EditorStore>(set => ({
  // Current page
  currentPage: null,
  setCurrentPage: page => set({ currentPage: page }),

  // Site ID
  siteId: null,
  setSiteId: id => set({ siteId: id }),

  // Selected block
  selectedBlockId: null,
  setSelectedBlockId: id => set({ selectedBlockId: id }),

  // Preview mode
  previewMode: 'desktop',
  setPreviewMode: mode => set({ previewMode: mode }),

  // Editor view
  view: 'canvas',
  setView: view => set({ view }),

  // Sidebar state
  sidebarOpen: true,
  setSidebarOpen: open => set({ sidebarOpen: open }),
  sidebarTab: 'blocks',
  setSidebarTab: tab => set({ sidebarTab: tab }),

  // Settings panel
  settingsPanelOpen: false,
  setSettingsPanelOpen: open => set({ settingsPanelOpen: open }),

  // Loading state
  isLoading: false,
  setIsLoading: loading => set({ isLoading: loading }),

  // Unsaved changes
  hasUnsavedChanges: false,
  setHasUnsavedChanges: hasChanges => set({ hasUnsavedChanges: hasChanges }),

  // Auto-save
  autoSaveEnabled: true,
  setAutoSaveEnabled: enabled => set({ autoSaveEnabled: enabled }),
  lastSavedAt: null,
  setLastSavedAt: timestamp => set({ lastSavedAt: timestamp }),
}));

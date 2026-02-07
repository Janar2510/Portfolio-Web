/**
 * Editor Store
 * Main editor state management
 */

import { create } from 'zustand';
import type { PortfolioPage, PortfolioBlock } from '@/domain/builder/portfolio';
import type { TemplateConfig } from '@/domain/templates/contracts';

export type PreviewMode = 'desktop' | 'tablet' | 'mobile';
export type EditorView = 'canvas' | 'preview' | 'split';
export type WizardStep =
  | 'template'
  | 'content'
  | 'media'
  | 'theme'
  | 'contact'
  | 'publish';

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

  // Wizard state
  wizardStep: WizardStep;
  setWizardStep: (step: WizardStep) => void;

  // Draft config (template-based editor)
  draftConfig: TemplateConfig | null;
  setDraftConfig: (config: TemplateConfig | null) => void;
  updateDraftConfig: (updates: Partial<TemplateConfig>) => void;
  updateSectionContent: (
    sectionId: string,
    updates: Record<string, unknown>
  ) => void;
  updateThemePalette: (updates: Partial<TemplateConfig['theme']['palette']>) => void;
  updateThemeFonts: (updates: Partial<TemplateConfig['theme']['fonts']>) => void;
  updateAssets: (updates: NonNullable<TemplateConfig['assets']>) => void;
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

  // Wizard state
  wizardStep: 'template',
  setWizardStep: step => set({ wizardStep: step }),

  // Draft config
  draftConfig: null,
  setDraftConfig: config => set({ draftConfig: config }),
  updateDraftConfig: updates =>
    set(state => {
      if (!state.draftConfig) return state;
      return {
        draftConfig: {
          ...state.draftConfig,
          ...updates,
        },
        hasUnsavedChanges: true,
      };
    }),
  updateSectionContent: (sectionId, updates) =>
    set(state => {
      if (!state.draftConfig) return state;
      const sections = state.draftConfig.sections;
      const current = sections.content[sectionId] || {};
      return {
        draftConfig: {
          ...state.draftConfig,
          sections: {
            ...sections,
            content: {
              ...sections.content,
              [sectionId]: {
                ...current,
                ...updates,
              },
            },
          },
        },
        hasUnsavedChanges: true,
      };
    }),
  updateThemePalette: updates =>
    set(state => {
      if (!state.draftConfig) return state;
      return {
        draftConfig: {
          ...state.draftConfig,
          theme: {
            ...state.draftConfig.theme,
            palette: {
              ...state.draftConfig.theme.palette,
              ...updates,
            },
          },
        },
        hasUnsavedChanges: true,
      };
    }),
  updateThemeFonts: updates =>
    set(state => {
      if (!state.draftConfig) return state;
      return {
        draftConfig: {
          ...state.draftConfig,
          theme: {
            ...state.draftConfig.theme,
            fonts: {
              ...state.draftConfig.theme.fonts,
              ...updates,
            },
          },
        },
        hasUnsavedChanges: true,
      };
    }),
  updateAssets: updates =>
    set(state => {
      if (!state.draftConfig) return state;
      return {
        draftConfig: {
          ...state.draftConfig,
          assets: {
            ...(state.draftConfig.assets || {}),
            ...updates,
          },
        },
        hasUnsavedChanges: true,
      };
    }),
}));

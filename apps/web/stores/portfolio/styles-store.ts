/**
 * Styles Store
 * Global styles management
 */

import { create } from 'zustand';
import type { PortfolioSiteStyles, StylePreset } from '@/lib/portfolio/types';

interface StylesStore {
  // Current styles
  styles: PortfolioSiteStyles | null;
  setStyles: (styles: PortfolioSiteStyles | null) => void;

  // Style updates
  updateColors: (colors: Partial<PortfolioSiteStyles['colors']>) => void;
  updateTypography: (typography: Partial<PortfolioSiteStyles['typography']>) => void;
  updateSpacing: (spacing: Partial<PortfolioSiteStyles['spacing']>) => void;
  updateEffects: (effects: Partial<PortfolioSiteStyles['effects']>) => void;
  updateLayout: (layout: Partial<PortfolioSiteStyles['layout']>) => void;
  updateCustomCSS: (css: string | null) => void;

  // Presets
  presets: StylePreset[];
  setPresets: (presets: StylePreset[]) => void;
  savePreset: (preset: Omit<StylePreset, 'id'>) => void;
  deletePreset: (id: string) => void;
  applyPreset: (id: string) => void;

  // Dark mode
  darkModeEnabled: boolean;
  setDarkModeEnabled: (enabled: boolean) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Unsaved changes
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export const useStylesStore = create<StylesStore>((set, get) => ({
  // Current styles
  styles: null,
  setStyles: (styles) => set({ styles }),

  // Style updates
  updateColors: (colors) =>
    set((state) => {
      if (!state.styles) return state;
      return {
        styles: {
          ...state.styles,
          colors: { ...state.styles.colors, ...colors },
        },
        hasUnsavedChanges: true,
      };
    }),

  updateTypography: (typography) =>
    set((state) => {
      if (!state.styles) return state;
      return {
        styles: {
          ...state.styles,
          typography: { ...state.styles.typography, ...typography },
        },
        hasUnsavedChanges: true,
      };
    }),

  updateSpacing: (spacing) =>
    set((state) => {
      if (!state.styles) return state;
      return {
        styles: {
          ...state.styles,
          spacing: { ...state.styles.spacing, ...spacing },
        },
        hasUnsavedChanges: true,
      };
    }),

  updateEffects: (effects) =>
    set((state) => {
      if (!state.styles) return state;
      return {
        styles: {
          ...state.styles,
          effects: { ...state.styles.effects, ...effects },
        },
        hasUnsavedChanges: true,
      };
    }),

  updateLayout: (layout) =>
    set((state) => {
      if (!state.styles) return state;
      return {
        styles: {
          ...state.styles,
          layout: { ...state.styles.layout, ...layout },
        },
        hasUnsavedChanges: true,
      };
    }),

  updateCustomCSS: (css) =>
    set((state) => {
      if (!state.styles) return state;
      return {
        styles: {
          ...state.styles,
          custom_css: css,
        },
        hasUnsavedChanges: true,
      };
    }),

  // Presets
  presets: [],
  setPresets: (presets) => set({ presets }),
  savePreset: (preset) =>
    set((state) => {
      const newPreset: StylePreset = {
        ...preset,
        id: crypto.randomUUID(),
      };
      return {
        presets: [...state.presets, newPreset],
        hasUnsavedChanges: true,
      };
    }),
  deletePreset: (id) =>
    set((state) => ({
      presets: state.presets.filter((p) => p.id !== id),
      hasUnsavedChanges: true,
    })),
  applyPreset: (id) => {
    const { presets, styles } = get();
    const preset = presets.find((p) => p.id === id);
    if (!preset || !styles) return;

    set({
      styles: {
        ...styles,
        colors: preset.colors ? { ...styles.colors, ...preset.colors } : styles.colors,
        typography: preset.typography
          ? { ...styles.typography, ...preset.typography }
          : styles.typography,
        spacing: preset.spacing
          ? { ...styles.spacing, ...preset.spacing }
          : styles.spacing,
        effects: preset.effects
          ? { ...styles.effects, ...preset.effects }
          : styles.effects,
      },
      hasUnsavedChanges: true,
    });
  },

  // Dark mode
  darkModeEnabled: false,
  setDarkModeEnabled: (enabled) => set({ darkModeEnabled: enabled }),

  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Unsaved changes
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
}));

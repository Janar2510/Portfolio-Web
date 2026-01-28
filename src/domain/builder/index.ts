/**
 * Portfolio Module
 * Main export file for portfolio-related functionality
 */

// Types & Services from portfolio.ts (Source of truth for core models)
export * from './portfolio';

// Additional types from types.ts (Media, Projects, History, etc.)
export type {
  PortfolioMedia,
  PortfolioProject,
  PortfolioEditHistory,
  PortfolioVersion,
  PortfolioFormSubmission,
  SubmissionStatus,
  HistoryAction,
  HistoryEntityType,
  SiteSnapshot,
  MediaThumbnails,
  CaseStudy,
  PageType,
  PageSettings,
  SiteSettings,
  SectionCategory,
  PortfolioSection,
  SectionVariant,
  TemplatePageSchema,
  TemplateBlockSchema,
  TemplateStylesSchema,
  ColorPalette,
  TypographySettings,
  SpacingSettings,
  EffectsSettings,
  LayoutSettings,
  StylePreset as StylePresetType
} from './types';

/**
 * Portfolio TypeScript Types
 * Comprehensive type definitions for the Supale portfolio system
 */

// ===========================================
// SITE TYPES
// ===========================================

export interface PortfolioSite {
  id: string;
  owner_user_id: string;
  slug: string;
  status: 'draft' | 'published';
  draft_config: any;
  published_config: any;
  template_id: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  showBranding?: boolean;
  enableAnalytics?: boolean;
  enableContactForm?: boolean;
  language?: string;
  dateFormat?: string;
  [key: string]: unknown;
}

// ===========================================
// TEMPLATE TYPES
// ===========================================

export interface PortfolioTemplate {
  id: string;
  slug: string | null;
  name: string;
  name_et: string | null;
  description: string | null;
  description_et: string | null;
  category: TemplateCategory | null;
  tags: string[];
  thumbnail_url: string | null;
  preview_images: string[];
  demo_url: string | null;
  pages_schema: TemplatePageSchema[];
  styles_schema: TemplateStylesSchema;
  blocks_schema: Record<string, unknown>;
  features: string[];
  industries: string[];
  is_active: boolean;
  is_premium: boolean;
  is_featured: boolean;
  use_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
}

export type TemplateCategory =
  | 'minimal'
  | 'creative'
  | 'professional'
  | 'developer'
  | 'photographer'
  | 'designer'
  | 'agency'
  | 'freelancer';

export interface TemplatePageSchema {
  slug: string;
  title: string;
  is_homepage: boolean;
  blocks: TemplateBlockSchema[];
}

export interface TemplateBlockSchema {
  block_type: string;
  content: Record<string, unknown>;
  settings?: Record<string, unknown>;
  layout?: BlockLayout;
  styles?: Record<string, unknown>;
}

export interface TemplateStylesSchema {
  colors?: ColorPalette;
  typography?: TypographySettings;
  spacing?: SpacingSettings;
  effects?: EffectsSettings;
  layout?: LayoutSettings;
}

// ===========================================
// SECTION TYPES
// ===========================================

export interface PortfolioSection {
  id: string;
  slug: string;
  name: string;
  name_et: string | null;
  description: string | null;
  category: SectionCategory;
  thumbnail_url: string | null;
  blocks_schema: TemplateBlockSchema[];
  default_styles: Record<string, unknown>;
  variants: SectionVariant[];
  is_active: boolean;
  is_premium: boolean;
  sort_order: number;
  created_at: string;
}

export type SectionCategory =
  | 'hero'
  | 'about'
  | 'services'
  | 'portfolio'
  | 'testimonials'
  | 'contact'
  | 'footer'
  | 'navigation'
  | 'cta'
  | 'features'
  | 'team'
  | 'pricing'
  | 'faq'
  | 'blog'
  | 'stats';

export interface SectionVariant {
  id: string;
  name: string;
  thumbnail: string | null;
  blocks_diff: Record<string, unknown>;
}

// ===========================================
// PAGE TYPES
// ===========================================

export interface PortfolioPage {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  page_type: PageType;
  parent_id: string | null;
  is_homepage: boolean;
  is_published: boolean; // Keep for now as it's separate table? No, keep it.
  status: 'draft' | 'published';
  show_in_nav: boolean;
  nav_order: number;
  nav_label: string | null;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  social_image_url: string | null;
  settings: PageSettings;
  created_at: string;
  updated_at: string;
}

export type PageType = 'home' | 'page' | 'project' | 'blog_post' | 'legal';

export interface PageSettings {
  fullWidth?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  customCss?: string | null;
  [key: string]: unknown;
}

// ===========================================
// BLOCK TYPES
// ===========================================

export interface PortfolioBlock {
  id: string;
  page_id: string;
  block_type: string;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  styles: Record<string, unknown>;
  layout: BlockLayout;
  is_visible: boolean;
  visible_on: VisibilitySettings;
  animation: AnimationSettings;
  variant: string | null;
  is_locked: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlockLayout {
  width?: 'container' | 'full' | 'narrow' | 'wide';
  padding?: 'none' | 'small' | 'default' | 'large';
  margin?: 'none' | 'small' | 'default' | 'large';
  background?: string | null;
  alignment?: 'left' | 'center' | 'right';
  [key: string]: unknown;
}

export interface VisibilitySettings {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface AnimationSettings {
  type: string | null;
  delay: number;
  duration: 'slow' | 'normal' | 'fast';
}

// ===========================================
// STYLE TYPES
// ===========================================

export interface PortfolioSiteStyles {
  id: string;
  site_id: string;
  colors: ColorPalette;
  colors_dark: ColorPalette | null;
  typography: TypographySettings;
  spacing: SpacingSettings;
  effects: EffectsSettings;
  layout: LayoutSettings;
  custom_css: string | null;
  saved_presets: StylePreset[];
  created_at: string;
  updated_at: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  [key: string]: string;
}

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  baseSize: number;
  scale: number;
  lineHeight: number;
  headingWeight: number;
  bodyWeight: number;
  [key: string]: unknown;
}

export interface SpacingSettings {
  scale: 'compact' | 'default' | 'relaxed';
  sectionPadding: string;
  containerWidth: string;
  borderRadius: string;
  [key: string]: unknown;
}

export interface EffectsSettings {
  shadows: boolean;
  animations: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  hoverEffects: boolean;
  scrollAnimations: boolean;
  [key: string]: unknown;
}

export interface LayoutSettings {
  headerStyle: 'fixed' | 'static' | 'sticky';
  footerStyle: 'standard' | 'minimal' | 'extended';
  navPosition: 'top' | 'side' | 'bottom';
  [key: string]: unknown;
}

export interface StylePreset {
  id: string;
  name: string;
  colors?: Partial<ColorPalette>;
  typography?: Partial<TypographySettings>;
  spacing?: Partial<SpacingSettings>;
  effects?: Partial<EffectsSettings>;
}

// ===========================================
// MEDIA TYPES
// ===========================================

export interface PortfolioMedia {
  id: string;
  site_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  alt_text: string | null;
  caption: string | null;
  folder: string;
  tags: string[];
  is_processed: boolean;
  thumbnails: MediaThumbnails;
  optimized_url: string | null;
  blurhash: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface MediaThumbnails {
  small?: string;
  medium?: string;
  large?: string;
  [key: string]: string | undefined;
}

// ===========================================
// PROJECT TYPES
// ===========================================

export interface PortfolioProject {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  featured_image_id: string | null;
  gallery_image_ids: string[];
  category: string | null;
  tags: string[];
  client_name: string | null;
  project_date: string | null;
  project_url: string | null;
  case_study: CaseStudy;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseStudy {
  challenge: string | null;
  solution: string | null;
  results: string | null;
  testimonial: string | null;
  [key: string]: unknown;
}

// ===========================================
// HISTORY TYPES
// ===========================================

export interface PortfolioEditHistory {
  id: string;
  site_id: string;
  entity_type: HistoryEntityType;
  entity_id: string;
  action: HistoryAction;
  previous_state: Record<string, unknown> | null;
  new_state: Record<string, unknown> | null;
  description: string | null;
  changed_by: string | null;
  session_id: string | null;
  is_undoable: boolean;
  created_at: string;
}

export type HistoryEntityType =
  | 'site'
  | 'page'
  | 'block'
  | 'styles'
  | 'project';
export type HistoryAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'reorder'
  | 'duplicate'
  | 'replace_content';

// ===========================================
// VERSION TYPES
// ===========================================

export interface PortfolioVersion {
  id: string;
  site_id: string;
  version_name: string;
  description: string | null;
  snapshot: SiteSnapshot;
  is_auto_save: boolean;
  is_published_version: boolean;
  created_by: string | null;
  created_at: string;
}

export interface SiteSnapshot {
  site: PortfolioSite;
  pages: PortfolioPage[];
  blocks: PortfolioBlock[];
  styles: PortfolioSiteStyles;
  projects?: PortfolioProject[];
  [key: string]: unknown;
}

// ===========================================
// FORM SUBMISSION TYPES
// ===========================================

export interface PortfolioFormSubmission {
  id: string;
  site_id: string;
  form_type: 'contact' | 'newsletter' | 'custom';
  form_id: string | null;
  data: Record<string, unknown>;
  page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  status: SubmissionStatus;
  spam_score: number | null;
  is_spam: boolean;
  created_at: string;
}

export type SubmissionStatus = 'new' | 'read' | 'replied' | 'archived' | 'spam';

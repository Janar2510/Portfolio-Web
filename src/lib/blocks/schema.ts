/**
 * Block Schema System
 * Defines types, validation, and structure for all block types
 */

import { z } from 'zod';

// Base block schema
export const baseBlockSchema = z.object({
  id: z.string().uuid(),
  page_id: z.string().uuid(),
  block_type: z.string(),
  content: z.record(z.unknown()),
  layout: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.union([z.number(), z.string()]).optional(),
    height: z.union([z.number(), z.string()]).optional(),
    zIndex: z.number().optional(),
    colSpan: z.number().optional(),
    rowSpan: z.number().optional(),
  }).optional().default({}),
  settings: z.record(z.unknown()).default({}),
  sort_order: z.number().int().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});

// Block type definitions
export type BlockType =
  | 'hero'
  | 'text'
  | 'gallery'
  | 'projects'
  | 'form'
  | 'image'
  | 'video'
  | 'header'
  | 'footer'
  | 'features'
  | 'infinite-hero'
  | 'brand-hero'
  | 'organic-hero'
  | 'skills'
  | 'stats'
  | 'marquee'
  | 'bento';

// Hero Block
export const heroBlockContentSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  badge: z.string().optional(), // New: Pulsing badge above headline
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
  image_url: z.string().url().optional(),
  show_scroll_indicator: z.boolean().default(true), // New
});

export const heroBlockSettingsSchema = z.object({
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  background: z.enum(['solid', 'gradient', 'image']).default('solid'),
  overlay: z.boolean().default(false),
  height: z.enum(['small', 'medium', 'large', 'full']).default('medium'),
  text_color: z.string().optional(),
  variant: z
    .enum(['centered', 'split', 'minimal', 'bold', 'script'])
    .default('centered'),
  headline_style: z
    .enum(['default', 'gradient', 'serif', 'script'])
    .default('default'), // New
});

export type HeroBlockContent = z.infer<typeof heroBlockContentSchema>;
export type HeroBlockSettings = z.infer<typeof heroBlockSettingsSchema>;

// Text Block
export const textBlockContentSchema = z.object({
  title: z.string().optional(),
  text: z.string(),
  html: z.string().optional(),
});

export const textBlockSettingsSchema = z.object({
  max_width: z.string().default('800px'),
  text_align: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  font_size: z.enum(['small', 'medium', 'large']).default('medium'),
  padding: z.string().optional(),
});

export type TextBlockContent = z.infer<typeof textBlockContentSchema>;
export type TextBlockSettings = z.infer<typeof textBlockSettingsSchema>;

// Gallery Block
export const galleryBlockContentSchema = z.object({
  title: z.string().optional(),
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string().url(),
      alt: z.string().optional(),
      caption: z.string().optional(),
    })
  ),
});

export const galleryBlockSettingsSchema = z.object({
  layout: z.enum(['grid', 'masonry', 'carousel']).default('grid'),
  columns: z.number().int().min(1).max(6).default(3),
  gap: z.string().default('1rem'),
  aspect_ratio: z.string().optional(),
});

export type GalleryBlockContent = z.infer<typeof galleryBlockContentSchema>;
export type GalleryBlockSettings = z.infer<typeof galleryBlockSettingsSchema>;

// Projects Block
export const projectsBlockContentSchema = z.object({
  title: z.string().optional(),
  limit: z.number().int().positive().default(6),
  project_ids: z.array(z.string().uuid()).optional(),
  filter: z
    .object({
      tags: z.array(z.string()).optional(),
      featured: z.boolean().optional(),
      category: z.string().optional(),
    })
    .optional(),
});

export const projectsBlockSettingsSchema = z.object({
  layout: z.enum(['grid', 'list', 'masonry']).default('grid'),
  columns: z.number().int().min(1).max(4).default(3),
  show_description: z.boolean().default(true),
  show_tags: z.boolean().default(false),
  show_category: z.boolean().default(false),
  aspect_ratio: z.enum(['square', 'video', 'portrait', 'auto']).default('auto'), // New
});

export type ProjectsBlockContent = z.infer<typeof projectsBlockContentSchema>;
export type ProjectsBlockSettings = z.infer<typeof projectsBlockSettingsSchema>;

// Form Block
export const formBlockContentSchema = z.object({
  form_type: z.enum(['contact', 'newsletter', 'custom']).default('contact'),
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(z.string()).default(['name', 'email', 'message']),
  submit_text: z.string().default('Submit'),
  success_message: z
    .string()
    .default('Thank you! We will get back to you soon.'),
  contact_info: z
    .object({
      email: z.string().optional(),
      location: z.string().optional(),
      phone: z.string().optional(),
      socials: z
        .array(z.object({ platform: z.string(), url: z.string() }))
        .optional(), // New
    })
    .optional(),
});

export const formBlockSettingsSchema = z.object({
  layout: z.enum(['single', 'two-column', 'split-with-info']).default('single'),
  button_style: z.enum(['primary', 'secondary', 'outline']).default('primary'),
  button_align: z.enum(['left', 'center', 'right']).default('left'),
  rounded_corners: z
    .enum(['none', 'md', 'lg', 'full', 'artisanal'])
    .default('md'), // New
});

export type FormBlockContent = z.infer<typeof formBlockContentSchema>;
export type FormBlockSettings = z.infer<typeof formBlockSettingsSchema>;

// Image Block
export const imageBlockContentSchema = z.object({
  image_url: z.string().url(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  link_url: z.string().url().optional(),
});

export const imageBlockSettingsSchema = z.object({
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  width: z.string().optional(),
  rounded: z.boolean().default(false),
  shadow: z.boolean().default(false),
});

export type ImageBlockContent = z.infer<typeof imageBlockContentSchema>;
export type ImageBlockSettings = z.infer<typeof imageBlockSettingsSchema>;

// Video Block
export const videoBlockContentSchema = z.object({
  video_url: z.string().url(),
  video_type: z.enum(['youtube', 'vimeo', 'direct']).default('direct'),
  thumbnail_url: z.string().url().optional(),
  autoplay: z.boolean().default(false),
  loop: z.boolean().default(false),
  muted: z.boolean().default(false),
});

export const videoBlockSettingsSchema = z.object({
  width: z.string().optional(),
  aspect_ratio: z.string().default('16/9'),
  controls: z.boolean().default(true),
  rounded: z.boolean().default(false),
});

export type VideoBlockContent = z.infer<typeof videoBlockContentSchema>;

export type VideoBlockSettings = z.infer<typeof videoBlockSettingsSchema>;

// Header Block
export const headerBlockContentSchema = z.object({
  logo_text: z.string().optional(),
  logo_image: z.string().url().optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    )
    .optional(),
});

export const headerBlockSettingsSchema = z.object({
  layout: z.enum(['simple', 'centered', 'split']).default('simple'),
  sticky: z.boolean().default(true),
  position: z.enum(['fixed', 'relative', 'sticky']).default('sticky'),
  background_color: z.string().optional(),
  text_color: z.string().optional(),
});

export type HeaderBlockContent = z.infer<typeof headerBlockContentSchema>;
export type HeaderBlockSettings = z.infer<typeof headerBlockSettingsSchema>;

// Features Block
export const featuresBlockContentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  features: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string().optional(),
      })
    )
    .default([]),
});

export const featuresBlockSettingsSchema = z.object({
  layout: z.enum(['grid', 'list', 'cards']).default('grid'),
  columns: z.number().int().min(1).max(4).default(3),
  show_icon: z.boolean().default(true),
  background: z.enum(['default', 'glass']).default('default'),
});

export type FeaturesBlockContent = z.infer<typeof featuresBlockContentSchema>;
export type FeaturesBlockSettings = z.infer<typeof featuresBlockSettingsSchema>;

// Skills Block
export const skillsBlockContentSchema = z.object({
  title: z.string().optional(),
  skills: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        level: z.number().int().min(0).max(100),
        category: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .default([]),
});

export const skillsBlockSettingsSchema = z.object({
  layout: z.enum(['bars', 'badges', 'grid', 'circular']).default('bars'),
  show_level: z.boolean().default(true),
  show_category: z.boolean().default(false),
  columns: z.number().int().min(1).max(6).default(3),
});

export type SkillsBlockContent = z.infer<typeof skillsBlockContentSchema>;
export type SkillsBlockSettings = z.infer<typeof skillsBlockSettingsSchema>;

// Stats Block
export const statsBlockContentSchema = z.object({
  title: z.string().optional(),
  stats: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        value: z.union([z.string(), z.number()]),
        suffix: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .default([]),
});

export const statsBlockSettingsSchema = z.object({
  layout: z.enum(['grid', 'horizontal']).default('grid'),
  columns: z.number().int().min(1).max(6).default(4),
  animation: z.boolean().default(true),
});

export type StatsBlockContent = z.infer<typeof statsBlockContentSchema>;
export type StatsBlockSettings = z.infer<typeof statsBlockSettingsSchema>;

// Marquee Block
export const marqueeBlockContentSchema = z.object({
  items: z.array(z.string()).default(['Design', 'Development', 'Strategy', 'Branding']),
});

export const marqueeBlockSettingsSchema = z.object({
  speed: z.enum(['slow', 'normal', 'fast']).default('normal'),
  direction: z.enum(['left', 'right']).default('left'),
  gap: z.enum(['small', 'medium', 'large']).default('medium'),
  background: z.enum(['transparent', 'solid', 'black']).default('transparent'),
});

export type MarqueeBlockContent = z.infer<typeof marqueeBlockContentSchema>;
export type MarqueeBlockSettings = z.infer<typeof marqueeBlockSettingsSchema>;

// Bento Grid Block
export const bentoBlockContentSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      image_url: z.string().optional(),
      col_span: z.number().min(1).max(4).default(1),
      row_span: z.number().min(1).max(2).default(1),
      type: z.enum(['text', 'image', 'stats', 'icon']).default('text'),
    })
  ).default([]),
});

export const bentoBlockSettingsSchema = z.object({
  columns: z.number().min(2).max(4).default(3),
  gap: z.enum(['small', 'medium', 'large']).default('medium'),
});

export type BentoBlockContent = z.infer<typeof bentoBlockContentSchema>;
export type BentoBlockSettings = z.infer<typeof bentoBlockSettingsSchema>;

// Infinite Hero Block
export const infiniteHeroBlockContentSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
  cta_secondary_text: z.string().optional(),
  cta_secondary_link: z.string().optional(),
});

export const infiniteHeroBlockSettingsSchema = z.object({
  height: z.enum(['small', 'medium', 'large', 'full']).default('full'),
  overlay_variant: z.enum(['default', 'dark', 'vignette']).default('vignette'),
});

export type InfiniteHeroBlockContent = z.infer<
  typeof infiniteHeroBlockContentSchema
>;
export type InfiniteHeroBlockSettings = z.infer<
  typeof infiniteHeroBlockSettingsSchema
>;

// Brand Hero Block
export const brandHeroBlockContentSchema = z.object({
  logoText: z.string().optional(),
  navLinks: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
      })
    )
    .optional(),
  versionText: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  backgroundImage: z.string().optional(),
});

export const brandHeroBlockSettingsSchema = z.object({
  height: z.enum(['small', 'medium', 'large', 'full']).default('full'),
});

export type BrandHeroBlockContent = z.infer<typeof brandHeroBlockContentSchema>;
export type BrandHeroBlockSettings = z.infer<
  typeof brandHeroBlockSettingsSchema
>;

// Organic Hero Block
export const organicHeroBlockContentSchema = z.object({
  slogan: z.string().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
});

export const organicHeroBlockSettingsSchema = z.object({
  height: z.enum(['small', 'medium', 'large', 'full']).default('full'),
});

export type OrganicHeroBlockContent = z.infer<
  typeof organicHeroBlockContentSchema
>;
export type OrganicHeroBlockSettings = z.infer<
  typeof organicHeroBlockSettingsSchema
>;

// Block content type union
export type BlockContent =
  | HeroBlockContent
  | TextBlockContent
  | GalleryBlockContent
  | ProjectsBlockContent
  | FormBlockContent
  | ImageBlockContent
  | VideoBlockContent
  | HeaderBlockContent
  | FeaturesBlockContent
  | InfiniteHeroBlockContent
  | BrandHeroBlockContent
  | OrganicHeroBlockContent
  | SkillsBlockContent
  | StatsBlockContent
  | MarqueeBlockContent
  | BentoBlockContent;

// Block settings type union
export type BlockSettings =
  | HeroBlockSettings
  | TextBlockSettings
  | GalleryBlockSettings
  | ProjectsBlockSettings
  | FormBlockSettings
  | ImageBlockSettings
  | VideoBlockSettings
  | HeaderBlockSettings
  | FeaturesBlockSettings
  | InfiniteHeroBlockSettings
  | BrandHeroBlockSettings
  | OrganicHeroBlockSettings
  | SkillsBlockSettings
  | StatsBlockSettings
  | MarqueeBlockSettings
  | BentoBlockSettings;

// Block metadata
export interface BlockMetadata {
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  category: 'content' | 'media' | 'interactive' | 'layout';
  defaultContent: Record<string, unknown>;
  defaultSettings: Record<string, unknown>;
}

// Block registry
export const blockRegistry: Record<BlockType, BlockMetadata> = {
  hero: {
    type: 'hero',
    name: 'Hero',
    description: 'Large banner section with headline and call-to-action',
    icon: 'Sparkles',
    category: 'content',
    defaultContent: {
      headline: 'Welcome',
      subheadline: 'Your subtitle here',
      cta_text: 'Get Started',
      cta_link: '/',
    },
    defaultSettings: {
      alignment: 'center',
      background: 'gradient',
      overlay: false,
      height: 'medium',
    },
  },
  text: {
    type: 'text',
    name: 'Text',
    description: 'Rich text content block',
    icon: 'FileText',
    category: 'content',
    defaultContent: {
      text: 'Enter your text here...',
    },
    defaultSettings: {
      max_width: '800px',
      text_align: 'left',
      font_size: 'medium',
    },
  },
  gallery: {
    type: 'gallery',
    name: 'Gallery',
    description: 'Image gallery with multiple layouts',
    icon: 'Images',
    category: 'media',
    defaultContent: {
      title: 'Gallery',
      images: [],
    },
    defaultSettings: {
      layout: 'grid',
      columns: 3,
      gap: '1rem',
    },
  },
  projects: {
    type: 'projects',
    name: 'Projects',
    description: 'Display portfolio projects',
    icon: 'Briefcase',
    category: 'content',
    defaultContent: {
      title: 'Featured Projects',
      limit: 6,
    },
    defaultSettings: {
      layout: 'grid',
      columns: 3,
      show_description: true,
      show_tags: false,
    },
  },
  form: {
    type: 'form',
    name: 'Form',
    description: 'Contact or newsletter form',
    icon: 'Mail',
    category: 'interactive',
    defaultContent: {
      form_type: 'contact',
      title: 'Get In Touch',
      fields: ['name', 'email', 'message'],
      submit_text: 'Submit',
    },
    defaultSettings: {
      layout: 'single',
      button_style: 'primary',
      button_align: 'left',
    },
  },
  image: {
    type: 'image',
    name: 'Image',
    description: 'Single image with optional link',
    icon: 'Image',
    category: 'media',
    defaultContent: {
      image_url: '',
      alt: '',
    },
    defaultSettings: {
      alignment: 'center',
      rounded: false,
      shadow: false,
    },
  },
  video: {
    type: 'video',
    name: 'Video',
    description: 'Embedded video player',
    icon: 'Video',
    category: 'media',
    defaultContent: {
      video_url: '',
      video_type: 'direct',
      autoplay: false,
      loop: false,
    },
    defaultSettings: {
      aspect_ratio: '16/9',
      controls: true,
      rounded: false,
    },
  },
  header: {
    type: 'header',
    name: 'Header',
    description: 'Site navigation header',
    icon: 'LayoutTemplate',
    category: 'layout',
    defaultContent: {
      logo_text: 'Portfolio',
      links: [
        { label: 'Home', url: '/' },
        { label: 'Projects', url: '#projects' },
      ],
    },
    defaultSettings: {
      layout: 'simple',
      sticky: true,
      position: 'sticky', // sticky or fixed
    },
  },
  footer: {
    type: 'footer',
    name: 'Footer',
    description: 'Site footer',
    icon: 'LayoutTemplate',
    category: 'layout',
    defaultContent: {
      copyright_text: '© 2024 Portfolio. All rights reserved.',
    },
    defaultSettings: {
      layout: 'simple',
    },
  },
  features: {
    type: 'features',
    name: 'Features',
    description: 'List of features or services with icons',
    icon: 'List',
    category: 'content',
    defaultContent: {
      title: 'Our Features',
      description: 'What makes us special',
      features: [
        { title: 'Feature 1', description: 'Description 1', icon: 'Star' },
        { title: 'Feature 2', description: 'Description 2', icon: 'Zap' },
        { title: 'Feature 3', description: 'Description 3', icon: 'Shield' },
      ],
    },
    defaultSettings: {
      layout: 'grid',
      columns: 3,
      show_icon: true,
    },
  },
  'infinite-hero': {
    type: 'infinite-hero',
    name: 'Infinite Hero',
    description: 'Immersive shader-based background with cinematic typography',
    icon: 'Waves',
    category: 'content',
    defaultContent: {
      headline: 'The road dissolves in light,\nthe horizon remains unseen.',
      subheadline:
        'Minimal structures fade into a vast horizon where presence and absence merge. A quiet tension invites the eye to wander without end.',
      cta_text: 'Learn more',
      cta_link: '#',
      cta_secondary_text: 'View portfolio',
      cta_secondary_link: '#',
    },
    defaultSettings: {
      height: 'full',
      overlay_variant: 'vignette',
    },
  },
  'brand-hero': {
    type: 'brand-hero',
    name: 'Brand Hero',
    description:
      'Minimal branded hero with integrated navigation and full background',
    icon: 'Package',
    category: 'content',
    defaultContent: {
      logoText: 'Midnight',
      navLinks: [
        { label: 'Voyage', href: '#' },
        { label: 'Explore', href: '#' },
      ],
      title: 'Journey into the unknown',
      subtitle: 'Experience the deep blue elegance of our latest collection.',
      ctaText: 'Start Now',
      versionText: 'v1.0.4 - 2024',
    },
    defaultSettings: {
      height: 'full',
    },
  },
  'organic-hero': {
    type: 'organic-hero',
    name: 'Organic Hero',
    description: 'Artisanal organic hero with fluid background blobs',
    icon: 'Waves',
    category: 'layout',
    defaultContent: {
      slogan: 'NATURE IN HARMONY',
      headline: 'Organic Flow',
      subheadline:
        'A balanced exploration of form and function, inspired by the natural world.',
      cta_text: 'Discover the Flow',
      cta_link: '#',
    },
    defaultSettings: {
      height: 'full',
    },
  },
  skills: {
    type: 'skills',
    name: 'Skills',
    description: 'Display your skills with progress bars or badges',
    icon: 'Terminal',
    category: 'content',
    defaultContent: {
      title: 'Professional Skills',
      skills: [
        { id: '1', name: 'Design', level: 90, category: 'Creative' },
        { id: '2', name: 'Development', level: 85, category: 'Technical' },
      ],
    },
    defaultSettings: {
      layout: 'bars',
      show_level: true,
      columns: 3,
    },
  },
  stats: {
    type: 'stats',
    name: 'Stats',
    description: 'Display key statistics or metrics',
    icon: 'BarChart',
    category: 'content',
    defaultContent: {
      title: 'By the Numbers',
      stats: [
        { id: '1', label: 'Projects', value: 50, suffix: '+' },
        { id: '2', label: 'Experience', value: 10, suffix: 'y' },
      ],
    },
    defaultSettings: {
      layout: 'grid',
      columns: 4,
      animation: true,
    },
  },
  marquee: {
    type: 'marquee',
    name: 'Marquee',
    description: 'Infinite scrolling text or logos',
    icon: 'MoveHorizontal',
    category: 'interactive',
    defaultContent: {
      items: ['Trending', 'Modern', 'Creative', 'Design'],
    },
    defaultSettings: {
      speed: 'normal',
      direction: 'left',
      gap: 'medium',
      background: 'transparent',
    },
  },
  bento: {
    type: 'bento',
    name: 'Bento Grid',
    description: 'Modern, responsive grid layout',
    icon: 'LayoutGrid',
    category: 'layout',
    defaultContent: {
      items: [
        { id: '1', title: 'Main Feature', col_span: 2, row_span: 2, type: 'text' },
        { id: '2', title: 'Stat', col_span: 1, row_span: 1, type: 'stats' },
        { id: '3', title: 'Image', col_span: 1, row_span: 1, type: 'image' },
      ],
    },
    defaultSettings: {
      columns: 3,
      gap: 'medium',
    },
  },
};

// Validation helpers
export function validateBlockContent(
  blockType: BlockType,
  content: unknown
): boolean {
  try {
    switch (blockType) {
      case 'hero':
        heroBlockContentSchema.parse(content);
        return true;
      case 'text':
        textBlockContentSchema.parse(content);
        return true;
      case 'gallery':
        galleryBlockContentSchema.parse(content);
        return true;
      case 'projects':
        projectsBlockContentSchema.parse(content);
        return true;
      case 'form':
        formBlockContentSchema.parse(content);
        return true;
      case 'image':
        imageBlockContentSchema.parse(content);
        return true;
      case 'video':
        videoBlockContentSchema.parse(content);
        return true;
      case 'header':
        headerBlockContentSchema.parse(content);
        return true;
      case 'footer':
        return true;
      case 'features':
        featuresBlockContentSchema.parse(content);
        return true;
      case 'infinite-hero':
        infiniteHeroBlockContentSchema.parse(content);
        return true;
      case 'brand-hero':
        brandHeroBlockContentSchema.parse(content);
        return true;
      case 'organic-hero':
        organicHeroBlockContentSchema.parse(content);
        return true;
      case 'skills':
        skillsBlockContentSchema.parse(content);
        return true;
      case 'stats':
        statsBlockContentSchema.parse(content);
        return true;
      case 'marquee':
        marqueeBlockContentSchema.parse(content);
        return true;
      case 'bento':
        bentoBlockContentSchema.parse(content);
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export function validateBlockSettings(
  blockType: BlockType,
  settings: unknown
): boolean {
  try {
    switch (blockType) {
      case 'hero':
        heroBlockSettingsSchema.parse(settings);
        return true;
      case 'text':
        textBlockSettingsSchema.parse(settings);
        return true;
      case 'gallery':
        galleryBlockSettingsSchema.parse(settings);
        return true;
      case 'projects':
        projectsBlockSettingsSchema.parse(settings);
        return true;
      case 'form':
        formBlockSettingsSchema.parse(settings);
        return true;
      case 'image':
        imageBlockSettingsSchema.parse(settings);
        return true;
      case 'video':
        videoBlockSettingsSchema.parse(settings);
        return true;
      case 'header':
        headerBlockSettingsSchema.parse(settings);
        return true;
      case 'footer':
        return true;
      case 'features':
        featuresBlockSettingsSchema.parse(settings);
        return true;
      case 'infinite-hero':
        infiniteHeroBlockSettingsSchema.parse(settings);
        return true;
      case 'brand-hero':
        brandHeroBlockSettingsSchema.parse(settings);
        return true;
      case 'organic-hero':
        organicHeroBlockSettingsSchema.parse(settings);
        return true;
      case 'skills':
        skillsBlockSettingsSchema.parse(settings);
        return true;
      case 'stats':
        statsBlockSettingsSchema.parse(settings);
        return true;
      case 'marquee':
        marqueeBlockSettingsSchema.parse(settings);
        return true;
      case 'bento':
        bentoBlockSettingsSchema.parse(settings);
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

// Get default content for a block type
export function getDefaultBlockContent(
  blockType: BlockType
): Record<string, unknown> {
  return blockRegistry[blockType]?.defaultContent || {};
}

// Get default settings for a block type
export function getDefaultBlockSettings(
  blockType: BlockType
): Record<string, unknown> {
  return blockRegistry[blockType]?.defaultSettings || {};
}

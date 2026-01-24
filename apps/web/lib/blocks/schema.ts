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
  | 'footer';

// Hero Block
export const heroBlockContentSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
  image_url: z.string().url().optional(),
});

export const heroBlockSettingsSchema = z.object({
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  background: z.enum(['solid', 'gradient', 'image']).default('solid'),
  overlay: z.boolean().default(false),
  height: z.enum(['small', 'medium', 'large', 'full']).default('medium'),
  text_color: z.string().optional(),
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
    })
    .optional(),
});

export const projectsBlockSettingsSchema = z.object({
  layout: z.enum(['grid', 'list', 'masonry']).default('grid'),
  columns: z.number().int().min(1).max(4).default(3),
  show_description: z.boolean().default(true),
  show_tags: z.boolean().default(false),
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
  success_message: z.string().default('Thank you! We will get back to you soon.'),
});

export const formBlockSettingsSchema = z.object({
  layout: z.enum(['single', 'two-column']).default('single'),
  button_style: z.enum(['primary', 'secondary', 'outline']).default('primary'),
  button_align: z.enum(['left', 'center', 'right']).default('left'),
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

// Block content type union
export type BlockContent =
  | HeroBlockContent
  | TextBlockContent
  | GalleryBlockContent
  | ProjectsBlockContent
  | FormBlockContent
  | ImageBlockContent
  | VideoBlockContent;

// Block settings type union
export type BlockSettings =
  | HeroBlockSettings
  | TextBlockSettings
  | GalleryBlockSettings
  | ProjectsBlockSettings
  | FormBlockSettings
  | ImageBlockSettings
  | VideoBlockSettings;

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
        return true;
      case 'footer':
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
        return true;
      case 'footer':
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

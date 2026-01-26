/**
 * Block Schemas
 * Zod schemas for validating block content and settings
 */

import { z } from 'zod';

// ===========================================
// COMMON SCHEMAS
// ===========================================

export const commonBlockSettingsSchema = z.object({
  padding: z.enum(['none', 'small', 'default', 'large']).default('default'),
  margin: z.enum(['none', 'small', 'default', 'large']).default('default'),
  background: z.string().nullable().default(null),
  alignment: z.enum(['left', 'center', 'right']).default('left'),
});

// ===========================================
// LAYOUT BLOCKS
// ===========================================

// Hero Block
export const heroBlockContentSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  description: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
  cta_secondary_text: z.string().optional(),
  cta_secondary_link: z.string().optional(),
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  background_image_url: z.string().url().optional(),
});

export const heroBlockSettingsSchema = z.object({
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  background: z.enum(['solid', 'gradient', 'image', 'video']).default('solid'),
  overlay: z.boolean().default(false),
  overlay_opacity: z.number().min(0).max(1).default(0.5),
  height: z.enum(['small', 'medium', 'large', 'full']).default('medium'),
  text_color: z.string().optional(),
  variant: z
    .enum(['centered', 'split', 'minimal', 'bold', 'script'])
    .default('centered'),
  headline_style: z
    .enum(['default', 'gradient', 'serif', 'script'])
    .default('default'),
});

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

// Section Block
export const sectionBlockContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export const sectionBlockSettingsSchema = z.object({
  container_width: z
    .enum(['narrow', 'default', 'wide', 'full'])
    .default('default'),
  background_color: z.string().optional(),
  text_color: z.string().optional(),
});

// Columns Block
export const columnsBlockContentSchema = z.object({
  columns: z.array(z.record(z.unknown())).min(1).max(6),
});

export const columnsBlockSettingsSchema = z.object({
  column_count: z.number().int().min(1).max(6).default(3),
  gap: z.enum(['none', 'small', 'default', 'large']).default('default'),
  equal_height: z.boolean().default(false),
  responsive: z.boolean().default(true),
});

// ===========================================
// CONTENT BLOCKS
// ===========================================

// Text Block
export const textBlockContentSchema = z.object({
  text: z.string(),
  html: z.string().optional(),
});

export const textBlockSettingsSchema = z.object({
  max_width: z.string().default('800px'),
  text_align: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  font_size: z.enum(['small', 'medium', 'large']).default('medium'),
  line_height: z.number().default(1.6),
});

// Organic Flow Hero Block
export const organicHeroBlockContentSchema = z.object({
  slogan: z.string().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  description: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
});

export const organicHeroBlockSettingsSchema = commonBlockSettingsSchema.extend({
  animation: z.boolean().default(true),
});

// Cyber Hero Block
export const cyberHeroBlockContentSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  cta_text: z.string().optional(),
  image_url: z.string().url().optional(),
  depth_url: z.string().url().optional(),
});

export const cyberHeroBlockSettingsSchema = z.object({
  layout: z.enum(['full', 'centered']).default('full'),
});

// Split Hero Block
export const splitHeroBlockContentSchema = z.object({
  logo_text: z.string().optional(),
  logo_image: z.string().url().optional(),
  slogan: z.string().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
  image_url: z.string().url().optional(),
  contact_info: z
    .object({
      website: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
});

export const splitHeroBlockSettingsSchema = z.object({
  layout: z.enum(['split', 'split-reversed']).default('split'),
});

// Heading Block
export const headingBlockContentSchema = z.object({
  text: z.string(),
  level: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).default('h2'),
});

export const headingBlockSettingsSchema = z.object({
  alignment: z.enum(['left', 'center', 'right']).default('left'),
  size: z.enum(['small', 'medium', 'large', 'xl']).default('medium'),
  color: z.string().optional(),
});

// Quote Block
export const quoteBlockContentSchema = z.object({
  quote: z.string(),
  author: z.string().optional(),
  author_title: z.string().optional(),
  author_image: z.string().url().optional(),
});

export const quoteBlockSettingsSchema = z.object({
  style: z.enum(['default', 'large', 'minimal', 'bordered']).default('default'),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
});

// ===========================================
// MEDIA BLOCKS
// ===========================================

// Image Block
export const imageBlockContentSchema = z.object({
  image_url: z.string().url(),
  alt_text: z.string().optional(),
  caption: z.string().optional(),
  link_url: z.string().url().optional(),
});

export const imageBlockSettingsSchema = z.object({
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  width: z.enum(['auto', 'small', 'medium', 'large', 'full']).default('auto'),
  aspect_ratio: z.string().optional(),
  object_fit: z.enum(['contain', 'cover', 'fill']).default('cover'),
  rounded: z.boolean().default(false),
  shadow: z.boolean().default(false),
});

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
  layout: z.enum(['grid', 'masonry', 'carousel', 'slider']).default('grid'),
  columns: z.number().int().min(1).max(6).default(3),
  gap: z.enum(['none', 'small', 'default', 'large']).default('default'),
  aspect_ratio: z.string().optional(),
  lightbox: z.boolean().default(true),
  autoplay: z.boolean().default(false),
});

// Video Block
export const videoBlockContentSchema = z.object({
  video_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  autoplay: z.boolean().default(false),
  loop: z.boolean().default(false),
  muted: z.boolean().default(false),
  controls: z.boolean().default(true),
});

export const videoBlockSettingsSchema = z.object({
  width: z.enum(['auto', 'small', 'medium', 'large', 'full']).default('auto'),
  aspect_ratio: z.string().default('16:9'),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
});

// ===========================================
// INTERACTIVE BLOCKS
// ===========================================

// Contact Form Block
export const contactFormBlockContentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['text', 'email', 'tel', 'textarea', 'select']),
      label: z.string(),
      placeholder: z.string().optional(),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    })
  ),
  submit_text: z.string().default('Send Message'),
  success_message: z.string().default('Thank you! Your message has been sent.'),
  email_to: z.string().email().optional(),
});

export const contactFormBlockSettingsSchema = z.object({
  layout: z.enum(['default', 'compact', 'wide']).default('default'),
  button_style: z.enum(['primary', 'secondary', 'outline']).default('primary'),
  show_labels: z.boolean().default(true),
});

// ===========================================
// PORTFOLIO-SPECIFIC BLOCKS
// ===========================================

// Project Grid Block
export const projectGridBlockContentSchema = z.object({
  title: z.string().optional(),
  limit: z.number().int().positive().default(6),
  project_ids: z.array(z.string().uuid()).optional(),
  filter: z
    .object({
      tags: z.array(z.string()).optional(),
      category: z.string().optional(),
      featured: z.boolean().optional(),
    })
    .optional(),
});

export const projectGridBlockSettingsSchema = z.object({
  layout: z.enum(['grid', 'masonry', 'list']).default('grid'),
  columns: z.number().int().min(1).max(4).default(3),
  gap: z.enum(['none', 'small', 'default', 'large']).default('default'),
  show_excerpt: z.boolean().default(true),
  show_tags: z.boolean().default(true),
  show_date: z.boolean().default(true),
});

// Skills Block
export const skillsBlockContentSchema = z.object({
  title: z.string().optional(),
  skills: z.array(
    z.object({
      name: z.string(),
      level: z.number().min(0).max(100).optional(),
      category: z.string().optional(),
      icon: z.string().optional(),
    })
  ),
});

export const skillsBlockSettingsSchema = z.object({
  layout: z.enum(['grid', 'list', 'bars']).default('grid'),
  show_level: z.boolean().default(true),
  columns: z.number().int().min(1).max(6).default(3),
});

// Stats Block
export const statsBlockContentSchema = z.object({
  title: z.string().optional(),
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      suffix: z.string().optional(),
      icon: z.string().optional(),
    })
  ),
});

export const statsBlockSettingsSchema = z.object({
  layout: z.enum(['grid', 'horizontal']).default('grid'),
  columns: z.number().int().min(1).max(6).default(4),
  animation: z.boolean().default(true),
});

// ===========================================
// NEW BLOCKS
// ===========================================

// Shape Block
export const shapeBlockContentSchema = z.object({
  shape: z
    .enum(['square', 'circle', 'triangle', 'diamond'])
    .optional()
    .default('square'),
  color: z.string().optional().default('#000000'),
  width: z.union([z.string(), z.number()]).optional().default(100),
  height: z.union([z.string(), z.number()]).optional().default(100),
});

export const shapeBlockSettingsSchema = commonBlockSettingsSchema.extend({
  rotate: z.number().optional(),
});

// Frame Block
export const frameBlockContentSchema = z.object({
  borderColor: z.string().optional().default('#000000'),
  borderWidth: z.union([z.string(), z.number()]).optional().default(2),
  borderRadius: z.union([z.string(), z.number()]).optional().default(0),
  backgroundColor: z.string().optional().default('transparent'),
  padding: z.union([z.string(), z.number()]).optional().default(20),
  minHeight: z.union([z.string(), z.number()]).optional().default(200),
});

export const frameBlockSettingsSchema = commonBlockSettingsSchema.extend({
  shadow: z.boolean().default(false),
});

// Header Block
export const headerBlockContentSchema = z.object({
  logo_text: z.string().optional().default('My Portfolio'),
  logo_image: z.string().url().optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    )
    .default([
      { label: 'Home', url: '/' },
      { label: 'About', url: '#about' },
      { label: 'Contact', url: '#contact' },
    ]),
});

export const headerBlockSettingsSchema = z.object({
  layout: z.enum(['simple', 'centered', 'split']).default('simple'),
  sticky: z.boolean().default(true),
  background_color: z.string().optional(),
  text_color: z.string().optional(),
});

// Footer Block
export const footerBlockContentSchema = z.object({
  copyright_text: z
    .string()
    .optional()
    .default('© 2024 My Portfolio. All rights reserved.'),
  social_links: z
    .array(
      z.object({
        platform: z.enum([
          'twitter',
          'github',
          'linkedin',
          'instagram',
          'youtube',
        ]),
        url: z.string().url(),
      })
    )
    .optional(),
});

export const footerBlockSettingsSchema = z.object({
  layout: z.enum(['simple', 'columns', 'centered']).default('simple'),
  background_color: z.string().optional(),
  text_color: z.string().optional(),
});

// ===========================================
// SCHEMA MAPS
// ===========================================

export const blockContentSchemas: Record<string, z.ZodSchema> = {
  hero: heroBlockContentSchema,
  section: sectionBlockContentSchema,
  columns: columnsBlockContentSchema,
  text: textBlockContentSchema,
  heading: headingBlockContentSchema,
  quote: quoteBlockContentSchema,
  image: imageBlockContentSchema,
  gallery: galleryBlockContentSchema,
  video: videoBlockContentSchema,
  'contact-form': contactFormBlockContentSchema,
  'project-grid': projectGridBlockContentSchema,
  skills: skillsBlockContentSchema,
  stats: statsBlockContentSchema,
  shape: shapeBlockContentSchema,
  frame: frameBlockContentSchema,
  header: headerBlockContentSchema,
  footer: footerBlockContentSchema,
  'organic-hero': organicHeroBlockContentSchema,
  'cyber-hero': cyberHeroBlockContentSchema,
  'split-hero': splitHeroBlockContentSchema,
};

export const blockSettingsSchemas: Record<string, z.ZodSchema> = {
  hero: heroBlockSettingsSchema,
  section: sectionBlockSettingsSchema,
  columns: columnsBlockSettingsSchema,
  text: textBlockSettingsSchema,
  heading: headingBlockSettingsSchema,
  quote: quoteBlockSettingsSchema,
  image: imageBlockSettingsSchema,
  gallery: galleryBlockSettingsSchema,
  video: videoBlockSettingsSchema,
  'contact-form': contactFormBlockSettingsSchema,
  'project-grid': projectGridBlockSettingsSchema,
  skills: skillsBlockSettingsSchema,
  stats: statsBlockSettingsSchema,
  shape: shapeBlockSettingsSchema,
  frame: frameBlockSettingsSchema,
  header: headerBlockSettingsSchema,
  footer: footerBlockSettingsSchema,
  'organic-hero': organicHeroBlockSettingsSchema,
  'cyber-hero': cyberHeroBlockSettingsSchema,
  'split-hero': splitHeroBlockSettingsSchema,
};

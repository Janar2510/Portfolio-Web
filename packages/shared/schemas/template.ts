import { z } from 'zod';

/**
 * Theme Configuration
 */
export const ThemeConfigSchema = z.object({
    fonts: z.object({
        headingFont: z.string().default('Inter'),
        bodyFont: z.string().default('Inter'),
        monoFont: z.string().default('JetBrains Mono'),
        baseSize: z.number().default(16),
        scale: z.number().default(1.25),
        lineHeight: z.number().default(1.6),
        headingWeight: z.number().default(700),
        bodyWeight: z.number().default(400),
        fallback: z.string().default('sans-serif'),
    }),
    palette: z.object({
        primary: z.string(),
        secondary: z.string(),
        background: z.string(),
        text: z.string(),
        accent: z.string(),
        surface: z.string().optional(),
        border: z.string().optional(),
    }),
    buttons: z.object({
        radius: z.string(),
        style: z.enum(['solid', 'outline', 'ghost', 'link']),
        uppercase: z.boolean(),
    }).optional(),
});

/**
 * Sections Configuration
 */
export const SectionsConfigSchema = z.object({
    order: z.array(z.string()),
    visibility: z.record(z.string(), z.boolean()),
    content: z.record(z.string(), z.any()),
});

/**
 * Template Configuration (Mutable per site)
 * This is what's stored in the database as JSON.
 */
export const TemplateConfigSchema = z.object({
    templateId: z.string(),
    siteTitle: z.string().optional(),
    bio: z.string().optional(),
    theme: ThemeConfigSchema,
    sections: SectionsConfigSchema,
    custom_css: z.string().optional(),
    assets: z.object({
        logo: z.string().optional(),
        favicon: z.string().optional(),
        avatar: z.string().optional(),
        heroImage: z.string().optional(),
        projectImages: z.array(z.string()).default([]),
    }).optional(),
});

/**
 * Immutable Template Definition
 * Defined by developers as code in the registry.
 */
export const TemplateDefinitionSchema = z.object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'ID must be kebab-case'),
    name: z.string(),
    description: z.string(),
    category: z.string().optional(),
    rendererVersion: z.string(),
    allowedSections: z.array(z.string()),
    sectionDefaults: z.record(z.string(), z.any()),
    controls: z.object({
        fonts: z.boolean().default(true),
        palette: z.boolean().default(true),
        images: z.boolean().default(true),
        textFields: z.array(z.string()).default([]),
        toggles: z.array(z.string()).default([]),
    }),
    thumbnail_url: z.string().url().optional(),
});

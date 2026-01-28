import { z } from 'zod';

export const PaletteSchema = z.object({
    primary: z.string(),
    background: z.string(),
    text: z.string(),
    accent: z.string().optional(),
    secondary: z.string().optional(),
});

export const FontSchema = z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
});

export const ThemeSchema = z.object({
    palette: PaletteSchema,
    fonts: FontSchema,
});

export const ProjectItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().optional(),
    link: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

export const SectionContentSchema = z.object({
    hero: z.object({
        headline: z.string(),
        subtitle: z.string().optional(),
    }).optional(),
    about: z.object({
        bio: z.string(),
    }).optional(),
    projects: z.object({
        title: z.string(),
        items: z.array(ProjectItemSchema),
    }).optional(),
    contact: z.object({
        email: z.string().email().optional(),
        socials: z.array(z.object({
            platform: z.string(),
            url: z.string().url(),
        })).optional(),
    }).optional(),
}).catchall(z.any());

export const SectionConfigSchema = z.object({
    order: z.array(z.string()),
    content: z.record(z.string(), SectionContentSchema),
    visibility: z.record(z.string(), z.boolean()),
});

export const AssetConfigSchema = z.record(z.string(), z.string().optional()).and(z.object({
    logo: z.string().optional(),
    avatar: z.string().optional(),
    heroImage: z.string().optional(),
}));

export const TemplateConfigSchema = z.object({
    siteTitle: z.string(),
    theme: ThemeSchema,
    sections: SectionConfigSchema,
    assets: AssetConfigSchema,
});

/**
 * Validates a configuration object against the TemplateConfigSchema
 */
export function parseTemplateConfig(config: unknown) {
    return TemplateConfigSchema.parse(config);
}

/**
 * Safely validates a configuration object, returning success/error result
 */
export function safeParseTemplateConfig(config: unknown) {
    return TemplateConfigSchema.safeParse(config);
}

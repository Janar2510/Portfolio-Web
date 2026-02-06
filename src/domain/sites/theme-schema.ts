import { z } from 'zod';

/**
 * Theme Schema
 * Defines the structure for site theme customization
 */

export const themeColorsSchema = z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
    surface: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
    textMuted: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
});

export const themeFontsSchema = z.object({
    heading: z.string().min(1, 'Heading font is required'),
    body: z.string().min(1, 'Body font is required'),
});

export const themeLogoSchema = z.object({
    url: z.string().url().optional(),
    alt: z.string().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
});

export const themeSchema = z.object({
    colors: themeColorsSchema,
    fonts: themeFontsSchema,
    logo: themeLogoSchema.optional(),
});

// TypeScript types
export type ThemeColors = z.infer<typeof themeColorsSchema>;
export type ThemeFonts = z.infer<typeof themeFontsSchema>;
export type ThemeLogo = z.infer<typeof themeLogoSchema>;
export type Theme = z.infer<typeof themeSchema>;

// Default theme
export const defaultTheme: Theme = {
    colors: {
        primary: '#6366F1',      // Indigo
        secondary: '#8B5CF6',    // Violet
        background: '#FFFFFF',   // White
        surface: '#F9FAFB',      // Gray 50
        text: '#111827',         // Gray 900
        textMuted: '#6B7280',    // Gray 500
    },
    fonts: {
        heading: 'Inter',
        body: 'Inter',
    },
    logo: undefined,
};

import { Theme } from '@/domain/sites/theme-schema';

/**
 * Pre-defined Color Palettes
 * One-click color schemes for quick theme customization
 */

export interface ColorPalette {
    id: string;
    name: string;
    description: string;
    colors: Theme['colors'];
}

export const colorPalettes: ColorPalette[] = [
    {
        id: 'indigo-violet',
        name: 'Indigo Violet',
        description: 'Modern and professional',
        colors: {
            primary: '#6366F1',
            secondary: '#8B5CF6',
            background: '#FFFFFF',
            surface: '#F9FAFB',
            text: '#111827',
            textMuted: '#6B7280',
        },
    },
    {
        id: 'ocean-blue',
        name: 'Ocean Blue',
        description: 'Fresh and trustworthy',
        colors: {
            primary: '#0EA5E9',
            secondary: '#06B6D4',
            background: '#F0F9FF',
            surface: '#FFFFFF',
            text: '#0F172A',
            textMuted: '#64748B',
        },
    },
    {
        id: 'sunset-orange',
        name: 'Sunset Orange',
        description: 'Warm and energetic',
        colors: {
            primary: '#F97316',
            secondary: '#FB923C',
            background: '#FFF7ED',
            surface: '#FFFFFF',
            text: '#1C1917',
            textMuted: '#78716C',
        },
    },
    {
        id: 'forest-green',
        name: 'Forest Green',
        description: 'Natural and calming',
        colors: {
            primary: '#10B981',
            secondary: '#34D399',
            background: '#F0FDF4',
            surface: '#FFFFFF',
            text: '#14532D',
            textMuted: '#6B7280',
        },
    },
    {
        id: 'royal-purple',
        name: 'Royal Purple',
        description: 'Luxurious and creative',
        colors: {
            primary: '#9333EA',
            secondary: '#A855F7',
            background: '#FAF5FF',
            surface: '#FFFFFF',
            text: '#1F2937',
            textMuted: '#6B7280',
        },
    },
    {
        id: 'rose-pink',
        name: 'Rose Pink',
        description: 'Elegant and feminine',
        colors: {
            primary: '#F43F5E',
            secondary: '#FB7185',
            background: '#FFF1F2',
            surface: '#FFFFFF',
            text: '#1F2937',
            textMuted: '#6B7280',
        },
    },
    {
        id: 'slate-gray',
        name: 'Slate Gray',
        description: 'Minimal and sophisticated',
        colors: {
            primary: '#475569',
            secondary: '#64748B',
            background: '#F8FAFC',
            surface: '#FFFFFF',
            text: '#0F172A',
            textMuted: '#64748B',
        },
    },
    {
        id: 'amber-gold',
        name: 'Amber Gold',
        description: 'Rich and premium',
        colors: {
            primary: '#F59E0B',
            secondary: '#FBBF24',
            background: '#FFFBEB',
            surface: '#FFFFFF',
            text: '#1C1917',
            textMuted: '#78716C',
        },
    },
    {
        id: 'teal-cyan',
        name: 'Teal Cyan',
        description: 'Modern and vibrant',
        colors: {
            primary: '#14B8A6',
            secondary: '#2DD4BF',
            background: '#F0FDFA',
            surface: '#FFFFFF',
            text: '#0F172A',
            textMuted: '#64748B',
        },
    },
    {
        id: 'crimson-red',
        name: 'Crimson Red',
        description: 'Bold and passionate',
        colors: {
            primary: '#DC2626',
            secondary: '#EF4444',
            background: '#FEF2F2',
            surface: '#FFFFFF',
            text: '#1F2937',
            textMuted: '#6B7280',
        },
    },
    {
        id: 'midnight-dark',
        name: 'Midnight Dark',
        description: 'Sleek and modern',
        colors: {
            primary: '#6366F1',
            secondary: '#8B5CF6',
            background: '#0F172A',
            surface: '#1E293B',
            text: '#F1F5F9',
            textMuted: '#94A3B8',
        },
    },
    {
        id: 'charcoal-dark',
        name: 'Charcoal Dark',
        description: 'Professional dark theme',
        colors: {
            primary: '#10B981',
            secondary: '#34D399',
            background: '#111827',
            surface: '#1F2937',
            text: '#F9FAFB',
            textMuted: '#9CA3AF',
        },
    },
];

/**
 * Get a palette by ID
 */
export function getPaletteById(id: string): ColorPalette | undefined {
    return colorPalettes.find((p) => p.id === id);
}

/**
 * Get palette categories
 */
export function getPaletteCategories(): string[] {
    return ['All', 'Light', 'Dark', 'Colorful', 'Minimal'];
}

/**
 * Filter palettes by category
 */
export function filterPalettesByCategory(category: string): ColorPalette[] {
    if (category === 'All') return colorPalettes;

    if (category === 'Light') {
        return colorPalettes.filter((p) =>
            p.colors.background === '#FFFFFF' || p.colors.background.startsWith('#F')
        );
    }

    if (category === 'Dark') {
        return colorPalettes.filter((p) =>
            p.colors.background.startsWith('#0') || p.colors.background.startsWith('#1')
        );
    }

    if (category === 'Colorful') {
        return colorPalettes.filter((p) =>
            !['slate-gray', 'midnight-dark', 'charcoal-dark'].includes(p.id)
        );
    }

    if (category === 'Minimal') {
        return colorPalettes.filter((p) =>
            ['slate-gray', 'indigo-violet'].includes(p.id)
        );
    }

    return colorPalettes;
}

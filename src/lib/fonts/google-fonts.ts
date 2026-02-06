/**
 * Popular Google Fonts for web design
 * Curated list with categories and pairing suggestions
 */

export interface FontOption {
    family: string;
    category: 'serif' | 'sans-serif' | 'display' | 'monospace';
    weights: number[];
    popularPairings?: string[];
    description: string;
}

export const googleFonts: FontOption[] = [
    {
        family: 'Inter',
        category: 'sans-serif',
        weights: [400, 500, 600, 700, 800],
        popularPairings: ['Merriweather', 'Lora', 'Playfair Display'],
        description: 'Modern, clean, and highly readable',
    },
    {
        family: 'Roboto',
        category: 'sans-serif',
        weights: [300, 400, 500, 700, 900],
        popularPairings: ['Roboto Slab', 'Merriweather', 'Lora'],
        description: 'Google\'s signature font, versatile and friendly',
    },
    {
        family: 'Poppins',
        category: 'sans-serif',
        weights: [300, 400, 500, 600, 700, 800],
        popularPairings: ['Merriweather', 'Lora', 'Open Sans'],
        description: 'Geometric and modern with a friendly feel',
    },
    {
        family: 'Montserrat',
        category: 'sans-serif',
        weights: [300, 400, 500, 600, 700, 800, 900],
        popularPairings: ['Merriweather', 'Lora', 'Open Sans'],
        description: 'Urban and contemporary',
    },
    {
        family: 'Open Sans',
        category: 'sans-serif',
        weights: [300, 400, 600, 700, 800],
        popularPairings: ['Merriweather', 'Lora', 'Montserrat'],
        description: 'Neutral and friendly, excellent readability',
    },
    {
        family: 'Lato',
        category: 'sans-serif',
        weights: [300, 400, 700, 900],
        popularPairings: ['Merriweather', 'Lora', 'Playfair Display'],
        description: 'Warm and stable, serious but friendly',
    },
    {
        family: 'Playfair Display',
        category: 'serif',
        weights: [400, 500, 600, 700, 800, 900],
        popularPairings: ['Inter', 'Roboto', 'Open Sans'],
        description: 'Elegant and high-contrast, perfect for headings',
    },
    {
        family: 'Merriweather',
        category: 'serif',
        weights: [300, 400, 700, 900],
        popularPairings: ['Inter', 'Roboto', 'Open Sans', 'Lato'],
        description: 'Classic and readable, great for body text',
    },
    {
        family: 'Lora',
        category: 'serif',
        weights: [400, 500, 600, 700],
        popularPairings: ['Inter', 'Roboto', 'Open Sans'],
        description: 'Contemporary serif with calligraphic roots',
    },
    {
        family: 'Raleway',
        category: 'sans-serif',
        weights: [300, 400, 500, 600, 700, 800, 900],
        popularPairings: ['Merriweather', 'Lora', 'Open Sans'],
        description: 'Elegant and thin, works well for headings',
    },
    {
        family: 'Nunito',
        category: 'sans-serif',
        weights: [300, 400, 600, 700, 800, 900],
        popularPairings: ['Merriweather', 'Lora'],
        description: 'Rounded and friendly',
    },
    {
        family: 'Source Sans Pro',
        category: 'sans-serif',
        weights: [300, 400, 600, 700, 900],
        popularPairings: ['Merriweather', 'Lora'],
        description: 'Adobe\'s first open-source font, clean and professional',
    },
    {
        family: 'Oswald',
        category: 'sans-serif',
        weights: [300, 400, 500, 600, 700],
        popularPairings: ['Merriweather', 'Lora', 'Open Sans'],
        description: 'Condensed and bold, great for headlines',
    },
    {
        family: 'PT Serif',
        category: 'serif',
        weights: [400, 700],
        popularPairings: ['Inter', 'Roboto', 'Open Sans'],
        description: 'Transitional serif with excellent readability',
    },
    {
        family: 'Crimson Text',
        category: 'serif',
        weights: [400, 600, 700],
        popularPairings: ['Inter', 'Roboto', 'Lato'],
        description: 'Inspired by classic old-style typefaces',
    },
];

/**
 * Load a Google Font dynamically
 */
export async function loadGoogleFont(
    fontFamily: string,
    weights: number[] = [400, 600, 700]
): Promise<void> {
    const weightsParam = weights.join(';');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
        / /g,
        '+'
    )}:wght@${weightsParam}&display=swap`;

    // Check if already loaded
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (existingLink) return;

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.href = fontUrl;
        link.rel = 'stylesheet';
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load font: ${fontFamily}`));
        document.head.appendChild(link);
    });
}

/**
 * Get font by family name
 */
export function getFontByFamily(family: string): FontOption | undefined {
    return googleFonts.find((f) => f.family === family);
}

/**
 * Get fonts by category
 */
export function getFontsByCategory(
    category: FontOption['category']
): FontOption[] {
    return googleFonts.filter((f) => f.category === category);
}

/**
 * Get font pairing suggestions
 */
export function getFontPairings(headingFont: string): FontOption[] {
    const font = getFontByFamily(headingFont);
    if (!font || !font.popularPairings) return [];

    return font.popularPairings
        .map((family) => getFontByFamily(family))
        .filter((f): f is FontOption => f !== undefined);
}

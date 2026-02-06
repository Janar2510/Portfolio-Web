import { ThemeConfig, AssetConfig } from '@/domain/templates/contracts';
export * from '@/domain/builder/types';

export interface PortfolioSiteStyles {
    colors: ThemeConfig['palette'];
    typography: ThemeConfig['fonts'];
    spacing: {
        scale: 'compact' | 'default' | 'relaxed';
        containerMaxWidth?: string;
        sectionPadding: string;
        containerWidth: string;
        borderRadius: string;
    };
    effects: {
        shadows: boolean;
        animations: boolean;
        animationSpeed: string;
        scrollAnimations: boolean;
        hoverEffects: boolean;
    };
    layout: {
        containerWidth: string;
    };
    custom_css?: string;
    assets: AssetConfig;
    siteTitle?: string;
    bio?: string;
}

// Keep existing interface if it's not in domain types, or alias it if needed
// Checking domain types, StylePreset exists there too.
// We can rely on the export * from domain/builder/types for most things now.


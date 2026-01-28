import { ThemeConfig, AssetConfig } from '@/domain/templates/contracts';

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

export interface StylePreset {
    id: string;
    name: string;
    colors?: Partial<PortfolioSiteStyles['colors']>;
    typography?: Partial<PortfolioSiteStyles['typography']>;
    spacing?: Partial<PortfolioSiteStyles['spacing']>;
    effects?: Partial<PortfolioSiteStyles['effects']>;
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

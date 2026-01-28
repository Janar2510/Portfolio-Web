export type TemplateId = 'editorial-minimal' | 'playful-pop';

export interface PaletteConfig {
    primary: string;
    background: string;
    text: string;
    accent?: string;
    secondary?: string;
}

export interface FontConfig {
    headingFont: string;
    bodyFont: string;
}

export interface ThemeConfig {
    palette: PaletteConfig;
    fonts: FontConfig;
}

export interface ProjectItem {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
    tags?: string[];
}

export interface SectionContent {
    hero?: {
        headline: string;
        subtitle?: string;
    };
    about?: {
        bio: string;
    };
    projects?: {
        title: string;
        items: ProjectItem[];
    };
    contact?: {
        email?: string;
        socials?: {
            platform: string;
            url: string;
        }[];
    };
    [key: string]: any;
}

export interface SectionConfig {
    order: string[];
    content: Record<string, SectionContent>;
    visibility: Record<string, boolean>;
}

export interface AssetConfig {
    logo?: string;
    avatar?: string;
    heroImage?: string;
    [key: string]: string | undefined;
}

export interface TemplateConfig {
    siteTitle: string;
    theme: ThemeConfig;
    sections: SectionConfig;
    assets: AssetConfig;
}

export interface TemplateDefinition {
    id: TemplateId;
    name: string;
    description: string;
    previewImage?: string;
    allowedSections: string[];
}

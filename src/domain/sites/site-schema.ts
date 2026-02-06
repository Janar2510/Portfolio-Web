import { z } from 'zod';
import { Locale, RequiredLocalizedString, LocalizedString, TemplateId, SiteStatus, ISODateString } from '../templates/types';

export type SiteSchemaVersion = 1;
export const SITE_SCHEMA_VERSION = 1 as const;

export type SiteSectionType = 'hero' | 'about' | 'projects' | 'services' | 'contact' | 'gallery' | 'header' | 'footer' | 'custom' | 'bento' | 'marquee' | 'features';

export interface BaseSection {
    id: string;
    type: SiteSectionType;
    enabled: boolean;
}

export interface HeroSection extends BaseSection {
    type: 'hero';
    content: {
        headline: RequiredLocalizedString;
        subheadline?: LocalizedString;
        ctaLabel?: LocalizedString;
        ctaHref?: string;
        backgroundImage?: string;
    };
}

export interface AboutSection extends BaseSection {
    type: 'about';
    content: {
        heading?: LocalizedString;
        subheading?: LocalizedString;
        body: RequiredLocalizedString;
        avatarImage?: { src: string; alt?: LocalizedString };
    };
}

export interface ProjectsSection extends BaseSection {
    type: 'projects';
    content: {
        heading?: LocalizedString;
        subheading?: LocalizedString;
        items: Array<{
            id: string;
            title: RequiredLocalizedString;
            description?: LocalizedString;
            image?: { src: string; alt?: LocalizedString };
            href?: string;
        }>;
    };
}

export interface ServicesSection extends BaseSection {
    type: 'services';
    content: {
        heading?: LocalizedString;
        subheading?: LocalizedString;
        items: Array<{
            id: string;
            title: RequiredLocalizedString;
            description?: LocalizedString;
        }>;
    };
}

export interface ContactSection extends BaseSection {
    type: 'contact';
    content: {
        heading?: LocalizedString;
        subheading?: LocalizedString;
        description?: LocalizedString;
        email?: string;
        phone?: string;
        location?: LocalizedString;
        formEnabled?: boolean;
        socials?: Array<{ platform: string; url: string }>;
    };
}

export interface GallerySection extends BaseSection {
    type: 'gallery';
    content: {
        heading?: LocalizedString;
        subheading?: LocalizedString;
        items: Array<{
            id: string;
            image: { src: string; alt?: LocalizedString };
            caption?: LocalizedString;
        }>;
    };
    settings?: {
        layout?: 'grid' | 'masonry' | 'carousel' | 'accordion';
        columns?: number;
        gap?: string;
        aspect_ratio?: string;
    };
}

export interface HeaderSection extends BaseSection {
    type: 'header';
    content: {
        logoText?: string;
        logoImage?: { src: string; alt?: string };
        navLinks?: Array<{ label: LocalizedString; href: string }>;
    };
}

export interface FooterSection extends BaseSection {
    type: 'footer';
    content: {
        text?: LocalizedString;
        socials?: Array<{ platform: string; url: string }>;
    };
}

export interface CustomBlockSection extends BaseSection {
    type: 'custom';
    content: {
        heading?: LocalizedString;
        subheading?: LocalizedString;
        body?: LocalizedString;
        html?: string;
    };
}

export interface BentoSection extends BaseSection {
    type: 'bento';
    content: {
        heading?: LocalizedString;
        items: Array<{
            id: string;
            title?: LocalizedString;
            description?: LocalizedString;
            col_span?: number;
            row_span?: number;
            type?: string;
            image_url?: string;
            icon?: string;
        }>;
    };
}

export interface MarqueeSection extends BaseSection {
    type: 'marquee';
    content: {
        items: Array<LocalizedString>;
    };
    settings?: {
        speed?: string;
        direction?: string;
        background?: string; // e.g. 'transparent', 'black', 'white'
        gap?: string;
    };
}

export interface FeaturesSection extends BaseSection {
    type: 'features';
    content: {
        heading?: LocalizedString;
        title?: LocalizedString; // Some templates use title
        items?: Array<{ // Some templates use items
            id?: string;
            title: RequiredLocalizedString;
            description?: LocalizedString;
            icon?: string;
        }>;
        features?: Array<{ // Some templates use features
            id?: string;
            title: RequiredLocalizedString;
            description?: LocalizedString;
            icon?: string;
        }>;
    };
    settings?: {
        layout?: string;
        show_icon?: boolean;
    };
}

export type SiteSection =
    | HeroSection
    | AboutSection
    | ProjectsSection
    | ServicesSection
    | ContactSection
    | GallerySection
    | HeaderSection
    | FooterSection
    | CustomBlockSection
    | BentoSection
    | MarqueeSection
    | FeaturesSection;

export interface SiteDocument {
    id: string;
    ownerId: string;
    name: string;
    slug: string;
    templateId: TemplateId;
    locale: Locale;
    status: SiteStatus;
    schemaVersion: SiteSchemaVersion;
    sections: SiteSection[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    publishedAt?: ISODateString;
    theme?: {
        colors: {
            primary: string;
            secondary: string;
            background: string;
            surface: string;
            text: string;
            textMuted: string;
        };
        fonts: {
            heading: string;
            body: string;
        };
        logo?: {
            url?: string;
            alt?: string;
            width?: number;
            height?: number;
        };
        buttons?: {
            radius: string;
            style: 'solid' | 'outline' | 'ghost' | 'link';
            uppercase: boolean;
        };
    };
    publishedSnapshot?: {
        schemaVersion: number;
        locale: Locale;
        sections: SiteSection[];
        publishedAt: ISODateString;
    };
    // Legacy fields for builder compatibility
    draft_config?: any;
    published_config?: any;
    template_id?: string;
    owner_id?: string;
    owner_user_id?: string;
    created_at?: string;
    updated_at?: string;
}

export const SiteDocumentSchema = z.any(); // Transitional Zod schema for SiteDocument

import { z } from 'zod';
import { Locale, RequiredLocalizedString, LocalizedString, TemplateId, SiteStatus, ISODateString } from '../templates/types';

export type SiteSchemaVersion = 1;
export const SITE_SCHEMA_VERSION = 1 as const;

export type SiteSectionType = 'hero' | 'about' | 'projects' | 'services' | 'contact';

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
    };
}

export interface AboutSection extends BaseSection {
    type: 'about';
    content: {
        heading?: LocalizedString;
        body: RequiredLocalizedString;
        avatarImage?: { src: string; alt?: LocalizedString };
    };
}

export interface ProjectsSection extends BaseSection {
    type: 'projects';
    content: {
        heading?: LocalizedString;
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
        description?: LocalizedString;
        email?: string;
        phone?: string;
        location?: LocalizedString;
        formEnabled?: boolean;
        socials?: Array<{ platform: string; url: string }>;
    };
}

export type SiteSection =
    | HeroSection
    | AboutSection
    | ProjectsSection
    | ServicesSection
    | ContactSection;

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
    publishedSnapshot?: {
        schemaVersion: number;
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

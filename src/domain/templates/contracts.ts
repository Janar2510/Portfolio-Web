import { Locale, TemplateId } from './types';
export type { Locale, TemplateId };
import { SiteSection } from '../sites/site-schema';

// Legacy types still required by builder/renderer
export type {
    TemplateConfig,
    ThemeConfig,
    SectionsConfig
} from '../../../packages/shared/types/template';

import { z } from 'zod';
export const AssetConfigSchema = z.object({
    logo: z.string().url().optional(),
    avatar: z.string().url().optional(),
    heroImage: z.string().url().optional(),
    projectImages: z.array(z.string().url()).default([]),
});
export type AssetConfig = z.infer<typeof AssetConfigSchema>;

export type { SiteDocument } from '../sites/site-schema';
export { SiteDocumentSchema } from '../sites/site-schema';

export interface TemplateDefinition {
    id: TemplateId;
    name: string;
    description: string;
    templateVersion: number;
    previewImage?: string;
    defaultLocale: Locale;
    defaultSections: SiteSection[];
    theme?: {
        palette: {
            primary: string;
            secondary: string;
            background: string;
            text: string;
            accent: string;
            surface?: string;
        };
        fonts?: {
            headingFont: string;
            bodyFont: string;
        };
        buttons?: {
            radius: string;
            style: 'solid' | 'outline' | 'ghost' | 'link';
            uppercase: boolean;
        };
    };
}

export type TemplateRegistry = Record<TemplateId, TemplateDefinition>;

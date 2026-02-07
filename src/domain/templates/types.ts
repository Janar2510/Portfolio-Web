export type Locale = 'et' | 'en';
export type SiteStatus = 'draft' | 'published' | 'archived';
export type TemplateId =
    | 'minimal'
    | 'clean'
    | 'professional'
    | 'neon-noir'
    | 'swiss-style'
    | 'editorial'
    | 'saas-modern'
    | 'bento-grid'
    | 'marquee-portfolio'
    | 'brutalist'
    | 'artisanal-vision'
    | 'editorial-minimal'
    | 'playful-pop'
    | 'peak-perspective'
    | 'cyber-dream'
    | 'organic-flow'
    | 'midnight-voyage';

export type LocalizedString = Partial<Record<Locale, string>>;
export type RequiredLocalizedString = Record<Locale, string>;
export type ISODateString = string;

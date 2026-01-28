export type Locale = 'et' | 'en';
export type SiteStatus = 'draft' | 'published' | 'archived';
export type TemplateId = 'minimal' | 'clean' | 'professional';

export type LocalizedString = Partial<Record<Locale, string>>;
export type RequiredLocalizedString = Record<Locale, string>;
export type ISODateString = string;

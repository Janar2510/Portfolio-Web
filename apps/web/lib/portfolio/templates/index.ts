/**
 * Portfolio Templates
 * Template definitions and utilities
 */

import templateDefinitions from './definitions.json';

export interface TemplateDefinition {
  templateId: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  preview_images?: string[];
  targetPersona: string;
  styleKeywords: string[];
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    surface?: string;
    border?: string;
    textSecondary?: string;
  };
  fontPreset: {
    heading: string;
    body: string;
    mono?: string;
  };
  sections: {
    hero: {
      headline: string;
      subtitle: string;
      badge?: string;
      ctaText?: string;
      backgroundStyle: string;
      alignment?: string;
      height?: string;
      backgroundImage?: string;
      settings?: Record<string, any>;
    };
    about: {
      bioText: string;
      imagePlaceholder: boolean;
    };
    projects: {
      title?: string;
      settings?: Record<string, any>;
      items: Array<{
        title: string;
        image: string;
        description: string;
        category?: string;
      }>;
    };
    services: {
      title?: string;
      description?: string;
      settings?: Record<string, any>;
      items: Array<{
        title: string;
        description: string;
        icon?: string;
      }>;
    };
    contact: {
      title?: string;
      description?: string;
      ctaText: string;
      settings?: Record<string, any>;
      formFields: string[];
      contact_info?: {
        email?: string;
        location?: string;
        phone?: string;
        socials?: Array<{ platform: string; url: string }>;
      };
    };
    footer?: {
      logo_text?: string;
      bio_text?: string;
      copyright_text?: string;
      settings?: Record<string, any>;
    };
  };
}

export const templates: TemplateDefinition[] =
  templateDefinitions as TemplateDefinition[];

export function getTemplateById(
  templateId: string
): TemplateDefinition | undefined {
  return templates.find(t => t.templateId === templateId);
}

export function getTemplatesByCategory(category: string): TemplateDefinition[] {
  // Map style keywords to categories
  const categoryMap: Record<string, string[]> = {
    minimal: ['minimal', 'clean', 'simple'],
    creative: ['creative', 'bold', 'vibrant'],
    professional: ['professional', 'conservative', 'business'],
    developer: ['developer', 'technical', 'code'],
    artist: ['artist', 'visual', 'gallery'],
  };

  const keywords = categoryMap[category.toLowerCase()] || [];
  return templates.filter(t =>
    t.styleKeywords.some(keyword =>
      keywords.some(cat => keyword.toLowerCase().includes(cat))
    )
  );
}

export function getAllTemplates(): TemplateDefinition[] {
  return templates;
}

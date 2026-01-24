/**
 * Portfolio Templates
 * Template definitions and utilities
 */

import templateDefinitions from './definitions.json';

export interface TemplateDefinition {
  templateId: string;
  title: string;
  description: string;
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
      backgroundStyle: string;
      alignment?: string;
      height?: string;
    };
    about: {
      bioText: string;
      imagePlaceholder: boolean;
    };
    projects: Array<{
      title: string;
      image: string;
      description: string;
    }>;
    services?: Array<{
      title: string;
      description: string;
    }>;
    contact: {
      ctaText: string;
      formFields: string[];
    };
  };
}

export const templates: TemplateDefinition[] = templateDefinitions as TemplateDefinition[];

export function getTemplateById(templateId: string): TemplateDefinition | undefined {
  return templates.find((t) => t.templateId === templateId);
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
  return templates.filter((t) =>
    t.styleKeywords.some((keyword) =>
      keywords.some((cat) => keyword.toLowerCase().includes(cat))
    )
  );
}

export function getAllTemplates(): TemplateDefinition[] {
  return templates;
}

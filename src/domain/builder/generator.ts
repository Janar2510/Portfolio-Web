import { listTemplates, createDefaultConfig, getTemplate } from '@/domain/templates/registry';
import { TemplateConfig } from '@/domain/templates/contracts';

/**
 * Generates a full site configuration from a template definition.
 * This is the entry point for creating new sites.
 */
export function generateSiteFromTemplate(
  templateId: string
): TemplateConfig {
  const template = getTemplate(templateId as any);

  if (!template) {
    throw new Error(`Template with id ${templateId} not found`);
  }

  // Use the registry helper for the base config
  const config = createDefaultConfig(templateId as any) as TemplateConfig;

  // Additional generation logic could go here (e.g. AI enhancements)

  return config;
}

import { TemplateDefinition } from '@/domain/templates/contracts';
import { createDefaultConfig } from '@/domain/templates/registry';
import { SiteSection, HeroSection, AboutSection, ProjectsSection, ServicesSection, ContactSection } from '@/domain/sites/site-schema';
import { PortfolioTemplate } from '@/domain/builder/portfolio';

export function convertTemplateDefToPortfolioTemplate(
  def: TemplateDefinition
): PortfolioTemplate {
  const getLocalized = (str: any, fallback: string = ''): string => {
    if (!str) return fallback;
    if (typeof str === 'string') return str;
    return str.en || str.et || fallback;
  };

  let sortOrder = 0;

  // Map all defaultSections to blocks
  const blocks = def.defaultSections.map(section => {
    // Basic mapping - ensure block_type is always set from section.type initially
    const block: any = {
      id: section.id,
      block_type: section.type,
      anchor_id: section.id,
      content: { ...section.content },
      settings: (section as any).settings || {},
      sort_order: sortOrder++,
    };

    // Recursive localization helper
    const localizeContent = (content: any): any => {
      if (content === null || content === undefined) return content;

      // If it's a localized string object { et, en }
      if (typeof content === 'object' && ('et' in content || 'en' in content)) {
        return getLocalized(content);
      }

      // Handle arrays
      if (Array.isArray(content)) {
        return content.map(item => localizeContent(item));
      }

      // Handle objects (recurse into properties)
      if (typeof content === 'object') {
        const result: any = {};
        for (const key in content) {
          result[key] = localizeContent(content[key]);
        }
        return result;
      }

      return content;
    };

    // Apply localization to the whole content object early
    block.content = localizeContent(block.content);

    // Map 'about' to 'text' block
    if (section.type === 'about') {
      block.block_type = 'text';
      if (block.content.heading) {
        block.content.title = block.content.heading;
        delete block.content.heading;
      }
      if (block.content.body) {
        block.content.text = block.content.body;
        delete block.content.body;
      }
    }

    // Features/Services mapping
    if (section.type === 'services' || section.type === 'features') {
      block.block_type = 'features';
      if (block.content.heading) {
        block.content.title = block.content.heading;
        delete block.content.heading;
      }
      if (block.content.items) {
        block.content.features = block.content.items.map((item: any) => ({
          title: item.title,
          description: item.description,
          icon: item.icon || 'Star'
        }));
        delete block.content.items;
      }
    }

    // Projects mapping
    if (section.type === 'projects') {
      block.block_type = 'projects';
      if (block.content.heading) {
        block.content.title = block.content.heading;
        delete block.content.heading;
      }
    }

    // Contact/Form mapping
    if (section.type === 'contact') {
      block.block_type = 'form';
      block.content.form_type = 'contact';
      if (block.content.heading) {
        block.content.title = block.content.heading;
        delete block.content.heading;
      }
      if (block.content.email) {
        block.content.recipient_email = block.content.email;
        delete block.content.email;
      }
    }

    // Bento mapping
    if (section.type === 'bento') {
      block.block_type = 'bento'; // Explicitly ensure type
      if (block.content.heading) {
        block.content.title = block.content.heading;
        delete block.content.heading;
      }
    }

    // Marquee mapping
    if (section.type === 'marquee') {
      block.block_type = 'marquee'; // Explicitly ensure type
    }

    return block;
  });

  return {
    id: def.id,
    name: def.name,
    description: def.description,
    category: 'portfolio', // TODO: Make this dynamic if added to registry
    thumbnail_url: def.previewImage || null,
    preview_images: [],
    is_active: true,
    created_at: new Date().toISOString(),
    pages_schema: [
      {
        slug: 'home',
        title: 'Home',
        is_homepage: true,
        blocks: blocks,
      },
    ],
    styles_schema: (() => {
      const config = createDefaultConfig(def.id);
      return {
        color_palette: config?.theme?.palette || {
          primary: '#000000',
          secondary: '#ffffff',
          background: '#ffffff',
          text: '#000000',
          accent: '#000000',
        },
        typography: config?.theme?.fonts || {
          headingFont: 'Inter',
          bodyFont: 'Inter',
        },
        buttons: config?.theme?.buttons,
      };
    })(),
  } as unknown as PortfolioTemplate;
}

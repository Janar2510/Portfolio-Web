import { TemplateDefinition } from './index';
import { PortfolioTemplate } from '@/lib/services/portfolio';

export function convertTemplateDefToPortfolioTemplate(
  def: TemplateDefinition
): PortfolioTemplate {
  // Construct blocks for the specific template sections
  const blocks = [];
  let sortOrder = 0;

  // 1. Header is global, but we inject it as a block for the page structure
  blocks.push({
    block_type: 'header',
    content: {
      logo_text: def.sections.footer?.logo_text || def.title.split(' ')[0] || 'Portfolio',
      links: [
        { label: 'HOME', url: '#home' },
        { label: 'SERVICES', url: '#services' },
        { label: 'MY WORK', url: '#work' },
        { label: 'CONTACT', url: '#contact' },
      ],
      social_links: [
        { platform: 'instagram', url: '#' },
        { platform: 'twitter', url: '#' },
        { platform: 'linkedin', url: '#' },
      ],
    },
    settings: {
      layout: 'simple',
      sticky: true,
      position: 'fixed',
    },
    sort_order: sortOrder++,
  });

  // HERO SECTION
  if (def.sections.hero) {
    blocks.push({
      block_type: 'hero',
      anchor_id: 'home',
      content: {
        badge: def.sections.hero.badge,
        headline: def.sections.hero.headline,
        subheadline: def.sections.hero.subtitle,
        cta_text: def.sections.hero.ctaText || 'Get in Touch',
        cta_link: '#work',
        image_url: def.sections.hero.backgroundImage,
        show_scroll_indicator: true,
      },
      settings: {
        alignment: def.sections.hero.alignment || 'center',
        background: def.sections.hero.backgroundImage ? 'image' : (def.sections.hero.backgroundStyle || 'solid'),
        overlay: def.sections.hero.settings?.overlay ?? !!def.sections.hero.backgroundImage,
        height: def.sections.hero.height || 'full',
        headline_style: def.sections.hero.settings?.headline_style || 'serif',
      },
      sort_order: sortOrder++,
    });
  }

  // BRAND HERO SECTION
  if ((def.sections as any).brand_hero) {
    const bh = (def.sections as any).brand_hero;
    blocks.push({
      block_type: 'brand-hero',
      anchor_id: 'home',
      content: {
        logoText: bh.logoText,
        navLinks: bh.navLinks,
        versionText: bh.versionText,
        title: bh.title,
        subtitle: bh.subtitle,
        ctaText: bh.ctaText,
        backgroundImage: bh.backgroundImage || def.thumbnail_url,
      },
      settings: {
        height: bh.height || 'full',
      },
      sort_order: sortOrder++,
    });
  }

  // INFINITE HERO SECTION
  if ((def.sections as any).infinite_hero) {
    const ih = (def.sections as any).infinite_hero;
    blocks.push({
      block_type: 'infinite-hero',
      anchor_id: 'home',
      content: {
        headline: ih.headline,
        subheadline: ih.subtitle,
        cta_text: ih.ctaText,
        cta_secondary_text: ih.cta_secondary_text,
        cta_link: '#work',
        backgroundImage: ih.backgroundImage || def.thumbnail_url,
      },
      settings: {
        height: ih.height || 'full',
        overlay_variant: ih.settings?.overlay_variant || 'vignette',
      },
      sort_order: sortOrder++,
    });
  }

  // SPLIT HERO SECTION
  if ((def.sections as any).split_hero) {
    const sh = (def.sections as any).split_hero;
    blocks.push({
      block_type: 'split-hero',
      anchor_id: 'home',
      content: {
        logo_image: sh.logo_image,
        logo_text: sh.logo_text,
        slogan: sh.slogan,
        headline: sh.headline,
        subheadline: sh.subtitle,
        cta_text: sh.ctaText,
        cta_link: '#work',
        image_url: sh.backgroundImage || def.thumbnail_url,
        contact_info: sh.contact_info,
      },
      settings: {
        layout: 'split',
      },
      sort_order: sortOrder++,
    });
  }

  // CYBER HERO SECTION
  if ((def.sections as any).cyber_hero) {
    const ch = (def.sections as any).cyber_hero;
    blocks.push({
      block_type: 'cyber-hero',
      anchor_id: 'home',
      content: {
        headline: ch.headline,
        subheadline: ch.subtitle,
        cta_text: ch.ctaText,
        image_url: ch.image_url || def.thumbnail_url,
        depth_url: ch.depth_url,
      },
      settings: {
        layout: 'full',
      },
      sort_order: sortOrder++,
    });
  }

  // ORGANIC HERO SECTION
  if ((def.sections as any).organic_hero) {
    const oh = (def.sections as any).organic_hero;
    blocks.push({
      block_type: 'organic-hero',
      anchor_id: 'home',
      content: {
        slogan: oh.slogan,
        headline: oh.headline,
        subheadline: oh.subtitle,
        cta_text: oh.ctaText,
        cta_link: '#work',
        backgroundImage: oh.backgroundImage || def.thumbnail_url,
      },
      settings: {
        layout: 'centered',
      },
      sort_order: sortOrder++,
    });
  }

  // SERVICES SECTION
  if (def.sections.services) {
    blocks.push({
      block_type: 'features',
      anchor_id: 'services',
      content: {
        title: def.sections.services.title || 'What I Do',
        description: def.sections.services.description,
        features: def.sections.services.items?.map(s => ({
          title: s.title,
          description: s.description,
          icon: s.icon || 'Star',
        })) || [],
      },
      settings: {
        layout: def.sections.services.settings?.layout || 'grid',
        columns: def.sections.services.settings?.columns || 4,
        show_icon: true,
        background: def.sections.services.settings?.background || 'glass',
      },
      sort_order: sortOrder++,
    });
  }

  // PROJECTS SECTION
  if (def.sections.projects) {
    blocks.push({
      block_type: 'project-grid',
      anchor_id: 'work',
      content: {
        title: def.sections.projects.title || 'Selected Works',
        limit: 6,
      },
      settings: {
        layout: def.sections.projects.settings?.layout || 'grid',
        columns: def.sections.projects.settings?.columns || 3,
        show_description: true,
        show_tags: false,
        aspect_ratio: def.sections.projects.settings?.aspect_ratio || 'portrait',
      },
      sort_order: sortOrder++,
    });
  }

  // CONTACT SECTION
  if (def.sections.contact) {
    blocks.push({
      block_type: 'form',
      anchor_id: 'contact',
      content: {
        form_type: 'contact',
        title: def.sections.contact.title || 'Get In Touch',
        description: def.sections.contact.description,
        fields: def.sections.contact.formFields,
        submit_text: def.sections.contact.ctaText,
        contact_info: def.sections.contact.contact_info,
      },
      settings: {
        layout: def.sections.contact.settings?.layout || 'split-with-info',
        button_style: 'primary',
        rounded_corners: 'artisanal',
      },
      sort_order: sortOrder++,
    });
  }

  // FOOTER
  if (def.sections.footer) {
    blocks.push({
      block_type: 'footer',
      content: {
        logo_text: def.sections.footer.logo_text,
        bio_text: def.sections.footer.bio_text,
        copyright_text: def.sections.footer.copyright_text,
        social_links: [
          { platform: 'instagram', url: '#' },
          { platform: 'twitter', url: '#' },
          { platform: 'linkedin', url: '#' },
          { platform: 'facebook', url: '#' },
        ],
      },
      settings: {
        layout: def.sections.footer.settings?.layout || 'large-minimal',
      },
      sort_order: sortOrder++,
    });
  }

  return {
    id: def.templateId,
    name: def.title,
    description: def.description,
    category: 'portfolio',
    thumbnail_url: def.thumbnail_url || null,
    preview_images: def.preview_images || [],
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
    styles_schema: {
      color_palette: def.colorPalette,
      typography: {
        headingFont: def.fontPreset.heading,
        bodyFont: def.fontPreset.body,
      },
    },
  } as unknown as PortfolioTemplate;
}

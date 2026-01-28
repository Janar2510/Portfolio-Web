import { TemplateDefinition } from '@/domain/templates/contracts';
import { SiteSection, HeroSection, AboutSection, ProjectsSection, ServicesSection, ContactSection } from '@/domain/sites/site-schema';
import { PortfolioTemplate } from '@/domain/builder/portfolio';

export function convertTemplateDefToPortfolioTemplate(
  def: TemplateDefinition
): PortfolioTemplate {
  const findSection = <T extends SiteSection>(type: T['type']): T | undefined =>
    def.defaultSections.find(s => s.type === type) as T | undefined;

  const getLocalized = (str: any, fallback: string = ''): string => {
    if (!str) return fallback;
    return str.en || str.et || fallback;
  };
  // Construct blocks for the specific template sections
  const blocks = [];
  let sortOrder = 0;

  // 1. Header is global, but we inject it as a block for the page structure
  const contactSection = findSection<ContactSection>('contact');
  blocks.push({
    block_type: 'header',
    content: {
      logo_text: def.name || 'Portfolio',
      links: [
        { label: 'HOME', url: '#home' },
        { label: 'SERVICES', url: '#services' },
        { label: 'MY WORK', url: '#work' },
        { label: 'CONTACT', url: '#contact' },
      ],
      social_links: contactSection?.content.socials?.map(s => ({
        platform: s.platform.toLowerCase(),
        url: s.url
      })) || [
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
  const heroSection = findSection<HeroSection>('hero');
  if (heroSection) {
    const hero = heroSection.content;
    blocks.push({
      block_type: 'hero',
      anchor_id: 'home',
      content: {
        headline: getLocalized(hero.headline),
        subheadline: getLocalized(hero.subheadline),
        cta_text: getLocalized(hero.ctaLabel, 'Get in Touch'),
        cta_link: hero.ctaHref || '#work',
        image_url: '', // New schema doesn't have image in content yet for MVP?
        show_scroll_indicator: true,
      },
      settings: {
        alignment: 'center',
        background: 'solid',
        overlay: false,
        height: 'full',
        headline_style: 'serif',
      },
      sort_order: sortOrder++,
    });
  }


  // SERVICES SECTION
  const servicesSection = findSection<ServicesSection>('services');
  if (servicesSection) {
    const services = servicesSection.content;
    blocks.push({
      block_type: 'features',
      anchor_id: 'services',
      content: {
        title: getLocalized(services.heading, 'What I Do'),
        features:
          services.items?.map((s: any) => ({
            title: getLocalized(s.title),
            description: getLocalized(s.description),
            icon: 'Star',
          })) || [],
      },
      settings: {
        layout: 'grid',
        columns: 4,
        show_icon: true,
        background: 'glass',
      },
      sort_order: sortOrder++,
    });
  }

  // PROJECTS SECTION
  const projectsSection = findSection<ProjectsSection>('projects');
  if (projectsSection) {
    const projects = projectsSection.content;
    blocks.push({
      block_type: 'project-grid',
      anchor_id: 'work',
      content: {
        title: getLocalized(projects.heading, 'Selected Works'),
        limit: 6,
      },
      settings: {
        layout: 'grid',
        columns: 3,
        show_description: true,
        show_tags: false,
        aspect_ratio: 'portrait',
      },
      sort_order: sortOrder++,
    });
  }

  // CONTACT SECTION
  if (contactSection) {
    const contact = contactSection.content;
    blocks.push({
      block_type: 'form',
      anchor_id: 'contact',
      content: {
        form_type: 'contact',
        title: getLocalized(contact.heading, 'Get In Touch'),
        description: getLocalized(contact.description),
        fields: [],
        submit_text: 'Send Message',
        contact_info: contact.email,
      },
      settings: {
        layout: 'split-with-info',
        button_style: 'primary',
        rounded_corners: 'artisanal',
      },
      sort_order: sortOrder++,
    });
  }


  return {
    id: def.id,
    name: def.name,
    description: def.description,
    category: 'portfolio',
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
    styles_schema: {
      color_palette: {
        primary: '#000000',
        secondary: '#ffffff',
        background: '#ffffff',
        text: '#000000',
        accent: '#000000',
      }, // Default or extract from controls if available?
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
      },
    },
  } as unknown as PortfolioTemplate;
}

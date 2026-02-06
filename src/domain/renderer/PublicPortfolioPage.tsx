'use client';

import { TemplateConfig } from '@/domain/templates/contracts';
import { cn } from '@/lib/utils';
// Import blocks directly or via a registry
// For this MVP, we will assume we have block components available or import them here
// In a real app, you might use dynamic imports or a registry map
import { HeroBlock } from '@/components/portfolio/blocks/HeroBlock';
import { TextBlock } from '@/components/portfolio/blocks/TextBlock';
import { ProjectGridBlock } from '@/components/portfolio/blocks/ProjectGridBlock';

// Simple registry for the MVP renderer
const BLOCK_COMPONENTS: Record<string, any> = {
  hero: HeroBlock,
  about: TextBlock, // Reuse TextBlock for 'about'
  text: TextBlock,
  projects: ProjectGridBlock,
  contact: TextBlock, // Reuse TextBlock for 'contact' (MVP)
  gallery: ProjectGridBlock, // Reuse Grid for gallery
};

interface PublicPortfolioPageProps {
  config: TemplateConfig;
}

export function PublicPortfolioPage({ config }: PublicPortfolioPageProps) {
  const { theme, sections, siteTitle, assets } = config;
  const { palette, fonts } = theme;

  // Apply global variables for the theme
  const style = {
    '--primary': palette.primary,
    '--primary-foreground': '#ffffff', // Basic contrast for now
    '--background': palette.background,
    '--foreground': palette.text,
    '--muted': palette.secondary,
    '--accent': palette.accent,
    '--font-heading': fonts.headingFont,
    '--font-body': fonts.bodyFont,
    '--radius': theme.buttons?.radius || '0.5rem',
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen bg-background text-foreground selection:bg-primary/20"
      style={style}
    >
      {/* Basic Navigation / Header */}
      {(assets?.logo || siteTitle) && (
        <header className="py-6 px-8 flex items-center justify-between border-b border-border/10">
          <div className="flex items-center gap-3">
            {assets?.logo && (
              <img src={assets.logo} alt="Logo" className="h-8 w-auto object-contain" />
            )}
            {siteTitle && (
              <span className="text-xl font-bold tracking-tight">{siteTitle}</span>
            )}
          </div>
        </header>
      )}

      <main className="flex flex-col">
        {sections.order.map((blockId) => {
          // If visibility is strictly false, skip. (Undefined defaults to true for safety/legacy)
          if (sections.visibility[blockId] === false) return null;

          const blockType = blockId.split('-')[0]; // simple parsing: hero-123 -> hero
          const Component = BLOCK_COMPONENTS[blockType];

          if (!Component) {
            console.warn(`Unknown block type: ${blockType}`);
            return null;
          }

          const content = sections.content[blockId] || {};

          return (
            <section key={blockId} id={blockId} className="w-full">
              <Component content={content} />
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-border/10 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {siteTitle || 'Portfolio'}. Built with Supale.</p>
      </footer>
    </div>
  );
}

'use client';

import { BlockRenderer } from '@/components/portfolio/editor/BlockRenderer';
import type {
  PublicPortfolioSite,
  PublicPortfolioPage,
  PublicPortfolioBlock,
  PublicPortfolioStyle,
} from '@/lib/portfolio/public';
import { SEOMetadata } from '@/components/portfolio/public/SEOMetadata';
import { AnalyticsScript } from '@/components/portfolio/public/AnalyticsScript';
import { FontLoader } from '@/components/portfolio/public/FontLoader';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { useEffect } from 'react';

interface PublicPortfolioPageProps {
  site: PublicPortfolioSite;
  page: PublicPortfolioPage;
  blocks: PublicPortfolioBlock[];
  styles: PublicPortfolioStyle | null;
}

export function PublicPortfolioPage({
  site,
  page,
  blocks,
  styles,
}: PublicPortfolioPageProps) {
  // Apply custom CSS if available
  useEffect(() => {
    if (styles?.custom_css) {
      const styleId = `portfolio-custom-css-${site.id}`;
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      styleElement.textContent = styles.custom_css;
    }
  }, [styles, site.id]);

  // Apply color palette and typography
  useEffect(() => {
    if (styles) {
      const root = document.documentElement;

      if (styles.color_palette) {
        if (styles.color_palette.primary) {
          root.style.setProperty(
            '--portfolio-primary',
            styles.color_palette.primary
          );
        }
        if (styles.color_palette.secondary) {
          root.style.setProperty(
            '--portfolio-secondary',
            styles.color_palette.secondary
          );
        }
        if (styles.color_palette.accent) {
          root.style.setProperty(
            '--portfolio-accent',
            styles.color_palette.accent
          );
        }
        if (styles.color_palette.background) {
          root.style.setProperty(
            '--portfolio-background',
            styles.color_palette.background
          );
        }
        if (styles.color_palette.text) {
          root.style.setProperty('--portfolio-text', styles.color_palette.text);
        }
      }

      if (styles.typography) {
        if (styles.typography.headingFont) {
          root.style.setProperty(
            '--portfolio-heading-font',
            styles.typography.headingFont
          );
        }
        if (styles.typography.bodyFont) {
          root.style.setProperty(
            '--portfolio-body-font',
            styles.typography.bodyFont
          );
        }
      }
    }
  }, [styles]);

  const metadata = generatePageMetadata(site, page, site.subdomain);

  // Convert public types to internal types for BlockRenderer
  const portfolioBlocks = blocks.map(block => ({
    id: block.id,
    page_id: block.page_id,
    block_type: block.block_type,
    content: block.content,
    settings: block.settings,
    sort_order: block.sort_order,
    created_at: '',
    updated_at: '',
  }));

  return (
    <>
      <SEOMetadata site={site} page={page} metadata={metadata} />
      <AnalyticsScript siteId={site.id} pageId={page?.id} />
      <FontLoader
        headingFont={styles?.typography?.headingFont}
        bodyFont={styles?.typography?.bodyFont}
      />
      <div
        className="min-h-screen"
        style={{
          backgroundColor: styles?.color_palette?.background || 'white',
          color: styles?.color_palette?.text || 'black',
          fontFamily: styles?.typography?.bodyFont || 'inherit',
        }}
      >
        <style jsx global>{`
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            font-family: ${styles?.typography?.headingFont || 'inherit'};
          }
        `}</style>
        <main>
          {portfolioBlocks.map(block => (
            <BlockRenderer
              key={block.id}
              block={block}
              isEditing={false}
              onUpdate={() => {}}
              onDelete={() => {}}
              siteId={site.id}
            />
          ))}
        </main>
      </div>
    </>
  );
}

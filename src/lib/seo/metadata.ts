/**
 * SEO Metadata Utilities
 * Generate meta tags and structured data for portfolio sites
 */

import type { PortfolioSite, PortfolioPage } from '@/domain/builder/portfolio';
import type {
  PublicPortfolioSite,
  PublicPortfolioPage,
} from '@/domain/builder/public';

export interface SEOMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article';
  siteName?: string;
  locale?: string;
  alternateLocales?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

export function generatePageMetadata(
  site: PortfolioSite | PublicPortfolioSite,
  page: PortfolioPage | PublicPortfolioPage | null,
  subdomain: string
): SEOMetadata {
  const baseUrl =
    process.env.NEXT_PUBLIC_PORTFOLIO_BASE_URL ||
    'https://portfolio.example.com';
  const siteUrl = `${baseUrl}/${subdomain}`;
  const pageUrl = page ? `${siteUrl}/${page.slug}` : siteUrl;

  // Use page-specific SEO if available, otherwise fall back to site defaults
  const title = page?.seo_title || page?.title || site.slug;
  const description =
    page?.seo_description || 'Portfolio site';

  return {
    title: `${title}${page ? '' : ` | ${site.slug}`}`,
    description,
    url: pageUrl,
    type: 'website',
    siteName: site.slug,
    canonical: pageUrl,
  };
}

export function generateMetadataTags(metadata: SEOMetadata) {
  const tags: Array<{ name?: string; property?: string; content: string }> = [];

  // Basic meta tags
  tags.push({ name: 'title', content: metadata.title });
  tags.push({ name: 'description', content: metadata.description });

  // Open Graph tags
  tags.push({ property: 'og:title', content: metadata.title });
  tags.push({ property: 'og:description', content: metadata.description });
  tags.push({ property: 'og:type', content: metadata.type || 'website' });
  tags.push({ property: 'og:url', content: metadata.url });
  if (metadata.image) {
    tags.push({ property: 'og:image', content: metadata.image });
  }
  if (metadata.siteName) {
    tags.push({ property: 'og:site_name', content: metadata.siteName });
  }
  if (metadata.locale) {
    tags.push({ property: 'og:locale', content: metadata.locale });
  }

  // Twitter Card tags
  tags.push({ name: 'twitter:card', content: 'summary_large_image' });
  tags.push({ name: 'twitter:title', content: metadata.title });
  tags.push({ name: 'twitter:description', content: metadata.description });
  if (metadata.image) {
    tags.push({ name: 'twitter:image', content: metadata.image });
  }

  // Robots meta
  if (metadata.noindex || metadata.nofollow) {
    const robots = [
      metadata.noindex ? 'noindex' : 'index',
      metadata.nofollow ? 'nofollow' : 'follow',
    ].join(', ');
    tags.push({ name: 'robots', content: robots });
  }

  return tags;
}

export function generateStructuredData(
  site: PortfolioSite | PublicPortfolioSite,
  page: PortfolioPage | PublicPortfolioPage | null
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_PORTFOLIO_BASE_URL ||
    'https://portfolio.example.com';
  const siteUrl = `${baseUrl}/${site.slug}`;
  const pageUrl = page ? `${siteUrl}/${page.slug}` : siteUrl;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.slug,
    url: siteUrl,
    description: 'Portfolio site',
  };

  if (page) {
    return {
      ...structuredData,
      '@type': 'WebPage',
      name: page.title,
      url: pageUrl,
      description: page.seo_description || page.title,
      isPartOf: {
        '@type': 'WebSite',
        name: site.slug,
        url: siteUrl,
      },
    };
  }

  return structuredData;
}

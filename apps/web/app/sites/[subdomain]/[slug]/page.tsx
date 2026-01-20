import { notFound } from 'next/navigation';
import { PublicPortfolioService } from '@/lib/portfolio/public';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { PublicPortfolioPage } from '../PublicPortfolioPage';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ subdomain: string; slug: string }>;
}

// Generate static params for ISR
export async function generateStaticParams() {
  const service = new PublicPortfolioService();
  try {
    const sites = await service.getAllPublishedSites();
    const params: Array<{ subdomain: string; slug: string }> = [];

    for (const site of sites) {
      const siteData = await service.getSiteBySubdomain(site.subdomain);
      if (siteData) {
        const pages = await service.getPagesBySite(siteData.id);
        for (const page of pages) {
          params.push({
            subdomain: site.subdomain,
            slug: page.slug,
          });
        }
      }
    }

    return params;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const service = new PublicPortfolioService();

  try {
    const site = await service.getSiteBySubdomain(subdomain);
    if (!site) {
      return {
        title: 'Portfolio Not Found',
      };
    }

    const page = await service.getPageBySlug(site.id, slug);
    if (!page) {
      return {
        title: 'Page Not Found',
      };
    }

    const metadata = generatePageMetadata(site, page, subdomain);

    return {
      title: metadata.title,
      description: metadata.description,
      openGraph: {
        title: metadata.title,
        description: metadata.description,
        url: metadata.url,
        siteName: metadata.siteName,
        images: metadata.image ? [metadata.image] : [],
        type: metadata.type,
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata.title,
        description: metadata.description,
        images: metadata.image ? [metadata.image] : [],
      },
      robots: {
        index: !metadata.noindex,
        follow: !metadata.nofollow,
      },
      alternates: {
        canonical: metadata.canonical,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Portfolio',
    };
  }
}

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function PortfolioPagePage({ params }: PageProps) {
  const { subdomain, slug } = await params;
  const service = new PublicPortfolioService();

  try {
    const site = await service.getSiteBySubdomain(subdomain);
    if (!site) {
      notFound();
    }

    const page = await service.getPageBySlug(site.id, slug);
    if (!page) {
      notFound();
    }

    // Get blocks for page
    const blocks = await service.getBlocksByPage(page.id);

    // Get styles
    const styles = await service.getStylesBySite(site.id);

    return (
      <PublicPortfolioPage
        site={site}
        page={page}
        blocks={blocks}
        styles={styles}
      />
    );
  } catch (error) {
    console.error('Error loading portfolio page:', error);
    notFound();
  }
}

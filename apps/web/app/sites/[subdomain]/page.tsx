import { notFound } from 'next/navigation';
import { PublicPortfolioService } from '@/lib/portfolio/public';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { PublicPortfolioPage } from './PublicPortfolioPage';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

// Generate static params for ISR
export async function generateStaticParams() {
  const service = new PublicPortfolioService();
  try {
    const sites = await service.getAllPublishedSites();
    return sites.map(site => ({
      subdomain: site.subdomain,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Metadata is handled by layout.tsx

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function PortfolioSitePage({ params }: PageProps) {
  const { subdomain } = await params;
  const service = new PublicPortfolioService();

  try {
    const site = await service.getSiteBySubdomain(subdomain);
    if (!site) {
      notFound();
    }

    // Get homepage
    const pages = await service.getPagesBySite(site.id);
    const homepage = pages.find(p => p.is_homepage) || pages[0] || null;

    if (!homepage) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">No pages found</h1>
            <p className="text-muted-foreground">
              This portfolio site has no published pages yet.
            </p>
          </div>
        </div>
      );
    }

    // Get blocks for homepage
    const blocks = await service.getBlocksByPage(homepage.id);

    // Get styles
    const styles = await service.getStylesBySite(site.id);

    return (
      <PublicPortfolioPage
        site={site}
        page={homepage}
        blocks={blocks}
        styles={styles}
      />
    );
  } catch (error) {
    console.error('Error loading portfolio site:', error);
    notFound();
  }
}

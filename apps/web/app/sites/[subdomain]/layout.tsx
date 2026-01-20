import type { Metadata } from 'next';
import { PublicPortfolioService } from '@/lib/portfolio/public';
import { generatePageMetadata } from '@/lib/seo/metadata';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { subdomain } = await params;
  const service = new PublicPortfolioService();

  try {
    const site = await service.getSiteBySubdomain(subdomain);
    if (!site) {
      return {
        title: 'Portfolio Not Found',
      };
    }

    const metadata = generatePageMetadata(site, null, subdomain);

    return {
      title: {
        default: metadata.title,
        template: `%s | ${site.name}`,
      },
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
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Portfolio',
    };
  }
}

export default async function PortfolioSiteLayout({
  children,
}: LayoutProps) {
  return <>{children}</>;
}

import type { SEOMetadata } from '@/lib/seo/metadata';
import { generateStructuredData } from '@/lib/seo/metadata';
import type {
  PublicPortfolioSite,
  PublicPortfolioPage,
} from '@/lib/portfolio/public';

interface SEOMetadataProps {
  site: PublicPortfolioSite;
  page: PublicPortfolioPage | null;
  metadata: SEOMetadata;
}

export function SEOMetadata({ site, page, metadata }: SEOMetadataProps) {
  const structuredData = generateStructuredData(site, page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}

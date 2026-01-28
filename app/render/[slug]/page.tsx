import { notFound } from 'next/navigation';
import { RendererService } from '@/domain/renderer/services';
import { PublicPortfolioPage } from '@/domain/renderer/PublicPortfolioPage';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  const service = new RendererService();
  const site = await service.getPublishedSiteBySlug(params.slug);

  if (!site || !site.published_config) {
    notFound();
  }

  // In a real implementation, you'd fetch the specific page by slug as well.
  // For now, we render the published config's main blocks.
  const config = site.published_config!;

  return (
    <PublicPortfolioPage
      config={config}
    />
  );
}

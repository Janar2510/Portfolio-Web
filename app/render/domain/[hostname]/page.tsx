import { notFound } from 'next/navigation';
import { RendererService } from '@/domain/renderer/services';
import { PublicPortfolioPage } from '@/domain/renderer/PublicPortfolioPage';

interface PageProps {
  params: {
    hostname: string;
  };
}

export default async function Page({ params }: PageProps) {
  const service = new RendererService();
  const site = await service.getPublishedSiteByDomain(params.hostname);

  if (!site || !site.published_config) {
    notFound();
  }

  const config = site.published_config!;

  return (
    <PublicPortfolioPage
      config={config}
    />
  );
}

import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';
import { PageBuilder } from '@/components/portfolio/builder';
import { CreateSiteDialog } from '@/components/portfolio/CreateSiteDialog';
import { NoSiteView } from '@/components/portfolio/NoSiteView';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portfolio' });

  try {
    const supabase = await createClient();
    const portfolioService = new PortfolioService(supabase);

    // Get user's site (one site per user for MVP)
    const site = await portfolioService.getSite();

    if (!site) {
      return <NoSiteView />;
    }

    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="heading-page mb-2">{t('title')}</h1>
          <p className="body-small text-muted-foreground">
            {t('manageSite')}: {site.name}
          </p>
        </div>

        <div className="card">
          <PageBuilder siteId={site.id} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading portfolio:', error);
    notFound();
  }
}

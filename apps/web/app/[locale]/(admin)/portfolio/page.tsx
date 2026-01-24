import { createClientWithUser } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';
import { CreateSiteDialog } from '@/components/portfolio/CreateSiteDialog';
import { NoSiteView } from '@/components/portfolio/NoSiteView';
import { PortfolioSiteView } from '@/components/portfolio/PortfolioSiteView';
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
    // Use createClientWithUser to get both supabase client and recovered user
    const { supabase, user } = await createClientWithUser();

    // Pass the recovered user to PortfolioService to avoid auth issues in SSR
    const portfolioService = new PortfolioService(supabase, user);

    // Get user's site (one site per user for MVP)
    const site = await portfolioService.getSite();
    console.log('Portfolio page - site:', site, 'user:', user?.id);

    if (!site) {
      console.log('Portfolio page - no site found, showing NoSiteView');
      return <NoSiteView />;
    }

    // Get pages to show site overview
    const pages = await portfolioService.getPages(site.id);
    console.log('Portfolio page - pages:', pages);

    return <PortfolioSiteView site={site} pages={pages} locale={locale} />;
  } catch (error) {
    console.error('Error loading portfolio:', error);
    // Return error UI instead of notFound to help debug
    return (
      <div className="rounded-lg border bg-card p-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading Portfolio</h1>
        <p className="text-muted-foreground mb-4">
          There was an error loading your portfolio site.
        </p>
        <pre className="bg-muted p-4 rounded text-xs overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
        <div className="mt-4">
          <a
            href={`/${locale}/portfolio/debug`}
            className="text-primary hover:underline"
          >
            View Debug Page →
          </a>
        </div>
      </div>
    );
  }
}

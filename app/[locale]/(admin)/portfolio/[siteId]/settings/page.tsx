import { createClientWithUser } from '@/lib/supabase/server';
import { PortfolioService } from '@/domain/builder/portfolio';
import { PortfolioSettingsView } from '@/components/portfolio/PortfolioSettingsView';
import { notFound, redirect } from 'next/navigation';

export default async function PortfolioSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  try {
    const { supabase, user } = await createClientWithUser();

    if (!user) {
      redirect(`/${locale}/sign-in`);
    }

    const portfolioService = new PortfolioService(supabase, user);
    const site = await portfolioService.getSite();

    if (!site) {
      redirect(`/${locale}/portfolio`);
    }

    return <PortfolioSettingsView site={site} locale={locale} />;
  } catch (error) {
    console.error('Error loading portfolio settings:', error);
    return (
      <div className="rounded-lg border bg-card p-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading Settings</h1>
        <p className="text-muted-foreground mb-4">
          There was an error loading your portfolio settings.
        </p>
        <pre className="bg-muted p-4 rounded text-xs overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}

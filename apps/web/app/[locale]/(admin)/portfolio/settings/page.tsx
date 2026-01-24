/**
 * Portfolio Settings Page
 * General site settings and management
 */

import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';
import { redirect } from 'next/navigation';
import { PortfolioSettingsView } from '@/components/portfolio/PortfolioSettingsView';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PortfolioSettingsPage({ params }: PageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const portfolioService = new PortfolioService(supabase);

  // Get user's site
  const site = await portfolioService.getSite();
  if (!site) {
    redirect(`/${locale}/portfolio`);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PortfolioSettingsView site={site} locale={locale} />
    </div>
  );
}

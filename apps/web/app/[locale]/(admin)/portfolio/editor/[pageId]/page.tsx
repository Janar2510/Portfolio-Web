/**
 * Portfolio Editor Page
 * Visual editor for editing portfolio pages
 */

import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';
import { EditorLayout } from '@/components/portfolio/editor/EditorLayout';
import { notFound, redirect } from 'next/navigation';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

interface PageProps {
  params: Promise<{ locale: string; pageId: string }>;
}

export default async function PortfolioEditorPage({ params }: PageProps) {
  const { locale, pageId } = await params;
  const supabase = await createClient();
  const portfolioService = new PortfolioService(supabase);

  // Get user's site
  const site = await portfolioService.getSite();
  if (!site) {
    redirect(`/${locale}/portfolio`);
  }

  // Get page
  const page = await portfolioService.getPageById(pageId);
  if (!page || page.site_id !== site.id) {
    notFound();
  }

  // Prefetch data
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['portfolio-page', pageId],
    queryFn: () => portfolioService.getPageById(pageId),
  });

  await queryClient.prefetchQuery({
    queryKey: ['portfolio-blocks', pageId],
    queryFn: () => portfolioService.getBlocks(pageId),
  });

  await queryClient.prefetchQuery({
    queryKey: ['portfolio-styles', site.id],
    queryFn: () => portfolioService.getStyles(site.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditorLayout pageId={pageId} siteId={site.id} />
    </HydrationBoundary>
  );
}

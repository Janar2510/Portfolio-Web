
import { createClientWithUser } from '@/lib/supabase/server';
import { EditorLayout } from '@/components/portfolio/editor/EditorLayout';
import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string; siteId: string }>;
}

export default async function PortfolioEditorPage({ params }: PageProps) {
  const { locale, siteId } = await params;
  const { supabase, user } = await createClientWithUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // Verify site exists and belongs to user
  const { data: site, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .eq('owner_user_id', user.id)
    .single();

  if (error || !site) {
    console.error('Editor access denied or site not found:', error);
    notFound();
  }

  // We are not prefetching everything yet, just ensuring access
  // The EditorLayout will handle client-side fetching or we can add prefetching back later
  // once the editor services are updated to the new schema.

  return (
    <EditorLayout pageId="main" siteId={site.id} />
  );
}

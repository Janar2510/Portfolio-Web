import { redirect } from 'next/navigation';
import { createClientWithUser } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';
import { notFound } from 'next/navigation';
import { EditorLayout } from '@/components/portfolio/editor/EditorLayout';

type Props = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function EditSitePage({ params }: Props) {
    const { locale, id } = await params;
    const { user, supabase } = await createClientWithUser();

    if (!user) {
        redirect(`/${locale}/sign-in?next=/${locale}/sites/${id}/edit`);
    }

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    let site;
    try {
        site = await svc.getSiteById(id);
    } catch (error) {
        console.error('Failed to load site:', error);
        notFound();
    }

    // New Visual Editor (handles its own layout)
    return (
        <EditorLayout siteId={site.id} pageId="home" />
    );
}

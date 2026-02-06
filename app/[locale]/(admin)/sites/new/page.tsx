import { redirect } from 'next/navigation';
import { createClientWithUser, createClient } from '@/lib/supabase/server';
import { CreateSiteForm } from './CreateSiteForm';
import { SitesService } from '@/domain/sites/sites-service';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';

interface NewSitePageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default async function NewSitePage({
    params,
}: NewSitePageProps) {
    const { locale } = await params;
    const { user } = await createClientWithUser();

    if (!user) {
        redirect(`/${locale}/sign-in?next=/${locale}/sites/new`);
    }

    // Fetch site count for limit check
    const supabase = await createClient();
    const repo = new SupabaseSitesRepository(supabase);
    const sitesService = new SitesService(repo);
    const sites = await sitesService.listUserSites(user.id);

    return (
        <div className="container mx-auto px-4">
            <CreateSiteForm locale={locale} siteCount={sites.length} />
        </div>
    );
}

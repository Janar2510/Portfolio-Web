import { redirect } from 'next/navigation';
import { createClientWithUser, createClient } from '@/lib/supabase/server';
import { SitesService } from '@/domain/sites/sites-service';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';

interface EditorRedirectPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default async function EditorRedirectPage({
    params,
}: EditorRedirectPageProps) {
    const { locale } = await params;
    const { user } = await createClientWithUser();

    if (!user) {
        redirect(`/${locale}/sign-in?next=/${locale}/editor`);
    }

    // Initialize service
    const supabase = await createClient();
    const repo = new SupabaseSitesRepository(supabase, user);
    const sitesService = new SitesService(repo);

    try {
        const sites = await sitesService.listUserSites(user.id);

        if (sites.length > 0) {
            // User has sites, go to list to choose
            redirect(`/${locale}/sites`);
        } else {
            // User has no sites, go to create new
            redirect(`/${locale}/sites/new`);
        }
    } catch (error) {
        console.error('Failed to resolve editor redirect:', error);
        // Fallback to sites list on error
        redirect(`/${locale}/sites`);
    }
}

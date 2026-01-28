'use server';

import { redirect } from 'next/navigation';
import { createClientWithUser } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';

export type ActionState = {
    ok: boolean;
    errorKey?: string;
};

export async function publishSiteAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const siteId = String(formData.get('siteId') ?? '');
    const locale = String(formData.get('locale') ?? '');

    const { supabase, user } = await createClientWithUser();
    if (!user) {
        return { ok: false, errorKey: 'Unauthorized' };
    }

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    try {
        await svc.publishSite({ siteId });
    } catch (error) {
        console.error('Publish error:', error);
        return { ok: false, errorKey: 'Failed to publish' };
    }

    // Redirect on success (must be outside try/catch)
    redirect(`/${locale}/sites/${siteId}/preview`);
}

export async function unpublishSiteAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const siteId = String(formData.get('siteId') ?? '');
    const locale = String(formData.get('locale') ?? '');

    const { supabase, user } = await createClientWithUser();
    if (!user) {
        return { ok: false, errorKey: 'Unauthorized' };
    }

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    try {
        await svc.unpublishSite({ siteId });
    } catch (error) {
        console.error('Unpublish error:', error);
        return { ok: false, errorKey: 'Failed to unpublish' };
    }

    // Redirect on success
    redirect(`/${locale}/sites/${siteId}/preview`);
}

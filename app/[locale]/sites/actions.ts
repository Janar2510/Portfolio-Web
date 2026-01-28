'use server';

import { redirect } from 'next/navigation';
import { createClientWithUser } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';
import { ConflictError, ValidationError } from '@/domain/sites/errors';

export type ActionState = {
    ok: boolean;
    errorKey?: string;
};

export async function createSiteAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const name = String(formData.get('name') ?? '').trim();
    const templateId = String(formData.get('templateId') ?? '');
    const locale = String(formData.get('locale') ?? 'en');

    const { supabase, user } = await createClientWithUser();

    if (!user) {
        return { ok: false, errorKey: 'sites.errors.notAuthenticated' };
    }

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    let siteId: string | undefined;

    try {
        const created = await svc.createSiteFromTemplate({
            ownerId: user.id,
            name,
            templateId: templateId as any,
            locale: locale as any,
        });
        siteId = created.id;
    } catch (error) {
        if (error instanceof ConflictError) {
            return { ok: false, errorKey: 'sites.errors.alreadyHasSite' };
        }
        if (error instanceof ValidationError) {
            return { ok: false, errorKey: 'sites.errors.invalidName' };
        }
        console.error('Create site error:', error);
        return { ok: false, errorKey: 'sites.errors.unknown' };
    }

    if (siteId) {
        redirect(`/${locale}/sites/${siteId}/edit`);
    }

    return { ok: false, errorKey: 'sites.errors.unknown' };
}

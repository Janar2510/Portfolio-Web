'use server';

import { redirect } from 'next/navigation';
import { createClientWithUser } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';
import { ConflictError, ValidationError } from '@/domain/sites/errors';
import { SiteDocument } from '@/domain/sites/site-schema';
import { revalidatePath } from 'next/cache';

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
            if (error.message.includes('taken')) {
                return { ok: false, errorKey: 'sites.errors.subdomainTaken' };
            }
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

// --- EDIT & PUBLISH ACTIONS ---

export async function saveSiteAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const siteId = String(formData.get('siteId') ?? '');
    const locale = String(formData.get('locale') ?? 'en');

    // Extract multi-language fields (simplified for Phase 3/4 MVP)
    const heroHeadlineEt = String(formData.get('heroHeadlineEt') ?? '');
    const heroHeadlineEn = String(formData.get('heroHeadlineEn') ?? '');
    const heroSubheadlineEt = String(formData.get('heroSubheadlineEt') ?? '');
    const heroSubheadlineEn = String(formData.get('heroSubheadlineEn') ?? '');
    const aboutBodyEt = String(formData.get('aboutBodyEt') ?? '');
    const aboutBodyEn = String(formData.get('aboutBodyEn') ?? '');

    const { supabase, user } = await createClientWithUser();
    if (!user) return { ok: false, errorKey: 'sites.edit.errors.notAuthenticated' };

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    try {
        await svc.updateSiteSchema({
            siteId,
            updater: (site: SiteDocument) => {
                const nextSite = { ...site };

                // Get or create sections with type narrowing
                const getOrCreate = (type: string, id: string) => {
                    let s = nextSite.sections.find(sec => sec.type === type);
                    if (!s) {
                        s = { id, type, enabled: true, content: {} } as any;
                        nextSite.sections.push(s as any);
                    }
                    return s;
                };

                const heroSec = getOrCreate('hero', 'hero-main') as any;
                heroSec.content.headline = { et: heroHeadlineEt, en: heroHeadlineEn };
                heroSec.content.subheadline = { et: heroSubheadlineEt, en: heroSubheadlineEn };

                const aboutSec = getOrCreate('about', 'about-main') as any;
                aboutSec.content.body = { et: aboutBodyEt, en: aboutBodyEn };

                return nextSite;
            },
        });

        revalidatePath(`/${locale}/sites/${siteId}/edit`);
        return { ok: true };
    } catch (error) {
        console.error('Save site error:', error);
        return { ok: false, errorKey: 'sites.edit.errors.unknown' };
    }
}

export async function publishFromEditAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const siteId = String(formData.get('siteId') ?? '');
    const locale = String(formData.get('locale') ?? 'en');

    const { supabase, user } = await createClientWithUser();
    if (!user) return { ok: false, errorKey: 'Unauthorized' };

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    try {
        await svc.publishSite({ siteId });
        revalidatePath(`/${locale}/sites/${siteId}/edit`);
        revalidatePath(`/s/[slug]`, 'page'); // Public view
        return { ok: true };
    } catch (error) {
        console.error('Publish error:', error);
        return { ok: false, errorKey: 'Failed to publish' };
    }
}

export async function unpublishFromEditAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const siteId = String(formData.get('siteId') ?? '');
    const locale = String(formData.get('locale') ?? 'en');

    const { supabase, user } = await createClientWithUser();
    if (!user) return { ok: false, errorKey: 'Unauthorized' };

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    try {
        await svc.unpublishSite({ siteId });
        revalidatePath(`/${locale}/sites/${siteId}/edit`);
        return { ok: true };
    } catch (error) {
        console.error('Unpublish error:', error);
        return { ok: false, errorKey: 'Failed to unpublish' };
    }
}

export async function deleteSiteAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const siteId = String(formData.get('siteId') ?? '');
    const locale = String(formData.get('locale') ?? 'en');

    const { supabase, user } = await createClientWithUser();
    if (!user) return { ok: false, errorKey: 'Unauthorized' };

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    try {
        await svc.deleteSite(siteId);
        revalidatePath(`/${locale}/sites`);
        return { ok: true };
    } catch (error) {
        console.error('Delete site error:', error);
        return { ok: false, errorKey: 'Failed to delete site' };
    }
}

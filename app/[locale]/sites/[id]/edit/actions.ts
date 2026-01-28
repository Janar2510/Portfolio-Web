'use server';

import { redirect } from 'next/navigation';
import { createClientWithUser } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';
import { SiteDocument } from '@/domain/sites/site-schema';

export type ActionState = {
    ok: boolean;
    errorKey?: string;
    timestamp?: number;
};

export async function saveSiteAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const siteId = String(formData.get('siteId') ?? '');
    const heroHeadlineEt = String(formData.get('heroHeadlineEt') ?? '');
    const heroHeadlineEn = String(formData.get('heroHeadlineEn') ?? '');
    const heroSubheadlineEt = String(formData.get('heroSubheadlineEt') ?? '');
    const heroSubheadlineEn = String(formData.get('heroSubheadlineEn') ?? '');
    const aboutBodyEt = String(formData.get('aboutBodyEt') ?? '');
    const aboutBodyEn = String(formData.get('aboutBodyEn') ?? '');

    const { supabase, user } = await createClientWithUser();

    if (!user) {
        return { ok: false, errorKey: 'sites.edit.errors.notAuthenticated' };
    }

    if (!siteId) {
        return { ok: false, errorKey: 'sites.edit.errors.invalid', timestamp: Date.now() };
    }

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    try {
        await svc.updateSiteSchema({
            siteId,
            updater: (site: SiteDocument) => {
                const nextSite = { ...site };

                // --- Update HERO ---
                let heroSection = nextSite.sections.find(s => s.type === 'hero');
                if (!heroSection) {
                    heroSection = {
                        id: 'hero-main',
                        type: 'hero',
                        enabled: true,
                        content: {}
                    };
                    nextSite.sections.unshift(heroSection);
                }

                if (!heroSection.content) heroSection.content = {};
                if (!heroSection.content.headline) heroSection.content.headline = {};
                if (!heroSection.content.subheadline) heroSection.content.subheadline = {};

                heroSection.content.headline.et = heroHeadlineEt;
                heroSection.content.headline.en = heroHeadlineEn;
                heroSection.content.subheadline.et = heroSubheadlineEt;
                heroSection.content.subheadline.en = heroSubheadlineEn;

                // --- Update ABOUT ---
                let aboutSection = nextSite.sections.find(s => s.type === 'about');
                if (!aboutSection) {
                    aboutSection = {
                        id: 'about-main',
                        type: 'about',
                        enabled: true,
                        content: {}
                    };
                    nextSite.sections.push(aboutSection);
                }

                if (!aboutSection.content) aboutSection.content = {};
                if (!aboutSection.content.body) aboutSection.content.body = {};

                aboutSection.content.body.et = aboutBodyEt;
                aboutSection.content.body.en = aboutBodyEn;

                return nextSite;
            },
        });

        return { ok: true, timestamp: Date.now() };
    } catch (error) {
        console.error('Save site error:', error);
        return { ok: false, errorKey: 'sites.edit.errors.unknown', timestamp: Date.now() };
    }
}

export async function publishFromEditAction(
    prevState: any,
    formData: FormData
) {
    const siteId = String(formData.get('siteId') ?? '');
    const locale = String(formData.get('locale') ?? '');

    const { supabase, user } = await createClientWithUser();
    if (!user) return { ok: false, errorKey: 'Unauthorized' };

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    try {
        await svc.publishSite({ siteId });
    } catch (error) {
        console.error('Publish error:', error);
        return { ok: false, errorKey: 'Failed to publish' };
    }

    redirect(`/${locale}/sites/${siteId}/edit`);
}

export async function unpublishFromEditAction(
    prevState: any,
    formData: FormData
) {
    const siteId = String(formData.get('siteId') ?? '');
    const locale = String(formData.get('locale') ?? '');

    const { supabase, user } = await createClientWithUser();
    if (!user) return { ok: false, errorKey: 'Unauthorized' };

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);

    try {
        await svc.unpublishSite({ siteId });
    } catch (error) {
        console.error('Unpublish error:', error);
        return { ok: false, errorKey: 'Failed to unpublish' };
    }

    redirect(`/${locale}/sites/${siteId}/edit`);
}

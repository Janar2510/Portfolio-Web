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

    // Content Fields
    const heroHeadlineEt = String(formData.get('heroHeadlineEt') ?? '');
    const heroHeadlineEn = String(formData.get('heroHeadlineEn') ?? '');
    const heroSubheadlineEt = String(formData.get('heroSubheadlineEt') ?? '');
    const heroSubheadlineEn = String(formData.get('heroSubheadlineEn') ?? '');

    const aboutHeadingEt = String(formData.get('aboutHeadingEt') ?? '');
    const aboutHeadingEn = String(formData.get('aboutHeadingEn') ?? '');
    const aboutSubheadingEt = String(formData.get('aboutSubheadingEt') ?? '');
    const aboutSubheadingEn = String(formData.get('aboutSubheadingEn') ?? '');
    const aboutBodyEt = String(formData.get('aboutBodyEt') ?? '');
    const aboutBodyEn = String(formData.get('aboutBodyEn') ?? '');

    const servicesHeadingEt = String(formData.get('servicesHeadingEt') ?? '');
    const servicesHeadingEn = String(formData.get('servicesHeadingEn') ?? '');
    const servicesSubheadingEt = String(formData.get('servicesSubheadingEt') ?? '');
    const servicesSubheadingEn = String(formData.get('servicesSubheadingEn') ?? '');

    const projectsHeadingEt = String(formData.get('projectsHeadingEt') ?? '');
    const projectsHeadingEn = String(formData.get('projectsHeadingEn') ?? '');
    const projectsSubheadingEt = String(formData.get('projectsSubheadingEt') ?? '');
    const projectsSubheadingEn = String(formData.get('projectsSubheadingEn') ?? '');

    const contactHeadingEt = String(formData.get('contactHeadingEt') ?? '');
    const contactHeadingEn = String(formData.get('contactHeadingEn') ?? '');
    const contactSubheadingEt = String(formData.get('contactSubheadingEt') ?? '');
    const contactSubheadingEn = String(formData.get('contactSubheadingEn') ?? '');

    const headerLogoText = String(formData.get('headerLogoText') ?? '');

    const footerTextEt = String(formData.get('footerTextEt') ?? '');
    const footerTextEn = String(formData.get('footerTextEn') ?? '');

    const galleryHeadingEt = String(formData.get('galleryHeadingEt') ?? '');
    const galleryHeadingEn = String(formData.get('galleryHeadingEn') ?? '');
    const gallerySubheadingEt = String(formData.get('gallerySubheadingEt') ?? '');
    const gallerySubheadingEn = String(formData.get('gallerySubheadingEn') ?? '');

    const customHeadingEt = String(formData.get('customHeadingEt') ?? '');
    const customHeadingEn = String(formData.get('customHeadingEn') ?? '');
    const customSubheadingEt = String(formData.get('customSubheadingEt') ?? '');
    const customSubheadingEn = String(formData.get('customSubheadingEn') ?? '');
    const customBodyEt = String(formData.get('customBodyEt') ?? '');
    const customBodyEn = String(formData.get('customBodyEn') ?? '');

    const enabledSectionsRaw = String(formData.get('enabledSections') ?? '{}');
    const sectionsOrderRaw = String(formData.get('sectionsOrder') ?? '[]');
    const servicesItemsRaw = String(formData.get('servicesItems') ?? '[]');

    let enabledSectionsMap: Record<string, boolean> = {};
    let sectionsOrder: string[] = [];
    let servicesItems: any[] = [];

    try {
        enabledSectionsMap = JSON.parse(enabledSectionsRaw);
        sectionsOrder = JSON.parse(sectionsOrderRaw);
        servicesItems = JSON.parse(servicesItemsRaw);
    } catch (e) {
        console.warn('Failed to parse structures:', e);
    }

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
                const nextSite = JSON.parse(JSON.stringify(site)) as SiteDocument;

                // --- Update HERO ---
                const heroSection = nextSite.sections.find(s => s.type === 'hero') as any;
                if (heroSection) {
                    if (!heroSection.content) heroSection.content = {};
                    if (!heroSection.content.headline) heroSection.content.headline = {};
                    if (!heroSection.content.subheadline) heroSection.content.subheadline = {};

                    heroSection.content.headline.et = heroHeadlineEt;
                    heroSection.content.headline.en = heroHeadlineEn;
                    heroSection.content.subheadline.et = heroSubheadlineEt;
                    heroSection.content.subheadline.en = heroSubheadlineEn;
                }

                // --- Update ABOUT ---
                const aboutSection = nextSite.sections.find(s => s.type === 'about') as any;
                if (aboutSection) {
                    if (!aboutSection.content) aboutSection.content = {};
                    if (!aboutSection.content.heading) aboutSection.content.heading = {};
                    if (!aboutSection.content.subheading) aboutSection.content.subheading = {};
                    if (!aboutSection.content.body) aboutSection.content.body = {};

                    aboutSection.content.heading.et = aboutHeadingEt;
                    aboutSection.content.heading.en = aboutHeadingEn;
                    aboutSection.content.subheading.et = aboutSubheadingEt;
                    aboutSection.content.subheading.en = aboutSubheadingEn;
                    aboutSection.content.body.et = aboutBodyEt;
                    aboutSection.content.body.en = aboutBodyEn;
                }

                // --- Update SERVICES ---
                const servicesSection = nextSite.sections.find(s => s.type === 'services') as any;
                if (servicesSection) {
                    if (!servicesSection.content) servicesSection.content = {};
                    if (!servicesSection.content.heading) servicesSection.content.heading = {};
                    if (!servicesSection.content.subheading) servicesSection.content.subheading = {};

                    servicesSection.content.heading.et = servicesHeadingEt;
                    servicesSection.content.heading.en = servicesHeadingEn;
                    servicesSection.content.subheading.et = servicesSubheadingEt;
                    servicesSection.content.subheading.en = servicesSubheadingEn;

                    if (servicesItems.length > 0) {
                        servicesSection.content.items = servicesItems;
                    }
                }

                // --- Update PROJECTS ---
                const projectsSection = nextSite.sections.find(s => s.type === 'projects') as any;
                if (projectsSection) {
                    if (!projectsSection.content) projectsSection.content = {};
                    if (!projectsSection.content.heading) projectsSection.content.heading = {};
                    if (!projectsSection.content.subheading) projectsSection.content.subheading = {};

                    projectsSection.content.heading.et = projectsHeadingEt;
                    projectsSection.content.heading.en = projectsHeadingEn;
                    projectsSection.content.subheading.et = projectsSubheadingEt;
                    projectsSection.content.subheading.en = projectsSubheadingEn;
                }

                // --- Update CONTACT ---
                const contactSection = nextSite.sections.find(s => s.type === 'contact') as any;
                if (contactSection) {
                    if (!contactSection.content) contactSection.content = {};
                    if (!contactSection.content.heading) contactSection.content.heading = {};
                    if (!contactSection.content.subheading) contactSection.content.subheading = {};

                    contactSection.content.heading.et = contactHeadingEt;
                    contactSection.content.heading.en = contactHeadingEn;
                    contactSection.content.subheading.et = contactSubheadingEt;
                    contactSection.content.subheading.en = contactSubheadingEn;
                }

                // --- Update HEADER ---
                const headerSection = nextSite.sections.find(s => s.type === 'header') as any;
                if (headerSection) {
                    if (!headerSection.content) headerSection.content = {};
                    headerSection.content.logoText = headerLogoText;
                }

                // --- Update GALLERY ---
                const gallerySection = nextSite.sections.find(s => s.type === 'gallery') as any;
                if (gallerySection) {
                    if (!gallerySection.content) gallerySection.content = {};
                    if (!gallerySection.content.heading) gallerySection.content.heading = {};
                    if (!gallerySection.content.subheading) gallerySection.content.subheading = {};

                    gallerySection.content.heading.et = galleryHeadingEt;
                    gallerySection.content.heading.en = galleryHeadingEn;
                    gallerySection.content.subheading.et = gallerySubheadingEt;
                    gallerySection.content.subheading.en = gallerySubheadingEn;
                }

                // --- Update FOOTER ---
                const footerSection = nextSite.sections.find(s => s.type === 'footer') as any;
                if (footerSection) {
                    if (!footerSection.content) footerSection.content = {};
                    if (!footerSection.content.text) footerSection.content.text = {};

                    footerSection.content.text.et = footerTextEt;
                    footerSection.content.text.en = footerTextEn;
                }

                // --- Update CUSTOM ---
                const customSection = nextSite.sections.find(s => s.type === 'custom') as any;
                if (customSection) {
                    if (!customSection.content) customSection.content = {};
                    if (!customSection.content.heading) customSection.content.heading = {};
                    if (!customSection.content.subheading) customSection.content.subheading = {};
                    if (!customSection.content.body) customSection.content.body = {};

                    customSection.content.heading.et = customHeadingEt;
                    customSection.content.heading.en = customHeadingEn;
                    customSection.content.subheading.et = customSubheadingEt;
                    customSection.content.subheading.en = customSubheadingEn;
                    customSection.content.body.et = customBodyEt;
                    customSection.content.body.en = customBodyEn;
                }

                // --- Update VISIBILITY ---
                nextSite.sections = nextSite.sections.map(s => ({
                    ...s,
                    enabled: enabledSectionsMap[s.id] ?? s.enabled
                }));

                // --- Update ORDER ---
                if (sectionsOrder.length > 0) {
                    nextSite.sections.sort((a, b) => {
                        const idxA = sectionsOrder.indexOf(a.id);
                        const idxB = sectionsOrder.indexOf(b.id);
                        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
                    });
                }

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

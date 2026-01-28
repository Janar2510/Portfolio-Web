import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createClientWithUser } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';
import { SiteEditor } from './SiteEditor';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ExternalLink, Globe, EyeOff, Eye } from 'lucide-react';
import { notFound } from 'next/navigation';
import { publishFromEditAction, unpublishFromEditAction } from './actions';
import { Badge } from '@/components/ui/badge';

type Props = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function EditSitePage({ params }: Props) {
    const { locale, id } = await params;
    const t = await getTranslations('sites.edit');
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

    const isPublished = site.status === 'published';
    const publicUrl = `/s/${site.slug}`;

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/sites">
                            <Button variant="ghost" size="sm" className="-ml-3 gap-1">
                                <ChevronLeft className="w-4 h-4" />
                                {t('back')}
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{site.name}</h1>
                        <Badge variant={isPublished ? 'default' : 'secondary'} className="uppercase text-[10px]">
                            {site.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{site.slug}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isPublished && (
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                                <ExternalLink className="w-4 h-4" />
                                <span className="hidden md:inline">{t('actions.viewPublic')}</span>
                            </Button>
                        </a>
                    )}

                    <Link href={`/sites/${id}/preview`}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            {t('actions.preview')}
                        </Button>
                    </Link>

                    <form action={async () => {
                        'use server';
                        const formData = new FormData();
                        formData.append('siteId', site.id);
                        formData.append('locale', locale);
                        if (isPublished) {
                            await unpublishFromEditAction({ ok: false }, formData);
                        } else {
                            await publishFromEditAction({ ok: false }, formData);
                        }
                    }}>
                        <Button
                            type="submit"
                            variant={isPublished ? "outline" : "default"}
                            size="sm"
                            className="gap-2 min-w-[100px]"
                        >
                            {isPublished ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                            {isPublished ? t('actions.unpublish') : t('actions.publish')}
                        </Button>
                    </form>
                </div>
            </div>

            <SiteEditor initialSite={site} locale={locale} />
        </div>
    );
}

import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createClientWithUser } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { GlassCard } from '@/components/ui/glass-card';
import { PageHeader } from '@/components/ui-kit/PageHeader';
import { StatusPill } from '@/components/ui-kit/StatusPill';
import { EmptyState } from '@/components/ui-kit/EmptyState';
import { Globe, Plus, ExternalLink, Edit2, Clock, Trash2 } from 'lucide-react';
import { DeleteSiteButton } from './DeleteSiteButton';

interface SitesPageProps {
    params: {
        locale: string;
    };
}

export default async function SitesPage({ params }: SitesPageProps) {
    const { locale } = await params;
    const t = await getTranslations('sites');
    const { supabase, user } = await createClientWithUser();

    if (!user) {
        redirect(`/${locale}/sign-in?next=/${locale}/sites`);
    }

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);
    const sites = await svc.listUserSites(user.id);

    return (
        <div className="animate-fade-in space-y-8">
            <PageHeader
                title={t('title')}
                description={t('subtitle')}
                actions={
                    <Link href="/sites/new">
                        <GradientButton className="rounded-xl h-10 px-6 gap-2">
                            <Plus className="w-4 h-4" />
                            {t('createCta')}
                        </GradientButton>
                    </Link>
                }
            />

            {sites.length === 0 ? (
                <EmptyState
                    title={t('empty.title')}
                    description={t('empty.description')}
                    icon={Globe}
                    action={{
                        label: t('empty.cta'),
                        href: "/sites/new"
                    }}
                />
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sites.map((site) => (
                        <GlassCard
                            key={site.id}
                            variant="hover"
                            className="flex flex-col h-full group"
                        >
                            <div className="p-6 flex flex-col h-full relative">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <StatusPill status={site.status} />
                                    <div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest bg-black/20 backdrop-blur-sm px-2 py-1 rounded-md border border-white/5">
                                        {site.slug}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300 tracking-tight">
                                        {site.name || site.slug}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>Last updated {new Date(site.updatedAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto flex items-center gap-3 pt-6 border-t border-white/5">
                                    {site.status === 'published' && (
                                        <a
                                            href={`/s/${site.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors px-2 py-1"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            {t('actions.viewPublic')}
                                        </a>
                                    )}
                                    <Link href={`/sites/${site.id}/edit`} className="ml-auto">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px] px-5 h-9 rounded-lg gap-2"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            {t('actions.edit')}
                                        </Button>
                                    </Link>
                                    <DeleteSiteButton siteId={site.id} locale={locale} />
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}

import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createClientWithUser } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';

interface SitesPageProps {
    params: {
        locale: string;
    };
}

export default async function SitesPage({ params: { locale } }: SitesPageProps) {
    const t = await getTranslations('sites');
    const { supabase, user } = await createClientWithUser();

    if (!user) {
        redirect(`/${locale}/sign-in?next=/${locale}/sites`);
    }

    const repo = new SupabaseSitesRepository(supabase, user);
    const svc = new SitesService(repo);
    const sites = await svc.listUserSites(user.id);

    if (sites.length === 0) {
        return (
            <div className="container py-8 max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                        <p className="text-muted-foreground">{t('subtitle')}</p>
                    </div>
                    <Link href="/sites/new">
                        <Button>{t('createCta')}</Button>
                    </Link>
                </div>
                <Card className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">{t('empty.title')}</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            {t('empty.description')}
                        </p>
                        <Link href="/sites/new">
                            <Button size="lg" className="mt-4">
                                {t('empty.cta')}
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Link href="/sites/new">
                    <Button>{t('createCta')}</Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sites.map((site) => (
                    <Card key={site.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="line-clamp-1">{site.name || site.slug}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <span className="font-mono text-xs">{site.slug}</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-medium border ${site.status === 'published'
                                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                            : site.status === 'archived'
                                                ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                        }`}
                                >
                                    {t(`status.${site.status}` as any)}
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto pt-4 flex gap-2 justify-end">
                            {site.status === 'published' ? (
                                <a
                                    href={`/s/${site.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium hover:underline px-4 py-2"
                                >
                                    {t('actions.viewPublic')}
                                </a>
                            ) : null}
                            <Link href={`/sites/${site.id}/edit`}>
                                <Button size="sm">{t('actions.edit')}</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

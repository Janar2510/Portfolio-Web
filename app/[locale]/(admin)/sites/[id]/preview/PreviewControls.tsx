'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, EyeOff, ExternalLink, Loader2 } from 'lucide-react';
import { publishSiteAction, unpublishSiteAction } from './actions';
import { SiteStatus } from '@/domain/templates/types';

interface PreviewControlsProps {
    siteId: string;
    locale: string;
    status: SiteStatus;
    slug: string;
}

export function PreviewControls({ siteId, locale, status, slug }: PreviewControlsProps) {
    const t = useTranslations('sites.preview');
    const [isPending, startTransition] = useTransition();
    const isPublished = status === 'published';
    const publicUrl = `/s/${slug}`;

    const handleAction = (action: 'publish' | 'unpublish') => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('siteId', siteId);
            formData.append('locale', locale);

            if (action === 'publish') {
                await publishSiteAction({ ok: false }, formData);
            } else {
                await unpublishSiteAction({ ok: false }, formData);
            }
        });
    };

    return (
        <div className="flex items-center gap-3">
            {isPublished && (
                <div className="hidden md:flex items-center gap-2 text-sm mr-2 text-muted-foreground p-2 bg-muted/50 rounded-md border border-border">
                    <Globe className="w-3 h-3" />
                    <span className="hidden lg:inline">{t('publicUrl')}:</span>
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono flex items-center gap-1">
                        {publicUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            )}

            {isPublished && (
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="md:hidden">
                    <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </a>
            )}

            {isPublished ? (
                <Button
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleAction('unpublish')}
                    className="gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                    {t('unpublish')}
                </Button>
            ) : (
                <Button
                    variant="default"
                    disabled={isPending}
                    onClick={() => handleAction('publish')}
                    className="gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    {t('publish')}
                </Button>
            )}
        </div>
    );
}

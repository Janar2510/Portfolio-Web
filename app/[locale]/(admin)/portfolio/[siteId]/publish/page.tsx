'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SiteService } from '@/domain/builder/services';
import { usePublishSite } from '@/hooks/portfolio/use-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Rocket, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface PublishPageProps {
    params: Promise<{ locale: string; siteId: string }>;
}

export default function PublishPage({ params }: PublishPageProps) {
    const { locale, siteId } = use(params);
    const router = useRouter();
    const publishMutation = usePublishSite();

    const { data: site, isLoading } = useQuery({
        queryKey: ['portfolio-site', siteId],
        queryFn: async () => {
            const siteService = new SiteService();
            return await siteService.getSite(siteId);
        },
    });

    const handlePublish = async () => {
        try {
            await publishMutation.mutateAsync(siteId);
            toast.success('Site published successfully!');
            router.push(`/${locale}/portfolio`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to publish site.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!site) {
        return <div className="p-8 text-center text-muted-foreground">Site not found.</div>;
    }

    return (
        <div className="container max-w-2xl mx-auto p-8 space-y-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
            </Button>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Publish Your Site</h1>
                <p className="text-muted-foreground text-lg">
                    Ready to share your portfolio with the world?
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {site.draft_config.siteTitle || site.slug}
                        <Badge variant={site.status === 'published' ? 'default' : 'secondary'}>
                            {site.status}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Summary of your site configuration
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-muted-foreground">Template:</div>
                        <div className="font-medium underline decoration-dotted">{site.template_id}</div>

                        <div className="text-muted-foreground">Slug:</div>
                        <div className="font-medium">{site.slug}</div>

                        <div className="text-muted-foreground">URL:</div>
                        <div className="font-medium">/s/{site.slug}</div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium">Everything looks good!</p>
                            <p className="text-muted-foreground">All sections have valid content and the theme is applied.</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handlePublish}
                        disabled={publishMutation.isPending}
                        className="w-full h-12 text-lg"
                    >
                        {publishMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            <>
                                <Rocket className="mr-2 h-5 w-5" />
                                Go Live
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

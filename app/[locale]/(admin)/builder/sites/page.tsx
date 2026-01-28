import { getTranslations } from 'next-intl/server';
import { getMySites } from '@/lib/sites/server'; // Use new DAL
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Calendar, Globe, Pencil, Plus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function SitesPage({ params }: PageProps) {
    const { locale } = await params;
    const t = await getTranslations('builder');

    // Fetch sites using the new Data Access Layer
    const sites = await getMySites();

    return (
        <div className="container py-8 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Sites</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your portfolios and landing pages.
                    </p>
                </div>
                {sites.length > 0 && (
                    <Button asChild>
                        <Link href="/builder/sites/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Site
                        </Link>
                    </Button>
                )}
            </div>

            {sites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/30">
                    <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                        <Globe className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No sites yet</h2>
                    <p className="text-muted-foreground max-w-sm mb-8">
                        Create your first professional portfolio in minutes using our beautiful templates.
                    </p>
                    <Button size="lg" asChild>
                        <Link href="/builder/sites/new">Create Your First Site</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map((site) => (
                        <Card key={site.id} className="overflow-hidden flex flex-col transition-all hover:shadow-md h-full">
                            <div className="aspect-video w-full bg-muted/50 relative group">
                                {/* Placeholder for site preview/thumbnail */}
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                                    <Globe className="h-16 w-16" />
                                </div>
                                {/* Overlay with Quick Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" asChild>
                                            <Link href={`/builder/sites/${site.id}/editor`}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button size="sm" variant="secondary" asChild>
                                            <Link href={`/builder/sites/${site.id}/preview`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Preview
                                            </Link>
                                        </Button>
                                    </div>
                                    {site.status === 'published' && (
                                        <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" asChild>
                                            <Link href={`/s/${site.slug}`} target="_blank">
                                                <Globe className="mr-2 h-4 w-4" />
                                                Visit Live Site
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="truncate text-lg">
                                        {site.draft_config?.siteTitle || site.slug}
                                    </CardTitle>
                                    <Badge variant={site.status === 'published' ? 'default' : 'secondary'}>
                                        {site.status}
                                    </Badge>
                                </div>
                                <CardDescription className="truncate">
                                    {site.draft_config?.bio || 'No description'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 flex-grow">
                                <div className="flex items-center text-xs text-muted-foreground gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Updated {format(new Date(site.updated_at), 'MMM d, yyyy')}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 border-t bg-muted/10 mt-auto">
                                <div className="text-xs text-muted-foreground w-full flex justify-between items-center">
                                    <span className="truncate max-w-[150px] font-mono">/{site.slug}</span>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs" asChild>
                                        <Link href={`/builder/sites/${site.id}/editor`}>
                                            Open Editor
                                        </Link>
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

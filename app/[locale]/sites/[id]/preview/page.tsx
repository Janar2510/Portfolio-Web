import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createClientWithUser } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { PreviewControls } from './PreviewControls';
import { HeroSection, AboutSection, ProjectsSection, ServicesSection, ContactSection } from '@/domain/sites/site-schema';

type Props = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function PreviewSitePage({ params }: Props) {
    const { locale, id } = await params;
    const t = await getTranslations('sites.preview');
    const { user, supabase } = await createClientWithUser();

    if (!user) {
        redirect(`/${locale}/sign-in?next=/${locale}/sites/${id}/preview`);
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

    // Identify sections
    const sections = site.sections || [];
    const hero = sections.find(s => s.type === 'hero') as HeroSection | undefined;
    const about = sections.find(s => s.type === 'about') as AboutSection | undefined;
    const projects = sections.find(s => s.type === 'projects') as ProjectsSection | undefined;
    const services = sections.find(s => s.type === 'services') as ServicesSection | undefined;
    const contact = sections.find(s => s.type === 'contact') as ContactSection | undefined;

    // Helper to extract localized string
    const getLoc = (obj: any) => obj?.[locale] || obj?.['en'] || '';

    const isPublished = site.status === 'published';

    return (
        <div className="min-h-screen flex flex-col">
            {/* Control Bar (Sticky) */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm p-4">
                <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">

                    <div className="flex items-center gap-4">
                        <Link href={`/sites/${id}/edit`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ChevronLeft className="w-4 h-4" />
                                {t('backToEdit')}
                            </Button>
                        </Link>
                        <div className="h-6 w-px bg-border hidden md:block" />
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{site.name}</span>
                            <Badge variant={isPublished ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                {site.status}
                            </Badge>
                        </div>
                    </div>

                    <PreviewControls
                        siteId={site.id}
                        locale={locale}
                        status={site.status}
                        slug={site.slug}
                    />

                </div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 bg-muted/20 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-950 shadow-xl rounded-xl overflow-hidden min-h-[80vh] border border-border/50">
                    {/* Preview Header */}
                    <div className="bg-muted/50 border-b border-border p-3 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                            <div className="w-3 h-3 rounded-full bg-green-400/80" />
                        </div>
                        <div className="flex-1 text-center text-xs ml-4 text-muted-foreground font-mono bg-background/50 rounded py-1 px-4 mx-4 truncate">
                            {isPublished ? `https://supale.com/s/${site.slug}` : 'Draft Preview Mode'}
                        </div>
                    </div>

                    {/* Content Renderer */}
                    <div className="p-12 space-y-24">

                        {/* HERO */}
                        <section className="text-center space-y-6 pt-10">
                            {hero && hero.enabled ? (
                                <>
                                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                                        {getLoc(hero.content?.headline) || 'No headline'}
                                    </h1>
                                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                        {getLoc(hero.content?.subheadline) || 'No subheadline'}
                                    </p>
                                </>
                            ) : null}
                        </section>

                        {/* ABOUT */}
                        {about && about.enabled && (
                            <section className="max-w-2xl mx-auto">
                                <div className="prose dark:prose-invert prose-lg mx-auto">
                                    <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground mb-4">About</h2>
                                    <p className="text-foreground/90 whitespace-pre-wrap">
                                        {getLoc(about.content?.body) || 'No about text'}
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* SERVICES */}
                        {services && services.enabled && (
                            <section className="max-w-4xl mx-auto">
                                <h2 className="text-3xl font-bold text-center mb-12">Services</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {services.content.items.map(item => (
                                        <div key={item.id} className="p-6 border rounded-lg bg-card/50">
                                            <h3 className="text-xl font-semibold mb-2">{getLoc(item.title)}</h3>
                                            <p className="text-muted-foreground text-sm">{getLoc(item.description)}</p>
                                        </div>
                                    ))}
                                    {services.content.items.length === 0 && <div className="col-span-full text-center text-muted-foreground italic">No services added</div>}
                                </div>
                            </section>
                        )}

                        {/* PROJECTS */}
                        {projects && projects.enabled && (
                            <section className="max-w-5xl mx-auto">
                                <h2 className="text-3xl font-bold text-center mb-12">Projects</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {projects.content.items.map(item => (
                                        <div key={item.id} className="group cursor-pointer">
                                            <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden border border-border flex items-center justify-center text-muted-foreground">
                                                {item.image ? <img src={item.image.src} alt={getLoc(item.image.alt)} className="w-full h-full object-cover" /> : <span>Image</span>}
                                            </div>
                                            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{getLoc(item.title)}</h3>
                                            <p className="text-muted-foreground">{getLoc(item.description)}</p>
                                        </div>
                                    ))}
                                    {projects.content.items.length === 0 && <div className="col-span-full text-center text-muted-foreground italic">No projects added</div>}
                                </div>
                            </section>
                        )}

                        {/* CONTACT */}
                        {contact && contact.enabled && (
                            <section className="max-w-2xl mx-auto text-center border-t border-border pt-12">
                                <h2 className="text-3xl font-bold mb-6">Contact</h2>
                                <div className="space-y-2 text-lg">
                                    {contact.content.email && <div><a href={`mailto:${contact.content.email}`} className="text-primary hover:underline">{contact.content.email}</a></div>}
                                    {contact.content.phone && <div>{contact.content.phone}</div>}
                                    {contact.content.location && <div className="text-muted-foreground">{getLoc(contact.content.location)}</div>}
                                </div>
                            </section>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

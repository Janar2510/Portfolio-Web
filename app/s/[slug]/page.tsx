import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';
import { Metadata } from 'next';
import { HeroSection, AboutSection, ProjectsSection, ServicesSection, ContactSection } from '@/domain/sites/site-schema';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const repo = new SupabaseSitesRepository(supabase, null);
    const svc = new SitesService(repo);

    try {
        const site = await svc.getPublishedSiteBySlug(slug);
        return {
            title: site.name,
            description: `Check out ${site.name}'s portfolio on Supale.`
        };
    } catch (e) {
        return { title: 'Site Not Found' };
    }
}

export default async function PublicSitePage({ params }: Props) {
    const { slug } = await params;

    const supabase = await createClient();
    const repo = new SupabaseSitesRepository(supabase, null);
    const svc = new SitesService(repo);

    let site;
    try {
        site = await svc.getPublishedSiteBySlug(slug);
    } catch (error) {
        console.warn(`Public site not found for slug: ${slug}`, error);
        notFound();
    }

    if (!site.publishedSnapshot) {
        notFound();
    }

    const { sections } = site.publishedSnapshot;

    // Identify sections with strict typing
    const hero = sections.find(s => s.type === 'hero') as HeroSection | undefined;
    const about = sections.find(s => s.type === 'about') as AboutSection | undefined;
    const projects = sections.find(s => s.type === 'projects') as ProjectsSection | undefined;
    const services = sections.find(s => s.type === 'services') as ServicesSection | undefined;
    const contact = sections.find(s => s.type === 'contact') as ContactSection | undefined;

    const displayLocale = site.locale || 'et';
    const getLoc = (obj: any) => obj?.[displayLocale] || obj?.['en'] || obj?.['et'] || '';

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-foreground">
            <main>
                <div className="p-12 space-y-24 max-w-5xl mx-auto">

                    {/* HERO */}
                    <section className="text-center space-y-6 pt-20">
                        {hero && hero.enabled ? (
                            <>
                                <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-foreground">
                                    {getLoc(hero.content?.headline)}
                                </h1>
                                <p className="text-xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                    {getLoc(hero.content?.subheadline)}
                                </p>
                            </>
                        ) : null}
                    </section>

                    {/* ABOUT */}
                    {about && about.enabled && (
                        <section className="max-w-3xl mx-auto">
                            <div className="prose dark:prose-invert prose-xl mx-auto leading-loose">
                                <p className="whitespace-pre-wrap">
                                    {getLoc(about.content?.body)}
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
                                    <div key={item.id} className="p-8 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                        <h3 className="text-xl font-semibold mb-3">{getLoc(item.title)}</h3>
                                        <p className="text-muted-foreground text-base leading-relaxed">{getLoc(item.description)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* PROJECTS */}
                    {projects && projects.enabled && (
                        <section className="max-w-6xl mx-auto">
                            <h2 className="text-3xl font-bold text-center mb-12">Projects</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {projects.content.items.map(item => (
                                    <div key={item.id} className="group">
                                        <div className="aspect-video bg-gray-100 dark:bg-zinc-900 rounded-xl mb-6 overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-muted-foreground shadow-sm">
                                            {item.image ? <img src={item.image.src} alt={getLoc(item.image.alt)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <span>Image</span>}
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{getLoc(item.title)}</h3>
                                        <p className="text-muted-foreground text-lg">{getLoc(item.description)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* CONTACT */}
                    {contact && contact.enabled && (
                        <section className="max-w-3xl mx-auto text-center border-t border-border pt-16">
                            <h2 className="text-4xl font-bold mb-8">Get in Touch</h2>
                            <div className="space-y-4 text-xl">
                                {contact.content.email && <div><a href={`mailto:${contact.content.email}`} className="text-primary hover:underline font-medium">{contact.content.email}</a></div>}
                                {contact.content.phone && <div>{contact.content.phone}</div>}
                                {contact.content.location && <div className="text-muted-foreground">{getLoc(contact.content.location)}</div>}
                            </div>
                        </section>
                    )}

                    {/* Footer */}
                    <footer className="text-center text-sm text-muted-foreground pt-20 pb-10 border-t border-border mt-20">
                        <p>&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
                        <p className="mt-2 text-xs opacity-50">Published via Supale</p>
                    </footer>

                </div>
            </main>
        </div>
    );
}

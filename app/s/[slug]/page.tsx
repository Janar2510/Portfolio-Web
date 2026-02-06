import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SupabaseSitesRepository } from '@/domain/sites/adapters/supabase-repo';
import { SitesService } from '@/domain/sites/sites-service';
import { Metadata } from 'next';
import { HeroSection, AboutSection, ProjectsSection, ServicesSection, ContactSection, GallerySection, HeaderSection, FooterSection, CustomBlockSection } from '@/domain/sites/site-schema';

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
    const header = sections.find(s => s.type === 'header') as any;
    const hero = sections.find(s => s.type === 'hero') as HeroSection | undefined;
    const about = sections.find(s => s.type === 'about') as AboutSection | undefined;
    const projects = sections.find(s => s.type === 'projects') as ProjectsSection | undefined;
    const services = sections.find(s => s.type === 'services') as ServicesSection | undefined;
    const gallery = sections.find(s => s.type === 'gallery') as GallerySection | undefined;
    const contact = sections.find(s => s.type === 'contact') as ContactSection | undefined;
    const custom = sections.find(s => s.type === 'custom') as CustomBlockSection | undefined;
    const footer = sections.find(s => s.type === 'footer') as FooterSection | undefined;

    const displayLocale = site.publishedSnapshot?.locale || site.locale || 'et';
    const getLoc = (obj: any) => obj?.[displayLocale] || obj?.['en'] || obj?.['et'] || '';

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
            {/* HEADER */}
            {header && header.enabled && (
                <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="text-xl font-bold">
                            {(header as any).content.logoImage ? (
                                <img src={(header as any).content.logoImage.src} alt={(header as any).content.logoImage.alt} className="h-8 w-auto" />
                            ) : (
                                <span>{(header as any).content.logoText || site.name}</span>
                            )}
                        </div>
                        <nav className="hidden md:flex gap-8">
                            {(header as any).content.navLinks?.map((link: any, i: number) => (
                                <a key={i} href={link.href} className="text-sm font-medium hover:opacity-70 transition-opacity">
                                    {getLoc(link.label)}
                                </a>
                            ))}
                        </nav>
                    </div>
                </header>
            )}

            <main className="w-full min-h-screen">
                <div className={`px-6 md:px-12 lg:px-24 py-12 md:py-24 space-y-32 ${header?.enabled ? 'pt-32' : ''}`}>

                    {/* HERO */}
                    <section className="text-center space-y-8 pt-24">
                        {hero && hero.enabled ? (
                            <div className="space-y-6">
                                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100 leading-[1.05]">
                                    {getLoc(hero.content?.headline)}
                                </h1>
                                <p className="text-xl md:text-3xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                                    {getLoc(hero.content?.subheadline)}
                                </p>
                            </div>
                        ) : null}
                    </section>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 w-full" />

                    {/* ABOUT */}
                    {about && about.enabled && (
                        <section className="max-w-4xl mx-auto py-4 space-y-8">
                            <div className="space-y-4">
                                {getLoc(about.content?.heading) && (
                                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{getLoc(about.content.heading)}</h2>
                                )}
                                {getLoc(about.content?.subheading) && (
                                    <p className="text-xl text-zinc-500 font-medium">{getLoc(about.content.subheading)}</p>
                                )}
                            </div>
                            <div className="space-y-8">
                                <p className="text-2xl md:text-3xl text-zinc-800 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                                    {getLoc(about.content?.body)}
                                </p>
                            </div>
                        </section>
                    )}

                    {/* SERVICES */}
                    {services && services.enabled && (
                        <section className="max-w-7xl mx-auto space-y-16">
                            <div className="text-center space-y-4">
                                <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                    {getLoc(services.content?.heading) || 'Services'}
                                </h2>
                                {getLoc(services.content?.subheading) && (
                                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto">{getLoc(services.content.subheading)}</p>
                                )}
                                <div className="w-12 h-1.5 bg-zinc-900 dark:bg-zinc-100 mx-auto rounded-full" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {services.content.items.map(item => (
                                    <div key={item.id} className="p-10 border border-zinc-100 dark:border-zinc-900 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-900/50 transition-all hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl group outline outline-1 outline-transparent hover:outline-zinc-200 dark:hover:outline-zinc-800">
                                        <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">{getLoc(item.title)}</h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">{getLoc(item.description)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* GALLERY */}
                    {gallery && gallery.enabled && (
                        <section className="max-w-7xl mx-auto space-y-16">
                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{getLoc(gallery.content?.heading) || 'Gallery'}</h2>
                                {getLoc(gallery.content?.subheading) && (
                                    <p className="text-xl text-zinc-500 font-medium">{getLoc(gallery.content.subheading)}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {gallery.content.items?.map((item: any) => (
                                    <div key={item.id} className="aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden group">
                                        <img
                                            src={item.image.src}
                                            alt={getLoc(item.image.alt)}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* PROJECTS */}
                    {projects && projects.enabled && (
                        <section className="max-w-7xl mx-auto space-y-16">
                            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-100 dark:border-zinc-900 pb-10 gap-4">
                                <div className="space-y-4">
                                    <h2 className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 italic tracking-tighter">
                                        {getLoc(projects.content?.heading) || 'Work'}
                                    </h2>
                                    {getLoc(projects.content?.subheading) && (
                                        <p className="text-xl text-zinc-500 font-medium">{getLoc(projects.content.subheading)}</p>
                                    )}
                                </div>
                                <div className="text-zinc-400 font-mono text-sm">(0{projects.content.items.length})</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                {projects.content.items.map(item => (
                                    <div key={item.id} className="group space-y-8">
                                        <div className="aspect-[4/3] bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center text-zinc-400 transition-all duration-700 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] group-hover:-translate-y-3">
                                            {item.image ? (
                                                <img src={item.image.src} alt={getLoc(item.image.alt)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            ) : (
                                                <span className="uppercase tracking-widest text-[10px] font-bold opacity-30">No Image</span>
                                            )}
                                        </div>
                                        <div className="space-y-3 px-2">
                                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">{getLoc(item.title)}</h3>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-xl leading-relaxed">{getLoc(item.description)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* CUSTOM BLOCK */}
                    {custom && custom.enabled && (
                        <section className="max-w-4xl mx-auto py-12 space-y-8">
                            <div className="space-y-4 text-center md:text-left">
                                {getLoc(custom.content?.heading) && (
                                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{getLoc(custom.content.heading)}</h2>
                                )}
                                {getLoc(custom.content?.subheading) && (
                                    <p className="text-xl text-zinc-500 font-medium">{getLoc(custom.content.subheading)}</p>
                                )}
                            </div>
                            {getLoc(custom.content?.body) && (
                                <div className="text-xl md:text-2xl text-zinc-700 dark:text-zinc-400 leading-relaxed font-normal whitespace-pre-wrap text-center md:text-left">
                                    {getLoc(custom.content.body)}
                                </div>
                            )}
                        </section>
                    )}

                    {/* CONTACT */}
                    {contact && contact.enabled && (
                        <section className="max-w-5xl mx-auto text-center py-24 bg-zinc-900 dark:bg-zinc-100 rounded-[4rem] text-white dark:text-zinc-900 px-12 shadow-2xl space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                                    {getLoc(contact.content?.heading) || "Let's connect."}
                                </h2>
                                {getLoc(contact.content?.subheading) && (
                                    <p className="text-2xl opacity-70">{getLoc(contact.content.subheading)}</p>
                                )}
                            </div>
                            <div className="space-y-8">
                                {contact.content.email && (
                                    <div>
                                        <a href={`mailto:${contact.content.email}`} className="text-3xl md:text-4xl font-semibold hover:opacity-70 transition-opacity underline underline-offset-12 decoration-zinc-700 dark:decoration-zinc-300">
                                            {contact.content.email}
                                        </a>
                                    </div>
                                )}
                                <div className="flex flex-wrap justify-center gap-6 text-sm font-mono opacity-50 tracking-widest uppercase pt-6">
                                    {contact.content.phone && <span>{contact.content.phone}</span>}
                                    {contact.content.location && <span>{getLoc(contact.content.location)}</span>}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* FOOTER */}
                    {footer && footer.enabled && (
                        <footer className="max-w-7xl mx-auto border-t border-zinc-100 dark:border-zinc-900 pt-16 pb-24 text-center space-y-8">
                            <div className="text-2xl font-bold">{site.name}</div>
                            <div className="text-zinc-500 max-w-md mx-auto">{getLoc(footer.content.text)}</div>
                            <div className="flex justify-center gap-8">
                                {footer.content.socials?.map((s: any, i: number) => (
                                    <a key={i} href={s.url} className="text-sm font-bold uppercase tracking-widest hover:opacity-70 transition-opacity">
                                        {s.platform}
                                    </a>
                                ))}
                            </div>
                            <div className="pt-12 text-[10px] uppercase tracking-[0.2em] opacity-30 font-bold">
                                &copy; {new Date().getFullYear()} {site.name} &mdash; Built with Supale
                            </div>
                        </footer>
                    )}

                    {!footer?.enabled && (
                        <footer className="text-center text-sm text-zinc-400 dark:text-zinc-600 pt-32 pb-16">
                            <p className="font-medium">&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
                            <p className="mt-2 text-[10px] uppercase tracking-widest opacity-50">Published via Supale</p>
                        </footer>
                    )}

                </div>
            </main>
        </div>
    );
}

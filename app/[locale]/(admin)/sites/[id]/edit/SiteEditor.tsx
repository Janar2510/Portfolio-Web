'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { SiteDocument } from '@/domain/sites/site-schema';
import { saveSiteAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUp, ChevronDown, Loader2, Check, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface SiteEditorProps {
    initialSite: SiteDocument;
    locale: string;
}

export function SiteEditor({ initialSite, locale }: SiteEditorProps) {
    const t = useTranslations('sites.edit');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [lastSaved, setLastSaved] = useState<number | null>(null);
    const [errorKey, setErrorKey] = useState<string | null>(null);

    // Section Management State
    const [sections, setSections] = useState(initialSite.sections);
    const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>(
        initialSite.sections.reduce((acc, s) => ({ ...acc, [s.id]: s.enabled }), {})
    );

    // Local state for editable fields
    // Hero
    const heroSection = sections.find(s => s.type === 'hero');
    const [heroHeadlineEt, setHeroHeadlineEt] = useState(heroSection?.content?.headline?.et || '');
    const [heroHeadlineEn, setHeroHeadlineEn] = useState(heroSection?.content?.headline?.en || '');
    const [heroSubheadlineEt, setHeroSubheadlineEt] = useState(heroSection?.content?.subheadline?.et || '');
    const [heroSubheadlineEn, setHeroSubheadlineEn] = useState(heroSection?.content?.subheadline?.en || '');

    // About
    const aboutSection = sections.find(s => s.type === 'about');
    const [aboutHeadingEt, setAboutHeadingEt] = useState(aboutSection?.content?.heading?.et || '');
    const [aboutHeadingEn, setAboutHeadingEn] = useState(aboutSection?.content?.heading?.en || '');
    const [aboutSubheadingEt, setAboutSubheadingEt] = useState(aboutSection?.content?.subheading?.et || '');
    const [aboutSubheadingEn, setAboutSubheadingEn] = useState(aboutSection?.content?.subheading?.en || '');
    const [aboutBodyEt, setAboutBodyEt] = useState(aboutSection?.content?.body?.et || '');
    const [aboutBodyEn, setAboutBodyEn] = useState(aboutSection?.content?.body?.en || '');

    // Services
    const servicesSection = sections.find(s => s.type === 'services');
    const [servicesHeadingEt, setServicesHeadingEt] = useState(servicesSection?.content?.heading?.et || '');
    const [servicesHeadingEn, setServicesHeadingEn] = useState(servicesSection?.content?.heading?.en || '');
    const [servicesSubheadingEt, setServicesSubheadingEt] = useState(servicesSection?.content?.subheading?.et || '');
    const [servicesSubheadingEn, setServicesSubheadingEn] = useState(servicesSection?.content?.subheading?.en || '');
    const [servicesItems, setServicesItems] = useState(servicesSection?.content?.items || []);

    // Projects
    const projectsSection = sections.find(s => s.type === 'projects');
    const [projectsHeadingEt, setProjectsHeadingEt] = useState(projectsSection?.content?.heading?.et || '');
    const [projectsHeadingEn, setProjectsHeadingEn] = useState(projectsSection?.content?.heading?.en || '');
    const [projectsSubheadingEt, setProjectsSubheadingEt] = useState(projectsSection?.content?.subheading?.et || '');
    const [projectsSubheadingEn, setProjectsSubheadingEn] = useState(projectsSection?.content?.subheading?.en || '');

    // Contact
    const contactSection = sections.find(s => s.type === 'contact');
    const [contactHeadingEt, setContactHeadingEt] = useState(contactSection?.content?.heading?.et || '');
    const [contactHeadingEn, setContactHeadingEn] = useState(contactSection?.content?.heading?.en || '');
    const [contactSubheadingEt, setContactSubheadingEt] = useState(contactSection?.content?.subheading?.et || '');
    const [contactSubheadingEn, setContactSubheadingEn] = useState(contactSection?.content?.subheading?.en || '');

    // Header
    const headerSection = sections.find(s => s.type === 'header');
    const [headerLogoText, setHeaderLogoText] = useState(headerSection?.content?.logoText || initialSite.name);

    // Footer
    const footerSection = sections.find(s => s.type === 'footer');
    const [footerTextEt, setFooterTextEt] = useState(footerSection?.content?.text?.et || '');
    const [footerTextEn, setFooterTextEn] = useState(footerSection?.content?.text?.en || '');

    // Gallery
    const gallerySection = sections.find(s => s.type === 'gallery');
    const [galleryHeadingEt, setGalleryHeadingEt] = useState(gallerySection?.content?.heading?.et || '');
    const [galleryHeadingEn, setGalleryHeadingEn] = useState(gallerySection?.content?.heading?.en || '');
    const [gallerySubheadingEt, setGallerySubheadingEt] = useState(gallerySection?.content?.subheading?.et || '');
    const [gallerySubheadingEn, setGallerySubheadingEn] = useState(gallerySection?.content?.subheading?.en || '');

    // Custom
    const customSection = sections.find(s => s.type === 'custom');
    const [customHeadingEt, setCustomHeadingEt] = useState(customSection?.content?.heading?.et || '');
    const [customHeadingEn, setCustomHeadingEn] = useState(customSection?.content?.heading?.en || '');
    const [customSubheadingEt, setCustomSubheadingEt] = useState(customSection?.content?.subheading?.et || '');
    const [customSubheadingEn, setCustomSubheadingEn] = useState(customSection?.content?.subheading?.en || '');
    const [customBodyEt, setCustomBodyEt] = useState(customSection?.content?.body?.et || '');
    const [customBodyEn, setCustomBodyEn] = useState(customSection?.content?.body?.en || '');

    const addSection = (type: string) => {
        const id = `${type}-${Date.now()}`;
        const newSection = {
            id,
            type,
            enabled: true,
            content: {}
        } as any;

        if (type === 'header') newSection.content = { logoText: initialSite.name };
        if (type === 'footer') newSection.content = { text: { et: '', en: '' } };

        setSections(prev => [...prev, newSection]);
        setEnabledSections(prev => ({ ...prev, [id]: true }));
    };

    const removeSection = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        setSections(prev => prev.filter(s => s.id !== id));
    };

    const updateServiceItem = (id: string, field: 'title' | 'description', lang: 'et' | 'en', value: string) => {
        setServicesItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const updatedItem = { ...item };
            if (field === 'title') {
                updatedItem.title = { ...item.title, [lang]: value };
            } else {
                updatedItem.description = { ...item.description, [lang]: value };
            }
            return updatedItem;
        }));
    };

    const toggleSection = (id: string) => {
        setEnabledSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return;

        const temp = newSections[index];
        newSections[index] = newSections[targetIndex];
        newSections[targetIndex] = temp;
        setSections(newSections);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorKey(null);

        const formData = new FormData();
        formData.append('siteId', initialSite.id);
        formData.append('locale', locale);

        formData.append('heroHeadlineEt', heroHeadlineEt);
        formData.append('heroHeadlineEn', heroHeadlineEn);
        formData.append('heroSubheadlineEt', heroSubheadlineEt);
        formData.append('heroSubheadlineEn', heroSubheadlineEn);

        formData.append('aboutHeadingEt', aboutHeadingEt);
        formData.append('aboutHeadingEn', aboutHeadingEn);
        formData.append('aboutSubheadingEt', aboutSubheadingEt);
        formData.append('aboutSubheadingEn', aboutSubheadingEn);
        formData.append('aboutBodyEt', aboutBodyEt);
        formData.append('aboutBodyEn', aboutBodyEn);

        formData.append('servicesHeadingEt', servicesHeadingEt);
        formData.append('servicesHeadingEn', servicesHeadingEn);
        formData.append('servicesSubheadingEt', servicesSubheadingEt);
        formData.append('servicesSubheadingEn', servicesSubheadingEn);

        formData.append('projectsHeadingEt', projectsHeadingEt);
        formData.append('projectsHeadingEn', projectsHeadingEn);
        formData.append('projectsSubheadingEt', projectsSubheadingEt);
        formData.append('projectsSubheadingEn', projectsSubheadingEn);

        formData.append('contactHeadingEt', contactHeadingEt);
        formData.append('contactHeadingEn', contactHeadingEn);
        formData.append('contactSubheadingEt', contactSubheadingEt);
        formData.append('contactSubheadingEn', contactSubheadingEn);

        formData.append('headerLogoText', headerLogoText);
        formData.append('footerTextEt', footerTextEt);
        formData.append('footerTextEn', footerTextEn);
        formData.append('galleryHeadingEt', galleryHeadingEt);
        formData.append('galleryHeadingEn', galleryHeadingEn);
        formData.append('gallerySubheadingEt', gallerySubheadingEt);
        formData.append('gallerySubheadingEn', gallerySubheadingEn);

        formData.append('customHeadingEt', customHeadingEt);
        formData.append('customHeadingEn', customHeadingEn);
        formData.append('customSubheadingEt', customSubheadingEt);
        formData.append('customSubheadingEn', customSubheadingEn);
        formData.append('customBodyEt', customBodyEt);
        formData.append('customBodyEn', customBodyEn);

        formData.append('enabledSections', JSON.stringify(enabledSections));
        formData.append('sectionsOrder', JSON.stringify(sections.map(s => s.id)));
        formData.append('servicesItems', JSON.stringify(servicesItems));

        startTransition(async () => {
            const result = await saveSiteAction({ ok: false }, formData);
            if (result.ok) {
                setLastSaved(Date.now());
                router.refresh();
            } else {
                setErrorKey(result.errorKey || 'sites.edit.errors.unknown');
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('sections.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2">
                        {sections.map((section, idx) => (
                            <div key={section.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-all group">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id={`enable-${section.id}`}
                                        checked={enabledSections[section.id]}
                                        onCheckedChange={() => toggleSection(section.id)}
                                    />
                                    <div className="flex flex-col">
                                        <span className="capitalize font-bold text-sm tracking-tight">{section.type}</span>
                                        <div className="flex gap-2">
                                            <Badge variant={enabledSections[section.id] ? "default" : "secondary"} className="text-[8px] h-3.5 px-1 uppercase w-fit">
                                                {enabledSections[section.id] ? "Active" : "Hidden"}
                                            </Badge>
                                            {['header', 'footer', 'gallery', 'custom'].includes(section.type) && (
                                                <button
                                                    onClick={(e) => removeSection(section.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost" size="icon" className="h-7 w-7"
                                        onClick={(e) => { e.preventDefault(); moveSection(idx, 'up'); }}
                                        disabled={idx === 0}
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon" className="h-7 w-7"
                                        onClick={(e) => { e.preventDefault(); moveSection(idx, 'down'); }}
                                        disabled={idx === sections.length - 1}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <div className="p-4 border-t border-border/50">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full gap-2 border-dashed">
                                    <Plus className="h-4 w-4" /> Add Section
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => addSection('header')} disabled={!!sections.find(s => s.type === 'header')}>Header</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => addSection('footer')} disabled={!!sections.find(s => s.type === 'footer')}>Footer</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => addSection('gallery')}>Gallery</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => addSection('custom')}>Custom Block</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-3">
                <form onSubmit={handleSave} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('editor.title')}</CardTitle>
                            <CardDescription>{t('meta.status')}: {initialSite.status}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Hero */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">{t('hero.title')}</h3>
                                <Tabs defaultValue="et">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="et">Estonian</TabsTrigger>
                                        <TabsTrigger value="en">English</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="et" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="heroHeadlineEt">{t('hero.headline.et')}</Label>
                                            <Input id="heroHeadlineEt" value={heroHeadlineEt} onChange={(e) => setHeroHeadlineEt(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="heroSubheadlineEt">{t('hero.subheadline.et')}</Label>
                                            <Input id="heroSubheadlineEt" value={heroSubheadlineEt} onChange={(e) => setHeroSubheadlineEt(e.target.value)} />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="en" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="heroHeadlineEn">{t('hero.headline.en')}</Label>
                                            <Input id="heroHeadlineEn" value={heroHeadlineEn} onChange={(e) => setHeroHeadlineEn(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="heroSubheadlineEn">{t('hero.subheadline.en')}</Label>
                                            <Input id="heroSubheadlineEn" value={heroSubheadlineEn} onChange={(e) => setHeroSubheadlineEn(e.target.value)} />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="border-t border-border" />

                            {/* About */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">About</h3>
                                <Tabs defaultValue="et">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="et">Estonian</TabsTrigger>
                                        <TabsTrigger value="en">English</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="et" className="space-y-4">
                                        <div className="space-y-2"><Label>Headline (ET)</Label><Input value={aboutHeadingEt} onChange={(e) => setAboutHeadingEt(e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Subheadline (ET)</Label><Input value={aboutSubheadingEt} onChange={(e) => setAboutSubheadingEt(e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Body (ET)</Label><Textarea value={aboutBodyEt} onChange={(e) => setAboutBodyEt(e.target.value)} rows={6} /></div>
                                    </TabsContent>
                                    <TabsContent value="en" className="space-y-4">
                                        <div className="space-y-2"><Label>Headline (EN)</Label><Input value={aboutHeadingEn} onChange={(e) => setAboutHeadingEn(e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Subheadline (EN)</Label><Input value={aboutSubheadingEn} onChange={(e) => setAboutSubheadingEn(e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Body (EN)</Label><Textarea value={aboutBodyEn} onChange={(e) => setAboutBodyEn(e.target.value)} rows={6} /></div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="border-t border-border" />

                            {/* Services */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Services</h3>
                                <Tabs defaultValue="et">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="et">Estonian</TabsTrigger>
                                        <TabsTrigger value="en">English</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="et" className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Headline (ET)</Label><Input value={servicesHeadingEt} onChange={(e) => setServicesHeadingEt(e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Subheadline (ET)</Label><Input value={servicesSubheadingEt} onChange={(e) => setServicesSubheadingEt(e.target.value)} /></div>
                                        </div>
                                        {servicesItems.map((item, idx) => (
                                            <div key={item.id} className="p-4 border rounded-xl bg-muted/10 space-y-4">
                                                <Label>Service {idx + 1} (ET)</Label>
                                                <Input value={item.title?.et || ''} onChange={(e) => updateServiceItem(item.id, 'title', 'et', e.target.value)} className="font-bold" />
                                                <Textarea value={item.description?.et || ''} onChange={(e) => updateServiceItem(item.id, 'description', 'et', e.target.value)} rows={2} />
                                            </div>
                                        ))}
                                    </TabsContent>
                                    <TabsContent value="en" className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Headline (EN)</Label><Input value={servicesHeadingEn} onChange={(e) => setServicesHeadingEn(e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Subheadline (EN)</Label><Input value={servicesSubheadingEn} onChange={(e) => setServicesSubheadingEn(e.target.value)} /></div>
                                        </div>
                                        {servicesItems.map((item, idx) => (
                                            <div key={item.id} className="p-4 border rounded-xl bg-muted/10 space-y-4">
                                                <Label>Service {idx + 1} (EN)</Label>
                                                <Input value={item.title?.en || ''} onChange={(e) => updateServiceItem(item.id, 'title', 'en', e.target.value)} className="font-bold" />
                                                <Textarea value={item.description?.en || ''} onChange={(e) => updateServiceItem(item.id, 'description', 'en', e.target.value)} rows={2} />
                                            </div>
                                        ))}
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="border-t border-border" />

                            {/* Projects */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Projects</h3>
                                <Tabs defaultValue="et">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="et">Estonian</TabsTrigger>
                                        <TabsTrigger value="en">English</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="et" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Headline (ET)</Label><Input value={projectsHeadingEt} onChange={(e) => setProjectsHeadingEt(e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Subheadline (ET)</Label><Input value={projectsSubheadingEt} onChange={(e) => setProjectsSubheadingEt(e.target.value)} /></div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="en" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Headline (EN)</Label><Input value={projectsHeadingEn} onChange={(e) => setProjectsHeadingEn(e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Subheadline (EN)</Label><Input value={projectsSubheadingEn} onChange={(e) => setProjectsSubheadingEn(e.target.value)} /></div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="border-t border-border" />

                            {/* Contact */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Contact</h3>
                                <Tabs defaultValue="et">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="et">Estonian</TabsTrigger>
                                        <TabsTrigger value="en">English</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="et" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Headline (ET)</Label><Input value={contactHeadingEt} onChange={(e) => setContactHeadingEt(e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Subheadline (ET)</Label><Input value={contactSubheadingEt} onChange={(e) => setContactSubheadingEt(e.target.value)} /></div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="en" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Headline (EN)</Label><Input value={contactHeadingEn} onChange={(e) => setContactHeadingEn(e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Subheadline (EN)</Label><Input value={contactSubheadingEn} onChange={(e) => setContactSubheadingEn(e.target.value)} /></div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="border-t border-border" />

                            {/* Header */}
                            {sections.find(s => s.type === 'header') && (
                                <>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Header</h3>
                                        <div className="space-y-2"><Label>Logo Text</Label><Input value={headerLogoText} onChange={(e) => setHeaderLogoText(e.target.value)} /></div>
                                    </div>
                                    <div className="border-t border-border" />
                                </>
                            )}

                            {/* Gallery */}
                            {sections.find(s => s.type === 'gallery') && (
                                <>
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold">Gallery</h3>
                                        <Tabs defaultValue="et">
                                            <TabsList className="mb-4"><TabsTrigger value="et">Estonian</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                                            <TabsContent value="et" className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2"><Label>Headline (ET)</Label><Input value={galleryHeadingEt} onChange={(e) => setGalleryHeadingEt(e.target.value)} /></div>
                                                    <div className="space-y-2"><Label>Subheadline (ET)</Label><Input value={gallerySubheadingEt} onChange={(e) => setGallerySubheadingEt(e.target.value)} /></div>
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="en" className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2"><Label>Headline (EN)</Label><Input value={galleryHeadingEn} onChange={(e) => setGalleryHeadingEn(e.target.value)} /></div>
                                                    <div className="space-y-2"><Label>Subheadline (EN)</Label><Input value={gallerySubheadingEn} onChange={(e) => setGallerySubheadingEn(e.target.value)} /></div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                    <div className="border-t border-border" />
                                </>
                            )}

                            {/* Custom Block */}
                            {sections.find(s => s.type === 'custom') && (
                                <>
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold">Custom Block</h3>
                                        <Tabs defaultValue="et">
                                            <TabsList className="mb-4"><TabsTrigger value="et">Estonian</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                                            <TabsContent value="et" className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2"><Label>Heading (ET)</Label><Input value={customHeadingEt} onChange={(e) => setCustomHeadingEt(e.target.value)} /></div>
                                                    <div className="space-y-2"><Label>Subheading (ET)</Label><Input value={customSubheadingEt} onChange={(e) => setCustomSubheadingEt(e.target.value)} /></div>
                                                </div>
                                                <div className="space-y-2"><Label>Body (ET)</Label><Textarea value={customBodyEt} onChange={(e) => setCustomBodyEt(e.target.value)} rows={4} /></div>
                                            </TabsContent>
                                            <TabsContent value="en" className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2"><Label>Heading (EN)</Label><Input value={customHeadingEn} onChange={(e) => setCustomHeadingEn(e.target.value)} /></div>
                                                    <div className="space-y-2"><Label>Subheading (EN)</Label><Input value={customSubheadingEn} onChange={(e) => setCustomSubheadingEn(e.target.value)} /></div>
                                                </div>
                                                <div className="space-y-2"><Label>Body (EN)</Label><Textarea value={customBodyEn} onChange={(e) => setCustomBodyEn(e.target.value)} rows={4} /></div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                    <div className="border-t border-border" />
                                </>
                            )}

                            {/* Footer */}
                            {sections.find(s => s.type === 'footer') && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold">Footer</h3>
                                    <Tabs defaultValue="et">
                                        <TabsList className="mb-4"><TabsTrigger value="et">Estonian</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                                        <TabsContent value="et" className="space-y-4">
                                            <div className="space-y-2"><Label>Footer Text (ET)</Label><Textarea value={footerTextEt} onChange={(e) => setFooterTextEt(e.target.value)} rows={3} /></div>
                                        </TabsContent>
                                        <TabsContent value="en" className="space-y-4">
                                            <div className="space-y-2"><Label>Footer Text (EN)</Label><Textarea value={footerTextEn} onChange={(e) => setFooterTextEn(e.target.value)} rows={3} /></div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="sticky bottom-6 flex items-center justify-between bg-background/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-lg z-10">
                        <div className="flex items-center gap-4">
                            {lastSaved && (
                                <div className="flex flex-col items-start translate-y-1">
                                    <span className="text-sm text-green-600 flex items-center gap-1 font-medium"><Check className="w-4 h-4" /> {t('saved')}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Click "Publish Changes" in header to go live</span>
                                </div>
                            )}
                            {errorKey && <span className="text-sm text-destructive font-medium">{t('errors.unknown')}</span>}
                        </div>
                        <Button type="submit" disabled={isPending} className="min-w-[140px]">
                            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : t('save')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

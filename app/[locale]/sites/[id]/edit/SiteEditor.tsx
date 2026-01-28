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
import { Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SiteEditorProps {
    initialSite: SiteDocument;
    locale: string;
}

export function SiteEditor({ initialSite, locale }: SiteEditorProps) {
    const t = useTranslations('sites.edit');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [lastSaved, setLastSaved] = useState<number | null>(null);

    // Local state for editable fields to allow instant feedback
    // Hero
    const heroSection = initialSite.sections.find(s => s.type === 'hero');
    const [heroHeadlineEt, setHeroHeadlineEt] = useState(heroSection?.content?.headline?.et || '');
    const [heroHeadlineEn, setHeroHeadlineEn] = useState(heroSection?.content?.headline?.en || '');
    const [heroSubheadlineEt, setHeroSubheadlineEt] = useState(heroSection?.content?.subheadline?.et || '');
    const [heroSubheadlineEn, setHeroSubheadlineEn] = useState(heroSection?.content?.subheadline?.en || '');

    // About
    const aboutSection = initialSite.sections.find(s => s.type === 'about');
    const [aboutBodyEt, setAboutBodyEt] = useState(aboutSection?.content?.body?.et || '');
    const [aboutBodyEn, setAboutBodyEn] = useState(aboutSection?.content?.body?.en || '');

    const [errorKey, setErrorKey] = useState<string | null>(null);

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
        formData.append('aboutBodyEt', aboutBodyEt);
        formData.append('aboutBodyEn', aboutBodyEn);

        startTransition(async () => {
            const result = await saveSiteAction({ ok: false }, formData);
            if (result.ok) {
                setLastSaved(Date.now());
                router.refresh(); // Refresh RSC data
            } else {
                setErrorKey(result.errorKey || 'sites.edit.errors.unknown');
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column: Sections List (Skeleton) */}
            <div className="lg:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('sections.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {initialSite.sections.map((section, idx) => (
                            <div key={section.id || idx} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors cursor-pointer">
                                <span className="capitalize font-medium">{section.type}</span>
                                {section.enabled && <Badge variant="secondary" className="text-xs">Active</Badge>}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Editor Form */}
            <div className="lg:col-span-3">
                <form onSubmit={handleSave} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('editor.title')}</CardTitle>
                            <CardDescription>{t('meta.status')}: {initialSite.status}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Hero Section Fields */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    {t('hero.title')}
                                </h3>
                                <Tabs defaultValue="et" className="w-full">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="et">Estonian</TabsTrigger>
                                        <TabsTrigger value="en">English</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="et" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="heroHeadlineEt">{t('hero.headline.et')}</Label>
                                            <Input
                                                id="heroHeadlineEt"
                                                value={heroHeadlineEt}
                                                onChange={(e) => setHeroHeadlineEt(e.target.value)}
                                                placeholder="..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="heroSubheadlineEt">{t('hero.subheadline.et')}</Label>
                                            <Input
                                                id="heroSubheadlineEt"
                                                value={heroSubheadlineEt}
                                                onChange={(e) => setHeroSubheadlineEt(e.target.value)}
                                                placeholder="..."
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="en" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="heroHeadlineEn">{t('hero.headline.en')}</Label>
                                            <Input
                                                id="heroHeadlineEn"
                                                value={heroHeadlineEn}
                                                onChange={(e) => setHeroHeadlineEn(e.target.value)}
                                                placeholder="..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="heroSubheadlineEn">{t('hero.subheadline.en')}</Label>
                                            <Input
                                                id="heroSubheadlineEn"
                                                value={heroSubheadlineEn}
                                                onChange={(e) => setHeroSubheadlineEn(e.target.value)}
                                                placeholder="..."
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="border-t border-border" />

                            {/* About Section Fields */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    {t('about.title')}
                                </h3>
                                <Tabs defaultValue="et" className="w-full">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="et">Estonian</TabsTrigger>
                                        <TabsTrigger value="en">English</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="et" className="space-y-2">
                                        <Label htmlFor="aboutBodyEt">{t('about.body.et')}</Label>
                                        <Textarea
                                            id="aboutBodyEt"
                                            value={aboutBodyEt}
                                            onChange={(e) => setAboutBodyEt(e.target.value)}
                                            rows={5}
                                            placeholder="..."
                                        />
                                    </TabsContent>

                                    <TabsContent value="en" className="space-y-2">
                                        <Label htmlFor="aboutBodyEn">{t('about.body.en')}</Label>
                                        <Textarea
                                            id="aboutBodyEn"
                                            value={aboutBodyEn}
                                            onChange={(e) => setAboutBodyEn(e.target.value)}
                                            rows={5}
                                            placeholder="..."
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Sticky/Floating Action Bar */}
                    <div className="sticky bottom-6 flex items-center justify-between bg-background/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-lg z-10">
                        <div className="flex items-center gap-2">
                            {lastSaved && (
                                <span className="text-sm text-green-600 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2">
                                    <Check className="w-4 h-4" /> {t('saved')}
                                </span>
                            )}
                            {errorKey && (
                                <span className="text-sm text-destructive font-medium">
                                    {t('errors.unknown')}
                                </span>
                            )}
                        </div>

                        <Button type="submit" disabled={isPending} className="min-w-[140px]">
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                t('save')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

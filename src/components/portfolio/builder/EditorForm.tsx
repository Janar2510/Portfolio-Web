'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    Save,
    Send,
    Eye,
    Layout,
    Type,
    Palette,
    User,
    Monitor,
    Smartphone,
    Globe
} from 'lucide-react';

import type { Site } from '@/lib/sites/types';
import { updateSiteConfigAction, publishSiteAction } from '@/actions';
import { TemplateConfig } from '../../../../packages/shared/templates/types';

const EditorFormSchema = z.object({
    siteTitle: z.string().min(1, 'Title is required'),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    heroHeadline: z.string().min(1, 'Headline is required'),
    heroSubtitle: z.string().optional(),
    heroImage: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
    textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
    accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
});

type EditorFormValues = z.infer<typeof EditorFormSchema>;

interface EditorFormProps {
    site: Site;
    locale: string;
}

export function EditorForm({ site, locale }: EditorFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // specific casting as the DB jsonb type might be loose, but we know it's TemplateConfig
    const config = site.draft_config as unknown as any;

    const form = useForm<EditorFormValues>({
        resolver: zodResolver(EditorFormSchema),
        defaultValues: {
            siteTitle: config?.siteTitle || site.slug || '',
            bio: config?.bio || '',
            avatar: config?.avatar || '',
            heroHeadline: config?.sections?.content?.hero?.headline || '',
            heroSubtitle: config?.sections?.content?.hero?.subheadline || '',
            heroImage: config?.sections?.content?.hero?.image_url || '',
            primaryColor: config?.theme?.palette?.primary || '#000000',
            backgroundColor: config?.theme?.palette?.background || '#ffffff',
            textColor: config?.theme?.palette?.text || '#000000',
            accentColor: config?.theme?.palette?.accent || '#000000',
        },
    });

    async function onSubmit(values: EditorFormValues) {
        setIsSaving(true);
        try {
            // Map form values back to TemplateConfig structure
            const updatedConfig = {
                ...config,
                siteTitle: values.siteTitle,
                bio: values.bio,
                avatar: values.avatar,
                theme: {
                    ...config.theme,
                    palette: {
                        primary: values.primaryColor,
                        background: values.backgroundColor,
                        text: values.textColor,
                        accent: values.accentColor,
                    },
                },
                sections: {
                    ...config.sections,
                    content: {
                        ...config.sections?.content,
                        hero: {
                            ...config.sections?.content?.hero,
                            headline: values.heroHeadline,
                            subheadline: values.heroSubtitle,
                            image_url: values.heroImage,
                        },
                    },
                },
            };

            const result = await updateSiteConfigAction(site.id, updatedConfig);
            if (result.success) {
                toast.success('Site configuration saved!');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to save configuration.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    }

    async function onPublish() {
        setIsPublishing(true);
        try {
            const result = await publishSiteAction(site.id);
            if (result.success) {
                // Determine slug from site object since action might not return it
                const slug = site.slug;
                toast.success('Site published successfully!', {
                    action: {
                        label: 'View Live Site',
                        onClick: () => window.open(`/s/${slug}`, '_blank'),
                    },
                });
            } else {
                toast.error(result.error || 'Failed to publish site.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred during publishing.');
        } finally {
            setIsPublishing(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-[calc(100vh-64px)] overflow-hidden flex flex-col md:flex-row">
                {/* Sidebar Settings */}
                <div className="w-full md:w-[400px] border-r bg-card flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Layout className="h-5 w-5 text-primary" />
                            <h2 className="font-bold">Editor</h2>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSaving}
                                className="h-8 gap-2"
                            >
                                <Save className="h-3.5 w-3.5" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isPublishing}
                                onClick={onPublish}
                                className="h-8 gap-2 text-primary border-primary/20 hover:bg-primary/5"
                            >
                                <Send className="h-3.5 w-3.5" />
                                {isPublishing ? '...' : 'Publish'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="w-full rounded-none border-b grid grid-cols-3 h-12 bg-muted/20">
                                <TabsTrigger value="general" className="data-[state=active]:bg-background">
                                    <User className="h-4 w-4 mr-2" />
                                    Info
                                </TabsTrigger>
                                <TabsTrigger value="hero" className="data-[state=active]:bg-background">
                                    <Type className="h-4 w-4 mr-2" />
                                    Hero
                                </TabsTrigger>
                                <TabsTrigger value="theme" className="data-[state=active]:bg-background">
                                    <Palette className="h-4 w-4 mr-2" />
                                    Style
                                </TabsTrigger>
                            </TabsList>

                            <div className="p-6 space-y-8 pb-20">
                                <TabsContent value="general" className="mt-0 space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">General Settings</h3>
                                        <p className="text-xs text-muted-foreground">Basic identity of your portfolio.</p>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="siteTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Site Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="My Portfolio" className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bio / Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="A short bio..." className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors min-h-[100px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="avatar"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Avatar URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent value="hero" className="mt-0 space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Hero Section</h3>
                                        <p className="text-xs text-muted-foreground">The first impression your visitors get.</p>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="heroHeadline"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Main Headline</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Creative Developer" className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="heroSubtitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subtitle</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Building digital experiences..." className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors min-h-[80px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="heroImage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Background Image URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors" {...field} />
                                                </FormControl>
                                                <FormDescription className="text-[11px]">Best with high resolution landscape images.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent value="theme" className="mt-0 space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Visual Style</h3>
                                        <p className="text-xs text-muted-foreground">Colors and aesthetic settings.</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="primaryColor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Primary Color</FormLabel>
                                                    <div className="flex gap-2">
                                                        <div
                                                            className="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-black/10 shrink-0"
                                                            style={{ backgroundColor: field.value }}
                                                        />
                                                        <FormControl>
                                                            <Input {...field} className="bg-muted/30" />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="backgroundColor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Background Color</FormLabel>
                                                    <div className="flex gap-2">
                                                        <div
                                                            className="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-black/10 shrink-0"
                                                            style={{ backgroundColor: field.value }}
                                                        />
                                                        <FormControl>
                                                            <Input {...field} className="bg-muted/30" />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="textColor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Text Color</FormLabel>
                                                    <div className="flex gap-2">
                                                        <div
                                                            className="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-black/10 shrink-0"
                                                            style={{ backgroundColor: field.value }}
                                                        />
                                                        <FormControl>
                                                            <Input {...field} className="bg-muted/30" />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="accentColor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Accent Color</FormLabel>
                                                    <div className="flex gap-2">
                                                        <div
                                                            className="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-black/10 shrink-0"
                                                            style={{ backgroundColor: field.value }}
                                                        />
                                                        <FormControl>
                                                            <Input {...field} className="bg-muted/30" />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-muted/20 flex flex-col group relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                            Live Preview (Autosaves Draft)
                        </div>
                    </div>

                    <div className="h-12 border-b bg-card/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-muted/50">
                                    <Monitor className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                                    <Smartphone className="h-4 w-4" />
                                </Button>
                            </div>
                            <Separator orientation="vertical" className="h-4 mx-2" />
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                <Globe className="h-3 w-3" />
                                {site.slug}.portfolio.site
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="text-primary gap-1"
                            onClick={() => window.open(`/${locale}/builder/sites/${site.id}/preview`, '_blank')}
                        >
                            <Eye className="h-4 w-4" />
                            Open Full Preview
                        </Button>
                    </div>

                    <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-auto">
                        <Card className="w-full h-full max-w-[1200px] shadow-2xl overflow-hidden border-none ring-1 ring-black/5 bg-white">
                            <iframe
                                src={`/${locale}/builder/sites/${site.id}/preview`}
                                className="w-full h-full border-none"
                                title="Site Preview"
                            />
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}

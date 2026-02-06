'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Layout, Sparkles, ArrowRight } from 'lucide-react';
import { createSiteAction } from '../actions';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Site name must be at least 2 characters.",
    }),
    templateId: z.string().min(1, "Please select a template."),
});

const TEMPLATES = [
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean and focus-driven design.',
        previewColor: 'bg-zinc-100'
    },
    {
        id: 'clean',
        name: 'Clean',
        description: 'Modern and airy portfolio layout.',
        previewColor: 'bg-blue-50'
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Structured for industry veterans.',
        previewColor: 'bg-zinc-900'
    },
    {
        id: 'bento-grid',
        name: 'Bento Box',
        description: 'Modern grid-based layout.',
        previewColor: 'bg-indigo-950'
    },
    {
        id: 'marquee-portfolio',
        name: 'Marquee',
        description: 'Dynamic, typography-driven.',
        previewColor: 'bg-violet-950'
    },
    {
        id: 'editorial',
        name: 'Editorial',
        description: 'Premium magazine-style portfolio.',
        previewColor: 'bg-cyan-950'
    },
    {
        id: 'saas-modern',
        name: 'SaaS Modern',
        description: 'Modern SaaS landing page with purple theme.',
        previewColor: 'bg-purple-950'
    },
];

import { canCreateSite, DEFAULT_PLAN } from '@/config/plans';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

export function CreateSiteForm({ locale, siteCount = 0 }: { locale: string; siteCount?: number }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);

    // TODO: Fetch real user plan from subscription service.
    // For now, defaulting to 'free' plan limits.
    const currentPlanId = DEFAULT_PLAN;
    const canCreate = canCreateSite(siteCount, currentPlanId);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            templateId: TEMPLATES[0].id,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!canCreate) return;

        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('templateId', values.templateId);
        formData.append('locale', locale);

        startTransition(async () => {
            const result = await createSiteAction({ ok: false }, formData);
            if (!result.ok) {
                toast.error(result.errorKey || 'Failed to create site');
            }
            // Success results in a redirect from the action
        });
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-10">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                    Create your <span className="text-primary italic">Portfolio</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                    Select a starting point and give your site a name. You can customize everything later.
                </p>
            </div>

            {!canCreate && (
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-500">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Site Limit Reached</AlertTitle>
                    <AlertDescription>
                        You have reached the limit of sites for your current plan. Please upgrade to create more sites.
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 px-1">
                            <Sparkles className="w-4 h-4" />
                            Choose a Template
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {TEMPLATES.map((tmpl) => (
                                <Card
                                    key={tmpl.id}
                                    className={`relative cursor-pointer transition-all duration-300 overflow-hidden group border-2 ${selectedTemplate === tmpl.id
                                        ? 'border-primary ring-2 ring-primary/20 shadow-xl'
                                        : 'hover:border-primary/50 border-transparent bg-muted/30'
                                        }`}
                                    onClick={() => {
                                        setSelectedTemplate(tmpl.id);
                                        form.setValue('templateId', tmpl.id);
                                    }}
                                >
                                    <div className={`aspect-[4/3] w-full ${tmpl.previewColor} transition-transform duration-500 group-hover:scale-105 flex items-center justify-center`}>
                                        <Layout className={`w-12 h-12 ${tmpl.id === 'professional' ? 'text-white/20' : 'text-zinc-300'}`} />
                                    </div>
                                    <CardContent className="p-5">
                                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{tmpl.name}</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{tmpl.description}</p>
                                    </CardContent>
                                    {selectedTemplate === tmpl.id && (
                                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1 shadow-lg animate-in zoom-in duration-300">
                                            <Sparkles className="w-3 h-3" />
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                        <FormField
                            control={form.control}
                            name="templateId"
                            render={({ field }) => (
                                <FormItem className="hidden">
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="bg-muted/30 p-8 rounded-3xl border border-border/50 backdrop-blur-sm space-y-6">
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 px-1">
                            Identity
                        </div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-bold">What should we call your site?</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={!canCreate}
                                            placeholder="e.g. My Awesome Portfolio"
                                            className="h-14 text-lg bg-background border-border/50 focus:ring-primary/20 transition-all rounded-xl shadow-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            size="lg"
                            disabled={isPending || !canCreate}
                            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all group gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creating your site...
                                </>
                            ) : (
                                <>
                                    {!canCreate ? 'Limit Reached' : 'Build My Portfolio'}
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

import { Sparkles, Cog, Sliders, Tags, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomFieldsSettings } from '@/components/crm/settings/CustomFieldsSettings';

export default function CrmSettingsPage() {
    return (
        <div className="animate-fade-up max-w-[1440px] mx-auto py-12 px-6">
            {/* Pulse-style Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        Configuration Mode
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white m-0 font-display">
                        CRM Settings
                    </h1>
                    <p className="text-lg text-white/40 max-w-xl">
                        Fine-tune your sales process and automation rules.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="fields" className="space-y-8">
                <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl h-auto">
                    <TabsTrigger
                        value="fields"
                        className="rounded-xl px-6 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold uppercase tracking-wide text-xs"
                    >
                        <Sliders className="w-4 h-4 mr-2" />
                        Custom Fields
                    </TabsTrigger>
                    <TabsTrigger
                        value="pipelines"
                        className="rounded-xl px-6 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold uppercase tracking-wide text-xs"
                    >
                        <GitBranch className="w-4 h-4 mr-2" />
                        Pipelines
                    </TabsTrigger>
                    <TabsTrigger
                        value="tags"
                        className="rounded-xl px-6 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold uppercase tracking-wide text-xs"
                    >
                        <Tags className="w-4 h-4 mr-2" />
                        Tags & Labels
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="fields" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white font-display uppercase">Custom Field Definitions</h2>
                            <p className="text-white/40">Manage additional data points for your CRM entities.</p>
                        </div>
                        <CustomFieldsSettings />
                    </div>
                </TabsContent>

                <TabsContent value="pipelines">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 min-h-[300px] flex items-center justify-center">
                        <p className="text-white/20 italic">Pipeline configuration coming soon...</p>
                    </div>
                </TabsContent>

                <TabsContent value="tags">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 min-h-[300px] flex items-center justify-center">
                        <p className="text-white/20 italic">Label management coming soon...</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

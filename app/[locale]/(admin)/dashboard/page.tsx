import { getTranslations } from 'next-intl/server';
import { PulseGrid } from '@/components/dashboard/PulseGrid';
import { ModuleOverview } from '@/components/dashboard/ModuleOverview';
import { ActiveServices } from '@/components/dashboard/ActiveServices';
import { Button } from '@/components/ui/button';
import { PlusCircle, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="animate-fade-up max-w-[1280px] mx-auto py-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Workspace Active
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white m-0">
            Workspace Pulse
          </h1>
          <p className="text-lg text-white/40 max-w-xl">
            Everything is running smoothly. Here's what's happening across your platform.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sites/new">
            <Button size="lg" className="gap-2 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam px-8">
              <PlusCircle className="w-4 h-4" />
              <span>Create New Site</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Pulse Stats Grid */}
      <PulseGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Module Overviews */}
        <div className="lg:col-span-2 space-y-8">
          <ModuleOverview
            title="Portfolio & Sites"
            subtitle="Manage your live sites and drafts"
            viewAllHref="/sites"
            items={[
              { id: '1', title: 'Personal Portfolio', description: 'Published on janar.supale.com', status: 'Live', time: 'Updated 2h ago' },
              { id: '2', title: 'Creative Studio', description: 'Draft in progress', status: 'Draft', time: 'Updated yesterday' },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ModuleOverview
              title="Recent CRM Leads"
              subtitle="Engage with your audience"
              viewAllHref="/crm"
              items={[
                { id: '1', title: 'Alex Rivera', description: 'Inquiry: Web Design', time: '1h ago' },
                { id: '2', title: 'Sarah Chen', description: 'Newsletter Signup', time: '4h ago' },
              ]}
            />
            <ModuleOverview
              title="Active Projects"
              subtitle="Stay on track with deliverables"
              viewAllHref="/projects"
              items={[
                { id: '1', title: 'Brand Identity', description: 'Due next Friday', status: 'In Review' },
                { id: '2', title: 'UI Audit', description: 'Starting soon', status: 'Planned' },
              ]}
            />
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <ActiveServices />

          <div className="surface-elevated p-8 border-white/5 bg-gradient-to-br from-primary/10 to-transparent rounded-[2.5rem] relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">New Site Engine</h3>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Experience the magic of AI-driven site building with our refreshed engine.
              </p>
              <Button variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/5 text-white/70">
                Explore Components
              </Button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/20 blur-[50px] group-hover:bg-primary/30 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}

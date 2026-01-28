import { notFound, redirect } from 'next/navigation';
import { createClientWithUser } from '@/lib/supabase/server';
import { getSiteById } from '@/lib/sites/server';
import { PublicPortfolioPage } from '@/domain/renderer/PublicPortfolioPage';
import { TemplateConfig } from '@/domain/templates/contracts'; // Adjust import based on where contracts are
// If contracts.ts doesn't export TemplateConfig directly but re-exports from shared which might be tricky in some setups, check imports.
// Checked previous view_file: src/domain/templates/contracts.ts re-exports TemplateConfig.

interface PageProps {
    params: Promise<{
        locale: string;
        siteId: string;
    }>;
}

export default async function PreviewPage({ params }: PageProps) {
    const { locale, siteId } = await params;
    const { user } = await createClientWithUser();

    if (!user) {
        redirect(`/${locale}/sign-in`);
    }

    // specific owner check via getSiteById
    const site = await getSiteById(siteId);

    if (!site) {
        notFound();
    }

    // Double check ownership (redundant but safe)
    if (site.owner_user_id !== user.id) {
        return <div className="min-h-screen flex items-center justify-center text-destructive">Unauthorized</div>;
    }

    // Cast draft_config to TemplateConfig
    // In a real app we might want to validate it with Zod here too to prevent crashes if draft is corrupted,
    // but for MVP casting is acceptable as the EditorForm produces valid shapes.
    const config = site.draft_config as unknown as TemplateConfig;

    return (
        <div className="relative min-h-screen">
            {/* Preview Banner */}
            <div className="fixed top-0 left-0 right-0 h-10 bg-primary text-primary-foreground z-50 flex items-center justify-between px-4 text-sm shadow-md">
                <span className="font-medium">Preview Mode</span>
                <div className="flex items-center gap-4">
                    <span className="opacity-80 text-xs hidden sm:inline">Changes are saved to draft</span>
                    <a
                        href={`/${locale}/builder/sites/${siteId}/editor`}
                        className="bg-primary-foreground/20 hover:bg-primary-foreground/30 px-3 py-1 rounded text-xs transition-colors"
                    >
                        Back to Editor
                    </a>
                </div>
            </div>

            {/* Main Content - Pushed down by banner */}
            <div className="pt-10">
                <PublicPortfolioPage config={config} />
            </div>
        </div>
    );
}

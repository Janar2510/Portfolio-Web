import { notFound, redirect } from 'next/navigation';
import { createClientWithUser } from '@/lib/supabase/server';
import { getSiteById } from '@/lib/sites/server';
import { EditorForm } from '@/components/portfolio/builder/EditorForm';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
    params: Promise<{
        locale: string;
        siteId: string;
    }>;
}

export default async function EditorPage({ params }: PageProps) {
    const { locale, siteId } = await params;
    const { user } = await createClientWithUser();

    if (!user) {
        redirect(`/${locale}/sign-in`);
    }

    const site = await getSiteById(siteId);

    if (!site) {
        notFound();
    }

    // Security check: Ensure owner matches
    if (site.owner_user_id !== user.id) {
        return <div className="p-8 text-center text-destructive">Unauthorized</div>;
    }

    return (
        <div className="h-screen overflow-hidden flex flex-col bg-background">
            <EditorForm site={site} locale={locale} />
        </div>
    );
}

import { redirect } from 'next/navigation';
import { createClientWithUser } from '@/lib/supabase/server';

interface NewSitePageProps {
    params: {
        locale: string;
    };
}

export default async function NewSitePage({
    params: { locale },
}: NewSitePageProps) {
    const { user } = await createClientWithUser();

    if (!user) {
        redirect(`/${locale}/sign-in?next=/${locale}/builder/sites/new`);
    }

    // Redirect to the canonical builder site creation page
    redirect(`/${locale}/builder/sites/new`);
}

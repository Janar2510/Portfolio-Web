import { redirect } from 'next/navigation';

export default async function RedirectPage({ params }: { params: Promise<{ locale: string; siteId: string }> }) {
    const { locale, siteId } = await params;
    redirect(`/${locale}/sites/${siteId}/edit`);
}

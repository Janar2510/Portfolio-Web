
import { CreateSiteForm } from '@/components/portfolio/builder/CreateSiteForm';

export default async function NewSitePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <div className="container mx-auto px-4">
            <CreateSiteForm locale={locale} />
        </div>
    );
}

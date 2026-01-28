import { CreateSiteForm } from '@/components/portfolio/builder/CreateSiteForm';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function NewSitePage({ params }: PageProps) {
    const { locale } = await params;
    const t = await getTranslations('builder');

    return (
        <div className="container py-8 max-w-3xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="-ml-4 text-muted-foreground">
                    <Link href="/builder/sites">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <CreateSiteForm locale={locale} />
        </div>
    );
}

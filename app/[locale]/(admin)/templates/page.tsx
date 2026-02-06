'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { TemplateChooser } from '@/components/portfolio/TemplateChooser';
import { motion } from 'framer-motion';

export default function TemplatesPage() {
    const t = useTranslations('builder'); // Reusing builder translations for now, or add specific ones
    const router = useRouter();

    const handleTemplateSelect = (templateId: string | null) => {
        if (templateId) {
            // Redirect to site creation with pre-selected template
            router.push(`/sites/new?template=${templateId}`);
        } else {
            router.push('/sites/new');
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Professional Templates</h2>
                    <p className="text-muted-foreground">
                        Choose a starting point for your portfolio.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <TemplateChooser
                    selectedTemplateId={null} // No selection state needed here really, just the grid
                    onTemplateSelect={handleTemplateSelect}
                />
            </div>
        </div>
    );
}

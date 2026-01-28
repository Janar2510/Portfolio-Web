'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

export function CreateSiteForm({ locale }: { locale: string }) {
    const router = useRouter();

    useEffect(() => {
        router.replace(`/${locale}/sites/new`);
    }, [router, locale]);

    return null;
}

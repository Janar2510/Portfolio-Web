'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export function EditorForm() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const siteId = params.siteId as string;

    useEffect(() => {
        if (locale && siteId) {
            router.replace(`/${locale}/sites/${siteId}/edit`);
        } else if (locale) {
            router.replace(`/${locale}/sites`);
        }
    }, [router, locale, siteId]);

    return null;
}

'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Breadcrumbs() {
    const pathname = usePathname();
    const t = useTranslations('nav');

    // Split pathname and remove locale (first segment after slash)
    const segments = pathname.split('/').filter(Boolean).slice(1);

    return (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground font-medium overflow-x-auto no-scrollbar py-1">
            <Link
                href="/dashboard"
                className="hover:text-foreground transition-colors p-1 rounded-md hover:bg-white/5"
            >
                <Home className="w-4 h-4" />
            </Link>

            {segments.map((segment, index) => {
                const path = `/${segments.slice(0, index + 1).join('/')}`;
                const isLast = index === segments.length - 1;

                // Try to translate the segment, fallback to capitalized segment name
                let label = segment;
                try {
                    // Check if it's a UUID (likely a site ID)
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
                    if (isUuid) {
                        label = '...'; // Placeholder for long IDs
                    } else {
                        // Check if segment is a common nav key
                        label = t(segment as any) || segment.charAt(0).toUpperCase() + segment.slice(1);
                    }
                } catch (e) {
                    label = segment.charAt(0).toUpperCase() + segment.slice(1);
                }

                return (
                    <React.Fragment key={path}>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                        <Link
                            href={path}
                            className={`
                px-1.5 py-0.5 rounded-md hover:bg-white/5 transition-colors whitespace-nowrap
                ${isLast ? "text-foreground font-semibold" : "hover:text-foreground"}
              `}
                            aria-current={isLast ? 'page' : undefined}
                        >
                            {label}
                        </Link>
                    </React.Fragment>
                );
            })}
        </nav>
    );
}

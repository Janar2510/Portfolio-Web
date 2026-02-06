'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-8 border-b border-white/5", className)}>
            <div className="space-y-1.5">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-primary/60 bg-clip-text text-transparent">
                    {title}
                </h1>
                {description && (
                    <p className="text-muted-foreground text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-3 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

export type StatusType = 'draft' | 'published' | 'archived' | 'active';

interface StatusPillProps {
    status: StatusType | string;
    className?: string;
    showDot?: boolean;
}

export function StatusPill({ status, className, showDot = true }: StatusPillProps) {
    const normalizedStatus = status.toLowerCase() as StatusType;

    const variants = {
        draft: "bg-white/5 text-muted-foreground border-white/10",
        published: "bg-primary/10 text-primary border-primary/20 shadow-glow-soft",
        active: "bg-primary/10 text-primary border-primary/20 shadow-glow-soft",
        archived: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const labels = {
        draft: "Draft",
        published: "Published",
        active: "Active",
        archived: "Archived",
    };

    const variantClass = variants[normalizedStatus] || variants.draft;
    const label = labels[normalizedStatus] || status;

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
            variantClass,
            className
        )}>
            {showDot && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
            {label}
        </div>
    );
}

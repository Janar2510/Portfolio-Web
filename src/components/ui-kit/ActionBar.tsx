'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ActionBarProps {
    children: React.ReactNode;
    className?: string;
    position?: 'top' | 'bottom';
}

export function ActionBar({ children, className, position = 'bottom' }: ActionBarProps) {
    return (
        <div className={cn(
            "fixed left-0 right-0 z-40 px-6 py-4 transition-all duration-300 pointer-events-none",
            position === 'bottom' ? "bottom-0" : "top-16", // Top Nav is 16
            className
        )}>
            <div className={cn(
                "mx-auto max-w-4xl w-full pointer-events-auto",
                "bg-navy-950/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-8 py-4",
                "flex items-center justify-between gap-6"
            )}>
                {children}
            </div>
        </div>
    );
}

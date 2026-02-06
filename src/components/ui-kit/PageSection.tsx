'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

interface PageSectionProps extends HTMLMotionProps<'section'> {
    children: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    noPadding?: boolean;
}

export function PageSection({
    children,
    title,
    description,
    action,
    noPadding = false,
    className,
    ...props
}: PageSectionProps) {
    return (
        <motion.section
            variants={fadeUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className={cn(
                "w-full mb-12 last:mb-0",
                className
            )}
            {...props}
        >
            {(title || description || action) && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2">
                    <div className="flex-1 space-y-2">
                        {title && (
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground m-0">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="text-muted-foreground max-w-2xl m-0 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && (
                        <div className="flex-shrink-0">
                            {action}
                        </div>
                    )}
                </div>
            )}

            <div className={cn(
                "w-full",
                noPadding ? "" : "px-0"
            )}>
                {children}
            </div>
        </motion.section>
    );
}

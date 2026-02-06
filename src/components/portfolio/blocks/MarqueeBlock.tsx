'use client';

import React from 'react';
import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/domain/builder/portfolio';

export function MarqueeBlock({
    block,
    isEditing,
    ...props
}: {
    block: PortfolioBlock;
    isEditing: boolean;
    [key: string]: any;
}) {
    const content = (block.content as any) || { items: [] };
    const settings = (block.settings as any) || { speed: 'normal', direction: 'left', gap: 'medium', background: 'transparent' };

    const items = content.items || ['Marquee Item 1', 'Marquee Item 2', 'Marquee Item 3'];
    const speed = settings.speed === 'slow' ? 40 : settings.speed === 'fast' ? 10 : 20;
    const direction = settings.direction || 'left';
    const gap = settings.gap === 'small' ? 'gap-8' : settings.gap === 'large' ? 'gap-32' : 'gap-16';
    const isSolid = settings.background === 'solid' || settings.background === 'black';

    return (
        <BaseBlock block={block} isEditing={isEditing} {...props}>
            <div
                className={cn(
                    "w-full overflow-hidden py-12 flex relative z-10",
                    isSolid ? "bg-[var(--portfolio-background)]" : "bg-transparent"
                )}
            >
                {/* Gradient fades */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

                <div
                    className={cn(
                        "flex min-w-full shrink-0 items-center justify-around",
                        gap,
                        direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'
                    )}
                    style={{
                        animationDuration: `${speed}s`
                    }}
                >
                    {items.map((item: string, i: number) => (
                        <span key={i} className="text-4xl md:text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-[var(--portfolio-text)] to-[var(--portfolio-text)]/20 whitespace-nowrap" style={{ fontFamily: 'var(--portfolio-font-heading)' }}>
                            {item}
                        </span>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {items.map((item: string, i: number) => (
                        <span key={`dup-${i}`} className="text-4xl md:text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-[var(--portfolio-text)] to-[var(--portfolio-text)]/20 whitespace-nowrap" style={{ fontFamily: 'var(--portfolio-font-heading)' }}>
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </BaseBlock>
    );
}

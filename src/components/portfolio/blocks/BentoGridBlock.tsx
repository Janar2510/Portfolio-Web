'use client';

import React from 'react';
import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/domain/builder/portfolio';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export function BentoGridBlock({
    block,
    isEditing,
    ...props
}: {
    block: PortfolioBlock;
    isEditing: boolean;
    [key: string]: any;
}) {
    const content = (block.content as any) || { items: [] };
    const settings = (block.settings as any) || { columns: 3, gap: 'medium' };

    const items = content.items || [];
    const columns = settings.columns || 3;
    const gap = settings.gap === 'small' ? 'gap-2' : settings.gap === 'large' ? 'gap-6' : 'gap-4';

    const gridClass = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns as 2 | 3 | 4];

    return (
        <BaseBlock block={block} isEditing={isEditing} {...props}>
            <div className="container mx-auto px-6 py-12">
                <div className={cn("grid auto-rows-[minmax(180px,auto)]", gridClass, gap)}>
                    {items.map((item: any, i: number) => (
                        <div
                            key={item.id || i}
                            className={cn(
                                "group relative overflow-hidden rounded-3xl bg-[var(--portfolio-text)]/5 border border-[var(--portfolio-text)]/10 hover:border-[var(--portfolio-text)]/20 transition-all duration-500 hover:bg-[var(--portfolio-text)]/10",
                                item.col_span > 1 && `md:col-span-${item.col_span}`,
                                item.row_span > 1 && `md:row-span-${item.row_span}`
                            )}
                        >
                            <div className="absolute inset-0 z-0">
                                {item.image_url && (
                                    <Image
                                        src={item.image_url}
                                        alt={item.title || 'Bento image'}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-50 group-hover:opacity-70"
                                    />
                                )}
                            </div>

                            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                                <div>
                                    {item.type === 'stats' && (
                                        <div className="text-4xl font-bold mb-2 uppercase tracking-tighter" style={{ color: 'var(--portfolio-text)', fontFamily: 'var(--portfolio-font-heading)' }}>{item.description}</div>
                                    )}
                                    {(item.title && item.type !== 'image') && (
                                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--portfolio-text)', fontFamily: 'var(--portfolio-font-heading)' }}>{item.title}</h3>
                                    )}
                                    {(item.description && item.type !== 'stats' && item.type !== 'image') && (
                                        <p className="text-sm opacity-60" style={{ color: 'var(--portfolio-text)', fontFamily: 'var(--portfolio-font-body)' }}>{item.description}</p>
                                    )}
                                </div>

                                <div className="flex justify-between items-end">
                                    {item.type === 'image' && item.title && (
                                        <h3 className="text-lg font-bold text-[var(--portfolio-text)]">{item.title}</h3>
                                    )}
                                    <div className="p-2 rounded-full bg-[var(--portfolio-text)]/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="w-4 h-4 text-[var(--portfolio-text)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BaseBlock>
    );
}

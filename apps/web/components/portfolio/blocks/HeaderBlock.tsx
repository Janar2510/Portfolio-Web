'use client';

import { BaseBlock } from './BaseBlock';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import { Link as ScrollLink } from 'react-scroll'; // Optional if we want smooth scroll
import Link from 'next/link';

interface HeaderBlockProps {
    block: PortfolioBlock;
    isEditing?: boolean;
    onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
    onDelete?: () => void;
    onAddAfter?: (blockType: string) => void;
    onEdit?: (block: PortfolioBlock) => void;
}

export function HeaderBlock({
    block,
    isEditing = false,
    onUpdate,
    onDelete,
    onAddAfter,
    onEdit,
}: HeaderBlockProps) {
    const content = block.content as any;
    const settings = block.settings as any;

    const getLayoutStyle = () => {
        switch (settings.layout) {
            case 'centered':
                return 'flex-col items-center gap-4';
            case 'split':
                return 'justify-between';
            case 'simple':
            default:
                return 'justify-between items-center';
        }
    };

    return (
        <BaseBlock
            block={block}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddAfter={onAddAfter}
            onEdit={onEdit}
            className={cn("w-full z-50", settings.sticky ? "sticky top-0 bg-background/80 backdrop-blur-md" : "")}
        >
            <header
                className={cn(
                    'flex px-6 py-4 border-b w-full',
                    getLayoutStyle(),
                    settings.background_color && `bg-[${settings.background_color}]`,
                    settings.text_color && `text-[${settings.text_color}]`
                )}
            >
                <div className="font-bold text-xl tracking-tight">
                    {content.logo_image ? (
                        <img src={content.logo_image} alt="Logo" className="h-8 md:h-10" />
                    ) : (
                        <span>{content.logo_text || 'My Portfolio'}</span>
                    )}
                </div>

                <nav className="flex gap-6 items-center">
                    {content.links?.map((link: any, i: number) => (
                        <Link
                            key={i}
                            href={link.url}
                            className="text-sm font-medium hover:text-primary transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </header>
        </BaseBlock>
    );
}

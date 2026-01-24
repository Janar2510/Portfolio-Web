'use client';

import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import { Github, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

interface FooterBlockProps {
    block: PortfolioBlock;
    isEditing?: boolean;
    onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
    onDelete?: () => void;
    onAddAfter?: (blockType: string) => void;
    onEdit?: (block: PortfolioBlock) => void;
}

export function FooterBlock({
    block,
    isEditing = false,
    onUpdate,
    onDelete,
    onAddAfter,
    onEdit,
}: FooterBlockProps) {
    const content = block.content as any;
    const settings = block.settings as any;

    const socialIcons: any = {
        github: Github,
        twitter: Twitter,
        linkedin: Linkedin,
        instagram: Instagram,
        youtube: Youtube,
    };

    return (
        <BaseBlock
            block={block}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddAfter={onAddAfter}
            onEdit={onEdit}
            className="w-full"
        >
            <footer
                className={cn(
                    'py-12 px-6 border-t',
                    settings.background_color ? `bg-[${settings.background_color}]` : 'bg-muted/30',
                    settings.text_color && `text-[${settings.text_color}]`
                )}
            >
                <div className={cn(
                    "max-w-6xl mx-auto flex flex-col md:flex-row gap-8",
                    settings.layout === 'centered' ? "items-center text-center" : "justify-between items-center"
                )}>
                    <div className="text-sm text-muted-foreground">
                        {content.copyright_text}
                    </div>

                    <div className="flex gap-4">
                        {content.social_links?.map((link: any, i: number) => {
                            const Icon = socialIcons[link.platform] || Github;
                            return (
                                <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Icon className="h-5 w-5" />
                                </a>
                            );
                        })}
                    </div>
                </div>
            </footer>
        </BaseBlock>
    );
}

'use client';

import { BaseBlock } from './BaseBlock';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import { Globe, Phone, MapPin, ArrowRight } from 'lucide-react';

interface SplitHeroBlockProps {
    block: PortfolioBlock;
    isEditing?: boolean;
    onUpdate?: (
        content: Record<string, unknown>,
        settings?: Record<string, unknown>
    ) => void;
    onDelete?: () => void;
    onAddAfter?: (blockType: string) => void;
    onEdit?: (block: PortfolioBlock) => void;
}

export function SplitHeroBlock({
    block,
    isEditing = false,
    onUpdate,
    onDelete,
    onAddAfter,
    onEdit,
}: SplitHeroBlockProps) {
    const content = block.content as any;
    const settings = block.settings as any;

    return (
        <BaseBlock
            block={block}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddAfter={onAddAfter}
            onEdit={onEdit}
            className="w-full bg-[#000000] text-white"
        >
            <section className="relative flex w-full flex-col overflow-hidden min-h-[85vh] md:flex-row">
                {/* Left Side: Content */}
                <div className="flex w-full flex-col justify-between p-8 md:w-1/2 md:p-12 lg:w-3/5 lg:p-20">
                    <div>
                        {/* Logo area */}
                        <div className="mb-16 flex items-center gap-3">
                            {content.logo_image ? (
                                <img src={content.logo_image} alt="Logo" className="h-10 w-10 rounded-md object-cover" />
                            ) : (
                                <div className="h-10 w-10 bg-zinc-800 rounded-md flex items-center justify-center font-bold text-xs uppercase">Logo</div>
                            )}
                            <div>
                                <h4 className="text-lg font-bold leading-none tracking-tight">
                                    {content.logo_text || "Your Logo"}
                                </h4>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                                    {content.slogan || "ELEVATE YOUR PERSPECTIVE"}
                                </p>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="max-w-xl animate-in fade-in slide-in-from-left-4 duration-700">
                            <h1 className="text-5xl font-extrabold leading-[1.1] md:text-7xl lg:text-[5.5rem] tracking-tight text-white mb-6">
                                {content.title || "Each Peak Teaches Something"}
                            </h1>

                            {/* Specialized Red Separator Line */}
                            <div className="h-1.5 w-24 bg-[#e11d48] mb-10" />

                            <p className="mb-12 text-lg md:text-xl text-zinc-400 font-medium leading-relaxed max-w-lg">
                                {content.subtitle || "Discover breathtaking landscapes and challenge yourself with our guided mountain expeditions. Join a community of adventurers."}
                            </p>

                            <a
                                href={content.cta_link || "#"}
                                className="group flex items-center gap-3 text-sm font-black tracking-[0.2em] uppercase text-white hover:text-[#e11d48] transition-colors"
                            >
                                {content.cta_text || "JOIN US TO EXPLORE"}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                            </a>
                        </div>
                    </div>

                    {/* Bottom Info Grid */}
                    <div className="mt-20 grid grid-cols-1 gap-8 text-[11px] font-bold text-zinc-500 sm:grid-cols-3 border-t border-zinc-800/50 pt-10 uppercase tracking-wider">
                        <div className="flex items-center gap-3 group cursor-pointer hover:text-white transition-colors">
                            <Globe className="h-4 w-4 text-[#e11d48]" />
                            <span>{content.contact_info?.website || "yourwebsite.com"}</span>
                        </div>
                        <div className="flex items-center gap-3 group cursor-pointer hover:text-white transition-colors">
                            <Phone className="h-4 w-4 text-[#e11d48]" />
                            <span>{content.contact_info?.phone || "+1 (555) 123-4567"}</span>
                        </div>
                        <div className="flex items-center gap-3 group cursor-pointer hover:text-white transition-colors">
                            <MapPin className="h-4 w-4 text-[#e11d48]" />
                            <span>{content.contact_info?.address || "20 Fieldstone Dr, Roswell, GA"}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Slanted Image */}
                <div
                    className="relative w-full min-h-[400px] md:w-1/2 lg:w-2/5 overflow-hidden animate-in fade-in duration-1000"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                        style={{
                            backgroundImage: `url(${content.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000'})`,
                            clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)'
                        }}
                    />
                </div>
            </section>
        </BaseBlock>
    );
}

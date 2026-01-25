'use client';

import React from 'react';
import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import { ArrowDown } from 'lucide-react';

export function OrganicHeroBlock({
    block,
    isEditing = false,
    onUpdate,
    onDelete,
    onAddAfter,
    onEdit,
}: {
    block: PortfolioBlock;
    isEditing?: boolean;
    onUpdate: (content: any, settings?: any) => void;
    onDelete: () => void;
    onAddAfter?: (type: string) => void;
    onEdit?: (block: any) => void;
}) {
    const content = (block.content || {}) as any;

    return (
        <BaseBlock
            block={block}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddAfter={onAddAfter}
            onEdit={onEdit}
            className="bg-[#013328] text-[#E3DCD2] relative overflow-hidden"
        >
            <style jsx>{`
        .organic-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          filter: blur(80px);
          opacity: 0.6;
        }
        .blob {
          position: absolute;
          background: #CC8B65;
          border-radius: 50%;
          animation: flow 20s infinite alternate ease-in-out;
        }
        .blob-1 {
          width: 500px;
          height: 500px;
          top: -10%;
          left: -10%;
          background: #CC8B65;
        }
        .blob-2 {
          width: 600px;
          height: 600px;
          bottom: -20%;
          right: -10%;
          background: #100C0D;
          animation-delay: -5s;
        }
        .blob-3 {
          width: 400px;
          height: 400px;
          top: 30%;
          left: 50%;
          background: #CC8B65;
          opacity: 0.5;
          animation-delay: -10s;
        }
        @keyframes flow {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(100px, 50px) scale(1.1); }
          66% { transform: translate(-50px, 120px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .noise {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0.05;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>

            <div className="relative min-h-screen flex items-center justify-center px-6 py-24">
                {/* Background Elements */}
                <div className="organic-bg">
                    <div className="blob blob-1" />
                    <div className="blob blob-2" />
                    <div className="blob blob-3" />
                </div>
                <div className="noise" />

                {/* Content */}
                <div className="relative z-10 max-w-4xl text-center">
                    <p className="text-[#CC8B65] uppercase tracking-[0.4em] font-bold text-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        {content.slogan || "Nature in Harmony"}
                    </p>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif italic tracking-tight leading-[0.9] mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        {content.headline || "Organic Flow"}
                    </h1>
                    <p className="text-lg md:text-xl text-[#E3DCD2]/70 max-w-2xl mx-auto leading-relaxed mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
                        {content.subheadline || "A balanced exploration of form and function, inspired by the natural world and its effortless complexities."}
                    </p>
                    <div className="flex flex-col items-center gap-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600">
                        <button className="px-10 py-5 bg-[#CC8B65] text-[#100C0D] font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-xl shadow-[#000000]/20">
                            {content.cta_text || "Discover the Flow"}
                        </button>
                        <div className="animate-bounce mt-8 opacity-50">
                            <ArrowDown size={32} />
                        </div>
                    </div>
                </div>
            </div>
        </BaseBlock>
    );
}

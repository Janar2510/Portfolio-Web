'use client';

import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  ArrowUp,
} from 'lucide-react';

interface FooterBlockProps {
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
    facebook: Facebook,
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
          'w-full border-t transition-colors duration-500',
          settings.layout === 'large-minimal'
            ? 'bg-black border-white/5 py-20'
            : 'py-8 px-6',
          !settings.layout ||
            settings.layout === 'simple' ||
            settings.layout === 'centered'
            ? settings.background_color
              ? `bg-[${settings.background_color}]`
              : 'bg-muted/30'
            : '',
          settings.text_color && `text-[${settings.text_color}]`
        )}
      >
        {settings.layout === 'large-minimal' ? (
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
              <div>
                <a
                  href="#home"
                  className="text-3xl font-serif font-bold text-white mb-4 block tracking-tighter"
                >
                  {content.logo_text === 'ELENA.VANCE' ? (
                    <>
                      ELENA<span className="text-primary">.</span>VANCE
                    </>
                  ) : (
                    content.logo_text || 'ELENA.VANCE'
                  )}
                </a>
                <p className="text-slate-500 max-w-xs text-sm">
                  {content.bio_text ||
                    'Exploring the boundaries of visual expression.'}
                </p>
              </div>

              <div className="flex gap-6 mt-10 md:mt-0">
                {(
                  content.social_links || [
                    { platform: 'instagram', url: '#' },
                    { platform: 'twitter', url: '#' },
                    { platform: 'linkedin', url: '#' },
                    { platform: 'facebook', url: '#' },
                  ]
                ).map((link: any, i: number) => {
                  const Icon = socialIcons[link.platform] || Github;
                  return (
                    <a
                      key={i}
                      href={link.url}
                      className="w-12 h-12 bg-white/5 hover:bg-primary hover:text-white transition-all duration-300 rounded-full flex items-center justify-center text-slate-400 shadow-lg hover:shadow-primary/20"
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-8">
              <p className="text-slate-500 text-sm">
                {content.copyright_text ||
                  `© ${new Date().getFullYear()} Elena Vance.`}
              </p>

              <div className="flex space-x-8 text-xs font-bold uppercase tracking-widest text-slate-500">
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms
                </a>
              </div>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:text-white transition-colors group"
              >
                Back to top{' '}
                <ArrowUp
                  size={16}
                  className="group-hover:-translate-y-1 transition-transform"
                />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'max-w-6xl mx-auto flex flex-col md:flex-row gap-8',
              settings.layout === 'centered'
                ? 'items-center text-center'
                : 'justify-between items-center'
            )}
          >
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
        )}
      </footer>
    </BaseBlock>
  );
}

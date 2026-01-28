'use client';

import { BaseBlock } from './BaseBlock';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/domain/builder/portfolio';
import { Link as ScrollLink } from 'react-scroll'; // Optional if we want smooth scroll
import Link from 'next/link';
import { Instagram, Twitter, Linkedin } from 'lucide-react';

interface HeaderBlockProps {
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
      className={cn(
        'w-full z-50',
        settings.position === 'fixed'
          ? 'fixed top-0 left-0 transition-all duration-500'
          : '',
        settings.sticky && settings.position !== 'fixed'
          ? 'sticky top-0 bg-background/80 backdrop-blur-md'
          : ''
      )}
    >
      <header
        className={cn(
          'flex px-6 py-6 border-b w-full transition-all duration-300',
          getLayoutStyle(),
          settings.sticky && settings.position !== 'fixed'
            ? 'bg-background/80 backdrop-blur-md border-border/40'
            : settings.position === 'fixed'
              ? 'bg-transparent border-transparent'
              : 'bg-background',
          settings.background_color && `bg-[${settings.background_color}]`,
          'text-white' // Force white for Artisanal elite look
        )}
      >
        <div className="font-serif font-bold text-2xl tracking-tighter">
          {content.logo_image ? (
            <img
              src={content.logo_image}
              alt="Logo"
              className="h-8 md:h-10 hover:opacity-80 transition-opacity"
            />
          ) : (
            <span className="text-white">
              {content.logo_text === 'ELENA.VANCE' ||
              content.logo_text === 'Elena Vance' ? (
                <>
                  ELENA<span className="text-primary">.</span>VANCE
                </>
              ) : (
                content.logo_text || 'Portfolio'
              )}
            </span>
          )}
        </div>

        <nav className="flex gap-2 md:gap-10 items-center">
          {content.links?.map((link: any, i: number) => {
            const isAnchor = link.url?.startsWith('#');
            const target = isAnchor ? link.url.substring(1) : '';

            if (isAnchor) {
              return (
                <ScrollLink
                  key={i}
                  to={target}
                  spy={true}
                  smooth={true}
                  offset={-100}
                  duration={500}
                  containerId="preview-scroll-container" // Target the preview container
                  className="hidden sm:block text-[10px] font-extrabold tracking-[0.4em] uppercase px-2 py-1 transition-all cursor-pointer text-white/90 hover:text-white"
                >
                  {link.label}
                </ScrollLink>
              );
            }

            return (
              <Link
                key={i}
                href={link.url}
                className="hidden sm:block text-[10px] font-extrabold tracking-[0.4em] uppercase px-2 py-1 transition-all text-white/90 hover:text-white"
              >
                {link.label}
              </Link>
            );
          })}
          <Button size="sm" className="sm:hidden text-white" variant="ghost">
            Menu
          </Button>
        </nav>

        {/* Social Links on the right */}
        <div className="hidden sm:flex items-center gap-5">
          {content.social_links?.map((social: any, i: number) => {
            const Icon =
              social.platform === 'instagram'
                ? Instagram
                : social.platform === 'twitter'
                  ? Twitter
                  : social.platform === 'linkedin'
                    ? Linkedin
                    : null;
            if (!Icon) return null;
            return (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 hover:scale-110 hover:opacity-100 text-white"
              >
                <Icon size={18} />
              </a>
            );
          })}
        </div>
      </header>
    </BaseBlock>
  );
}

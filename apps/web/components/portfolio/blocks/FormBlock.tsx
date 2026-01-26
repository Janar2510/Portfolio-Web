'use client';

import { useState } from 'react';
import { BaseBlock } from './BaseBlock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import type { FormBlockContent, FormBlockSettings } from '@/lib/blocks/schema';
import { useEditorStore } from '@/stores/portfolio';

interface FormBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate?: (
    content: Record<string, unknown>,
    settings?: Record<string, unknown>
  ) => void;
  onDelete?: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
  siteId?: string; // Optional site_id for public pages
}

export function FormBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
  siteId: propSiteId,
}: FormBlockProps) {
  const content = block.content as FormBlockContent;
  const settings = block.settings as FormBlockSettings;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { currentPage } = useEditorStore();

  const fields = content.fields || ['name', 'email', 'message'];
  // Use prop siteId (for public pages) or currentPage site_id (for editor)
  const siteId = propSiteId || currentPage?.site_id;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditing || !siteId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data: Record<string, unknown> = {};

      // Collect form data
      fields.forEach(field => {
        const value = formData.get(field);
        if (value) {
          data[field] = value.toString();
        }
      });

      // Submit to public API
      const response = await fetch('/api/portfolio/public/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_id: siteId,
          form_type: content.form_type || 'contact',
          form_id: block.id,
          data: data,
          page_url:
            typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to submit form');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Failed to submit form. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <BaseBlock
        block={block}
        isEditing={isEditing}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddAfter={onAddAfter}
        className="w-full"
      >
        <section className="mx-auto w-full max-w-2xl px-4 py-16">
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-lg text-muted-foreground">
              {content.success_message ||
                'Thank you! We will get back to you soon.'}
            </p>
          </div>
        </section>
      </BaseBlock>
    );
  }

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
      <section
        className={cn(
          'mx-auto w-full px-4 py-16',
          settings.layout === 'split-with-info' ? 'max-w-7xl' : 'max-w-2xl'
        )}
      >
        {settings.layout !== 'split-with-info' && (
          <>
            {content.title && (
              <h2 className="mb-2 text-center text-3xl font-semibold">
                {content.title}
              </h2>
            )}
            {content.description && (
              <p className="mb-8 text-center text-muted-foreground">
                {content.description}
              </p>
            )}
          </>
        )}

        <div
          className={cn(
            'w-full',
            settings.layout === 'split-with-info' &&
              'grid grid-cols-1 lg:grid-cols-2 gap-20 items-start'
          )}
        >
          {settings.layout === 'split-with-info' && (
            <div>
              <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-primary mb-4">
                Get In Touch
              </h2>
              <h3 className="text-5xl md:text-6xl font-serif font-bold mb-8">
                {content.title || "Let's Create Something Epic"}
              </h3>
              <p className="text-muted-foreground text-lg mb-12 leading-relaxed">
                {content.description ||
                  'Available for collaborations, commissions, and speaking engagements worldwide.'}
              </p>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-primary border border-white/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Email Me
                    </p>
                    <p className="font-medium">
                      {(content as any).contact_info?.email ||
                        'hello@example.com'}
                    </p>
                  </div>
                </div>
                {/* Location */}
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-primary border border-white/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Location
                    </p>
                    <p className="font-medium">
                      {(content as any).contact_info?.location ||
                        'Remote Worldwide'}
                    </p>
                  </div>
                </div>
                {/* Phone */}
                {(content as any).contact_info?.phone && (
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-primary border border-white/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Let's Talk
                      </p>
                      <p className="font-medium text-white">
                        {(content as any).contact_info.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={cn(
              'space-y-4',
              settings.layout === 'two-column' &&
                'md:grid md:grid-cols-2 md:gap-4',
              settings.layout === 'split-with-info' &&
                'p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm'
            )}
          >
            {fields.includes('name') && (
              <div
                className={
                  settings.layout === 'two-column' ? 'md:col-span-2' : ''
                }
              >
                <Label
                  htmlFor="name"
                  className={
                    settings.layout === 'split-with-info'
                      ? 'text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block'
                      : ''
                  }
                >
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  disabled={isEditing || isSubmitting}
                  className={
                    settings.layout === 'split-with-info'
                      ? 'bg-black/40 border-white/10 rounded-2xl px-6 py-4 h-auto focus-visible:ring-primary/50'
                      : ''
                  }
                  placeholder={
                    settings.layout === 'split-with-info'
                      ? 'John Doe'
                      : undefined
                  }
                />
              </div>
            )}

            {fields.includes('email') && (
              <div>
                <Label
                  htmlFor="email"
                  className={
                    settings.layout === 'split-with-info'
                      ? 'text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block'
                      : ''
                  }
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isEditing || isSubmitting}
                  className={
                    settings.layout === 'split-with-info'
                      ? 'bg-black/40 border-white/10 rounded-2xl px-6 py-4 h-auto focus-visible:ring-primary/50'
                      : ''
                  }
                  placeholder={
                    settings.layout === 'split-with-info'
                      ? 'john@example.com'
                      : undefined
                  }
                />
              </div>
            )}

            {fields.includes('phone') && (
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  disabled={isEditing || isSubmitting}
                  className={
                    settings.layout === 'split-with-info'
                      ? 'bg-black/40 border-white/10 rounded-2xl px-6 py-4 h-auto focus-visible:ring-primary/50'
                      : ''
                  }
                />
              </div>
            )}

            {fields.includes('company') && (
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  disabled={isEditing || isSubmitting}
                  className={
                    settings.layout === 'split-with-info'
                      ? 'bg-black/40 border-white/10 rounded-2xl px-6 py-4 h-auto focus-visible:ring-primary/50'
                      : ''
                  }
                />
              </div>
            )}

            {fields.includes('message') && (
              <div
                className={
                  settings.layout === 'two-column' ? 'md:col-span-2' : ''
                }
              >
                <Label
                  htmlFor="message"
                  className={
                    settings.layout === 'split-with-info'
                      ? 'text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block'
                      : ''
                  }
                >
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  disabled={isEditing || isSubmitting}
                  className={
                    settings.layout === 'split-with-info'
                      ? 'bg-black/40 border-white/10 rounded-2xl px-6 py-4 focus-visible:ring-primary/50 resize-none'
                      : ''
                  }
                  placeholder={
                    settings.layout === 'split-with-info'
                      ? 'Tell me about your project...'
                      : undefined
                  }
                />
              </div>
            )}

            {submitError && (
              <div
                className={cn(
                  'rounded-lg border border-error-main bg-error-light p-3 text-sm text-error-main',
                  settings.layout === 'two-column' && 'md:col-span-2'
                )}
              >
                {submitError}
              </div>
            )}

            <div
              className={cn(
                'flex',
                settings.layout === 'two-column' && 'md:col-span-2',
                settings.button_align === 'center' && 'justify-center',
                settings.button_align === 'right' && 'justify-end'
              )}
            >
              <Button
                type="submit"
                variant={
                  settings.button_style === 'secondary'
                    ? 'secondary'
                    : settings.button_style === 'outline'
                      ? 'outline'
                      : 'default'
                }
                disabled={isEditing || isSubmitting || !siteId}
                className={
                  settings.layout === 'split-with-info'
                    ? 'w-full py-6 rounded-2xl text-lg font-bold shadow-xl hover:translate-y-[-2px] transition-transform'
                    : ''
                }
              >
                {isSubmitting
                  ? 'Submitting...'
                  : content.submit_text || 'Submit'}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </BaseBlock>
  );
}

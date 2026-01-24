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
  onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
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
      fields.forEach((field) => {
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
          page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to submit form');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
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
              {content.success_message || 'Thank you! We will get back to you soon.'}
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
      <section className="mx-auto w-full max-w-2xl px-4 py-16">
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

        <form
          onSubmit={handleSubmit}
          className={cn(
            'space-y-4',
            settings.layout === 'two-column' && 'md:grid md:grid-cols-2 md:gap-4'
          )}
        >
          {fields.includes('name') && (
            <div className={settings.layout === 'two-column' ? 'md:col-span-2' : ''}>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required disabled={isEditing || isSubmitting} />
            </div>
          )}

          {fields.includes('email') && (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isEditing || isSubmitting}
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
              />
            </div>
          )}

          {fields.includes('company') && (
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" disabled={isEditing || isSubmitting} />
            </div>
          )}

          {fields.includes('message') && (
            <div className={settings.layout === 'two-column' ? 'md:col-span-2' : ''}>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={6}
                required
                disabled={isEditing || isSubmitting}
              />
            </div>
          )}

          {submitError && (
            <div className={cn(
              'rounded-lg border border-error-main bg-error-light p-3 text-sm text-error-main',
              settings.layout === 'two-column' && 'md:col-span-2'
            )}>
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
            >
              {isSubmitting ? 'Submitting...' : content.submit_text || 'Submit'}
            </Button>
          </div>
        </form>
      </section>
    </BaseBlock>
  );
}

"use client";

import { useMemo, useState } from 'react';
import { useEditorStore } from '@/stores/portfolio';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const getLocalizedValue = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const localized = value as Record<string, string>;
    return localized.en || localized.et || '';
  }
  return '';
};

const setLocalizedValue = (value: unknown, nextValue: string) => {
  if (value && typeof value === 'object') {
    return { ...(value as Record<string, string>), en: nextValue, et: nextValue };
  }
  return nextValue;
};

export function ContactStep() {
  const { draftConfig, updateDraftConfig, updateSectionContent } =
    useEditorStore();
  const [socialsValue, setSocialsValue] = useState<string | null>(null);

  const sectionIds = draftConfig?.sections.order || [];
  const contactSectionId = useMemo(
    () => sectionIds.find(id => id.startsWith('contact')),
    [sectionIds]
  );

  if (!draftConfig || !contactSectionId) {
    return (
      <div className="text-sm text-muted-foreground" style={{ padding: 'var(--space-4)' }}>
        Pick a template with a contact section to edit your contact info.
      </div>
    );
  }

  const content = draftConfig.sections.content[contactSectionId] || {};
  const socials = (content as any).socials || [];

  const handleSocialsChange = (value: string) => {
    setSocialsValue(value);
    const nextSocials = value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(url => ({ platform: 'link', url }));

    updateSectionContent(contactSectionId, {
      socials: nextSocials,
    });
  };

  return (
    <div
      className="flex flex-col"
      style={{ gap: 'var(--card-gap)', padding: 'var(--space-4)' }}
    >
      <GradientBorderCard>
        <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <div>
            <h3 className="text-sm font-semibold">SEO basics</h3>
            <p className="text-xs text-muted-foreground">
              These fields appear in search results and link previews.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="seo-title" className="text-xs">
              SEO title
            </Label>
            <Input
              id="seo-title"
              value={draftConfig.seo_title || ''}
              onChange={event =>
                updateDraftConfig({
                  seo_title: event.target.value,
                })
              }
            />
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="seo-description" className="text-xs">
              SEO description
            </Label>
            <Textarea
              id="seo-description"
              value={draftConfig.seo_description || ''}
              onChange={event =>
                updateDraftConfig({
                  seo_description: event.target.value,
                })
              }
              rows={4}
            />
          </div>
        </div>
      </GradientBorderCard>

      <GradientBorderCard>
        <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <div>
            <h3 className="text-sm font-semibold">Contact details</h3>
            <p className="text-xs text-muted-foreground">
              Add the ways clients can reach you.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="contact-email" className="text-xs">
              Email
            </Label>
            <Input
              id="contact-email"
              value={(content as any).email || ''}
              onChange={event =>
                updateSectionContent(contactSectionId, {
                  email: event.target.value,
                })
              }
            />
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="contact-phone" className="text-xs">
              Phone
            </Label>
            <Input
              id="contact-phone"
              value={(content as any).phone || ''}
              onChange={event =>
                updateSectionContent(contactSectionId, {
                  phone: event.target.value,
                })
              }
            />
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="contact-location" className="text-xs">
              Location
            </Label>
            <Input
              id="contact-location"
              value={getLocalizedValue((content as any).location)}
              onChange={event =>
                updateSectionContent(contactSectionId, {
                  location: setLocalizedValue(
                    (content as any).location,
                    event.target.value
                  ),
                })
              }
            />
          </div>
        </div>
      </GradientBorderCard>

      <GradientBorderCard>
        <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <div>
            <h3 className="text-sm font-semibold">Social links</h3>
            <p className="text-xs text-muted-foreground">
              Paste one URL per line for social links.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="contact-socials" className="text-xs">
              Social URLs
            </Label>
            <Textarea
              id="contact-socials"
              value={
                socialsValue ?? socials.map((item: any) => item.url).join('\n')
              }
              onChange={event => handleSocialsChange(event.target.value)}
              rows={5}
            />
          </div>
        </div>
      </GradientBorderCard>
    </div>
  );
}

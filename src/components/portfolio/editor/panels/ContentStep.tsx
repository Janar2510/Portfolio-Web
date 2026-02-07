'use client';

import { useMemo } from 'react';
import { useEditorStore } from '@/stores/portfolio';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

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

export function ContentStep() {
  const {
    draftConfig,
    updateDraftConfig,
    updateSectionContent,
  } = useEditorStore();

  const sectionIds = draftConfig?.sections.order || [];
  const sectionContent = draftConfig?.sections.content || {};
  const sectionVisibility = draftConfig?.sections.visibility || {};

  const sectionByType = useMemo(() => {
    const map = new Map<string, string>();
    sectionIds.forEach(id => {
      const type = id.split('-')[0];
      if (!map.has(type)) {
        map.set(type, id);
      }
    });
    return map;
  }, [sectionIds]);

  if (!draftConfig) {
    return (
      <div className="text-sm text-muted-foreground" style={{ padding: 'var(--space-4)' }}>
        Pick a template to start editing your content.
      </div>
    );
  }

  const heroId = sectionByType.get('hero');
  const aboutId = sectionByType.get('about');
  const projectsId = sectionByType.get('projects');
  const contactId = sectionByType.get('contact');
  const footerId = sectionByType.get('footer');

  const heroContent = heroId ? sectionContent[heroId] || {} : {};
  const aboutContent = aboutId ? sectionContent[aboutId] || {} : {};
  const projectsContent = projectsId ? sectionContent[projectsId] || {} : {};
  const contactContent = contactId ? sectionContent[contactId] || {} : {};
  const footerContent = footerId ? sectionContent[footerId] || {} : {};

  return (
    <div
      className="flex flex-col"
      style={{ gap: 'var(--card-gap)', padding: 'var(--space-4)' }}
    >
      <GradientBorderCard>
        <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <div>
            <h3 className="text-sm font-semibold">Site basics</h3>
            <p className="text-xs text-muted-foreground">
              This text powers your page header and SEO description.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="site-title" className="text-xs">
              Site title
            </Label>
            <Input
              id="site-title"
              value={draftConfig.siteTitle || ''}
              onChange={event =>
                updateDraftConfig({ siteTitle: event.target.value })
              }
            />
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <Label htmlFor="site-bio" className="text-xs">
              Short bio (SEO description)
            </Label>
            <Textarea
              id="site-bio"
              value={draftConfig.bio || ''}
              onChange={event =>
                updateDraftConfig({ bio: event.target.value })
              }
            />
          </div>
        </div>
      </GradientBorderCard>

      {heroId && (
        <GradientBorderCard>
          <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
            <div>
              <h3 className="text-sm font-semibold">Hero section</h3>
              <p className="text-xs text-muted-foreground">
                Main headline and call-to-action.
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <Label htmlFor="hero-headline" className="text-xs">
                Headline
              </Label>
              <Input
                id="hero-headline"
                value={getLocalizedValue((heroContent as any).headline)}
                onChange={event =>
                  updateSectionContent(heroId, {
                    headline: setLocalizedValue(
                      (heroContent as any).headline,
                      event.target.value
                    ),
                  })
                }
              />
            </div>

            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <Label htmlFor="hero-subheadline" className="text-xs">
                Subheadline
              </Label>
              <Textarea
                id="hero-subheadline"
                value={getLocalizedValue((heroContent as any).subheadline)}
                onChange={event =>
                  updateSectionContent(heroId, {
                    subheadline: setLocalizedValue(
                      (heroContent as any).subheadline,
                      event.target.value
                    ),
                  })
                }
              />
            </div>

            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <Label htmlFor="hero-cta" className="text-xs">
                Call-to-action label
              </Label>
              <Input
                id="hero-cta"
                value={getLocalizedValue((heroContent as any).ctaLabel)}
                onChange={event =>
                  updateSectionContent(heroId, {
                    ctaLabel: setLocalizedValue(
                      (heroContent as any).ctaLabel,
                      event.target.value
                    ),
                  })
                }
              />
            </div>
          </div>
        </GradientBorderCard>
      )}

      {aboutId && (
        <GradientBorderCard>
          <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
            <div>
              <h3 className="text-sm font-semibold">About section</h3>
              <p className="text-xs text-muted-foreground">Tell visitors who you are.</p>
            </div>

            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <Label htmlFor="about-body" className="text-xs">
                About text
              </Label>
              <Textarea
                id="about-body"
                value={getLocalizedValue((aboutContent as any).body)}
                onChange={event =>
                  updateSectionContent(aboutId, {
                    body: setLocalizedValue(
                      (aboutContent as any).body,
                      event.target.value
                    ),
                  })
                }
              />
            </div>
          </div>
        </GradientBorderCard>
      )}

      {projectsId && (
        <GradientBorderCard>
          <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
            <div>
              <h3 className="text-sm font-semibold">Projects section</h3>
              <p className="text-xs text-muted-foreground">
                Set the heading for your work.
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <Label htmlFor="projects-heading" className="text-xs">
                Heading
              </Label>
              <Input
                id="projects-heading"
                value={getLocalizedValue((projectsContent as any).heading)}
                onChange={event =>
                  updateSectionContent(projectsId, {
                    heading: setLocalizedValue(
                      (projectsContent as any).heading,
                      event.target.value
                    ),
                  })
                }
              />
            </div>
          </div>
        </GradientBorderCard>
      )}

      {contactId && (
        <GradientBorderCard>
          <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
            <div>
              <h3 className="text-sm font-semibold">Contact section</h3>
              <p className="text-xs text-muted-foreground">
                Show the heading above your contact info.
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <Label htmlFor="contact-heading" className="text-xs">
                Heading
              </Label>
              <Input
                id="contact-heading"
                value={getLocalizedValue((contactContent as any).heading)}
                onChange={event =>
                  updateSectionContent(contactId, {
                    heading: setLocalizedValue(
                      (contactContent as any).heading,
                      event.target.value
                    ),
                  })
                }
              />
            </div>
          </div>
        </GradientBorderCard>
      )}

      {footerId && (
        <GradientBorderCard>
          <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
            <div>
              <h3 className="text-sm font-semibold">Footer</h3>
              <p className="text-xs text-muted-foreground">
                Add the text shown at the bottom of your site.
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <Label htmlFor="footer-text" className="text-xs">
                Footer text
              </Label>
              <Input
                id="footer-text"
                value={getLocalizedValue((footerContent as any).text)}
                onChange={event =>
                  updateSectionContent(footerId, {
                    text: setLocalizedValue(
                      (footerContent as any).text,
                      event.target.value
                    ),
                  })
                }
              />
            </div>
          </div>
        </GradientBorderCard>
      )}

      <GradientBorderCard>
        <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <div>
            <h3 className="text-sm font-semibold">Section visibility</h3>
            <p className="text-xs text-muted-foreground">
              Toggle which sections appear on your site.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            {sectionIds.map(sectionId => (
              <label
                key={sectionId}
                className="flex items-center justify-between text-xs"
                style={{ gap: 'var(--space-2)' }}
              >
                <span className="text-muted-foreground">
                  {sectionId.replace(/-/g, ' ')}
                </span>
                <Checkbox
                  checked={sectionVisibility[sectionId] !== false}
                  onCheckedChange={checked => {
                    updateDraftConfig({
                      sections: {
                        ...draftConfig.sections,
                        visibility: {
                          ...draftConfig.sections.visibility,
                          [sectionId]: Boolean(checked),
                        },
                      },
                    });
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      </GradientBorderCard>
    </div>
  );
}

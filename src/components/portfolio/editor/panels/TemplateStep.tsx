/* eslint-disable @next/next/no-img-element */
'use client';

import { listTemplates, createDefaultConfig } from '@/domain/templates/registry';
import { useEditorStore } from '@/stores/portfolio';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Button } from '@/components/ui/button';

const TEMPLATE_GROUPS: Array<{ title: string; ids: string[] }> = [
  {
    title: 'Classic',
    ids: ['minimal', 'clean', 'professional'],
  },
  {
    title: 'Creative',
    ids: [
      'editorial',
      'artisanal-vision',
      'bento-grid',
      'marquee-portfolio',
    ],
  },
  {
    title: 'Bold',
    ids: ['neon-noir', 'swiss-style', 'brutalist', 'saas-modern'],
  },
];

export function TemplateStep() {
  const { setDraftConfig, setWizardStep, setHasUnsavedChanges } =
    useEditorStore();

  const templates = listTemplates();
  const groupedIds = new Set(
    TEMPLATE_GROUPS.flatMap(group => group.ids)
  );
  const remainingTemplates = templates.filter(
    template => !groupedIds.has(template.id)
  );

  const handleSelectTemplate = (templateId: string) => {
    const newConfig = createDefaultConfig(templateId as any);
    if (!newConfig) return;

    setDraftConfig(newConfig);
    setHasUnsavedChanges(true);
    setWizardStep('content');
  };

  return (
    <div className="flex flex-col">
      <div style={{ padding: 'var(--space-4)' }}>
        <h3 className="text-sm font-semibold">Choose a template</h3>
        <p className="text-xs text-muted-foreground">
          Pick a full website template and we will fill it with your content.
        </p>
      </div>

      <div
        className="flex flex-col"
        style={{
          gap: 'var(--card-gap)',
          padding: 'var(--space-4)',
        }}
      >
        {TEMPLATE_GROUPS.map(group => (
          <div key={group.title} className="flex flex-col">
            <div style={{ paddingBottom: 'var(--space-2)' }}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {group.title}
              </h4>
            </div>

            <div
              className="grid"
              style={{
                gap: 'var(--card-gap)',
                gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
              }}
            >
              {templates
                .filter(template => group.ids.includes(template.id))
                .map(template => (
                  <GradientBorderCard key={template.id}>
                    <div
                      className="flex flex-col"
                      style={{ padding: 'var(--space-4)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-semibold">
                            {template.name}
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSelectTemplate(template.id)}
                        >
                          Use Template
                        </Button>
                      </div>
                      {template.previewImage && (
                        <div
                          className="overflow-hidden rounded-lg border"
                          style={{
                            borderColor: 'hsl(var(--border-subtle))',
                            marginTop: 'var(--space-3)',
                          }}
                        >
                          <img
                            src={template.previewImage}
                            alt={`${template.name} preview`}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </GradientBorderCard>
                ))}
            </div>
          </div>
        ))}

        {remainingTemplates.length > 0 && (
          <div className="flex flex-col">
            <div style={{ paddingBottom: 'var(--space-2)' }}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                More templates
              </h4>
            </div>

            <div
              className="grid"
              style={{
                gap: 'var(--card-gap)',
                gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
              }}
            >
              {remainingTemplates.map(template => (
                <GradientBorderCard key={template.id}>
                  <div
                    className="flex flex-col"
                    style={{ padding: 'var(--space-4)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-semibold">
                          {template.name}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelectTemplate(template.id)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </GradientBorderCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Editor Sidebar Component
 * Left sidebar with block library, pages, and styles tabs
 */

'use client';

import { useEditorStore } from '@/stores/portfolio';
import { cn } from '@/lib/utils';
import { EDITOR_WIZARD_STEPS } from '@/lib/portfolio/editor-wizard';
import { Button } from '@/components/ui/button';
import { TemplateStep } from './panels/TemplateStep';
import { ContentStep } from './panels/ContentStep';
import { MediaStep } from './panels/MediaStep';
import { ThemeStep } from './panels/ThemeStep';
import { ContactStep } from './panels/ContactStep';
import { PublishStep } from './panels/PublishStep';

interface EditorSidebarProps {
  className?: string;
  siteId: string;
}

export function EditorSidebar({ className, siteId }: EditorSidebarProps) {
  const { wizardStep, setWizardStep } = useEditorStore();
  const stepIndex = EDITOR_WIZARD_STEPS.findIndex(
    step => step.id === wizardStep
  );
  const currentStep = EDITOR_WIZARD_STEPS[stepIndex] || EDITOR_WIZARD_STEPS[0];

  const stepContent = {
    template: <TemplateStep />,
    content: <ContentStep />,
    media: <MediaStep />,
    theme: <ThemeStep />,
    contact: <ContactStep />,
    publish: <PublishStep siteId={siteId} />,
  } as const;

  return (
    <div className={cn('bg-background flex flex-col', className)}>
      <div className="border-b" style={{ padding: 'var(--space-4)' }}>
        <h2 className="text-sm font-semibold">Build your site</h2>
        <p className="text-xs text-muted-foreground">
          Follow the steps to publish your portfolio.
        </p>
      </div>

      <div
        className="flex flex-col border-b"
        style={{ padding: 'var(--space-4)', gap: 'var(--space-2)' }}
      >
        {EDITOR_WIZARD_STEPS.map(step => (
          <Button
            key={step.id}
            variant={wizardStep === step.id ? 'default' : 'outline'}
            onClick={() => setWizardStep(step.id)}
            className="justify-between"
          >
            <span className="text-xs font-medium">{step.title}</span>
            <span className="text-[10px] text-muted-foreground">
              {step.id}
            </span>
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">{stepContent[currentStep.id]}</div>

      <div
        className="border-t"
        style={{ padding: 'var(--space-4)', gap: 'var(--space-2)' }}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() =>
              setWizardStep(
                EDITOR_WIZARD_STEPS[Math.max(stepIndex - 1, 0)].id
              )
            }
            disabled={stepIndex === 0}
          >
            Back
          </Button>
          <Button
            onClick={() =>
              setWizardStep(
                EDITOR_WIZARD_STEPS[
                  Math.min(stepIndex + 1, EDITOR_WIZARD_STEPS.length - 1)
                ].id
              )
            }
            disabled={stepIndex === EDITOR_WIZARD_STEPS.length - 1}
          >
            Next
          </Button>
        </div>
        <p
          className="text-[10px] text-muted-foreground"
          style={{ marginTop: 'var(--space-2)' }}
        >
          {currentStep.description}
        </p>
      </div>
    </div>
  );
}

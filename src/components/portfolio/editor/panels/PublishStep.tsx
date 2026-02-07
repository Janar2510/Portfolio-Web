"use client";

import { useEditorStore } from '@/stores/portfolio';
import { usePublishSite, useUnpublishSite, useSavePage } from '@/hooks/portfolio/use-editor';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PublishStepProps {
  siteId: string;
}

export function PublishStep({ siteId }: PublishStepProps) {
  const { hasUnsavedChanges, lastSavedAt, setLastSavedAt } = useEditorStore();
  const saveMutation = useSavePage();
  const publishMutation = usePublishSite();
  const unpublishMutation = useUnpublishSite();

  const handleSave = async () => {
    await saveMutation.mutateAsync();
    setLastSavedAt(new Date().toISOString());
  };

  return (
    <div
      className="flex flex-col"
      style={{ gap: 'var(--card-gap)', padding: 'var(--space-4)' }}
    >
      <GradientBorderCard>
        <div className="flex flex-col" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <div>
            <h3 className="text-sm font-semibold">Ready to publish?</h3>
            <p className="text-xs text-muted-foreground">
              Save your changes, then publish your site.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Save draft
          </Button>
          {lastSavedAt && !saveMutation.isPending && (
            <p className="text-xs text-muted-foreground">
              Last saved at {new Date(lastSavedAt).toLocaleTimeString()}
            </p>
          )}

          <div className="flex" style={{ gap: 'var(--space-2)' }}>
            <Button
              onClick={() => publishMutation.mutate(siteId)}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Publish
            </Button>
            <Button
              variant="outline"
              onClick={() => unpublishMutation.mutate(siteId)}
              disabled={unpublishMutation.isPending}
            >
              {unpublishMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Unpublish
            </Button>
          </div>
        </div>
      </GradientBorderCard>
    </div>
  );
}

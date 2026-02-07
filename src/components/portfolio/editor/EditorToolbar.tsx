/**
 * Editor Toolbar Component
 * Top toolbar with navigation, undo/redo, save, preview, and publish
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  MoreVertical,
} from 'lucide-react';
import { useEditorStore } from '@/stores/portfolio';
import { useRouter, useParams } from 'next/navigation';
import {
  useSavePage,
  usePublishSite,
  useUnpublishSite,
} from '@/hooks/portfolio/use-editor';
import { Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EDITOR_WIZARD_STEPS } from '@/lib/portfolio/editor-wizard';

interface EditorToolbarProps {
  siteId: string;
}

export function EditorToolbar({ siteId }: EditorToolbarProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const {
    previewMode,
    setPreviewMode,
    hasUnsavedChanges,
    lastSavedAt,
    setLastSavedAt,
    wizardStep,
  } = useEditorStore();

  const saveMutation = useSavePage();
  const publishMutation = usePublishSite();
  const unpublishMutation = useUnpublishSite();

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync();
      setLastSavedAt(new Date().toISOString());
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(siteId);
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  const handleUnpublish = async () => {
    try {
      if (confirm('Are you sure you want to unpublish your site?')) {
        await unpublishMutation.mutateAsync(siteId);
      }
    } catch (error) {
      console.error('Failed to unpublish:', error);
    }
  };

  const stepIndex = EDITOR_WIZARD_STEPS.findIndex(
    step => step.id === wizardStep
  );
  const currentStep =
    EDITOR_WIZARD_STEPS[stepIndex] || EDITOR_WIZARD_STEPS[0];

  return (
    <div
      className="border-b bg-background flex items-center justify-between"
      style={{
        height: 'calc(var(--space-8) + var(--space-6))',
        paddingInline: 'var(--space-4)',
      }}
    >
      {/* Left Section */}
      <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div
          className="w-px bg-border"
          style={{
            height: 'var(--space-6)',
            marginInline: 'var(--space-2)',
          }}
        />
        <span className="text-sm font-medium">
          Step {stepIndex + 1} of {EDITOR_WIZARD_STEPS.length}:{' '}
          {currentStep?.title}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
        {/* Device Preview Switcher */}
        <div
          className="flex items-center bg-muted rounded-md"
          style={{ gap: 'var(--space-1)', padding: 'var(--space-1)' }}
        >
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={previewMode === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        <div
          className="w-px bg-border"
          style={{
            height: 'var(--space-6)',
            marginInline: 'var(--space-2)',
          }}
        />

        {/* Save */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!hasUnsavedChanges || saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save
          {lastSavedAt && !saveMutation.isPending && (
            <span className="ml-2 text-xs text-muted-foreground">
              {new Date(lastSavedAt).toLocaleTimeString()}
            </span>
          )}
        </Button>

        {/* Publish */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={publishMutation.isPending}>
              {publishMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                'Publish'
              )}
              <MoreVertical className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/${locale}/portfolio/${siteId}/publish`)}
              disabled={publishMutation.isPending}
            >
              Publish Site
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleUnpublish}
              disabled={unpublishMutation.isPending}
            >
              {unpublishMutation.isPending
                ? 'Unpublishing...'
                : 'Unpublish Site'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open('/s/home', '_blank')
              }
            >
              View Live Site
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

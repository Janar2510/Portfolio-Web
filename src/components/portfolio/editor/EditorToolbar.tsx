/**
 * Editor Toolbar Component
 * Top toolbar with navigation, undo/redo, save, preview, and publish
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Save,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Layout,
  Split,
  MoreVertical,
} from 'lucide-react';
import { useEditorStore, useHistoryStore } from '@/stores/portfolio';
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
import { cn } from '@/lib/utils';
import type { PortfolioPage } from '@/domain/builder/portfolio';

interface EditorToolbarProps {
  page: PortfolioPage;
  siteId: string;
}

export function EditorToolbar({ page, siteId }: EditorToolbarProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const {
    previewMode,
    setPreviewMode,
    view,
    setView,
    hasUnsavedChanges,
    lastSavedAt,
    setLastSavedAt,
  } = useEditorStore();
  const { canUndo, canRedo, undo, redo } = useHistoryStore();

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

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="h-6 w-px bg-border mx-2" />
        <span className="text-sm font-medium">Page: {page.title}</span>
      </div>

      {/* Center Section - View Controls */}
      <div className="flex items-center gap-1 bg-muted rounded-md p-1">
        <Button
          variant={view === 'canvas' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('canvas')}
        >
          <Layout className="h-4 w-4" />
        </Button>
        <Button
          variant={view === 'split' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('split')}
        >
          <Split className="h-4 w-4" />
        </Button>
        {view === 'preview' ? (
          <Button
            variant="default"
            size="sm"
            onClick={() => setView('canvas')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Exit Preview
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('preview')}
            title="Full Screen Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Device Preview Switcher */}
        {view === 'preview' && (
          <>
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
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
            <div className="h-6 w-px bg-border mx-2" />
          </>
        )}

        {/* Undo/Redo */}
        <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo()}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo()}>
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-2" />

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
                window.open(`/s/${page.slug || 'home'}`, '_blank')
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

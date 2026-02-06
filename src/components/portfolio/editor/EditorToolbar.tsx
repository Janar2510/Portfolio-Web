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
import { useEditorStore, useHistoryStore, useStylesStore } from '@/stores/portfolio';
import { useRouter, useParams } from 'next/navigation';
import {
  useSavePage,
  usePublishSite,
  useUnpublishSite,
} from '@/hooks/portfolio/use-editor';
import { Loader2, Palette as PaletteIcon, Type as TypeIcon, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { PortfolioPage } from '@/domain/builder/portfolio';
import { PRESET_PALETTES, PRESET_FONTS } from '@/lib/portfolio/constants';

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
  const { styles, setStyles } = useStylesStore();

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

  const applyPalette = (palette: typeof PRESET_PALETTES[0]) => {
    setStyles({
      ...styles,
      colors: palette.colors,
    } as any);
  };

  const applyFonts = (fontSet: typeof PRESET_FONTS[0]) => {
    setStyles({
      ...styles,
      typography: {
        ...styles?.typography,
        ...fontSet.fonts,
      },
    } as any);
  };

  const currentPrimary = styles?.colors?.primary;
  const currentFont = styles?.typography?.body;

  const currentPalette = PRESET_PALETTES.find(p => p.colors.primary === currentPrimary) || PRESET_PALETTES[0];
  const currentFontSet = PRESET_FONTS.find(f => f.fonts.body === currentFont) || PRESET_FONTS[0];

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

      {/* Center Section - View & Style Controls */}
      <div className="flex items-center gap-4">
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

        <div className="h-6 w-px bg-border mx-2" />

        {/* Theme Selectors */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8 px-3 border-primary/20 hover:border-primary/50 transition-colors">
                <PaletteIcon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Theme: {currentPalette.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 p-1">
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Color Palettes</div>
              {PRESET_PALETTES.map((palette) => (
                <DropdownMenuItem
                  key={palette.id}
                  onClick={() => applyPalette(palette)}
                  className="flex items-center justify-between py-2 rounded-md cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      <div className="w-4 h-4 rounded-full border border-border" style={{ background: palette.colors.background }} />
                      <div className="w-4 h-4 rounded-full border border-border" style={{ background: palette.colors.primary }} />
                    </div>
                    <span className="text-sm">{palette.name}</span>
                  </div>
                  {currentPrimary === palette.colors.primary && <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/10" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8 px-3 border-primary/20 hover:border-primary/50 transition-colors">
                <TypeIcon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Font: {currentFontSet.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 p-1">
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Font Presets</div>
              {PRESET_FONTS.map((font) => (
                <DropdownMenuItem
                  key={font.id}
                  onClick={() => applyFonts(font)}
                  className="flex items-center justify-between py-2 rounded-md cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium" style={{ fontFamily: font.fonts.heading }}>AaBbCc</span>
                    <span className="text-[10px] text-muted-foreground">{font.name}</span>
                  </div>
                  {currentFont === font.fonts.body && <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/10" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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

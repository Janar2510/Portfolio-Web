/**
 * Editor Canvas Component
 * Main editing area with drag-and-drop block support
 */

'use client';

import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/stores/portfolio';
import { PublicPortfolioPage } from '@/domain/renderer/PublicPortfolioPage';

interface EditorCanvasProps {
  previewMode: 'desktop' | 'tablet' | 'mobile';
}

export function EditorCanvas({ previewMode }: EditorCanvasProps) {
  const { draftConfig } = useEditorStore();

  const previewStyles = {
    desktop: 'w-full',
    tablet: 'max-w-3xl mx-auto',
    mobile: 'max-w-sm mx-auto',
  };

  const previewIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  const PreviewIcon = previewIcons[previewMode];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      <div
        className="flex items-center justify-center gap-2 border-b bg-background"
        style={{ padding: 'var(--space-2)' }}
      >
        <PreviewIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground capitalize">
          {previewMode} Preview
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <div
          className={cn(
            'min-h-full bg-background transition-all duration-300',
            previewStyles[previewMode]
          )}
          style={{
            padding: 'var(--space-4)',
          }}
        >
          {draftConfig ? (
            <PublicPortfolioPage config={draftConfig} />
          ) : (
            <div
              className="text-center text-muted-foreground"
              style={{ padding: 'var(--space-6)' }}
            >
              Pick a template to see your preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

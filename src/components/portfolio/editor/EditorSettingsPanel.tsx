/**
 * Editor Settings Panel Component
 * Right sidebar for block/page settings
 */

'use client';

import { useEffect } from 'react';
import { useEditorStore, useBlocksStore } from '@/stores/portfolio';
import { BlockSettingsPanel } from './panels/BlockSettingsPanel';
import { PageSettingsPanel } from './panels/PageSettingsPanel';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorSettingsPanelProps {
  className?: string;
}

export function EditorSettingsPanel({ className }: EditorSettingsPanelProps) {
  const {
    settingsPanelOpen,
    setSettingsPanelOpen,
    selectedBlockId,
    setSettingsPanelOpen: setPanelOpen,
  } = useEditorStore();
  const { selectedBlock } = useBlocksStore();

  // Auto-open panel when block is selected
  useEffect(() => {
    if (selectedBlockId && !settingsPanelOpen) {
      setPanelOpen(true);
    }
  }, [selectedBlockId, settingsPanelOpen, setPanelOpen]);

  if (!settingsPanelOpen) return null;

  return (
    <div className={cn('bg-background flex flex-col', className)}>
      <div className="h-14 border-b flex items-center justify-between px-4">
        <h3 className="font-semibold">
          {selectedBlock ? 'Block Settings' : 'Page Settings'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSettingsPanelOpen(false);
            if (selectedBlockId) {
              const { setSelectedBlockId } = useEditorStore.getState();
              setSelectedBlockId(null);
            }
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {selectedBlock ? (
          <BlockSettingsPanel key={selectedBlock.id} block={selectedBlock} />
        ) : (
          <PageSettingsPanel />
        )}
      </div>
    </div>
  );
}

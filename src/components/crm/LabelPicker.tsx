'use client';

import { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Label as LabelType } from '@/domain/crm/types';

interface LabelPickerProps {
  labels: LabelType[];
  selectedLabelIds: string[];
  onLabelsChange: (labelIds: string[]) => void;
  onCreateLabel?: (name: string, color: string) => Promise<LabelType>;
  entityType: 'person' | 'organization' | 'deal' | 'lead';
}

export function LabelPicker({
  labels,
  selectedLabelIds,
  onLabelsChange,
  onCreateLabel,
  entityType,
}: LabelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#6B7B8A');
  const [isCreating, setIsCreating] = useState(false);

  const selectedLabels = labels.filter(l => selectedLabelIds.includes(l.id));
  const availableLabels = labels.filter(l => !selectedLabelIds.includes(l.id));

  const handleToggleLabel = (labelId: string) => {
    if (selectedLabelIds.includes(labelId)) {
      onLabelsChange(selectedLabelIds.filter(id => id !== labelId));
    } else {
      onLabelsChange([...selectedLabelIds, labelId]);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !onCreateLabel) return;

    setIsCreating(true);
    try {
      const newLabel = await onCreateLabel(newLabelName.trim(), newLabelColor);
      onLabelsChange([...selectedLabelIds, newLabel.id]);
      setNewLabelName('');
      setNewLabelColor('#6B7B8A');
    } catch (error) {
      console.error('Error creating label:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const colorPresets = [
    '#6B7B8A', // Gray
    '#E74C3C', // Red
    '#E67E22', // Orange
    '#F39C12', // Yellow
    '#27AE60', // Green
    '#3498DB', // Blue
    '#9B59B6', // Purple
    '#E91E63', // Pink
  ];

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Tag className="h-4 w-4" />
            {selectedLabels.length > 0 ? (
              <span>{selectedLabels.length} labels</span>
            ) : (
              <span>Add labels</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Selected Labels */}
            {selectedLabels.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Selected
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedLabels.map(label => (
                    <Badge
                      key={label.id}
                      variant="secondary"
                      className="cursor-pointer gap-1"
                      style={{
                        backgroundColor: `${label.color}20`,
                        color: label.color,
                      }}
                      onClick={() => handleToggleLabel(label.id)}
                    >
                      {label.name}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available Labels */}
            {availableLabels.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Available
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableLabels.map(label => (
                    <Badge
                      key={label.id}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleToggleLabel(label.id)}
                    >
                      <div
                        className="mr-1 h-2 w-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Create New Label */}
            {onCreateLabel && (
              <div className="space-y-2 border-t pt-4">
                <Label className="text-xs text-muted-foreground">
                  Create new label
                </Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Label name"
                    value={newLabelName}
                    onChange={e => setNewLabelName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateLabel();
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Color:</Label>
                    <div className="flex gap-1">
                      {colorPresets.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`h-6 w-6 rounded border-2 transition-all ${
                            newLabelColor === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewLabelColor(color)}
                        />
                      ))}
                    </div>
                    <Input
                      type="color"
                      value={newLabelColor}
                      onChange={e => setNewLabelColor(e.target.value)}
                      className="h-6 w-12"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCreateLabel}
                    disabled={!newLabelName.trim() || isCreating}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Label
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Labels Display */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map(label => (
            <Badge
              key={label.id}
              variant="secondary"
              className="gap-1"
              style={{
                backgroundColor: `${label.color}20`,
                color: label.color,
              }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
              <button
                type="button"
                onClick={() => handleToggleLabel(label.id)}
                className="ml-1 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

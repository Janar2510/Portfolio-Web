'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PipelineStage } from '@/domain/crm/crm';

interface StageCustomizationProps {
  stages: PipelineStage[];
  onStageCreate: (data: Partial<PipelineStage>) => Promise<void>;
  onStageUpdate: (
    stageId: string,
    data: Partial<PipelineStage>
  ) => Promise<void>;
  onStageDelete: (stageId: string) => Promise<void>;
  onStagesReorder: (stages: PipelineStage[]) => void;
}

export function StageCustomization({
  stages,
  onStageCreate,
  onStageUpdate,
  onStageDelete,
  onStagesReorder,
}: StageCustomizationProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);

  const handleCreateStage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const sortOrder = stages.length;

    await onStageCreate({
      name: formData.get('name') as string,
      color: formData.get('color')?.toString() || undefined,
      probability: formData.get('probability')
        ? parseInt(formData.get('probability') as string)
        : undefined,
      is_won: formData.get('is_won') === 'true',
      is_lost: formData.get('is_lost') === 'true',
      sort_order: sortOrder,
    });

    // Reset form before closing dialog
    form.reset();
    setIsCreateDialogOpen(false);
  };

  const handleEditStage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStage) return;

    const formData = new FormData(e.currentTarget);

    await onStageUpdate(editingStage.id, {
      name: formData.get('name') as string,
      color: formData.get('color')?.toString() || undefined,
      probability: formData.get('probability')
        ? parseInt(formData.get('probability') as string)
        : undefined,
      is_won: formData.get('is_won') === 'true',
      is_lost: formData.get('is_lost') === 'true',
    });
    setIsEditDialogOpen(false);
    setEditingStage(null);
  };

  const handleDeleteStage = async (stageId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this stage? Deals in this stage will need to be moved.'
      )
    ) {
      return;
    }
    await onStageDelete(stageId);
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= stages.length) return;

    const newStages = [...stages];
    const [moved] = newStages.splice(index, 1);
    newStages.splice(newIndex, 0, moved);

    const reordered = newStages.map((stage, idx) => ({
      ...stage,
      sort_order: idx,
    }));

    onStagesReorder(reordered);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/30">Pipeline Stages</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Add Stage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-black/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem]" aria-describedby="create-stage-description">
            <form onSubmit={handleCreateStage}>
              <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
                <DialogTitle className="text-2xl font-bold tracking-tight text-white font-display uppercase">Create Stage</DialogTitle>
                <DialogDescription id="create-stage-description" className="sr-only">
                  Add a new stage to your sales pipeline.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Stage Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., Qualified"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        name="color"
                        type="color"
                        className="h-10 w-20"
                        defaultValue="#3b82f6"
                      />
                      <Input
                        type="text"
                        name="color"
                        placeholder="#3b82f6"
                        defaultValue="#3b82f6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Win Probability (%)</Label>
                    <Input
                      id="probability"
                      name="probability"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stage Type</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_won"
                        value="true"
                        className="rounded"
                      />
                      <span className="text-sm">Won Stage</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_lost"
                        value="true"
                        className="rounded"
                      />
                      <span className="text-sm">Lost Stage</span>
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 border-t border-white/5 bg-white/[0.01]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="rounded-xl text-white/40 hover:text-white"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam-sm">Create Stage</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 group/item hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
          >
            <div className="flex-1 flex items-center gap-4">
              <div
                className="text-white/10 hover:text-white/30 transition-colors"
              >
                <GripVertical className="h-4 w-4" />
              </div>
              <div
                className="h-5 w-5 rounded-lg shadow-glow-soft shrink-0"
                style={{ backgroundColor: stage.color || 'hsl(var(--primary))' }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white uppercase tracking-tight text-sm">{stage.name}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-0.5">
                  {stage.probability}% prob
                  {stage.is_won && <span className="text-emerald-400/60 ml-2">• WON</span>}
                  {stage.is_lost && <span className="text-red-400/60 ml-2">• LOST</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-white/5 text-white/20 hover:text-white"
                onClick={() => moveStage(index, 'up')}
                disabled={index === 0}
              >
                <Plus className="h-3.5 w-3.5 rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-white/5 text-white/20 hover:text-white"
                onClick={() => moveStage(index, 'down')}
                disabled={index === stages.length - 1}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-white/5 text-white/20 hover:text-white"
                onClick={() => {
                  setEditingStage(stage);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-white/5 text-white/10 hover:text-destructive transition-all"
                onClick={() => handleDeleteStage(stage.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent aria-describedby="edit-stage-description">
          {editingStage && (
            <form onSubmit={handleEditStage}>
              <DialogHeader>
                <DialogTitle>Edit Stage</DialogTitle>
                <DialogDescription id="edit-stage-description">Update stage information.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Stage Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingStage.name}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-color"
                        name="color"
                        type="color"
                        className="h-10 w-20"
                        defaultValue={editingStage.color || '#3b82f6'}
                      />
                      <Input
                        type="text"
                        name="color"
                        placeholder="#3b82f6"
                        defaultValue={editingStage.color || '#3b82f6'}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-probability">
                      Win Probability (%)
                    </Label>
                    <Input
                      id="edit-probability"
                      name="probability"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={editingStage.probability}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stage Type</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_won"
                        value="true"
                        defaultChecked={editingStage.is_won}
                        className="rounded"
                      />
                      <span className="text-sm">Won Stage</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_lost"
                        value="true"
                        defaultChecked={editingStage.is_lost}
                        className="rounded"
                      />
                      <span className="text-sm">Lost Stage</span>
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 border-t border-white/5 bg-white/[0.01]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingStage(null);
                  }}
                  className="rounded-xl text-white/40 hover:text-white"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam-sm px-6">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Play, Pause, CheckCircle2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { ABVariant } from '@/lib/services/analytics';

interface VariantManagerProps {
  experimentId: string;
}

export function VariantManager({ experimentId }: VariantManagerProps) {
  const queryClient = useQueryClient();
  const [editingVariant, setEditingVariant] = useState<ABVariant | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch variants
  const { data: variants = [] } = useQuery({
    queryKey: ['ab-variants', experimentId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ab_variants')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('is_control', { ascending: false })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as ABVariant[];
    },
  });

  // Create variant mutation
  const createVariantMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      is_control?: boolean;
      content_diff: Record<string, unknown>;
    }) => {
      const supabase = createClient();
      const { data: result, error } = await supabase
        .from('ab_variants')
        .insert({
          experiment_id: experimentId,
          ...data,
          is_control: data.is_control || false,
        })
        .select()
        .single();
      if (error) throw error;
      return result as ABVariant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ab-variants', experimentId],
      });
      setIsCreateOpen(false);
    },
  });

  // Update variant mutation
  const updateVariantMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; content_diff?: Record<string, unknown> };
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ab_variants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ABVariant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ab-variants', experimentId],
      });
      setEditingVariant(null);
    },
  });

  // Delete variant mutation
  const deleteVariantMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('ab_variants')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ab-variants', experimentId],
      });
    },
  });

  const hasControl = variants.some(v => v.is_control);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Variants</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Variant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Variant</DialogTitle>
              <DialogDescription>
                Add a new variant to test against the control
              </DialogDescription>
            </DialogHeader>
            <VariantForm
              isControl={!hasControl}
              onSubmit={data => {
                createVariantMutation.mutate({
                  name: data.name,
                  is_control: data.is_control,
                  content_diff: JSON.parse(data.content_diff || '{}'),
                });
              }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {variants.map(variant => (
          <Card key={variant.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {variant.name}
                  {variant.is_control && (
                    <Badge variant="outline" className="ml-2">
                      Control
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingVariant(variant)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {!variant.is_control && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteVariantMutation.mutate(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Visitors:</span>{' '}
                  <span className="font-medium">{variant.visitors}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Conversions:</span>{' '}
                  <span className="font-medium">{variant.conversions}</span>
                </div>
                {variant.visitors > 0 && (
                  <div>
                    <span className="text-muted-foreground">
                      Conversion Rate:
                    </span>{' '}
                    <span className="font-medium">
                      {((variant.conversions / variant.visitors) * 100).toFixed(
                        2
                      )}
                      %
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingVariant && (
        <Dialog
          open={!!editingVariant}
          onOpenChange={() => setEditingVariant(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Variant</DialogTitle>
              <DialogDescription>
                Update variant name and content differences
              </DialogDescription>
            </DialogHeader>
            <VariantForm
              variant={editingVariant}
              onSubmit={data => {
                updateVariantMutation.mutate({
                  id: editingVariant.id,
                  updates: {
                    name: data.name,
                    content_diff: JSON.parse(data.content_diff || '{}'),
                  },
                });
              }}
              onCancel={() => setEditingVariant(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface VariantFormProps {
  variant?: ABVariant;
  isControl?: boolean;
  onSubmit: (data: {
    name: string;
    is_control: boolean;
    content_diff: string;
  }) => void;
  onCancel: () => void;
}

function VariantForm({
  variant,
  isControl = false,
  onSubmit,
  onCancel,
}: VariantFormProps) {
  const [name, setName] = useState(variant?.name || '');
  const [contentDiff, setContentDiff] = useState(
    variant ? JSON.stringify(variant.content_diff, null, 2) : '{}'
  );
  const [isControlVariant, setIsControlVariant] = useState(
    variant?.is_control || isControl
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      JSON.parse(contentDiff); // Validate JSON
      onSubmit({
        name,
        is_control: isControlVariant,
        content_diff: contentDiff,
      });
    } catch (error) {
      alert('Invalid JSON in content differences');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="variant_name">Variant Name *</Label>
        <Input
          id="variant_name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Variant A, Red Button, etc."
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_control"
            checked={isControlVariant}
            onChange={e => setIsControlVariant(e.target.checked)}
            disabled={variant?.is_control}
          />
          <Label htmlFor="is_control">Control Variant</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          The control variant is the baseline version you're testing against
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content_diff">Content Differences (JSON) *</Label>
        <Textarea
          id="content_diff"
          value={contentDiff}
          onChange={e => setContentDiff(e.target.value)}
          placeholder='{"title": "New Title", "buttonText": "Click Me"}'
          rows={8}
          required
        />
        <p className="text-xs text-muted-foreground">
          JSON object describing what's different in this variant
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Variant</Button>
      </DialogFooter>
    </form>
  );
}

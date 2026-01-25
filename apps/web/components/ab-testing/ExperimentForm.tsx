'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { ABExperiment } from '@/lib/services/analytics';

interface ExperimentFormProps {
  siteId: string;
  pages: Array<{ id: string; title: string; slug: string }>;
  blocks: Array<{ id: string; block_type: string; page_id: string }>;
  onCreate: (experiment: {
    name: string;
    description?: string;
    target_type: 'page' | 'block' | 'style';
    target_id?: string;
    traffic_split: number;
    goal_type: 'pageview' | 'click' | 'form_submit';
    goal_target?: string;
  }) => Promise<void>;
}

export function ExperimentForm({
  siteId,
  pages,
  blocks,
  onCreate,
}: ExperimentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState<'page' | 'block' | 'style'>(
    'page'
  );
  const [targetId, setTargetId] = useState<string>('');
  const [trafficSplit, setTrafficSplit] = useState<number>(50);
  const [goalType, setGoalType] = useState<
    'pageview' | 'click' | 'form_submit'
  >('pageview');
  const [goalTarget, setGoalTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onCreate({
        name,
        description: description || undefined,
        target_type: targetType,
        target_id: targetId || undefined,
        traffic_split: trafficSplit,
        goal_type: goalType,
        goal_target: goalTarget || undefined,
      });
      setIsOpen(false);
      // Reset form
      setName('');
      setDescription('');
      setTargetType('page');
      setTargetId('');
      setTrafficSplit(50);
      setGoalType('pageview');
      setGoalTarget('');
    } catch (error) {
      console.error('Failed to create experiment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBlocks = targetType === 'block' ? blocks : [];
  const filteredPages = targetType === 'page' ? pages : [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Experiment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create A/B Test Experiment</DialogTitle>
          <DialogDescription>
            Create a new A/B test to compare different versions of your content
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Experiment Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Homepage Hero CTA Test"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What are you testing and why?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_type">What to Test *</Label>
            <Select
              value={targetType}
              onValueChange={v => setTargetType(v as any)}
            >
              <SelectTrigger id="target_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Page</SelectItem>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="style">Style</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetType === 'page' && (
            <div className="space-y-2">
              <Label htmlFor="target_page">Select Page *</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger id="target_page">
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPages.map(page => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title} ({page.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {targetType === 'block' && (
            <div className="space-y-2">
              <Label htmlFor="target_block">Select Block *</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger id="target_block">
                  <SelectValue placeholder="Select a block" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBlocks.map(block => (
                    <SelectItem key={block.id} value={block.id}>
                      {block.block_type} (Page:{' '}
                      {pages.find(p =>
                        blocks.find(
                          b => b.id === block.id && b.page_id === p.id
                        )
                      )?.title || 'Unknown'}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="traffic_split">Traffic Split (%)</Label>
            <Input
              id="traffic_split"
              type="number"
              min="1"
              max="99"
              value={trafficSplit}
              onChange={e => setTrafficSplit(parseInt(e.target.value) || 50)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Percentage of traffic to send to variant B (remaining goes to
              control)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal_type">Conversion Goal *</Label>
            <Select value={goalType} onValueChange={v => setGoalType(v as any)}>
              <SelectTrigger id="goal_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pageview">Pageview</SelectItem>
                <SelectItem value="click">Click</SelectItem>
                <SelectItem value="form_submit">Form Submit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {goalType === 'click' && (
            <div className="space-y-2">
              <Label htmlFor="goal_target">Target Element (CSS Selector)</Label>
              <Input
                id="goal_target"
                value={goalTarget}
                onChange={e => setGoalTarget(e.target.value)}
                placeholder="e.g., .cta-button, #signup-form"
              />
            </div>
          )}

          {goalType === 'form_submit' && (
            <div className="space-y-2">
              <Label htmlFor="goal_target">Form ID or Selector</Label>
              <Input
                id="goal_target"
                value={goalTarget}
                onChange={e => setGoalTarget(e.target.value)}
                placeholder="e.g., contact-form, #newsletter-form"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name || !targetType}
            >
              {isSubmitting ? 'Creating...' : 'Create Experiment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

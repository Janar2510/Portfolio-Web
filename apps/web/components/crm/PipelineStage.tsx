'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, GripVertical, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DealCard } from './DealCard';
import { cn } from '@/lib/utils';
import type { PipelineStage as PipelineStageType, Deal } from '@/lib/services/crm';

interface PipelineStageProps {
  stage: PipelineStageType;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onAddDeal?: (stageId: string) => void;
  onStageSettings?: (stage: PipelineStageType) => void;
}

function getDealDragId(dealId: string): string {
  return `deal-${dealId}`;
}

export function PipelineStage({
  stage,
  deals,
  onDealClick,
  onAddDeal,
  onStageSettings,
}: PipelineStageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `stage-${stage.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dealIds = deals.map((deal) => getDealDragId(deal.id));

  // Calculate total value for this stage
  const totalValue = deals.reduce((sum, deal) => {
    return sum + (deal.value || 0);
  }, 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex h-full min-w-[300px] flex-col rounded-lg border bg-muted/30',
        isDragging && 'opacity-50'
      )}
    >
      {/* Stage Header */}
      <div className="flex items-center gap-2 border-b p-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: stage.color || '#3b82f6' }}
        />
        <div className="flex-1">
          <h3 className="font-semibold">{stage.name}</h3>
          {stage.probability > 0 && (
            <div className="text-xs text-muted-foreground">
              {stage.probability}% probability
            </div>
          )}
        </div>
        {onStageSettings && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onStageSettings(stage)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Stage Stats */}
      <div className="border-b px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>{deals.length} deals</span>
          {totalValue > 0 && (
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                notation: 'compact',
              }).format(totalValue)}
            </span>
          )}
        </div>
      </div>

      {/* Deals */}
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={() => onDealClick(deal)}
            />
          ))}
          {deals.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No deals
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add Deal Button */}
      {onAddDeal && (
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onAddDeal(stage.id)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </div>
      )}
    </div>
  );
}

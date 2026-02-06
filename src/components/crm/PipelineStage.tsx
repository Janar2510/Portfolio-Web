'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, GripVertical, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DealCard } from './DealCard';
import { cn } from '@/lib/utils';
import type {
  PipelineStage as PipelineStageType,
  Deal,
  Contact,
  Company
} from '@/domain/crm/crm';

interface PipelineStageProps {
  stage: PipelineStageType;
  deals: Deal[];
  contacts: Contact[];
  companies: Company[];
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
  contacts,
  companies,
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

  const dealIds = deals.map(deal => getDealDragId(deal.id));

  // Calculate total value and weighted value for this stage
  const totalValue = deals.reduce((sum, deal) => {
    return sum + (deal.value || 0);
  }, 0);

  const weightedValue = totalValue * (stage.probability / 100);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex h-full min-w-[340px] max-w-[340px] flex-col rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-2xl transition-all duration-500',
        isDragging && 'opacity-30 ring-4 ring-primary/10 scale-[0.98] shadow-glow-soft'
      )}
    >
      {/* Stage Header */}
      <div className="flex flex-col gap-2 p-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 transition-colors"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <h3 className="uppercase tracking-[0.3em] text-[9px] font-black text-white/20">
              {stage.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40">
              {deals.length}
            </span>
            {onStageSettings && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/20 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all"
                onClick={() => onStageSettings(stage)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Value Stats */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold tracking-tight text-foreground font-display">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'EUR',
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(totalValue)}
          </span>
          {stage.probability > 0 && stage.probability < 100 && (
            <span className="text-xs text-muted-foreground">
              • {stage.probability}% prob.
            </span>
          )}
        </div>

        {/* Progress Bar for Probability */}
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-3 p-[1px]">
          <div
            className="h-full bg-primary rounded-full shadow-glow-seafoam-sm transition-all duration-1000 ease-out"
            style={{ width: `${stage.probability}%` }}
          />
        </div>

        {weightedValue > 0 && weightedValue !== totalValue && (
          <div className="text-[10px] text-white/30 font-mono mt-1">
            Weighted: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(weightedValue)}
          </div>
        )}

      </div>

      {/* Deals List */}
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          {deals.map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              contact={contacts.find(c => c.id === deal.contact_id)}
              company={companies.find(c => c.id === deal.company_id)}
              onClick={() => onDealClick(deal)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add Deal Button */}
      {onAddDeal && (
        <div className="p-4 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-white/20 hover:text-primary hover:bg-white/5 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-dashed border-white/10 hover:border-primary/40 transition-all duration-300"
            onClick={() => onAddDeal(stage.id)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Deal
          </Button>
        </div>
      )}
    </div>
  );
}

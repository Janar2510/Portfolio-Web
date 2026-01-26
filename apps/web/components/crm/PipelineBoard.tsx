'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PipelineStage } from './PipelineStage';
import { DealCard } from './DealCard';
import type {
  PipelineStage as PipelineStageType,
  Deal,
  Contact,
  Company,
} from '@/lib/services/crm';

interface PipelineBoardProps {
  stages: PipelineStageType[];
  deals: Deal[];
  contacts: Contact[];
  companies: Company[];
  onStagesReorder: (stages: PipelineStageType[]) => void;
  onDealMove: (
    dealId: string,
    newStageId: string,
    newSortOrder: number
  ) => void;
  onDealClick: (deal: Deal) => void;
  onAddDeal?: (stageId: string) => void;
  onStageSettings?: (stage: PipelineStageType) => void;
}

function getStageDragId(stageId: string): string {
  return `stage-${stageId}`;
}

function getDealDragId(dealId: string): string {
  return `deal-${dealId}`;
}

function getStageIdFromDragId(dragId: string): string {
  return dragId.replace('stage-', '');
}

function getDealIdFromDragId(dragId: string): string {
  return dragId.replace('deal-', '');
}

export function PipelineBoard({
  stages,
  deals,
  contacts,
  companies,
  onStagesReorder,
  onDealMove,
  onDealClick,
  onAddDeal,
  onStageSettings,
}: PipelineBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const dragId = event.active.id as string;

    if (dragId.startsWith('deal-')) {
      const dealId = getDealIdFromDragId(dragId);
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        setActiveDeal(deal);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveDeal(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Handle stage reordering
    if (activeIdStr.startsWith('stage-') && overIdStr.startsWith('stage-')) {
      const activeStageId = getStageIdFromDragId(activeIdStr);
      const overStageId = getStageIdFromDragId(overIdStr);

      const oldIndex = stages.findIndex(stage => stage.id === activeStageId);
      const newIndex = stages.findIndex(stage => stage.id === overStageId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newStages = arrayMove(stages, oldIndex, newIndex).map(
          (stage, index) => ({
            ...stage,
            sort_order: index,
          })
        );
        onStagesReorder(newStages);
      }
      return;
    }

    // Handle deal movement between stages
    if (activeIdStr.startsWith('deal-')) {
      const dealId = getDealIdFromDragId(activeIdStr);
      const deal = deals.find(d => d.id === dealId);
      if (!deal) return;

      // Moving to a stage
      if (overIdStr.startsWith('stage-')) {
        const newStageId = getStageIdFromDragId(overIdStr);
        const dealsInNewStage = deals.filter(d => d.stage_id === newStageId);
        const newSortOrder = dealsInNewStage.length;
        onDealMove(dealId, newStageId, newSortOrder);
        return;
      }

      // Moving within same stage or to another deal
      if (overIdStr.startsWith('deal-')) {
        const overDealId = getDealIdFromDragId(overIdStr);
        const overDeal = deals.find(d => d.id === overDealId);
        if (!overDeal) return;

        const newStageId = overDeal.stage_id;
        const dealsInStage = deals
          .filter(d => d.stage_id === newStageId && d.id !== dealId)
          .sort((a, b) => a.sort_order - b.sort_order);

        const overIndex = dealsInStage.findIndex(d => d.id === overDealId);
        const newSortOrder =
          overIndex >= 0 ? overIndex + 1 : dealsInStage.length;

        onDealMove(dealId, newStageId, newSortOrder);
        return;
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveDeal(null);
  };

  const stageIds = stages.map(stage => getStageDragId(stage.id));

  // Group deals by stage
  const dealsByStage = stages.reduce(
    (acc, stage) => {
      acc[stage.id] = deals
        .filter(deal => deal.stage_id === stage.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      return acc;
    },
    {} as Record<string, Deal[]>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full w-full gap-4 overflow-x-auto p-4 bg-muted/10">
        <SortableContext
          items={stageIds}
          strategy={horizontalListSortingStrategy}
        >
          {stages.map(stage => (
            <div key={stage.id} className="h-full flex-shrink-0">
              <PipelineStage
                stage={stage}
                deals={dealsByStage[stage.id] || []}
                contacts={contacts}
                companies={companies}
                onDealClick={onDealClick}
                onAddDeal={onAddDeal}
                onStageSettings={onStageSettings}
              />
            </div>
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeDeal && (
          <div className="w-64 rounded-lg border bg-background p-3 shadow-lg">
            <DealCard
              deal={activeDeal}
              contact={contacts.find(c => c.id === activeDeal.contact_id)}
              company={companies.find(c => c.id === activeDeal.company_id)}
              isDragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

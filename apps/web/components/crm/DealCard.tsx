'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, Building2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Deal } from '@/lib/services/crm';

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  isDragging?: boolean;
}

function getDealDragId(dealId: string): string {
  return `deal-${dealId}`;
}

export function DealCard({ deal, onClick, isDragging = false }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: getDealDragId(deal.id),
    disabled: isDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const isOverdue =
    deal.expected_close_date &&
    new Date(deal.expected_close_date) < new Date() &&
    !deal.actual_close_date;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'cursor-grab rounded-lg border bg-background p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
        isOverdue && 'border-orange-300 bg-orange-50/50'
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="flex-1 font-medium text-sm">{deal.title}</h4>
          {deal.probability !== null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {deal.probability}%
            </div>
          )}
        </div>

        {deal.value && (
          <div className="text-lg font-semibold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: deal.currency || 'EUR',
            }).format(deal.value)}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {deal.expected_close_date && (
            <div
              className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-orange-600'
              )}
            >
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(deal.expected_close_date).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                  }
                )}
              </span>
            </div>
          )}
          {deal.contact_id && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Contact</span>
            </div>
          )}
          {deal.company_id && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>Company</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

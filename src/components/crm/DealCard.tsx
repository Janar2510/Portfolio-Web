'use client';

import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, Building2, TrendingUp, AlertTriangle, Mail, Phone, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Deal, Contact, Company } from '@/domain/crm/crm';

interface DealCardProps {
  deal: Deal;
  contact?: Contact;
  company?: Company;
  onClick?: () => void;
  isDragging?: boolean;
}

function getDealDragId(dealId: string): string {
  return `deal-${dealId}`;
}

export function DealCard({ deal, contact, company, onClick, isDragging = false }: DealCardProps) {
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const isOverdue =
    mounted &&
    deal.expected_close_date &&
    new Date(deal.expected_close_date) < new Date() &&
    !deal.actual_close_date;

  const daysInStage = mounted && deal.stage_entered_at
    ? Math.floor((new Date().getTime() - new Date(deal.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isRotten = mounted && daysInStage > 30 && deal.status === 'open';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'group relative cursor-grab rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-sm backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04] hover:border-primary/30 active:cursor-grabbing hover:scale-[1.02] hover:shadow-glow-seafoam-sm',
        isOverdue && 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40 hover:shadow-glow-soft',
        isRotten && 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 hover:shadow-glow-soft'
      )}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-4">
          <h4 className="flex-1 font-bold text-base text-white line-clamp-2 leading-tight tracking-tight">
            {deal.title}
          </h4>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div className="space-y-2">
            {deal.value != null && (
              <div className="text-3xl font-bold text-white font-display tracking-tight leading-none">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: deal.currency || 'EUR',
                  maximumFractionDigits: 0,
                }).format(deal.value)}
              </div>
            )}
            <div className="flex items-center gap-2">
              {deal.probability !== null && (
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <TrendingUp className="h-3 w-3" />
                  <span>{deal.probability}%</span>
                </div>
              )}
              {isOverdue && (
                <span className="text-[10px] uppercase font-black tracking-widest text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20 shadow-glow-soft">
                  Overdue
                </span>
              )}
            </div>
          </div>

          {isRotten && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20 shadow-glow-soft">
                    <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Rotten: In stage for {daysInStage} days</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex flex-col gap-2.5 text-[11px] text-white/30 border-t border-white/5 pt-5 mt-4">
          {deal.expected_close_date && (
            <div
              className={cn(
                'flex items-center gap-2',
                isOverdue && 'text-orange-400/60 font-medium'
              )}
            >
              <Calendar className="h-3 w-3 opacity-50" />
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
          {(contact || company) && (
            <div className="flex items-center gap-2 truncate">
              {contact ? (
                <>
                  <User className="h-3 w-3 shrink-0 opacity-50" />
                  <span className="truncate text-white/50">{contact.first_name} {contact.last_name}</span>
                </>
              ) : (
                <>
                  <Building2 className="h-3 w-3 shrink-0 opacity-50" />
                  <span className="truncate text-white/50">{company?.name}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Overlay (Visible on Hover) */}
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full shadow-elevated bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all"
          onClick={(e) => { e.stopPropagation(); /* TODO: Open email composer */ }}
        >
          <Mail className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full shadow-elevated bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all"
          onClick={(e) => { e.stopPropagation(); /* TODO: Open call log */ }}
        >
          <Phone className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

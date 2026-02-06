'use client';

import { format, formatDistanceToNow } from 'date-fns';
import {
    FileText,
    Phone,
    Users,
    CheckSquare,
    Mail,
    Calendar,
    MoreHorizontal
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { CRMActivity, ActivityType } from '@/domain/crm/crm';
import type { Email } from '@/domain/email/email';

// Union type for timeline items
export type TimelineItem =
    | (CRMActivity & { type: 'activity' })
    | (Email & { type: 'email' });

interface TimelineProps {
    items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
    // Sort items by date descending (newest first)
    const sortedItems = [...items].sort((a, b) => {
        const dateA = new Date(a.type === 'activity' ? a.created_at : a.sent_at).getTime();
        const dateB = new Date(b.type === 'activity' ? b.created_at : b.sent_at).getTime();
        return dateB - dateA;
    });

    if (items.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <p>No activity yet. Start by writing a note or scheduling a call!</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 relative ml-6 border-l-2 border-dashed border-white/10 pl-10 pb-4">
            {sortedItems.map((item) => {
                const isActivity = item.type === 'activity';
                const date = new Date(isActivity ? item.created_at : item.sent_at);

                return (
                    <div key={item.id} className="relative group">
                        {/* Icon Bubble */}
                        <div className={cn(
                            "absolute -left-[57px] top-0 h-10 w-10 rounded-2xl border border-white/10 flex items-center justify-center z-10 shadow-glow-soft",
                            isActivity && item.activity_type === 'note' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            isActivity && item.activity_type === 'call' && "bg-sky-500/10 text-sky-400 border-sky-500/20",
                            isActivity && item.activity_type === 'meeting' && "bg-violet-500/10 text-violet-400 border-violet-500/20",
                            isActivity && item.activity_type === 'task' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                            !isActivity && "bg-white/5 text-white/40 border-white/10", // Email
                        )}>
                            {isActivity && item.activity_type === 'note' && <FileText className="h-5 w-5" />}
                            {isActivity && item.activity_type === 'call' && <Phone className="h-5 w-5" />}
                            {isActivity && item.activity_type === 'meeting' && <Users className="h-5 w-5" />}
                            {isActivity && item.activity_type === 'task' && <CheckSquare className="h-5 w-5" />}
                            {!isActivity && <Mail className="h-5 w-5" />}
                        </div>

                        {/* Content Card */}
                        <div className="flex flex-col gap-1">
                            {/* Header */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <span className="font-medium text-foreground">
                                    {isActivity ? (
                                        item.activity_type === 'note' ? 'Note' : item.title
                                    ) : (
                                        item.subject || '(No Subject)'
                                    )}
                                </span>
                                <span>•</span>
                                <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
                            </div>

                            {/* Body */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 text-sm shadow-sm relative group-hover:bg-white/[0.04] group-hover:border-white/10 transition-all duration-300">
                                {isActivity && (
                                    <div className="whitespace-pre-wrap">
                                        {item.description || item.title}
                                        {/* If task has due date */}
                                        {item.due_date && (
                                            <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400/60 bg-emerald-400/5 border border-emerald-400/10 p-2 px-3 rounded-full w-fit">
                                                <Calendar className="h-3 w-3" />
                                                Due: {format(new Date(item.due_date), 'PPP p')}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!isActivity && (
                                    <div>
                                        <p className="line-clamp-3 text-muted-foreground">
                                            {item.body_preview || 'No preview available'}
                                        </p>
                                        <div className="mt-2 text-xs text-muted-foreground flex gap-2">
                                            <span>From: {item.from_address}</span>
                                            <span>To: {item.to_addresses.join(', ')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

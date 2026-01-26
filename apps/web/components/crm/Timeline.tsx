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
import type { CRMActivity, ActivityType } from '@/lib/services/crm';
import type { Email } from '@/lib/services/email';

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
        <div className="space-y-6 relative ml-4 border-l border-border pl-6 pb-4">
            {sortedItems.map((item) => {
                const isActivity = item.type === 'activity';
                const date = new Date(isActivity ? item.created_at : item.sent_at);

                return (
                    <div key={item.id} className="relative group">
                        {/* Icon Bubble */}
                        <div className={cn(
                            "absolute -left-[37px] top-0 h-8 w-8 rounded-full border-2 border-background flex items-center justify-center z-10",
                            isActivity && item.activity_type === 'note' && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400",
                            isActivity && item.activity_type === 'call' && "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
                            isActivity && item.activity_type === 'meeting' && "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
                            isActivity && item.activity_type === 'task' && "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
                            !isActivity && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", // Email
                        )}>
                            {isActivity && item.activity_type === 'note' && <FileText className="h-4 w-4" />}
                            {isActivity && item.activity_type === 'call' && <Phone className="h-4 w-4" />}
                            {isActivity && item.activity_type === 'meeting' && <Users className="h-4 w-4" />}
                            {isActivity && item.activity_type === 'task' && <CheckSquare className="h-4 w-4" />}
                            {!isActivity && <Mail className="h-4 w-4" />}
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
                            <div className="bg-card border rounded-lg p-3 text-sm shadow-sm relative group-hover:shadow-md transition-shadow">
                                {isActivity && (
                                    <div className="whitespace-pre-wrap">
                                        {item.description || item.title}
                                        {/* If task has due date */}
                                        {item.due_date && (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-1.5 rounded w-fit">
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

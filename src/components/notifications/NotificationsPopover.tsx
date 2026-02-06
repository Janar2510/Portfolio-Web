'use client';

import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/domain/notifications/services/notifications-service';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function NotificationsPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const supabase = createClient();

    // Fetch user
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    // Queries
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', userId],
        queryFn: () => userId ? notificationsService.list(userId) : [],
        enabled: !!userId,
        refetchInterval: 30000, // Poll every 30s
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Realtime subscription
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
                    // Optionally show toast
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, queryClient]);


    // Mutations
    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationsService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => userId ? notificationsService.markAllAsRead(userId) : Promise.resolve(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        }
    });

    const handleNotificationClick = (notification: any) => {
        if (!notification.is_read) {
            markAsReadMutation.mutate(notification.id);
        }
        setIsOpen(false);

        // Navigate based on entity type
        if (notification.entity_type === 'task' && notification.entity_id) {
            // We assume a route structure. Since we don't have project ID easily in notification,
            // we might need a global task route or fetch the task first.
            // For MVP: Do nothing or try best guess if we have project_id in data.
            if (notification.data?.project_id) {
                router.push(`/projects/${notification.data.project_id}?task=${notification.entity_id}`);
            }
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white/40 hover:text-white rounded-full">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 bg-black/90 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <h4 className="font-bold text-sm text-white">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAllReadMutation.mutate()}
                            className="text-xs text-primary hover:text-primary/80 h-auto p-0 hover:bg-transparent"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-white/20 text-center">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "p-4 cursor-pointer transition-colors hover:bg-white/5",
                                        !notification.is_read ? "bg-primary/[0.03]" : ""
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "mt-1 w-2 h-2 rounded-full flex-shrink-0",
                                            !notification.is_read ? "bg-primary" : "bg-transparent"
                                        )} />
                                        <div className="space-y-1">
                                            <p className={cn("text-sm text-white leading-snug", !notification.is_read && "font-medium")}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-white/40 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-white/20 pt-1">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

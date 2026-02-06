'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mindMapsService } from '@/domain/mind-maps/services/mind-maps-service';
import { createClient } from '@/lib/supabase/client';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Plus, Network, MoreVertical, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function MindMapsPage({ params: { locale } }: { params: { locale: string } }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [userId, setUserId] = useState<string | null>(null);

    // Auth check
    const supabase = createClient();
    if (!userId) {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }

    const { data: maps = [], isLoading } = useQuery({
        queryKey: ['mind-maps', userId],
        queryFn: () => userId ? mindMapsService.list(userId) : [],
        enabled: !!userId,
    });

    const createMutation = useMutation({
        mutationFn: () => mindMapsService.create({ title: 'Untitled Mind Map' }),
        onSuccess: (map) => {
            router.push(`/mind-maps/${map.id}`);
        },
        onError: () => toast.error('Failed to create mind map'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => mindMapsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mind-maps', userId] });
            toast.success('Mind map deleted');
        },
    });

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                    <h1 className="text-2xl font-bold text-white font-display uppercase tracking-tight">Mind Maps</h1>
                    <p className="text-white/40">Visual brainstorming and planning.</p>
                </div>
                <Button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                    className="bg-primary text-white font-bold"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Mind Map
                </Button>
            </div>

            {/* Content */}
            <div className="p-6">
                {isLoading ? (
                    <div className="text-white/20">Loading mind maps...</div>
                ) : maps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] border border-dashed border-white/10 rounded-2xl">
                        <Network className="w-12 h-12 text-white/10 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No mind maps yet</h3>
                        <p className="text-white/40 mb-6">Create your first mind map to get started.</p>
                        <Button onClick={() => createMutation.mutate()} variant="secondary">
                            Create Mind Map
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {maps.map((map) => (
                            <div key={map.id} className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-all cursor-pointer">
                                <Link href={`/mind-maps/${map.id}`} className="absolute inset-0" />

                                <div className="flex items-start justify-between relative z-10">
                                    <div className="p-2 rounded-lg bg-white/5 text-primary">
                                        <Network className="w-5 h-5" />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-white">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Delete this mind map?')) deleteMutation.mutate(map.id);
                                                }}
                                                className="text-red-400 hover:text-red-300 hover:bg-white/5"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="mt-4">
                                    <h3 className="font-bold text-white truncate">{map.title}</h3>
                                    <p className="text-xs text-white/40 mt-1">
                                        Edited {formatDistanceToNow(new Date(map.updated_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

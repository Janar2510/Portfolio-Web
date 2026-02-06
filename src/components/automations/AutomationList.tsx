'use client';

import { useQuery } from '@tanstack/react-query';
import { automationsService, Automation } from '@/domain/automations';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, Zap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AutomationListProps {
    projectId?: string;
}

export function AutomationList({ projectId }: AutomationListProps) {
    const { data: automations, isLoading, refetch } = useQuery({
        queryKey: ['automations', projectId],
        queryFn: () => automationsService.getAll(projectId)
    });

    const handleToggle = async (id: string, current: boolean) => {
        try {
            await automationsService.toggleActive(id, !current);
            refetch();
            toast.success('Updated automation status');
        } catch (e) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await automationsService.delete(id);
            refetch();
            toast.success('Deleted automation');
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-white/50" />;

    if (!automations?.length) {
        return (
            <div className="text-center p-10 border border-dashed border-white/10 rounded-xl">
                <p className="text-white/50">No automation rules found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {automations.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-xl group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${rule.is_active ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-white/40'}`}>
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">{rule.name}</h4>
                            <p className="text-xs text-white/50 flex items-center gap-2">
                                <span className="text-blue-400">{rule.trigger_type}</span>
                                <span>→</span>
                                <span className="text-green-400">{rule.action_type}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Switch
                            checked={rule.is_active}
                            onCheckedChange={() => handleToggle(rule.id, rule.is_active)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

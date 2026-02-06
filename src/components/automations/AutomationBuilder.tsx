'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    CreateAutomationSchema,
    TriggerType,
    ActionType
} from '@/domain/automations';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, ArrowRight, Zap, Play } from 'lucide-react';
import { automationsService } from '@/domain/automations';
import { toast } from 'sonner';

const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
    { value: 'task.created', label: 'Task Created' },
    { value: 'task.updated', label: 'Task Updated' },
    { value: 'task.status_changed', label: 'Status Changed' },
    { value: 'task.completed', label: 'Task Completed' }
];

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
    { value: 'task.create_subtasks', label: 'Create Subtasks' },
    { value: 'task.assign', label: 'Assign To...' },
    { value: 'task.update_field', label: 'Update Field' },
    { value: 'notification.send', label: 'Send Notification' }
];

interface AutomationBuilderProps {
    projectId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

type FormData = z.infer<typeof CreateAutomationSchema>;

export function AutomationBuilder({ projectId, onSuccess, onCancel }: AutomationBuilderProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(CreateAutomationSchema),
        defaultValues: {
            project_id: projectId || null,
            is_active: true,
            trigger_config: {},
            action_config: {}
        }
    });

    const selectedTrigger = watch('trigger_type');
    const selectedAction = watch('action_type');

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await automationsService.create(data);
            toast.success('Automation rule created');
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create automation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    New Automation Rule
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label>Rule Name</Label>
                        <Input
                            {...register('name')}
                            placeholder="e.g. Auto-assign Reviewer"
                            className="bg-black/20 border-white/10"
                        />
                        {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        {/* Trigger */}
                        <div className="flex-1 w-full space-y-4 p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl">
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                When...
                            </h3>
                            <Select onValueChange={(v) => setValue('trigger_type', v as TriggerType)}>
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue placeholder="Select Trigger" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRIGGER_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Dynamic Trigger Config */}
                            {selectedTrigger === 'task.status_changed' && (
                                <div className="space-y-2">
                                    <Label className="text-xs">Status ID (Optional)</Label>
                                    <Input
                                        placeholder="Specific status ID..."
                                        {...register('trigger_config.status_id')}
                                        className="bg-black/20 border-white/10 text-xs"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="hidden md:flex pt-10 text-white/20">
                            <ArrowRight className="w-6 h-6" />
                        </div>

                        {/* Action */}
                        <div className="flex-1 w-full space-y-4 p-4 border border-green-500/20 bg-green-500/5 rounded-xl">
                            <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Then...
                            </h3>
                            <Select onValueChange={(v) => setValue('action_type', v as ActionType)}>
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue placeholder="Select Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTION_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Dynamic Action Config */}
                            {selectedAction === 'task.create_subtasks' && (
                                <div className="space-y-2">
                                    <Label className="text-xs">Subtask Titles (comma separated)</Label>
                                    <Input
                                        placeholder="Design, Review, Deploy"
                                        onChange={(e) => {
                                            const titles = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                            setValue('action_config.subtasks', titles);
                                        }}
                                        className="bg-black/20 border-white/10 text-xs"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || !selectedTrigger || !selectedAction}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Rule'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

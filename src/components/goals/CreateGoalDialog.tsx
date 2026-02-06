'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsService } from '@/domain/goals';
import { toast } from 'sonner';

interface CreateGoalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
}

export function CreateGoalDialog({ isOpen, onClose, projectId }: CreateGoalDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const title = formData.get('title') as string;
            const description = formData.get('description') as string;
            const startDate = formData.get('start_date') as string;
            const dueDate = formData.get('due_date') as string;

            await goalsService.create({
                title,
                description,
                project_id: projectId || undefined,
                start_date: startDate || undefined,
                due_date: dueDate || undefined,
            });

            toast.success('Goal created successfully');
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            onClose();
        } catch (error) {
            console.error('Failed to create goal:', error);
            toast.error('Failed to create goal');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Goal Title</Label>
                        <Input
                            name="title"
                            required
                            placeholder="e.g. Increase Q1 Revenue"
                            className="bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            name="description"
                            placeholder="Describe the objective..."
                            className="bg-white/5 border-white/10 resize-none h-24"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                name="start_date"
                                className="bg-white/5 border-white/10 block w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                                type="date"
                                name="due_date"
                                className="bg-white/5 border-white/10 block w-full"
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                            {isSubmitting ? 'Creating...' : 'Create Goal'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

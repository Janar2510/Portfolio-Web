'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { tasksService, projectsService, Project } from '@/domain/projects';
import { taskRelationsService } from '@/domain/projects/services/task-relations-service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, Flag } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateTaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string; // Optional now
    statusId?: string; // Optional now
    initialData?: {
        title?: string;
        description?: string;
        email?: {
            id: string;
            subject: string;
            from: string;
        };
    };
}

export function CreateTaskDialog({ isOpen, onClose, projectId, statusId, initialData }: CreateTaskDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState<Date>();
    const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || '');
    const queryClient = useQueryClient();

    // Fetch projects if not provided
    const { data: projects = [] } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: () => projectsService.getAll(),
        enabled: !projectId,
    });

    // Fetch statuses for selected project
    const { data: statuses = [] } = useQuery({
        queryKey: ['statuses', selectedProjectId],
        queryFn: () => projectsService.getStatuses(selectedProjectId),
        enabled: !!selectedProjectId,
    });

    const activeStatusId = statusId || statuses?.[0]?.id || '';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedProjectId) {
            toast.error('Please select a project');
            return;
        }
        if (!activeStatusId) {
            toast.error('Project has no statuses');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const title = formData.get('title') as string;
            const description = formData.get('description') as string;
            const priority = formData.get('priority') as "none" | "low" | "medium" | "high" | "urgent";

            const newTask = await tasksService.create({
                project_id: selectedProjectId,
                status_id: activeStatusId,
                title,
                description: description || initialData?.description,
                priority: priority || 'none',
                due_date: date?.toISOString(),
                custom_fields: {},
            });

            // Link email if provided
            if (initialData?.email) {
                await taskRelationsService.addRelation(newTask.id, 'email', initialData.email.id);
            }

            toast.success('Task created');
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProjectId] });
            onClose();
        } catch (error) {
            console.error('Failed to create task:', error);
            toast.error('Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-zinc-950 border-white/10 text-foreground rounded-2xl">
                <DialogHeader className="p-4 border-b border-white/5">
                    <DialogTitle className="text-sm font-medium">New Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {!projectId && (
                        <div className="space-y-1">
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger className="w-full bg-white/5 border-white/10">
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10">
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Input
                            name="title"
                            required
                            autoFocus
                            defaultValue={initialData?.title}
                            placeholder="What needs to be done?"
                            className="bg-transparent border-none text-lg font-medium px-0 focus-visible:ring-0 placeholder:text-white/20"
                        />
                        <Input
                            name="description"
                            type="hidden"
                            defaultValue={initialData?.description}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Due Date Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "h-8 justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 text-xs",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                    {date ? format(date, "PPP") : <span>Due date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-zinc-900 border-white/10" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Priority Picker */}
                        <Select name="priority" defaultValue="none">
                            <SelectTrigger className="h-8 w-[100px] bg-white/5 border-white/10 text-xs">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10">
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white/40 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting}
                            className="bg-primary text-white font-bold"
                        >
                            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add Task'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

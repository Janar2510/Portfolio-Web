'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Loader2,
    Trash2,
    Plus,
    Calendar,
    LayoutList,
    CheckSquare,
    Save
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService, sprintsService, ChecklistItem, Task } from '@/domain/projects';
import { fieldDefinitionsService } from '@/domain/crm/services/field-definitions-service';
import { formulaEngine } from '@/domain/crm/services/formula-engine';
import { CustomFieldRenderer } from '@/components/crm/CustomFieldRenderer';
import { AssigneePicker } from './AssigneePicker';
import { RelationPicker } from './RelationPicker';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    projectId: string; // To fetch sprints
}

export function TaskDialog({ isOpen, onClose, task, projectId }: TaskDialogProps) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [customFields, setCustomFields] = useState<Record<string, any>>(task.custom_fields || {});
    const [sprintId, setSprintId] = useState(task.sprint_id || 'unassigned');
    const [priority, setPriority] = useState(task.priority || 'none');
    const [dueDate, setDueDate] = useState<string | null>(task.due_date || null);
    const [newItemContent, setNewItemContent] = useState('');

    // --- Queries ---

    // 1. Custom Field Definitions
    const { data: fieldDefs = [] } = useQuery({
        queryKey: ['custom-fields', 'task'],
        queryFn: () => fieldDefinitionsService.getByEntity('task'),
        enabled: isOpen,
    });

    // 2. Checklist Items
    const { data: checklist = [] } = useQuery({
        queryKey: ['checklist', task.id],
        queryFn: () => tasksService.getChecklist(task.id),
        enabled: isOpen,
    });

    // 3. Sprints
    const { data: sprints = [] } = useQuery({
        queryKey: ['sprints', projectId],
        queryFn: () => sprintsService.getByProject(projectId),
        enabled: isOpen,
    });

    // 4. Assignees
    const { data: assigneeIds = [] } = useQuery({
        queryKey: ['assignees', task.id],
        queryFn: () => tasksService.getAssignees(task.id),
        enabled: isOpen,
    });

    // --- Mutations ---

    const updateTaskMutation = useMutation({
        mutationFn: (updates: any) => tasksService.update(task.id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            toast.success('Task updated');
        },
    });

    const addChecklistMutation = useMutation({
        mutationFn: (content: string) => tasksService.addChecklistItem({ task_id: task.id, content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist', task.id] });
            setNewItemContent('');
        },
    });

    const toggleChecklistMutation = useMutation({
        mutationFn: ({ id, is_completed }: { id: string, is_completed: boolean }) =>
            tasksService.updateChecklistItem(id, { is_completed }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist', task.id] });
        },
    });

    const assignUserMutation = useMutation({
        mutationFn: (userId: string) => tasksService.assignUser(task.id, userId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignees', task.id] }),
    });

    const unassignUserMutation = useMutation({
        mutationFn: (userId: string) => tasksService.unassignUser(task.id, userId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignees', task.id] }),
    });

    const handleSave = () => {
        updateTaskMutation.mutate({
            title,
            description,
            custom_fields: customFields,
            priority,
            due_date: dueDate,
            sprint_id: sprintId === 'unassigned' ? null : sprintId,
        });
        onClose();
    };

    const handleAddChecklist = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemContent.trim()) return;
        addChecklistMutation.mutate(newItemContent);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-950 border-white/10 text-white rounded-2xl gap-0 p-0">

                {/* Header */}
                <div className="p-6 border-b border-white/5 sticky top-0 bg-zinc-950 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {/* Breadcrumb or Status badge could go here */}
                            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Task Details</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={handleSave} size="sm" className="bg-primary text-white font-bold h-8">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                        </div>
                    </div>

                    <DialogTitle className="sr-only">Edit Task: {title}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Edit, assign, and manage details for this task.
                    </DialogDescription>

                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-2xl font-bold bg-transparent border-none px-0 focus-visible:ring-0 h-auto"
                    />
                </div>

                <div className="p-6 space-y-8">

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Left Column (Description, Checklist) */}
                        <div className="md:col-span-2 space-y-8">

                            {/* Description */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-white/40">
                                    <LayoutList className="w-4 h-4" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest">Description</h3>
                                </div>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a more detailed description..."
                                    className="min-h-[120px] bg-white/5 border-white/10 rounded-xl resize-none"
                                />
                            </div>

                            {/* Checklist */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-white/40">
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest">Checklist</h3>
                                    </div>
                                    <span className="text-xs">
                                        {checklist.filter(i => i.is_completed).length}/{checklist.length}
                                    </span>
                                </div>


                                {/* Progress Bar */}
                                {checklist.length > 0 && (
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-300"
                                            style={{ width: `${(checklist.filter(i => i.is_completed).length / checklist.length) * 100}%` }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {checklist.map((item) => (
                                        <div key={item.id} className="flex items-start gap-3 group">
                                            <Checkbox
                                                checked={item.is_completed}
                                                onCheckedChange={(checked) => toggleChecklistMutation.mutate({ id: item.id, is_completed: !!checked })}
                                                className="mt-1"
                                            />
                                            <span className={`text-sm flex-1 ${item.is_completed ? 'line-through text-white/30' : 'text-white/80'}`}>
                                                {item.content}
                                            </span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/10 hover:text-red-400 -mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleAddChecklist} className="flex gap-2">
                                    <Input
                                        value={newItemContent}
                                        onChange={(e) => setNewItemContent(e.target.value)}
                                        placeholder="Add an item..."
                                        className="h-9 bg-transparent border-white/10 text-sm"
                                    />
                                    <Button type="submit" size="sm" variant="secondary" className="h-9">Add</Button>
                                </form>
                            </div>

                        </div>

                        {/* Right Column (Sidebar) */}
                        <div className="space-y-6">

                            {/* Properties */}
                            <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Properties</h4>

                                {/* Priority */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-white/50">Priority</Label>
                                    <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                                        <SelectTrigger className="h-8 bg-white/5 border-white/10 text-xs">
                                            <SelectValue placeholder="Select priority" />
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

                                {/* Due Date */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-white/50">Due Date</Label>
                                    <Input
                                        type="date"
                                        value={dueDate ? format(new Date(dueDate), 'yyyy-MM-dd') : ''}
                                        onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value).toISOString() : null)}
                                        className="h-8 bg-white/5 border-white/10 text-xs calendar-picker"
                                    />
                                </div>

                                {/* Assignees */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-white/50">Assignees</Label>
                                    <AssigneePicker
                                        assigneeIds={assigneeIds}
                                        onAssign={(userId) => assignUserMutation.mutate(userId)}
                                        onUnassign={(userId) => unassignUserMutation.mutate(userId)}
                                    />
                                </div>

                                {/* Sprint */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-white/50">Sprint</Label>
                                    <Select value={sprintId} onValueChange={setSprintId}>
                                        <SelectTrigger className="h-8 bg-white/5 border-white/10 text-xs">
                                            <SelectValue placeholder="Select sprint" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10">
                                            <SelectItem value="unassigned">No Sprint</SelectItem>
                                            {sprints.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Custom Fields */}
                                {/* Custom Fields */}
                                {fieldDefs.map((field) => (
                                    <div key={field.id} className="space-y-1.5">
                                        <div className="space-y-1.5">
                                            <CustomFieldRenderer
                                                field={field}
                                                value={
                                                    field.field_type === 'formula'
                                                        ? formulaEngine.evaluate(field.formula_expression || '', {
                                                            ...task,
                                                            ...customFields,
                                                            priority,
                                                            // Flatten common props for easy access
                                                            days_until_due: task.due_date ? Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
                                                            is_urgent: priority === 'urgent',
                                                        })
                                                        : customFields[field.field_key]
                                                }
                                                onChange={(val) => setCustomFields({ ...customFields, [field.field_key]: val })}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {/* Related Entities */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 text-left">Related To</h4>

                                    <div className="space-y-1.5 text-left">
                                        <Label className="text-xs text-white/50">Contact</Label>
                                        <RelationPicker taskId={task.id} type="contact" />
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <Label className="text-xs text-white/50">Organization</Label>
                                        <RelationPicker taskId={task.id} type="organization" />
                                    </div>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="text-xs text-white/20 space-y-1">
                                <p>Created {format(new Date(task.created_at), 'MMM d, yyyy')}</p>
                                <p>Updated {format(new Date(task.updated_at), 'MMM d, yyyy')}</p>
                            </div>

                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}

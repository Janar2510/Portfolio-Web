'use client';

import { useState } from 'react';
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
import { Loader2, Plus, Sparkles, FolderKanban } from 'lucide-react';
import { projectsService } from '@/domain/projects';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CreateProjectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
}

const COLORS = [
    { name: 'Slate', value: '#64748b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
];

export function CreateProjectDialog({ isOpen, onClose, projectId }: CreateProjectDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const description = formData.get('description') as string;
            const color = formData.get('color') as string;

            await projectsService.create({
                name,
                description,
                color,
                parent_id: projectId || undefined,
                custom_fields: {},
                settings: {},
                is_template: false
            });

            toast.success(projectId ? 'Folder created' : 'Project created');
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            onClose();
        } catch (error) {
            console.error('Failed to create project:', error);
            toast.error('Failed to create project');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-black/40 backdrop-blur-3xl border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-foreground rounded-[2rem]">
                <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            <FolderKanban className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white">New Project</DialogTitle>
                            <DialogDescription className="text-white/40">
                                Create a new space for your tasks.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Project Name</Label>
                            <Input
                                name="name"
                                required
                                placeholder="e.g. Website Redesign"
                                className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Description</Label>
                            <Textarea
                                name="description"
                                placeholder="What is this project about?"
                                className="min-h-[100px] bg-white/5 border-white/10 rounded-xl focus:border-primary/50 transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Color Theme</Label>
                            <Select name="color" defaultValue="#3b82f6">
                                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 rounded-xl max-h-[200px]">
                                    {COLORS.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                                                <span>{c.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary text-white font-bold rounded-xl px-6 shadow-glow-primary hover:bg-primary/90"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

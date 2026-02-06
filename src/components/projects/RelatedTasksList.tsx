'use client';

import { useQuery } from '@tanstack/react-query';
import { taskRelationsService } from '@/domain/projects/services/task-relations-service';
import { TaskCard } from './TaskCard';
import { Loader2 } from 'lucide-react';
import { Task } from '@/domain/projects';

interface RelatedTasksListProps {
    entityType: 'contact' | 'organization' | 'lead';
    entityId: string;
}

export function RelatedTasksList({ entityType, entityId }: RelatedTasksListProps) {
    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['related-tasks', entityType, entityId],
        queryFn: () => taskRelationsService.getTasksForEntity(entityType, entityId),
    });

    if (isLoading) {
        return <div className="flex items-center justify-center p-8 text-white/20"><Loader2 className="w-5 h-5 animate-spin" /></div>;
    }

    if (tasks.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-white/40 mb-2">No related tasks found.</p>
                <p className="text-xs text-white/20">Link tasks to this {entityType} from the project board.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {tasks.map((task: any) => (
                // Assuming task object matches Task interface, or close enough for TaskCard
                <TaskCard key={task.id} task={task as Task} />
            ))}
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sprintsService, tasksService, Project, Task, Sprint } from '@/domain/projects';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TaskDialog } from './TaskDialog';
import { toast } from 'sonner';

interface SprintBoardProps {
    project: Project;
}

export function SprintBoard({ project }: SprintBoardProps) {
    const { data: sprints = [] } = useQuery({
        queryKey: ['sprints', project.id],
        queryFn: () => sprintsService.getByProject(project.id),
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks', project.id],
        queryFn: () => tasksService.getByProject(project.id),
    });

    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Group tasks by sprint
    const tasksBySprint = tasks.reduce((acc, task) => {
        const sprintId = task.sprint_id || 'backlog';
        if (!acc[sprintId]) acc[sprintId] = [];
        acc[sprintId].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto pb-10">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Sprint Planning</h2>
                <Button size="sm" variant="outline" className="border-dashed border-white/20 hover:bg-white/5">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Sprint
                </Button>
            </div>

            {/* Active/Future Sprints */}
            {sprints.map((sprint) => (
                <SprintSection
                    key={sprint.id}
                    sprint={sprint}
                    tasks={tasksBySprint[sprint.id] || []}
                    onTaskClick={setEditingTask}
                />
            ))}

            {/* Backlog */}
            <SprintSection
                sprint={{ id: 'backlog', name: 'Backlog', status: 'planned' } as Sprint}
                tasks={tasksBySprint['backlog'] || []}
                isBacklog
                onTaskClick={setEditingTask}
            />

            {editingTask && (
                <TaskDialog
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    task={editingTask}
                    projectId={project.id}
                />
            )}
        </div>
    );
}

function SprintSection({
    sprint,
    tasks,
    isBacklog,
    onTaskClick
}: {
    sprint: Sprint,
    tasks: Task[],
    isBacklog?: boolean,
    onTaskClick: (task: Task) => void
}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
            <div className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg group">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/50">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                </CollapsibleTrigger>

                <div className="flex items-baseline gap-3 flex-1">
                    <h3 className="text-sm font-bold text-white">
                        {sprint.name}
                        <span className="ml-2 text-xs text-white/40 font-normal">({tasks.length} tasks)</span>
                    </h3>
                    {!isBacklog && sprint.start_date && (
                        <span className="text-xs text-white/30 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(sprint.start_date), 'MMM d')} - {format(new Date(sprint.end_date!), 'MMM d')}
                        </span>
                    )}
                    {sprint.status === 'active' && (
                        <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] uppercase font-bold tracking-wider">
                            Active
                        </span>
                    )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-white/40 hover:text-white">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Task
                    </Button>
                </div>
            </div>

            <CollapsibleContent>
                <div className="pl-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="col-span-full h-16 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-xs text-white/20">
                            No tasks in this sprint
                        </div>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

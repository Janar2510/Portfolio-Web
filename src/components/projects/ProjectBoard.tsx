'use client';

import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
    arrayMove,
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Project, ProjectStatus, Task, tasksService } from '@/domain/projects';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { TaskDialog } from './TaskDialog';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProjectBoardProps {
    project: Project;
    initialStatuses: ProjectStatus[];
    initialTasks: Task[];
}

export default function ProjectBoard({ project, initialStatuses, initialTasks }: ProjectBoardProps) {
    const [statuses, setStatuses] = useState(initialStatuses);
    const [tasks, setTasks] = useState(initialTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const tasksByStatus = useMemo(() => {
        const map: Record<string, Task[]> = {};
        statuses.forEach(s => map[s.id] = []);
        tasks.forEach(task => {
            if (task.status_id && map[task.status_id]) {
                map[task.status_id].push(task);
            }
        });
        return map;
    }, [statuses, tasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        if (task) setActiveTask(task);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Find container over
        // This is mainly for visual feedback if we had placeholder
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const activeId = active.id;
        const overId = over.id;

        // Find the "over" container (status)
        // If sorting within same column or moving to another

        let newStatusId = '';
        let newIndex = 0;

        // Check if dropped on a Droppable Container (Column)
        const isOverColumn = statuses.find(s => s.id === overId);

        // Check if dropped on another Task
        const overTask = tasks.find(t => t.id === overId);

        if (isOverColumn) {
            newStatusId = isOverColumn.id;
            // Append to end of column usually, or create smart placement if needed
            newIndex = tasksByStatus[newStatusId].length;
        } else if (overTask && overTask.status_id) {
            newStatusId = overTask.status_id;
            const overTaskIndex = tasksByStatus[newStatusId].findIndex(t => t.id === overId);
            const activeTaskIndex = tasksByStatus[newStatusId].findIndex(t => t.id === activeId);

            // If dragging down, place after. If up, before.
            // Dnd-kit logic for sortable is usually `arrayMove` index.
            // When moving between lists it's trickier.

            // Simplified logic: calculate new index based on visual position? 
            // arrayMove works for single list.

            // We will just place it before the target task for now.
            newIndex = overTaskIndex;
        }

        if (newStatusId) {
            // Optimistic Update
            setTasks((prevTasks) => {
                return prevTasks.map(t => {
                    if (t.id === activeId) {
                        return { ...t, status_id: newStatusId }; // Sort order logic skipped for MVP speed
                    }
                    return t;
                });
            });

            try {
                // Call API
                if (activeTask) {
                    await tasksService.moveTask(activeTask.id, newStatusId, newIndex);
                }
            } catch (e) {
                console.error("Failed to move task", e);
                // Revert if needed
            }
        }

        setActiveTask(null);
    };

    return (
        <DndContext
            id="kanban-board-dnd"
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start">
                {statuses.map((status) => (
                    <BoardColumn
                        key={status.id}
                        status={status}
                        tasks={tasksByStatus[status.id] || []}
                        onAddTask={() => {
                            setSelectedStatusId(status.id);
                            setCreateDialogOpen(true);
                        }}
                        onTaskClick={(task) => setEditingTask(task)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>

            {createDialogOpen && selectedStatusId && (
                <CreateTaskDialog
                    isOpen={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                    projectId={project.id}
                    statusId={selectedStatusId}
                />
            )}

            {editingTask && (
                <TaskDialog
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    task={editingTask}
                    projectId={project.id}
                />
            )}
        </DndContext>
    );
}

function BoardColumn({
    status,
    tasks,
    onAddTask,
    onTaskClick
}: {
    status: ProjectStatus,
    tasks: Task[],
    onAddTask: () => void,
    onTaskClick: (task: Task) => void
}) {
    const { setNodeRef } = useSortable({
        id: status.id,
        data: {
            type: 'Column',
            status,
        },
        disabled: true // Disable dragging columns for now
    });

    return (
        <div
            ref={setNodeRef}
            className="flex-shrink-0 w-80 flex flex-col h-full max-h-full rounded-2xl bg-white/[0.02] border border-white/5"
        >
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                    <h3 className="font-bold text-sm text-white">{status.name}</h3>
                    <span className="text-xs text-white/30 font-medium ml-1">{tasks.length}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button onClick={onAddTask} variant="ghost" size="icon" className="h-6 w-6 text-white/20 hover:text-white rounded-full">
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white/20 hover:text-white rounded-full">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Droppable Area */}
            <div className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                <SortableContext
                    id={status.id}
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3 min-h-[50px]">
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onClick={() => onTaskClick(task)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}

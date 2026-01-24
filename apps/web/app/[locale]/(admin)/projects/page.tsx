'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectList, type Project } from '@/components/projects/ProjectList';
import { KanbanBoard, type ProjectColumn, type ProjectTask } from '@/components/projects/KanbanBoard';
import { TaskDetailModal } from '@/components/projects/TaskDetailModal';
import { type Task, type Subtask, type TaskComment, type ProjectColumn as ServiceProjectColumn } from '@/lib/services/projects';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function ProjectsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { projects: data || [], total: data?.length || 0 };
    },
  });

  // Fetch columns for selected project
  const { data: columns = [] } = useQuery({
    queryKey: ['project-columns', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('project_columns')
        .select('*')
        .eq('project_id', selectedProjectId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedProjectId,
  });

  // Fetch tasks for selected project
  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', selectedProjectId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedProjectId,
  });

  // Fetch subtasks for selected task
  const { data: subtasks = [] } = useQuery({
    queryKey: ['task-subtasks', selectedTask?.id],
    queryFn: async () => {
      if (!selectedTask?.id) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', selectedTask.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedTask?.id,
  });

  // Fetch comments for selected task
  const { data: comments = [] } = useQuery({
    queryKey: ['task-comments', selectedTask?.id],
    queryFn: async () => {
      if (!selectedTask?.id) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', selectedTask.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedTask?.id,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; color?: string }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not found');

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          ...data,
          user_id: user.id,
          status: 'active',
        })
        .select()
        .single();
      if (error) throw error;

      // Create default columns
      const defaultColumns = [
        { name: 'To Do', sort_order: 0, is_done_column: false },
        { name: 'In Progress', sort_order: 1, is_done_column: false },
        { name: 'Done', sort_order: 2, is_done_column: true },
      ];
      for (const column of defaultColumns) {
        await supabase.from('project_columns').insert({
          project_id: project.id,
          ...column,
        });
      }

      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const supabase = createClient();
      const { data: project, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, deletedProjectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (selectedProjectId === deletedProjectId) {
        setSelectedProjectId(null);
      }
    },
  });

  // Reorder columns mutation
  const reorderColumnsMutation = useMutation({
    mutationFn: async (columns: ProjectColumn[]) => {
      const supabase = createClient();
      const updates = columns.map((col, index) =>
        supabase
          .from('project_columns')
          .update({ sort_order: index })
          .eq('id', col.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-columns', selectedProjectId] });
    },
  });

  // Move task mutation
  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, columnId, sortOrder }: { taskId: string; columnId: string; sortOrder: number }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .update({ column_id: columnId, sort_order: sortOrder })
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', selectedProjectId] });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', selectedProjectId] });
      queryClient.invalidateQueries({ queryKey: ['task-subtasks', selectedTask?.id] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', selectedProjectId] });
      setIsTaskModalOpen(false);
      setSelectedTask(null);
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async ({ projectId, columnId, title }: { projectId: string; columnId: string; title: string }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current max sort order
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('sort_order')
        .eq('column_id', columnId)
        .order('sort_order', { ascending: false })
        .limit(1);

      const newSortOrder = existingTasks?.[0]?.sort_order !== undefined ? existingTasks[0].sort_order + 1 : 0;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          column_id: columnId,
          title,
          sort_order: newSortOrder,
          assignee_id: user.id, // Assign to creator by default
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', selectedProjectId] });
    },
  });

  // Create subtask mutation
  const createSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('subtasks')
        .insert({ task_id: taskId, title })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-subtasks', selectedTask?.id] });
    },
  });

  // Update subtask mutation
  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, updates }: { subtaskId: string; updates: Partial<Subtask> }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', subtaskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-subtasks', selectedTask?.id] });
    },
  });

  // Delete subtask mutation
  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-subtasks', selectedTask?.id] });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('task_comments')
        .insert({ task_id: taskId, user_id: user.id, content })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', selectedTask?.id] });
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('task_comments')
        .update({ content })
        .eq('id', commentId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', selectedTask?.id] });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('task_comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', selectedTask?.id] });
    },
  });

  const handleTaskClick = async (task: ProjectTask) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', task.id)
      .single();
    if (error) throw error;
    if (data) {
      setSelectedTask(data as Task);
      setIsTaskModalOpen(true);
    }
  };

  const projects = projectsData?.projects || [];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(142_60%_6%)] to-[hsl(var(--background))] animate-fade-in">
      {/* Project List Sidebar */}
      <div className="w-64 shrink-0 bg-card border-r border-border animate-slide-down">
        <ProjectList
          projects={projects}
          currentProjectId={selectedProjectId || undefined}
          onProjectSelect={setSelectedProjectId}
          onProjectCreate={async (data) => {
            const newProject = await createProjectMutation.mutateAsync(data);
            if (newProject) {
              setSelectedProjectId(newProject.id);
            }
          }}
          onProjectUpdate={async (id, data) => {
            await updateProjectMutation.mutateAsync({ id, data });
          }}
          onProjectDelete={async (id) => {
            await deleteProjectMutation.mutateAsync(id);
          }}
        />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {selectedProjectId ? (
          <KanbanBoard
            projectId={selectedProjectId}
            columns={columns as ProjectColumn[]}
            tasks={tasks as ProjectTask[]}
            onColumnsReorder={async (newColumns) => {
              await reorderColumnsMutation.mutateAsync(newColumns);
            }}
            onTasksReorder={async () => {
              // This is handled by moveTask
            }}
            onTaskMove={async (taskId, columnId, sortOrder) => {
              await moveTaskMutation.mutateAsync({ taskId, columnId, sortOrder });
            }}
            onTaskClick={handleTaskClick}
            onTaskCreate={async (columnId, title) => {
              if (selectedProjectId) {
                await createTaskMutation.mutateAsync({
                  projectId: selectedProjectId,
                  columnId,
                  title,
                });
              }
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center animate-fade-in">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-foreground">Select a project to get started</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a project from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onUpdate={async (taskId, updates) => {
            await updateTaskMutation.mutateAsync({ taskId, updates });
            // Refresh task data
            const supabase = createClient();
            const { data: updatedTask, error } = await supabase
              .from('tasks')
              .select('*')
              .eq('id', taskId)
              .single();
            if (!error && updatedTask) {
              setSelectedTask(updatedTask as Task);
            }
          }}
          onDelete={async (taskId) => {
            await deleteTaskMutation.mutateAsync(taskId);
          }}
          subtasks={subtasks}
          comments={comments}
          onSubtaskCreate={async (taskId, title) => {
            await createSubtaskMutation.mutateAsync({ taskId, title });
          }}
          onSubtaskUpdate={async (subtaskId, updates) => {
            await updateSubtaskMutation.mutateAsync({ subtaskId, updates });
          }}
          onSubtaskDelete={async (subtaskId) => {
            await deleteSubtaskMutation.mutateAsync(subtaskId);
          }}
          onCommentCreate={async (taskId, content) => {
            await createCommentMutation.mutateAsync({ taskId, content });
          }}
          onCommentUpdate={async (commentId, content) => {
            await updateCommentMutation.mutateAsync({ commentId, content });
          }}
          onCommentDelete={async (commentId) => {
            await deleteCommentMutation.mutateAsync(commentId);
          }}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}

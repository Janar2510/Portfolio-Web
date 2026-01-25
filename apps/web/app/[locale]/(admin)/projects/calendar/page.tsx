'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarView } from '@/components/projects/CalendarView';
import { TaskDetailModal } from '@/components/projects/TaskDetailModal';
import { Button } from '@/components/ui/button';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Task, Subtask, TaskComment } from '@/lib/services/projects';

export default function CalendarPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { user } = useAuth();

  // Fetch all tasks with due dates across all projects
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['calendar-tasks'],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // Get all projects for the user
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id);

      if (!projects || projects.length === 0) return [];

      const projectIds = projects.map(p => p.id);

      // Get all tasks with due dates
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(
          `
          *,
          projects!inner(id, name, user_id)
        `
        )
        .in('project_id', projectIds)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (tasksData || []) as Task[];
    },
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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDownloadICal = () => {
    window.open('/api/projects/ical', '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(142_60%_6%)] to-[hsl(var(--background))] animate-fade-in">
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <CalendarIcon className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="mt-4 text-foreground font-medium">
            Loading calendar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your tasks by due date
          </p>
        </div>
        <Button onClick={handleDownloadICal} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export iCal
        </Button>
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-hidden">
        <CalendarView tasks={tasks} onTaskClick={handleTaskClick} />
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
            const supabase = createClient();
            const { data, error } = await supabase
              .from('tasks')
              .update(updates)
              .eq('id', taskId)
              .select()
              .single();
            if (error) throw error;
            if (data) {
              setSelectedTask(data as Task);
            }
          }}
          onDelete={async taskId => {
            const supabase = createClient();
            const { error } = await supabase
              .from('tasks')
              .delete()
              .eq('id', taskId);
            if (error) throw error;
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          subtasks={subtasks}
          comments={comments}
          onSubtaskCreate={async (taskId, title) => {
            const supabase = createClient();
            const { data, error } = await supabase
              .from('subtasks')
              .insert({ task_id: taskId, title })
              .select()
              .single();
            if (error) throw error;
          }}
          onSubtaskUpdate={async (subtaskId, updates) => {
            const supabase = createClient();
            const { data, error } = await supabase
              .from('subtasks')
              .update(updates)
              .eq('id', subtaskId)
              .select()
              .single();
            if (error) throw error;
          }}
          onSubtaskDelete={async subtaskId => {
            const supabase = createClient();
            const { error } = await supabase
              .from('subtasks')
              .delete()
              .eq('id', subtaskId);
            if (error) throw error;
          }}
          onCommentCreate={async (taskId, content) => {
            const supabase = createClient();
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');
            const { data, error } = await supabase
              .from('task_comments')
              .insert({ task_id: taskId, user_id: user.id, content })
              .select()
              .single();
            if (error) throw error;
          }}
          onCommentUpdate={async (commentId, content) => {
            const supabase = createClient();
            const { data, error } = await supabase
              .from('task_comments')
              .update({ content })
              .eq('id', commentId)
              .select()
              .single();
            if (error) throw error;
          }}
          onCommentDelete={async commentId => {
            const supabase = createClient();
            const { error } = await supabase
              .from('task_comments')
              .delete()
              .eq('id', commentId);
            if (error) throw error;
          }}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}

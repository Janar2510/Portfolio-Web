import { createClient } from '@/lib/supabase/client';
import {
    TaskSchema,
    ChecklistItemSchema
} from '../schemas';
import {
    Task,
    CreateTaskDTO,
    UpdateTaskDTO,
    ChecklistItem,
    CreateChecklistItemDTO,
    UpdateChecklistItemDTO
} from '../types';
import { z } from 'zod';

export class TasksService {
    private supabase = createClient();

    async getByProject(projectId: string): Promise<Task[]> {
        const { data, error } = await this.supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .is('deleted_at', null)
            .order('sort_order', { ascending: true }); // Primary sort by manual order

        if (error) throw error;
        return z.array(TaskSchema).parse(data || []);
    }

    async create(data: CreateTaskDTO): Promise<Task> {
        const { data: userData } = await this.supabase.auth.getUser();
        if (!userData.user) throw new Error('Unauthorized');

        // Logic to append to bottom of column? 
        // For MVP, default sort_order 0 is fine, or we fetch max.

        const { data: task, error } = await this.supabase
            .from('tasks')
            .insert({
                ...data,
                user_id: userData.user.id
            })
            .select()
            .single();

        if (error) throw error;

        const newTask = TaskSchema.parse(task);

        // -- Automation Hooks --
        try {
            const { automationRunner } = await import('@/domain/automations/services/automation-runner');
            automationRunner.checkAndRun('task.created', {
                projectId: newTask.project_id,
                task: newTask
            });
        } catch (e) {
            console.error('Failed to run automations', e);
        }

        return newTask;
    }

    async update(id: string, updates: UpdateTaskDTO): Promise<Task> {
        const { data, error } = await this.supabase
            .from('tasks')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        const newTask = TaskSchema.parse(data);

        // -- Automation Hooks --
        try {
            const { automationRunner } = await import('@/domain/automations/services/automation-runner');
            // Fire and forget - don't block response
            automationRunner.checkAndRun('task.created', {
                projectId: newTask.project_id,
                task: newTask
            });
        } catch (e) {
            console.error('Failed to run automations', e);
        }

        return newTask;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('tasks')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    async moveTask(taskId: string, newStatusId: string, newIndex: number) {
        // Move task to new status and update order.
        // This usually requires reordering other tasks in the column.
        // For MVP, we'll update status and set sort_order. 
        // A proper implementation would shift others.
        // We'll update only the dragged task for now.

        // Wait, if we drop it, we know the index.
        // We probably need to update all tasks in that status to reflect new order.
        // This is complex for a simple service call without knowing the other tasks.
        // Usually the UI sends the full reordered list of IDs for a column.

        // Let's implement `updateStatusAndOrder` instead.
        const { error } = await this.supabase
            .from('tasks')
            .update({
                status_id: newStatusId,
                sort_order: newIndex,
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

        if (error) throw error;
    }

    // Checklist Management
    async getChecklist(taskId: string): Promise<ChecklistItem[]> {
        const { data, error } = await this.supabase
            .from('task_checklist_items')
            .select('*')
            .eq('task_id', taskId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return z.array(ChecklistItemSchema).parse(data || []);
    }

    async addChecklistItem(data: CreateChecklistItemDTO): Promise<ChecklistItem> {
        const { data: item, error } = await this.supabase
            .from('task_checklist_items')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return ChecklistItemSchema.parse(item);
    }

    async updateChecklistItem(id: string, updates: UpdateChecklistItemDTO): Promise<ChecklistItem> {
        const { data, error } = await this.supabase
            .from('task_checklist_items')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return ChecklistItemSchema.parse(data);
    }

    async deleteChecklistItem(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('task_checklist_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // Assignees
    async getAssignees(taskId: string): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('task_assignees')
            .select('user_id')
            .eq('task_id', taskId);

        if (error) throw error;
        return data.map(d => d.user_id);
    }

    async assignUser(taskId: string, userId: string): Promise<void> {
        const { error } = await this.supabase
            .from('task_assignees')
            .insert({ task_id: taskId, user_id: userId });

        if (error) throw error;
    }

    async unassignUser(taskId: string, userId: string): Promise<void> {
        const { error } = await this.supabase
            .from('task_assignees')
            .delete()
            .eq('task_id', taskId)
            .eq('user_id', userId);

        if (error) throw error;
    }
}

export const tasksService = new TasksService();

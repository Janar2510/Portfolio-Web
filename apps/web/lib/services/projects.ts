import { createClient } from '@/lib/supabase/server';

export type ProjectStatus = 'active' | 'archived' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  color: string | null;
  linked_contact_id: string | null;
  linked_deal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectColumn {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  color: string | null;
  is_done_column: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  column_id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  due_date: string | null;
  due_time: string | null;
  priority: TaskPriority | null;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
}

export class ProjectService {
  private async getSupabase() {
    return await createClient();
  }

  // Project methods
  async getProjects(filters?: {
    status?: ProjectStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ projects: Project[]; total: number }> {
    const supabase = await this.getSupabase();
    let query = supabase.from('projects').select('*', { count: 'exact' });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { projects: data || [], total: count || 0 };
  }

  async getProjectById(id: string): Promise<Project | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createProject(project: {
    name: string;
    description?: string;
    status?: ProjectStatus;
    color?: string;
    linked_contact_id?: string;
    linked_deal_id?: string;
  }): Promise<Project> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...project,
        status: project.status || 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Create default columns
    await this.createDefaultColumns(data.id);

    return data;
  }

  async updateProject(
    id: string,
    updates: {
      name?: string;
      description?: string;
      status?: ProjectStatus;
      color?: string;
      linked_contact_id?: string;
      linked_deal_id?: string;
    }
  ): Promise<Project> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProject(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) throw error;
  }

  // Column methods
  async getColumns(projectId: string): Promise<ProjectColumn[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('project_columns')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createColumn(
    projectId: string,
    column: {
      name: string;
      sort_order?: number;
      color?: string;
      is_done_column?: boolean;
    }
  ): Promise<ProjectColumn> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('project_columns')
      .insert({
        project_id: projectId,
        ...column,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateColumn(
    id: string,
    updates: {
      name?: string;
      sort_order?: number;
      color?: string;
      is_done_column?: boolean;
    }
  ): Promise<ProjectColumn> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('project_columns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteColumn(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('project_columns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async reorderColumns(columnIds: string[]): Promise<void> {
    const supabase = await this.getSupabase();
    const updates = columnIds.map((id, index) =>
      supabase
        .from('project_columns')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);
  }

  async createDefaultColumns(projectId: string): Promise<void> {
    const defaultColumns = [
      { name: 'To Do', sort_order: 0, is_done_column: false },
      { name: 'In Progress', sort_order: 1, is_done_column: false },
      { name: 'Done', sort_order: 2, is_done_column: true },
    ];

    for (const column of defaultColumns) {
      await this.createColumn(projectId, column);
    }
  }

  // Task methods
  async getTasks(projectId: string, columnId?: string): Promise<Task[]> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);

    if (columnId) {
      query = query.eq('column_id', columnId);
    }

    const { data, error } = await query.order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getTaskById(id: string): Promise<Task | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createTask(
    projectId: string,
    columnId: string,
    task: {
      title: string;
      description?: string;
      assignee_id?: string;
      due_date?: string;
      due_time?: string;
      priority?: TaskPriority;
      sort_order?: number;
    }
  ): Promise<Task> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        column_id: columnId,
        ...task,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(
    id: string,
    updates: {
      column_id?: string;
      title?: string;
      description?: string;
      assignee_id?: string;
      due_date?: string;
      due_time?: string;
      priority?: TaskPriority;
      sort_order?: number;
    }
  ): Promise<Task> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) throw error;
  }

  async moveTask(taskId: string, columnId: string, sortOrder: number): Promise<Task> {
    return this.updateTask(taskId, {
      column_id: columnId,
      sort_order: sortOrder,
    });
  }

  async reorderTasks(taskIds: string[]): Promise<void> {
    const supabase = await this.getSupabase();
    const updates = taskIds.map((id, index) =>
      supabase
        .from('tasks')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);
  }

  // Subtask methods
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createSubtask(
    taskId: string,
    subtask: {
      title: string;
      sort_order?: number;
    }
  ): Promise<Subtask> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        ...subtask,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSubtask(
    id: string,
    updates: {
      title?: string;
      is_completed?: boolean;
      sort_order?: number;
    }
  ): Promise<Subtask> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSubtask(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from('subtasks').delete().eq('id', id);

    if (error) throw error;
  }

  // Comment methods
  async getComments(taskId: string): Promise<TaskComment[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createComment(
    taskId: string,
    comment: {
      content: string;
    }
  ): Promise<TaskComment> {
    const supabase = await this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: user.id,
        ...comment,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateComment(id: string, content: string): Promise<TaskComment> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('task_comments')
      .update({ content })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteComment(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Attachment methods
  async getAttachments(taskId: string): Promise<TaskAttachment[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createAttachment(
    taskId: string,
    attachment: {
      file_name: string;
      file_path: string;
      file_size?: number;
      mime_type?: string;
    }
  ): Promise<TaskAttachment> {
    const supabase = await this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: taskId,
        uploaded_by: user.id,
        ...attachment,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAttachment(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

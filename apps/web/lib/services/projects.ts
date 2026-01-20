import { createClient } from '@/lib/supabase/server';

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export class ProjectService {
  private async getSupabase() {
    return await createClient();
  }

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

    if (error) throw error;
    return data;
  }

  async createProject(project: {
    name: string;
    description?: string;
    status: ProjectStatus;
  }): Promise<Project> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProject(
    id: string,
    updates: {
      name?: string;
      description?: string;
      status?: ProjectStatus;
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
}

-- Migration: Create Project Management Module tables
-- Description: Projects, columns, tasks, subtasks, comments, and attachments with RLS policies
-- Note: This migration references contacts and deals tables which should be created in the CRM module migration

-- Projects container
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  color TEXT,                           -- For visual identification
  linked_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  linked_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kanban board columns
CREATE TABLE public.project_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  is_done_column BOOLEAN DEFAULT FALSE, -- Marks completion column
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES public.project_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  due_time TIME,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subtasks (checklist items)
CREATE TABLE public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task comments
CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task attachments (files)
CREATE TABLE public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,              -- Supabase Storage path
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(user_id, status);
CREATE INDEX idx_projects_linked_contact ON public.projects(linked_contact_id) WHERE linked_contact_id IS NOT NULL;
CREATE INDEX idx_projects_linked_deal ON public.projects(linked_deal_id) WHERE linked_deal_id IS NOT NULL;

CREATE INDEX idx_project_columns_project_id ON public.project_columns(project_id);
CREATE INDEX idx_project_columns_sort_order ON public.project_columns(project_id, sort_order);

CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_column_id ON public.tasks(column_id);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id) WHERE assignee_id IS NOT NULL;
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_priority ON public.tasks(priority) WHERE priority IS NOT NULL;
CREATE INDEX idx_tasks_sort_order ON public.tasks(column_id, sort_order);
CREATE INDEX idx_tasks_completed ON public.tasks(completed_at) WHERE completed_at IS NOT NULL;

CREATE INDEX idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX idx_subtasks_sort_order ON public.subtasks(task_id, sort_order);

CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON public.task_comments(user_id);
CREATE INDEX idx_task_comments_created ON public.task_comments(task_id, created_at);

CREATE INDEX idx_task_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX idx_task_attachments_uploaded_by ON public.task_attachments(uploaded_by);

-- Triggers for updated_at
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to set completed_at when task is moved to done column
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new column is a done column
  IF EXISTS (
    SELECT 1 FROM public.project_columns
    WHERE id = NEW.column_id
    AND is_done_column = TRUE
  ) AND OLD.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  ELSIF EXISTS (
    SELECT 1 FROM public.project_columns
    WHERE id = NEW.column_id
    AND is_done_column = FALSE
  ) AND OLD.completed_at IS NOT NULL THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_task_completed_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_completion();

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
-- Users can view their own projects
CREATE POLICY "Users can view own projects"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for project_columns
-- Users can view columns of their own projects
CREATE POLICY "Users can view own project columns"
  ON public.project_columns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_columns.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can insert columns to their own projects
CREATE POLICY "Users can insert own project columns"
  ON public.project_columns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_columns.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update columns of their own projects
CREATE POLICY "Users can update own project columns"
  ON public.project_columns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_columns.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete columns of their own projects
CREATE POLICY "Users can delete own project columns"
  ON public.project_columns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_columns.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for tasks
-- Users can view tasks of their own projects
CREATE POLICY "Users can view own project tasks"
  ON public.tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can insert tasks to their own projects
CREATE POLICY "Users can insert own project tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update tasks of their own projects
CREATE POLICY "Users can update own project tasks"
  ON public.tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete tasks of their own projects
CREATE POLICY "Users can delete own project tasks"
  ON public.tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for subtasks
-- Users can view subtasks of their own project tasks
CREATE POLICY "Users can view own project subtasks"
  ON public.subtasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.projects ON projects.id = tasks.project_id
      WHERE tasks.id = subtasks.task_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can insert subtasks to their own project tasks
CREATE POLICY "Users can insert own project subtasks"
  ON public.subtasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.projects ON projects.id = tasks.project_id
      WHERE tasks.id = subtasks.task_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update subtasks of their own project tasks
CREATE POLICY "Users can update own project subtasks"
  ON public.subtasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.projects ON projects.id = tasks.project_id
      WHERE tasks.id = subtasks.task_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete subtasks of their own project tasks
CREATE POLICY "Users can delete own project subtasks"
  ON public.subtasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.projects ON projects.id = tasks.project_id
      WHERE tasks.id = subtasks.task_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for task_comments
-- Users can view comments of their own project tasks
CREATE POLICY "Users can view own project task comments"
  ON public.task_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.projects ON projects.id = tasks.project_id
      WHERE tasks.id = task_comments.task_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can insert comments to their own project tasks
CREATE POLICY "Users can insert own project task comments"
  ON public.task_comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.projects ON projects.id = tasks.project_id
      WHERE tasks.id = task_comments.task_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own task comments"
  ON public.task_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own task comments"
  ON public.task_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for task_attachments
-- Users can view attachments of their own project tasks
CREATE POLICY "Users can view own project task attachments"
  ON public.task_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.projects ON projects.id = tasks.project_id
      WHERE tasks.id = task_attachments.task_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can insert attachments to their own project tasks
CREATE POLICY "Users can insert own project task attachments"
  ON public.task_attachments
  FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.projects ON projects.id = tasks.project_id
      WHERE tasks.id = task_attachments.task_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete attachments they uploaded
CREATE POLICY "Users can delete own task attachments"
  ON public.task_attachments
  FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_columns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subtasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.task_attachments TO authenticated;

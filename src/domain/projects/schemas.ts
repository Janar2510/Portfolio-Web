import { z } from 'zod';

export const ProjectSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().nullable().optional(),
    color: z.string().default('#888888'),
    icon: z.string().nullable().optional(),
    is_archived: z.boolean().default(false),
    is_template: z.boolean().default(false),
    owner_id: z.string().uuid().nullable().optional(),
    parent_id: z.string().uuid().nullable().optional(),
    custom_fields: z.record(z.any()).default({}),
    settings: z.record(z.any()).default({}),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable().optional(),
});

export const ProjectStatusSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    color: z.string().default('#888888'),
    sort_order: z.number().default(0),
    category: z.enum(['todo', 'active', 'done']).default('active'),
    created_at: z.string(),
    updated_at: z.string(),
});

export const TaskSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    user_id: z.string().uuid().nullable().optional(),
    parent_id: z.string().uuid().nullable().optional(),
    status_id: z.string().uuid().nullable().optional(),

    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional(),
    priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).default('none'),

    start_date: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
    is_completed: z.boolean().default(false),

    related_deal_id: z.string().uuid().nullable().optional(),
    related_person_id: z.string().uuid().nullable().optional(),
    related_organization_id: z.string().uuid().nullable().optional(),

    sprint_id: z.string().uuid().nullable().optional(),

    custom_fields: z.record(z.any()).default({}),
    sort_order: z.number().default(0),

    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable().optional(),
});

export const TaskAssigneeSchema = z.object({
    task_id: z.string().uuid(),
    user_id: z.string().uuid(),
    assigned_at: z.string(),
});

export const ChecklistItemSchema = z.object({
    id: z.string().uuid(),
    task_id: z.string().uuid(),
    content: z.string().min(1),
    is_completed: z.boolean().default(false),
    sort_order: z.number().default(0),
    created_at: z.string(),
    updated_at: z.string(),
});

export const SprintSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    name: z.string().min(1),
    goal: z.string().nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    status: z.enum(['planned', 'active', 'completed', 'archived']).default('planned'),
    created_at: z.string(),
    updated_at: z.string(),
});

// Creation Schemas
export const CreateProjectSchema = ProjectSchema.pick({
    name: true,
    description: true,
    color: true,
    icon: true,
    is_template: true,
    parent_id: true,
    custom_fields: true,
    settings: true,
});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
    is_archived: z.boolean().optional(),
    owner_id: z.string().uuid().optional(),
    parent_id: z.string().uuid().nullable().optional(),
});

export const CreateTaskSchema = TaskSchema.pick({
    project_id: true,
    parent_id: true,
    status_id: true,
    title: true,
    description: true,
    priority: true,
    start_date: true,
    due_date: true,
    related_deal_id: true,
    related_person_id: true,
    related_organization_id: true,
    sprint_id: true,
    custom_fields: true,
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
    is_completed: z.boolean().optional(),
    completed_at: z.string().optional(),
    sort_order: z.number().optional(),
    status_id: z.string().uuid().optional(),
    sprint_id: z.string().uuid().nullable().optional(),
});

export const CreateStatusSchema = ProjectStatusSchema.pick({
    project_id: true,
    name: true,
    color: true,
    category: true,
    sort_order: true,
});

export const CreateChecklistItemSchema = ChecklistItemSchema.pick({
    task_id: true,
    content: true,
});

export const UpdateChecklistItemSchema = CreateChecklistItemSchema.partial().extend({
    is_completed: z.boolean().optional(),
    sort_order: z.number().optional(),
});

export const CreateSprintSchema = SprintSchema.pick({
    project_id: true,
    name: true,
    goal: true,
    start_date: true,
    end_date: true,
    status: true,
});

export const UpdateSprintSchema = CreateSprintSchema.partial();

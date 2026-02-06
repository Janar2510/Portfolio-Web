import { z } from 'zod';

export const GoalSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    project_id: z.string().uuid().nullable().optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional(),
    status: z.enum(['active', 'completed', 'archived']).default('active'),
    start_date: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    progress: z.number().min(0).max(100).default(0),
    owner_id: z.string().uuid().nullable().optional(),
    sort_order: z.number().default(0),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable().optional(),
});

export const KeyResultSchema = z.object({
    id: z.string().uuid(),
    goal_id: z.string().uuid(),
    title: z.string().min(1, 'Title is required'),
    target_value: z.number(),
    current_value: z.number().default(0),
    unit: z.enum(['number', 'currency', 'percentage']).default('number'),
    sort_order: z.number().default(0),
    created_at: z.string(),
    updated_at: z.string(),
});

// DTOs
export const CreateGoalSchema = GoalSchema.pick({
    project_id: true,
    title: true,
    description: true,
    status: true,
    start_date: true,
    due_date: true,
    progress: true,
    owner_id: true,
});

export const UpdateGoalSchema = CreateGoalSchema.partial().extend({
    is_archived: z.boolean().optional(), // Mapped to status in service if needed, or direct status update
    sort_order: z.number().optional(),
});

export const CreateKeyResultSchema = KeyResultSchema.pick({
    goal_id: true,
    title: true,
    target_value: true,
    current_value: true,
    unit: true,
});

export const UpdateKeyResultSchema = CreateKeyResultSchema.partial().extend({
    sort_order: z.number().optional(),
});

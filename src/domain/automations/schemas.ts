import { z } from 'zod';

export const TriggerTypeSchema = z.enum([
    'task.created',
    'task.updated',
    'task.status_changed',
    'task.completed'
]);

export const ActionTypeSchema = z.enum([
    'task.create_subtasks',
    'task.assign',
    'notification.send',
    'task.update_field'
]);

export const AutomationSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    project_id: z.string().uuid().nullable(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().nullable(),
    is_active: z.boolean(),
    trigger_type: TriggerTypeSchema,
    trigger_config: z.record(z.any()), // flexible json
    action_type: ActionTypeSchema,
    action_config: z.record(z.any()),
    created_at: z.string(),
    updated_at: z.string(),
});

export const CreateAutomationSchema = AutomationSchema.omit({
    id: true,
    user_id: true,
    created_at: true,
    updated_at: true
});

export const UpdateAutomationSchema = CreateAutomationSchema.partial();

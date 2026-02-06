import { z } from 'zod';
import {
    ProjectSchema,
    ProjectStatusSchema,
    TaskSchema,
    TaskAssigneeSchema,
    ChecklistItemSchema,
    SprintSchema,
    CreateProjectSchema,
    UpdateProjectSchema,
    CreateTaskSchema,
    UpdateTaskSchema,
    CreateStatusSchema,
    CreateChecklistItemSchema,
    UpdateChecklistItemSchema,
    CreateSprintSchema,
    UpdateSprintSchema
} from './schemas';

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type TaskAssignee = z.infer<typeof TaskAssigneeSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type Sprint = z.infer<typeof SprintSchema>;

export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectDTO = z.infer<typeof UpdateProjectSchema>;

export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>;

export type CreateStatusDTO = z.infer<typeof CreateStatusSchema>;

export type CreateChecklistItemDTO = z.infer<typeof CreateChecklistItemSchema>;
export type UpdateChecklistItemDTO = z.infer<typeof UpdateChecklistItemSchema>;

export type CreateSprintDTO = z.infer<typeof CreateSprintSchema>;
export type UpdateSprintDTO = z.infer<typeof UpdateSprintSchema>;

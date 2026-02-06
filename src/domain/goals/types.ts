import { z } from 'zod';
import {
    GoalSchema,
    KeyResultSchema,
    CreateGoalSchema,
    UpdateGoalSchema,
    CreateKeyResultSchema,
    UpdateKeyResultSchema
} from './schemas';

export type Goal = z.infer<typeof GoalSchema>;
export type KeyResult = z.infer<typeof KeyResultSchema>;

export type CreateGoalDTO = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDTO = z.infer<typeof UpdateGoalSchema>;

export type CreateKeyResultDTO = z.infer<typeof CreateKeyResultSchema>;
export type UpdateKeyResultDTO = z.infer<typeof UpdateKeyResultSchema>;

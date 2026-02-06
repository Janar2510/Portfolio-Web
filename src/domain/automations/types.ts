import { z } from 'zod';
import {
    AutomationSchema,
    CreateAutomationSchema,
    UpdateAutomationSchema,
    TriggerTypeSchema,
    ActionTypeSchema
} from './schemas';

export type Automation = z.infer<typeof AutomationSchema>;
export type CreateAutomationDTO = z.infer<typeof CreateAutomationSchema>;
export type UpdateAutomationDTO = z.infer<typeof UpdateAutomationSchema>;

export type TriggerType = z.infer<typeof TriggerTypeSchema>;
export type ActionType = z.infer<typeof ActionTypeSchema>;

export interface TriggerConfig {
    [key: string]: any;
}

export interface ActionConfig {
    [key: string]: any;
}

import { createClient } from '@/lib/supabase/client';
import { TriggerType, ActionType, Automation } from '../types'; // from types.ts
import { tasksService } from '@/domain/projects/services/tasks-service'; // Import lazily or use dependency injection to avoid cycles if strictly typed, but here direct import is usually fine if we are careful. 
// Actually, circular dependency risk: TasksService -> AutomationRunner -> TasksService (for actions).
// Better to pass TasksService instance or methods, or use a slightly different architecture.
// For now, let's keep it simple. If we import tasksService inside the method, it often avoids build time cycles in some bundlers, but runtime is what matters. 
// Safest is to instantiate supabase client here or use the one from client.ts.

export interface AutomationContext {
    projectId: string;
    task?: any;
    [key: string]: any;
}

export class AutomationRunner {
    private supabase = createClient();

    async checkAndRun(trigger: TriggerType, context: AutomationContext) {
        console.log(`[AutomationRunner] Checking trigger: ${trigger}`, context);

        try {
            // 1. Fetch active rules for this trigger and project (or global)
            let query = this.supabase
                .from('automations')
                .select('*')
                .eq('is_active', true)
                .eq('trigger_type', trigger);

            // Filter by project (or global rules with null project_id)
            if (context.projectId) {
                // Correct Supabase OR syntax: or=(column.eq.value,column.is.null)
                query = query.or(`project_id.eq.${context.projectId},project_id.is.null`);
            } else {
                query = query.is('project_id', null);
            }

            const { data: rules, error } = await query;

            if (error) {
                console.error('[AutomationRunner] Failed to fetch rules', error);
                return;
            }

            if (!rules || rules.length === 0) {
                console.log('[AutomationRunner] No rules found for query:', { trigger, projectId: context.projectId });
                return;
            }

            console.log(`[AutomationRunner] Found ${rules.length} potential rules`);

            // 2. Evaluate & Run
            for (const rule of rules) {
                if (this.evaluateCondition(rule, context)) {
                    await this.executeAction(rule, context);
                }
            }
        } catch (e) {
            console.error('[AutomationRunner] Unexpected error', e);
        }
    }

    private evaluateCondition(rule: Automation, context: AutomationContext): boolean {
        const config = rule.trigger_config;

        // Example: If trigger is "task.status_changed" and config has "status_id", match it
        if (rule.trigger_type === 'task.status_changed') {
            if (config.status_id && context.new_status_id !== config.status_id) {
                return false;
            }
        }

        // Example: If trigger is "task.created" and config has "status_id" (e.g. created in "Done")
        if (rule.trigger_type === 'task.created') {
            if (config.status_id && context.task?.status_id !== config.status_id) {
                return false;
            }
        }

        return true;
    }

    private async executeAction(rule: Automation, context: AutomationContext) {
        console.log(`[AutomationRunner] Executing rule: ${rule.name} (${rule.action_type})`);
        const config = rule.action_config;

        try {
            await this.logExecution(rule.id, 'running', { context });

            if (rule.action_type === 'task.create_subtasks') {
                const subtasks = config.subtasks as string[]; // e.g., ["Design", "Review"]
                if (subtasks && Array.isArray(subtasks) && context.task?.id) {
                    // Avoid circular dependency by importing dynamically or ensuring tasksService is robust
                    // In a real app we might emit an event or use a command bus.
                    // For MVP, we'll try direct import or direct DB insert if service is problematic.
                    // Re-importing tasksService usually works in ES modules if no side-effects block it.
                    const { tasksService } = await import('@/domain/projects/services/tasks-service');

                    for (const title of subtasks) {
                        await tasksService.create({
                            title: title,
                            project_id: context.projectId,
                            parent_id: context.task.id,
                            priority: 'medium', // Default
                            // inherit other fields?
                        } as any); // cast to any if DTO is strict, or just fix the type properly.
                        // Actually let's check CreateTaskDTO.
                        // It expects: title, project_id, description?, etc.
                        // Let's use strict property 'title' and valid DTO.
                    }
                }
            } else if (rule.action_type === 'task.assign') {
                if (config.user_id && context.task?.id) {
                    const { tasksService } = await import('@/domain/projects/services/tasks-service');
                    await tasksService.assignUser(context.task.id, config.user_id);
                }
            }

            await this.logExecution(rule.id, 'success', { executed: true });

        } catch (e: any) {
            console.error(`[AutomationRunner] Action failed: ${rule.id}`, e);
            await this.logExecution(rule.id, 'failed', { error: e.message });
        }
    }

    private async logExecution(automationId: string, status: string, details: any) {
        // user_id is optional in logs, maybe we can get it from context or auth session
        // For now, let's just log system actions as null user or similar.
        // We'll skip fetching user for speed unless necessary.
        await this.supabase.from('automation_logs').insert({
            automation_id: automationId,
            status,
            details,
            executed_at: new Date().toISOString()
        });
    }
}

export const automationRunner = new AutomationRunner();

export type PlanId = 'free' | 'starter' | 'professional' | 'business';

export interface PlanLimits {
    sites: number;
}

export interface PlanConfig {
    id: PlanId;
    name: string;
    limits: PlanLimits;
}

export const PLANS: Record<PlanId, PlanConfig> = {
    free: {
        id: 'free',
        name: 'Free',
        limits: { sites: 1 },
    },
    starter: {
        id: 'starter',
        name: 'Starter',
        limits: { sites: 1 },
    },
    professional: {
        id: 'professional',
        name: 'Professional',
        limits: { sites: 1 },
    },
    business: {
        id: 'business',
        name: 'Business',
        limits: { sites: 3 },
    },
};

export const DEFAULT_PLAN: PlanId = 'free';

export function getPlanConfig(planId?: string | null): PlanConfig {
    const id = (planId as PlanId) || DEFAULT_PLAN;
    return PLANS[id] || PLANS[DEFAULT_PLAN];
}

export function canCreateSite(currentSiteCount: number, planId?: string | null): boolean {
    const config = getPlanConfig(planId);
    return currentSiteCount < config.limits.sites;
}

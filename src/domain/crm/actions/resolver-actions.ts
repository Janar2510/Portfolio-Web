'use server';

import { resolverService } from '../services/resolver-service';

export async function resolveEntitiesByEmail(email: string) {
    try {
        const result = await resolverService.resolveByEmail(email);
        return { success: true, data: result };
    } catch (error) {
        console.error('Failed to resolve entities:', error);
        return { success: false, error: 'Failed to resolve entities' };
    }
}

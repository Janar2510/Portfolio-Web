'use client';

import { useState, useCallback } from 'react';
import { resolveEntitiesByEmail } from '@/domain/crm/actions/resolver-actions';
import type { ResolutionResult } from '@/domain/crm/services/resolver-service';
import { toast } from 'sonner';

export function useEntityResolver() {
    const [isResolving, setIsResolving] = useState(false);
    const [resolvedData, setResolvedData] = useState<ResolutionResult | null>(null);

    const resolve = useCallback(async (email: string) => {
        if (!email || !email.includes('@')) return;

        setIsResolving(true);
        try {
            const { success, data, error } = await resolveEntitiesByEmail(email);
            if (success && data) {
                setResolvedData(data);

                // Optional: Toast feedback if successful resolution happened
                if (data.person || data.organization) {
                    const parts = [];
                    if (data.person) parts.push(`Contact: ${data.person.first_name}`);
                    if (data.organization) parts.push(`Org: ${data.organization.name}`);
                    toast.success(`Found existing data: ${parts.join(', ')}`);
                }
            } else {
                console.error(error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsResolving(false);
        }
    }, []);

    const clear = useCallback(() => {
        setResolvedData(null);
    }, []);

    return {
        isResolving,
        resolvedData,
        resolve,
        clear
    };
}

import { createClient } from '@/lib/supabase/client';
import { PersonSchema, OrganizationSchema, DealSchema } from '../schemas';
import { Person, Organization, Deal } from '../types';

export interface ResolutionResult {
    person: Person | null;
    organization: Organization | null;
    suggestedDeals: Deal[];
}

export class ResolverService {
    private supabase = createClient();

    /**
     * Resolves entities based on an email address.
     * 1. Finds Person with this email.
     * 2. Finds Organization linked to Person.
     * 3. If no Org linked (or Person not found), attempts to find Org by email domain.
     */
    async resolveByEmail(email: string): Promise<ResolutionResult> {
        let person: Person | null = null;
        let organization: Organization | null = null;

        // 1. Try to find Person by email
        // utilizing the JSONB containment operator @>
        // emails structure is [{ value: "...", ... }]
        const { data: personData } = await this.supabase
            .from('crm_persons')
            .select('*')
            .contains('emails', [{ value: email }])
            .is('deleted_at', null)
            .maybeSingle();

        if (personData) {
            person = PersonSchema.parse(personData) as unknown as Person;
        }

        // 2. If person found and has org_id, fetch Org
        if (person?.organization_id) {
            const { data: orgData } = await this.supabase
                .from('crm_organizations')
                .select('*')
                .eq('id', person.organization_id)
                .is('deleted_at', null)
                .maybeSingle();

            if (orgData) {
                organization = OrganizationSchema.parse(orgData);
            }
        }

        // 3. (Fallback) If no Organization found yet, try domain matching
        if (!organization) {
            const domain = this.extractDomain(email);
            if (domain && !this.isGenericDomain(domain)) {
                // Search in custom_fields -> website or generic similarity in name
                // Basic implementation: Check if any organization website contains domain
                // Note: exact domain match in JSONB is tricky without specific structure.
                // We'll try a rough search on custom_fields or name

                // Try finding by name (often domain part)
                const namePart = domain.split('.')[0];

                // Or if you have a specific website field in custom_fields
                // .or(`custom_fields->>website.ilike.%${domain}%`)
                const { data: orgData } = await this.supabase
                    .from('crm_organizations')
                    .select('*')
                    .or(`name.ilike.%${namePart}%, custom_fields->>website.ilike.%${domain}%`)
                    .is('deleted_at', null)
                    .limit(1)
                    .maybeSingle();

                if (orgData) {
                    organization = OrganizationSchema.parse(orgData);
                }
            }
        }

        return {
            person,
            organization,
            suggestedDeals: [] // Can accept generic deals later if needed
        };
    }

    private extractDomain(email: string): string | null {
        const parts = email.split('@');
        if (parts.length === 2) return parts[1].toLowerCase();
        return null;
    }

    private isGenericDomain(domain: string): boolean {
        const generics = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'protonmail.com'];
        return generics.includes(domain);
    }
}

export const resolverService = new ResolverService();

import { Organization, Person } from '../schemas/crm';

export type { Organization, Person };

export interface EntityReference {
    id: string;
    type: 'person' | 'organization';
}

export interface SearchQuery {
    query: string;
    limit?: number;
    offset?: number;
}

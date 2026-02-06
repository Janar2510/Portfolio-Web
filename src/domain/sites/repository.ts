import { SiteDocument } from './site-schema';

export interface SitesRepository {
    create(site: SiteDocument): Promise<SiteDocument>;
    update(site: SiteDocument): Promise<SiteDocument>;
    getById(id: string): Promise<SiteDocument | null>;
    listByOwner(ownerId: string): Promise<SiteDocument[]>;
    getPublishedBySlug(slug: string): Promise<SiteDocument | null>;
    delete(id: string): Promise<void>;
}

/**
 * A stub implementation that throws for all methods.
 * Used during initial development before DB integration.
 */
export class NotImplementedSitesRepository implements SitesRepository {
    async create(site: SiteDocument): Promise<SiteDocument> {
        throw new Error('SitesRepository.create not implemented');
    }
    async update(site: SiteDocument): Promise<SiteDocument> {
        throw new Error('SitesRepository.update not implemented');
    }
    async getById(id: string): Promise<SiteDocument | null> {
        throw new Error('SitesRepository.getById not implemented');
    }
    async listByOwner(ownerId: string): Promise<SiteDocument[]> {
        throw new Error('SitesRepository.listByOwner not implemented');
    }
    async getPublishedBySlug(slug: string): Promise<SiteDocument | null> {
        throw new Error('SitesRepository.getPublishedBySlug not implemented');
    }
    async delete(id: string): Promise<void> {
        throw new Error('SitesRepository.delete not implemented');
    }
}

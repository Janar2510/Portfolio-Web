import { SupabaseClient, User } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { SitesRepository } from '../repository';
import { SiteDocument } from '../site-schema';
import { PortfolioService } from '../../builder/portfolio';
import { portfolioSiteToSiteDocument, siteDocumentToPortfolioUpdate } from '../mappers/portfolio-mapper';
import { ValidationError, ConflictError } from '../errors';

export class SupabaseSitesRepository implements SitesRepository {
    private portfolio: PortfolioService;

    constructor(supabase: SupabaseClient, private user?: User | null) {
        this.portfolio = new PortfolioService(supabase, user);
    }

    async create(site: SiteDocument): Promise<SiteDocument> {
        try {
            const created = await this.portfolio.createSite({
                name: site.name,
                subdomain: site.slug,
                templateId: site.templateId
            });

            // After creation, PortfolioService applies template defaults.
            // We perform a second update to ensure the canonical draft_config is synced.
            const updates = siteDocumentToPortfolioUpdate(site);
            const adminClient = createAdminClient();
            await this.portfolio.updateSite(created.id, {
                draft_config: updates.draft_config
            }, adminClient);

            const fresh = await this.portfolio.getSiteById(created.id, adminClient);
            if (!fresh) throw new Error('Failed to retrieve created site');

            return portfolioSiteToSiteDocument(fresh);
        } catch (error: any) {
            if (error?.message?.includes('already has a site')) {
                throw new ConflictError('User already has a site');
            }
            throw error;
        }
    }

    async update(site: SiteDocument): Promise<SiteDocument> {
        const adminClient = createAdminClient();
        const updates = siteDocumentToPortfolioUpdate(site);
        await this.portfolio.updateSite(site.id, updates, adminClient);

        const fresh = await this.portfolio.getSiteById(site.id, adminClient);
        if (!fresh) throw new Error(`Failed to retrieve updated site: ${site.id}`);

        return portfolioSiteToSiteDocument(fresh);
    }

    async getById(id: string): Promise<SiteDocument | null> {
        const adminClient = createAdminClient();
        const row = await this.portfolio.getSiteById(id, adminClient);
        return row ? portfolioSiteToSiteDocument(row) : null;
    }

    async listByOwner(ownerId: string): Promise<SiteDocument[]> {
        console.log(`[SupabaseSitesRepository] listByOwner called for: ${ownerId}`);
        // Current user constraint check
        if (this.user && this.user.id !== ownerId) {
            console.warn(`[SupabaseSitesRepository] Ownership mismatch! Repo user: ${this.user.id}, requested: ${ownerId}`);
            return [];
        }

        const adminClient = createAdminClient();
        const rows = await this.portfolio.getSites(adminClient);
        console.log(`[SupabaseSitesRepository] PortfolioService.getSites (via Admin) returned ${rows?.length || 0} rows`);
        return rows.map(portfolioSiteToSiteDocument);
    }

    async getPublishedBySlug(slug: string): Promise<SiteDocument | null> {
        const adminClient = createAdminClient();
        const row = await this.portfolio.getSiteBySubdomain(slug, adminClient);
        return row ? portfolioSiteToSiteDocument(row) : null;
    }

    async delete(id: string): Promise<void> {
        const adminClient = createAdminClient();
        await this.portfolio.deleteSite(id);
    }
}

import { TemplateId, Locale } from '../templates/types';
import { getTemplate } from '../templates/registry';
import { SiteDocument, SiteSection, SITE_SCHEMA_VERSION } from './site-schema';
import { SitesRepository } from './repository';
import { slugify, ensureUniqueSlug } from './slug';
import { ValidationError, NotFoundError } from './errors';

export interface CreateSiteParams {
    ownerId: string;
    name: string;
    templateId: TemplateId;
    locale?: Locale;
}

export interface PublishSiteParams {
    siteId: string;
}

export interface UpdateSiteSchemaParams {
    siteId: string;
    updater: (site: SiteDocument) => SiteDocument;
}

/**
 * Core service for managing Sites using the canonical schema.
 */
export class SitesService {
    constructor(
        private repo: SitesRepository,
        private now = () => new Date().toISOString(),
        private idFactory = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            // Simple fallback for environments without crypto.randomUUID
            return 'site_' + Math.random().toString(36).substring(2, 9);
        }
    ) { }

    /**
     * 1. Creates a new SiteDocument from a template.
     */
    async createSiteFromTemplate(params: CreateSiteParams): Promise<SiteDocument> {
        const { ownerId, name, templateId } = params;

        if (!ownerId) throw new ValidationError('ownerId is required');
        if (!name) throw new ValidationError('name is required');
        if (!templateId) throw new ValidationError('templateId is required');

        const template = getTemplate(templateId);
        if (!template) throw new ValidationError(`Template not found: ${templateId}`);

        const locale = params.locale ?? template.defaultLocale;
        const desiredSlug = slugify(name);

        // Ensure slug uniqueness
        const slug = await ensureUniqueSlug(desiredSlug, async (s) => {
            const published = await this.repo.getPublishedBySlug(s);
            return !!published;
        });

        const timestamp = this.now();

        const site: SiteDocument = {
            id: this.idFactory(),
            ownerId,
            name,
            slug,
            templateId,
            locale,
            status: 'draft',
            schemaVersion: SITE_SCHEMA_VERSION,
            sections: JSON.parse(JSON.stringify(template.defaultSections)), // Deep copy
            createdAt: timestamp,
            updatedAt: timestamp,
            // Compatibility aliases
            template_id: templateId,
            owner_id: ownerId,
            owner_user_id: ownerId,
            created_at: timestamp,
            updated_at: timestamp
        };

        return this.repo.create(site);
    }

    /**
     * 2. Lists all sites for a specific owner.
     */
    async listUserSites(ownerId: string): Promise<SiteDocument[]> {
        if (!ownerId) throw new ValidationError('ownerId is required');
        return this.repo.listByOwner(ownerId);
    }

    /**
     * 3. Retrieves a site by its unique ID.
     */
    async getSiteById(siteId: string): Promise<SiteDocument> {
        const site = await this.repo.getById(siteId);
        if (!site) throw new NotFoundError(`Site not found: ${siteId}`);
        return site;
    }

    /**
     * 4. Updates the site schema using an updater function.
     */
    async updateSiteSchema(params: UpdateSiteSchemaParams): Promise<SiteDocument> {
        const { siteId, updater } = params;

        const site = await this.getSiteById(siteId);
        const updated = updater(site);

        // Enforce immutability of core fields
        updated.id = site.id;
        updated.ownerId = site.ownerId;
        updated.createdAt = site.createdAt;
        updated.schemaVersion = SITE_SCHEMA_VERSION;

        updated.updatedAt = this.now();
        updated.updated_at = updated.updatedAt;

        return this.repo.update(updated);
    }

    /**
     * 5. Publishes a site by taking a snapshot of the current configuration.
     */
    async publishSite(params: PublishSiteParams): Promise<SiteDocument> {
        const { siteId } = params;
        const site = await this.getSiteById(siteId);

        const hasEnabledSection = site.sections.some(s => s.enabled);
        if (!hasEnabledSection) {
            throw new ValidationError('Site must have at least one enabled section to publish');
        }

        const timestamp = this.now();

        site.status = 'published';
        site.publishedAt = timestamp;
        site.publishedSnapshot = {
            schemaVersion: site.schemaVersion,
            sections: JSON.parse(JSON.stringify(site.sections)), // Deep copy snapshot
            publishedAt: timestamp
        };
        site.updatedAt = timestamp;
        site.updated_at = timestamp;

        return this.repo.update(site);
    }

    /**
     * 6. Unpublishes a site, reverting it to draft status.
     */
    async unpublishSite(params: PublishSiteParams): Promise<SiteDocument> {
        const { siteId } = params;
        const site = await this.getSiteById(siteId);

        const timestamp = this.now();

        site.status = 'draft';
        delete site.publishedAt;
        delete site.publishedSnapshot;
        site.updatedAt = timestamp;
        site.updated_at = timestamp;

        return this.repo.update(site);
    }

    /**
     * 7. Resolves a published site by its slug.
     */
    async getPublishedSiteBySlug(slug: string): Promise<SiteDocument> {
        if (!slug) throw new ValidationError('Slug is required');
        const site = await this.repo.getPublishedBySlug(slug);
        if (!site) throw new NotFoundError(`Published site not found for slug: ${slug}`);
        return site;
    }
}

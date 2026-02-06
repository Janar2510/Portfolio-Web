import { PortfolioSite } from '../../builder/portfolio';
import { SiteDocument, SiteSchemaVersion } from '../site-schema';
import { TemplateId, Locale, SiteStatus } from '../../templates/types';

/**
 * Pure helper to map a database PortfolioSite row to a canonical SiteDocument.
 */
export function portfolioSiteToSiteDocument(row: PortfolioSite): SiteDocument {
    const draftConfig = row.draft_config as any;
    const publishedConfig = row.published_config as any;

    return {
        id: row.id,
        ownerId: row.owner_user_id,
        name: draftConfig?.siteTitle || row.slug,
        slug: row.slug,
        templateId: row.template_id as TemplateId,
        status: row.status as SiteStatus,
        locale: (draftConfig?.locale as Locale) || 'et',
        schemaVersion: (draftConfig?.schemaVersion as SiteSchemaVersion) || 1,
        sections: draftConfig?.sections || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        publishedAt: row.updated_at, // Best effort from existing schema
        publishedSnapshot: publishedConfig ? {
            schemaVersion: (publishedConfig.schemaVersion as number) || 1,
            locale: publishedConfig.locale || draftConfig?.locale || 'et',
            sections: publishedConfig.sections || [],
            publishedAt: row.updated_at
        } : undefined,
        // Compatibility aliases
        draft_config: row.draft_config,
        published_config: row.published_config,
        template_id: row.template_id,
        owner_id: row.owner_user_id,
        owner_user_id: row.owner_user_id,
        created_at: row.created_at,
        updated_at: row.updated_at
    };
}

/**
 * Pure helper to map a SiteDocument to a partial PortfolioSite update.
 */
export function siteDocumentToPortfolioUpdate(site: SiteDocument): Partial<PortfolioSite> {
    // Construct draft_config from canonical fields
    const draft_config = {
        ...((site as any).draft_config || {}),
        siteTitle: site.name,
        locale: site.locale,
        schemaVersion: site.schemaVersion,
        sections: site.sections
    };

    const update: Partial<PortfolioSite> = {
        slug: site.slug,
        template_id: site.templateId,
        status: site.status as 'draft' | 'published',
        draft_config: draft_config as any
    };

    if (site.publishedSnapshot) {
        update.published_config = {
            schemaVersion: site.publishedSnapshot.schemaVersion,
            locale: site.publishedSnapshot.locale || site.locale,
            sections: site.publishedSnapshot.sections
        } as any;
    } else {
        update.published_config = null;
    }

    return update;
}

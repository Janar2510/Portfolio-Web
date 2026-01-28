import { createClient } from '@/lib/supabase/client';
import { SiteDocument, SiteDocumentSchema, TemplateConfig } from '../templates/contracts';

export class SiteService {
    private supabase = createClient();

    async getSite(siteId: string): Promise<SiteDocument | null> {
        const { data, error } = await this.supabase
            .from('sites')
            .select('*')
            .eq('id', siteId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return SiteDocumentSchema.parse(data);
    }

    async getSiteByUserId(userId: string): Promise<SiteDocument | null> {
        const { data, error } = await this.supabase
            .from('sites')
            .select('*')
            .eq('owner_user_id', userId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return SiteDocumentSchema.parse(data);
    }

    async createSite(data: Partial<SiteDocument>): Promise<SiteDocument> {
        const { data: created, error } = await this.supabase
            .from('sites')
            .insert({
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return SiteDocumentSchema.parse(created);
    }

    async updateSite(siteId: string, updates: Partial<SiteDocument>): Promise<SiteDocument> {
        const { data, error } = await this.supabase
            .from('sites')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', siteId)
            .select()
            .single();

        if (error) throw error;
        return SiteDocumentSchema.parse(data);
    }

    async deleteSite(siteId: string): Promise<void> {
        const { error } = await this.supabase
            .from('sites')
            .delete()
            .eq('id', siteId);

        if (error) throw error;
    }

    async updateDraft(siteId: string, config: Partial<TemplateConfig>): Promise<void> {
        const site = await this.getSite(siteId);
        if (!site) throw new Error('Site not found');

        const newDraft = { ...site.draft_config, ...config };

        const { error } = await this.supabase
            .from('sites')
            .update({
                draft_config: newDraft,
                updated_at: new Date().toISOString()
            })
            .eq('id', siteId);

        if (error) throw error;
    }
}

export class PublishingService {
    private supabase = createClient();
    private siteService = new SiteService();

    async publish(siteId: string, userId: string): Promise<void> {
        const site = await this.siteService.getSite(siteId);
        if (!site) throw new Error('Site not found');

        // Atomic promotion: copy draft -> published and set status
        const { error: siteError } = await this.supabase
            .from('sites')
            .update({
                published_config: site.draft_config,
                status: 'published',
                updated_at: new Date().toISOString()
            })
            .eq('id', siteId);

        if (siteError) throw siteError;
    }

    async rollback(siteId: string, releaseId: string): Promise<void> {
        // Rollback not implemented in MVP schema
        throw new Error('Rollback not supported in MVP');
    }
}

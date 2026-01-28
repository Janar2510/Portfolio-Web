import { createClient } from '@/lib/supabase/client';
import { SiteDocument, SiteDocumentSchema } from '../templates/contracts';

export class RendererService {
    private supabase = createClient();

    /**
     * Fetches a site for the public renderer.
     * Only returns the published configuration.
     */
    async getPublishedSiteBySlug(slug: string): Promise<SiteDocument | null> {
        const { data, error } = await this.supabase
            .from('sites')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return SiteDocumentSchema.parse(data);
    }

    async getPublishedSiteByDomain(domain: string): Promise<SiteDocument | null> {
        // Custom domain support not in Step 4 minimal schema
        return null;
    }
}

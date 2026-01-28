import { createClientWithUser, createClient } from '@/lib/supabase/server';
import { Site, CreateSiteParams } from './types';

/**
 * List all sites owned by the current user
 */
export async function getMySites(): Promise<Site[]> {
    const { supabase, user } = await createClientWithUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching my sites:', error);
        throw error;
    }

    return data as Site[];
}

/**
 * Create a new site for the current user
 */
export async function createSite(params: CreateSiteParams): Promise<Site> {
    const { supabase, user } = await createClientWithUser();

    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('sites')
        .insert({
            slug: params.slug,
            template_id: params.templateId,
            owner_user_id: user.id,
            draft_config: {}, // Initial empty config
            status: 'draft'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating site:', error);
        throw error;
    }

    return data as Site;
}

/**
 * Get a site by ID, verifying ownership
 */
export async function getSiteById(siteId: string): Promise<Site | null> {
    const { supabase, user } = await createClientWithUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .eq('owner_user_id', user.id) // Enforce owner check
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching site:', error);
        }
        return null;
    }

    return data as Site;
}

/**
 * Update the draft configuration of a site
 */
export async function updateDraftConfig(siteId: string, draftConfig: any): Promise<void> {
    const { supabase, user } = await createClientWithUser();
    if (!user) throw new Error('Unauthorized');

    // Verify ownership implicitly via the update query filter

    const { error } = await supabase
        .from('sites')
        .update({
            draft_config: draftConfig,
            updated_at: new Date().toISOString()
        })
        .eq('id', siteId)
        .eq('owner_user_id', user.id);

    if (error) throw error;
}

/**
 * Publish a site: Copy draft config to published config and set status to 'published'
 */
// Publish a site: Copy draft config to published config and set status to 'published'
export async function publishSite(siteId: string): Promise<void> {
    // Note: This logic is slightly inefficient because getSiteById calls createClientWithUser internally too if we used it,
    // but here we want to hold the same client.
    // However, since getSiteById is exported, we can just call it (creating 1 client) and then create another client here... 
    // Wait, that brings back the 2 clients issue!
    // We should INLINE the logic or pass the client. But getSiteById does not accept a client.

    // Better approach: Get client first.
    const { supabase, user } = await createClientWithUser();
    if (!user) throw new Error('Unauthorized');

    // Fetch site using THIS client
    const { data: site } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .eq('owner_user_id', user.id)
        .single();

    if (!site) throw new Error('Site not found');

    const { error } = await supabase
        .from('sites')
        .update({
            published_config: site.draft_config,
            status: 'published',
            updated_at: new Date().toISOString()
        })
        .eq('id', siteId)
        .eq('owner_user_id', user.id);

    if (error) throw error;
}

/**
 * Public access: Get a published site by slug
 */
export async function getPublishedSiteBySlug(slug: string): Promise<Site | null> {
    const supabase = await createClient();

    // Querying the 'published_sites' view as requested
    const { data, error } = await supabase
        .from('published_sites')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Error fetching published site:', error);
        }
        return null;
    }

    return data as Site;
}

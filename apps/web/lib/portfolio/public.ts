/**
 * Public Portfolio Service
 * Service for fetching public portfolio data (no auth required)
 */

import { createClient } from '@/lib/supabase/server';

export interface PublicPortfolioSite {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  seo_title: string | null;
  seo_description: string | null;
  favicon_url: string | null;
  analytics_id: string | null;
}

export interface PublicPortfolioPage {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  is_homepage: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
}

export interface PublicPortfolioBlock {
  id: string;
  page_id: string;
  block_type: string;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  sort_order: number;
}

export interface PublicPortfolioStyle {
  id: string;
  site_id: string;
  color_palette: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  typography: {
    headingFont?: string;
    bodyFont?: string;
    scale?: string;
  };
  spacing_scale: string;
  custom_css: string | null;
}

export class PublicPortfolioService {
  private async getSupabase() {
    // Use anon client for public access
    return await createClient();
  }

  async getSiteBySubdomain(subdomain: string): Promise<PublicPortfolioSite | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_sites')
      .select('id, name, subdomain, custom_domain, seo_title, seo_description, favicon_url, analytics_id')
      .eq('subdomain', subdomain)
      .eq('is_published', true)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async getPagesBySite(siteId: string): Promise<PublicPortfolioPage[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_pages')
      .select('id, site_id, slug, title, is_homepage, is_published, seo_title, seo_description, sort_order')
      .eq('site_id', siteId)
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPageBySlug(siteId: string, slug: string): Promise<PublicPortfolioPage | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_pages')
      .select('id, site_id, slug, title, is_homepage, is_published, seo_title, seo_description, sort_order')
      .eq('site_id', siteId)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async getBlocksByPage(pageId: string): Promise<PublicPortfolioBlock[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_blocks')
      .select('id, page_id, block_type, content, settings, sort_order')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getStylesBySite(siteId: string): Promise<PublicPortfolioStyle | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_styles')
      .select('*')
      .eq('site_id', siteId)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async getAllPublishedSites(): Promise<Array<{ subdomain: string }>> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_sites')
      .select('subdomain')
      .eq('is_published', true);

    if (error) throw error;
    return data || [];
  }
}

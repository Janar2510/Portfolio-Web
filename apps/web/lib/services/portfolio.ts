import { createClient } from '@/lib/supabase/server';

export interface PortfolioSite {
  id: string;
  user_id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  favicon_url: string | null;
  analytics_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PortfolioPage {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  is_homepage: boolean;
  is_published: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioBlock {
  id: string;
  page_id: string;
  block_type: string;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioStyle {
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

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  pages_schema: Record<string, unknown>;
  styles_schema: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export class PortfolioService {
  private async getSupabase() {
    return await createClient();
  }

  // Site methods
  async getSite(): Promise<PortfolioSite | null> {
    const supabase = await this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('portfolio_sites')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') return null; // No site found
    if (error) throw error;
    return data;
  }

  async getSiteBySubdomain(subdomain: string): Promise<PortfolioSite | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_sites')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_published', true)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async getSiteById(id: string): Promise<PortfolioSite | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createSite(site: {
    name: string;
    subdomain: string;
    templateId?: string;
  }): Promise<PortfolioSite> {
    const supabase = await this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Check if user already has a site (MVP: one site per user)
    const existing = await this.getSite();
    if (existing) {
      throw new Error('User already has a portfolio site');
    }

    const { data, error } = await supabase
      .from('portfolio_sites')
      .insert({
        name: site.name,
        subdomain: site.subdomain,
      })
      .select()
      .single();

    if (error) throw error;

    // If template provided, apply it
    if (site.templateId) {
      await this.applyTemplate(data.id, site.templateId);
    }

    return data;
  }

  async updateSite(
    id: string,
    updates: {
      name?: string;
      subdomain?: string;
      custom_domain?: string;
      is_published?: boolean;
      seo_title?: string;
      seo_description?: string;
      favicon_url?: string;
      analytics_id?: string;
    }
  ): Promise<PortfolioSite> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSite(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('portfolio_sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Page methods
  async getPages(siteId: string): Promise<PortfolioPage[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_pages')
      .select('*')
      .eq('site_id', siteId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPageById(id: string): Promise<PortfolioPage | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async getPageBySlug(siteId: string, slug: string): Promise<PortfolioPage | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_pages')
      .select('*')
      .eq('site_id', siteId)
      .eq('slug', slug)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createPage(
    siteId: string,
    page: {
      slug: string;
      title: string;
      is_homepage?: boolean;
      seo_title?: string;
      seo_description?: string;
    }
  ): Promise<PortfolioPage> {
    const supabase = await this.getSupabase();

    // If this is the homepage, unset other homepages
    if (page.is_homepage) {
      await supabase
        .from('portfolio_pages')
        .update({ is_homepage: false })
        .eq('site_id', siteId)
        .eq('is_homepage', true);
    }

    const { data, error } = await supabase
      .from('portfolio_pages')
      .insert({
        site_id: siteId,
        ...page,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePage(
    id: string,
    updates: {
      slug?: string;
      title?: string;
      is_homepage?: boolean;
      is_published?: boolean;
      sort_order?: number;
      seo_title?: string;
      seo_description?: string;
    }
  ): Promise<PortfolioPage> {
    const supabase = await this.getSupabase();

    // If setting as homepage, unset others
    if (updates.is_homepage === true) {
      const page = await this.getPageById(id);
      if (page) {
        await supabase
          .from('portfolio_pages')
          .update({ is_homepage: false })
          .eq('site_id', page.site_id)
          .eq('is_homepage', true)
          .neq('id', id);
      }
    }

    const { data, error } = await supabase
      .from('portfolio_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePage(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('portfolio_pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Block methods
  async getBlocks(pageId: string): Promise<PortfolioBlock[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_blocks')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createBlock(
    pageId: string,
    block: {
      block_type: string;
      content: Record<string, unknown>;
      settings?: Record<string, unknown>;
      sort_order?: number;
    }
  ): Promise<PortfolioBlock> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_blocks')
      .insert({
        page_id: pageId,
        ...block,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBlock(
    id: string,
    updates: {
      block_type?: string;
      content?: Record<string, unknown>;
      settings?: Record<string, unknown>;
      sort_order?: number;
    }
  ): Promise<PortfolioBlock> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_blocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBlock(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('portfolio_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async reorderBlocks(blockIds: string[]): Promise<void> {
    const supabase = await this.getSupabase();
    const updates = blockIds.map((id, index) =>
      supabase
        .from('portfolio_blocks')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);
  }

  // Style methods
  async getStyles(siteId: string): Promise<PortfolioStyle | null> {
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

  async upsertStyles(
    siteId: string,
    styles: {
      color_palette: PortfolioStyle['color_palette'];
      typography: PortfolioStyle['typography'];
      spacing_scale?: string;
      custom_css?: string;
    }
  ): Promise<PortfolioStyle> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_styles')
      .upsert(
        {
          site_id: siteId,
          ...styles,
        },
        {
          onConflict: 'site_id',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Template methods
  async getTemplates(category?: string): Promise<PortfolioTemplate[]> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('portfolio_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getTemplateById(id: string): Promise<PortfolioTemplate | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_templates')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async applyTemplate(siteId: string, templateId: string): Promise<void> {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    // Apply styles
    await this.upsertStyles(siteId, template.styles_schema as PortfolioStyle);

    // Create pages from template
    const pages = template.pages_schema as Array<{
      slug: string;
      title: string;
      is_homepage: boolean;
      blocks: Array<{
        block_type: string;
        content: Record<string, unknown>;
        settings?: Record<string, unknown>;
      }>;
    }>;

    for (const pageData of pages) {
      const page = await this.createPage(siteId, {
        slug: pageData.slug,
        title: pageData.title,
        is_homepage: pageData.is_homepage,
      });

      // Create blocks for the page
      for (const blockData of pageData.blocks) {
        await this.createBlock(page.id, {
          block_type: blockData.block_type,
          content: blockData.content,
          settings: blockData.settings,
        });
      }
    }
  }
}

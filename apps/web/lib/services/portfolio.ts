import type { SupabaseClient, User } from '@supabase/supabase-js';

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
  layout?: {
    colSpan?: number; // 1-12
    rowSpan?: number; // 1-n
  } & Record<string, unknown>;
  styles?: Record<string, unknown>;
  is_visible?: boolean;
  visible_on?: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
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
  private supabase: SupabaseClient;
  private providedUser: User | null;

  constructor(supabase: SupabaseClient, user?: User | null) {
    this.supabase = supabase;
    this.providedUser = user ?? null;
  }

  // Site methods
  async getSite(): Promise<PortfolioSite | null> {
    // Use provided user if available, otherwise try to get from auth
    let user = this.providedUser;

    if (!user) {
      try {
        const { data: { user: authUser } } = await this.supabase.auth.getUser();
        user = authUser;
      } catch {
        // Auth call failed, continue with null user
      }
    }

    if (!user) return null;

    const { data, error } = await this.supabase
      .from('portfolio_sites')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') return null; // No site found
    if (error) throw error;
    return data;
  }

  async getSiteBySubdomain(subdomain: string): Promise<PortfolioSite | null> {
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
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
    // Try to get user from the service instance (recovered in route or provided in constructor)
    let user = this.providedUser;

    if (!user) {
      console.log('[PortfolioService] No provided user, attempting auth.getUser()...');
      const { data: { user: authUser }, error: userError } = await this.supabase.auth.getUser();
      if (userError) console.error('[PortfolioService] auth.getUser() error:', userError.message);
      user = authUser;
    }

    if (!user) {
      console.error('[PortfolioService] Final auth check failed: Not authenticated');
      throw new Error('Not authenticated');
    }

    console.log('[PortfolioService] Creating site for user:', user.id);

    // Verify profile exists (required for foreign key)
    console.log('[PortfolioService] Verifying profile existence...');
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.warn('[PortfolioService] Profile missing or error:', profileError?.message);
      console.log('[PortfolioService] Attempting to create missing profile...');

      const { error: createProfileError } = await this.supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: user.user_metadata?.full_name || user.email,
          locale: 'en'
        });

      if (createProfileError) {
        console.error('[PortfolioService] Failed to create profile:', createProfileError.message);
        // We still try to proceed, but it will likely fail on FK constraint
      } else {
        console.log('[PortfolioService] Profile created successfully');
      }
    } else {
      console.log('[PortfolioService] Profile verified');
    }

    // Check if user already has a site (MVP: one site per user)
    const existing = await this.getSite();
    if (existing) {
      console.error('[PortfolioService] User already has a site:', existing.id);
      throw new Error('User already has a portfolio site');
    }

    console.log('[PortfolioService] Inserting site row:', { name: site.name, subdomain: site.subdomain, user_id: user.id });
    const { data, error } = await this.supabase
      .from('portfolio_sites')
      .insert({
        name: site.name,
        subdomain: site.subdomain,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[PortfolioService] Error creating site:', error);
      throw error;
    }

    // Apply template if provided
    if (site.templateId) {
      try {
        console.log('[PortfolioService] Applying template:', site.templateId);
        await this.applyTemplate(data.id, site.templateId);
      } catch (templateError) {
        console.error('[PortfolioService] Failed to apply template:', templateError);
        // We don't throw here to avoid failing the whole site creation, 
        // but arguably we should let the user know. 
        // For now, we'll just log it. The site is created empty.
      }
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
    const { data, error } = await this.supabase
      .from('portfolio_sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSite(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('portfolio_sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async unpublishSite(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('portfolio_sites')
      .update({ is_published: false, published_at: null })
      .eq('id', id);

    if (error) throw error;
  }

  // Page methods
  async getPages(siteId: string): Promise<PortfolioPage[]> {
    const { data, error } = await this.supabase
      .from('portfolio_pages')
      .select('*')
      .eq('site_id', siteId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPageById(id: string): Promise<PortfolioPage | null> {
    const { data, error } = await this.supabase
      .from('portfolio_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async getPageBySlug(siteId: string, slug: string): Promise<PortfolioPage | null> {
    const { data, error } = await this.supabase
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
    // If this is the homepage, unset other homepages
    if (page.is_homepage) {
      await this.supabase
        .from('portfolio_pages')
        .update({ is_homepage: false })
        .eq('site_id', siteId)
        .eq('is_homepage', true);
    }

    const { data, error } = await this.supabase
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
    // If setting as homepage, unset others
    if (updates.is_homepage === true) {
      const page = await this.getPageById(id);
      if (page) {
        await this.supabase
          .from('portfolio_pages')
          .update({ is_homepage: false })
          .eq('site_id', page.site_id)
          .eq('is_homepage', true)
          .neq('id', id);
      }
    }

    const { data, error } = await this.supabase
      .from('portfolio_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePage(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('portfolio_pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Block methods
  async getBlocks(pageId: string): Promise<PortfolioBlock[]> {
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
      .from('portfolio_blocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBlock(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('portfolio_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deletePageBlocks(pageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('portfolio_blocks')
      .delete()
      .eq('page_id', pageId);

    if (error) throw error;
  }

  async reorderBlocks(blockIds: string[]): Promise<void> {
    const updates = blockIds.map((id, index) =>
      this.supabase
        .from('portfolio_blocks')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);
  }

  // Style methods
  async getStyles(siteId: string): Promise<PortfolioStyle | null> {
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
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
    let query = this.supabase
      .from('portfolio_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Inject static templates
    const staticTemplates: PortfolioTemplate[] = [
      {
        id: 'espresso',
        name: 'The Espresso Stroll',
        description: 'Warm, dark themed template perfect for lifestyle blogs or coffee shops.',
        thumbnail_url: null,
        category: 'portfolio',
        pages_schema: {},
        styles_schema: {},
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'ava',
        name: 'Ava Jones',
        description: 'Creative copywriter portfolio with soft gradients and clean typography.',
        thumbnail_url: null,
        category: 'portfolio',
        pages_schema: {},
        styles_schema: {},
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'bernadette',
        name: 'Bernadette Wilde',
        description: 'Professional marketing portfolio with a clean, neutral aesthetic.',
        thumbnail_url: null,
        category: 'business',
        pages_schema: {},
        styles_schema: {},
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'emily',
        name: 'Emily Maine',
        description: 'Elegant writer portfolio with a focus on editorial content.',
        thumbnail_url: null,
        category: 'portfolio',
        pages_schema: {},
        styles_schema: {},
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'bento',
        name: 'Bento Grid',
        description: 'Modern, block-based layout perfect for showcasing diverse content types.',
        thumbnail_url: null,
        category: 'portfolio',
        pages_schema: {},
        styles_schema: {},
        is_active: true,
        created_at: new Date().toISOString(),
      }
    ];

    // Filter static templates if category provided
    const filteredStatic = category
      ? staticTemplates.filter(t => t.category === category)
      : staticTemplates;

    return [...(data || []), ...filteredStatic];
  }

  async getTemplateById(id: string): Promise<PortfolioTemplate | null> {
    const { data, error } = await this.supabase
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
    const styles = template.styles_schema as unknown as PortfolioStyle;
    if (styles && Object.keys(styles).length > 0) {
      await this.upsertStyles(siteId, {
        color_palette: styles.color_palette || {},
        typography: styles.typography || {},
        spacing_scale: styles.spacing_scale,
        custom_css: styles.custom_css || undefined
      });
    }

    // Create pages from template
    const pages = template.pages_schema as unknown as Array<{
      slug: string;
      title: string;
      is_homepage: boolean;
      blocks: Array<{
        block_type: string;
        content: Record<string, unknown>;
        settings?: Record<string, unknown>;
      }>;
    }>;

    if (pages && Array.isArray(pages)) {
      // DELETE EXISTING PAGES (Strict Replacement)
      // We do this first to ensure a clean slate.
      const existingPages = await this.getPages(siteId);
      for (const p of existingPages) {
        // We delete one by one to ensure any potential cascades or hooks (if we add them later) run.
        // In a real prod env, a bulk delete via supabase.rpc or delete().in() would be better.
        await this.deletePage(p.id);
      }

      for (const pageData of pages) {
        const page = await this.createPage(siteId, {
          slug: pageData.slug,
          title: pageData.title,
          is_homepage: pageData.is_homepage,
        });

        // Create blocks for the page
        if (pageData.blocks) {
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
  }

  async createPageWithLayout(
    siteId: string,
    page: {
      slug: string;
      title: string;
      is_homepage?: boolean;
      seo_title?: string;
      seo_description?: string;
    }
  ): Promise<PortfolioPage> {
    // 1. Create the new page
    const newPage = await this.createPage(siteId, page);

    // 2. If it's NOT a homepage, try to inherit layout from the existing homepage
    if (!page.is_homepage) {
      const allPages = await this.getPages(siteId);
      const homePage = allPages.find(p => p.is_homepage);

      if (homePage) {
        // Fetch blocks from homepage
        const homeBlocks = await this.getBlocks(homePage.id);

        // Find Header and Footer
        const layoutBlocks = homeBlocks.filter(b =>
          b.block_type === 'header' || b.block_type === 'footer'
        );

        // Clone them to the new page
        for (const block of layoutBlocks) {
          await this.createBlock(newPage.id, {
            block_type: block.block_type,
            content: block.content,
            settings: block.settings,
            // Keep sort order logic: Header at top (0), Footer at bottom (likely high number)
            // But usually we just want to copy them. We might need to adjust sort_order if we want them specifically placed.
            // For now, let's just copy exactly.
            sort_order: block.sort_order
          });
        }
      }
    }

    return newPage;
  }
}

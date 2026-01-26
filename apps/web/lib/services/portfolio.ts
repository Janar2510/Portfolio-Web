import type { SupabaseClient, User } from '@supabase/supabase-js';
import { templates as fileTemplates } from '@/lib/portfolio/templates';
import { convertTemplateDefToPortfolioTemplate } from '@/lib/portfolio/templates/converter';

export interface PortfolioSite {
  id: string;
  user_id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  custom_domain_verified: boolean;
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
  anchor_id?: string;
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
  preview_images?: string[];
  category: string | null;
  pages_schema: Record<string, unknown>;
  styles_schema: Record<string, unknown>;
  features?: string[];
  is_active: boolean;
  is_featured?: boolean;
  is_premium?: boolean;
  demo_url?: string | null;
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
        const {
          data: { user: authUser },
        } = await this.supabase.auth.getUser();
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
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getSiteBySubdomain(subdomain: string): Promise<PortfolioSite | null> {
    const { data, error } = await this.supabase
      .from('portfolio_sites')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_published', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getSiteById(id: string): Promise<PortfolioSite | null> {
    const { data, error } = await this.supabase
      .from('portfolio_sites')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createSite(site: {
    name: string;
    subdomain: string;
    templateId?: string;
    logoUrl?: string; // New
    brandVoice?: string; // New (placeholder)
  }): Promise<PortfolioSite> {
    // Try to get user from the service instance (recovered in route or provided in constructor)
    let user = this.providedUser;

    if (!user) {
      console.log(
        '[PortfolioService] No provided user, attempting auth.getUser()...'
      );
      const {
        data: { user: authUser },
        error: userError,
      } = await this.supabase.auth.getUser();
      if (userError)
        console.error(
          '[PortfolioService] auth.getUser() error:',
          userError.message
        );
      user = authUser;
    }

    if (!user) {
      console.error(
        '[PortfolioService] Final auth check failed: Not authenticated'
      );
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
      console.warn(
        '[PortfolioService] Profile missing or error:',
        profileError?.message
      );
      console.log('[PortfolioService] Attempting to create missing profile...');

      const { error: createProfileError } = await this.supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: user.user_metadata?.full_name || user.email,
          locale: 'en',
        });

      if (createProfileError) {
        console.error(
          '[PortfolioService] Failed to create profile:',
          createProfileError.message
        );
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

    console.log('[PortfolioService] Inserting site row:', {
      name: site.name,
      subdomain: site.subdomain,
      user_id: user.id,
    });
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
        await this.applyTemplate(data.id, site.templateId, {
          logoUrl: site.logoUrl,
        });
      } catch (templateError) {
        console.error(
          '[PortfolioService] Failed to apply template:',
          templateError
        );
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
      custom_domain_verified?: boolean;
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
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getPageBySlug(
    siteId: string,
    slug: string
  ): Promise<PortfolioPage | null> {
    const { data, error } = await this.supabase
      .from('portfolio_pages')
      .select('*')
      .eq('site_id', siteId)
      .eq('slug', slug)
      .maybeSingle();

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
      .maybeSingle();

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

    // Inject static templates from file definitions
    const staticTemplates: PortfolioTemplate[] = fileTemplates.map(def =>
      convertTemplateDefToPortfolioTemplate(def)
    );

    // Filter static templates if category provided
    const filteredStatic = category
      ? staticTemplates.filter(t =>
          // Simple category matching
          category === 'portfolio' ? true : t.category === category
        )
      : staticTemplates;

    // FORCED OVERRIDE: Return ONLY static templates to ensure users see the updated designs
    // and not stale/broken database records.
    return filteredStatic;
  }

  async getTemplateById(id: string): Promise<PortfolioTemplate | null> {
    // Check file templates FIRST (Static First Strategy)
    const fileTemplate = fileTemplates.find(t => t.templateId === id);
    if (fileTemplate) {
      return convertTemplateDefToPortfolioTemplate(fileTemplate);
    }

    const { data, error } = await this.supabase
      .from('portfolio_templates')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (data) return data;

    return null;
  }

  // Project methods
  async getProjects(
    siteId: string,
    filters?: {
      category?: string;
      tags?: string[];
      limit?: number;
    }
  ): Promise<any[]> {
    let query = this.supabase
      .from('portfolio_projects')
      .select('*')
      .eq('site_id', siteId);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async getProjectBySlug(siteId: string, slug: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('portfolio_projects')
      .select('*')
      .eq('site_id', siteId)
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createProject(siteId: string, project: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('portfolio_projects')
      .insert({
        site_id: siteId,
        ...project,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProject(id: string, updates: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('portfolio_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('portfolio_projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async applyTemplate(
    siteId: string,
    templateId: string,
    options: { logoUrl?: string } = {}
  ): Promise<void> {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    // Apply styles
    const styles = template.styles_schema as unknown as PortfolioStyle;
    if (styles && Object.keys(styles).length > 0) {
      await this.upsertStyles(siteId, {
        color_palette: styles.color_palette || {},
        typography: styles.typography || {},
        spacing_scale: styles.spacing_scale,
        custom_css: styles.custom_css || undefined,
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
      const existingPages = await this.getPages(siteId);
      for (const p of existingPages) {
        await this.deletePage(p.id);
      }

      // DELETE EXISTING PROJECTS (To ensure clean template projects)
      const existingProjects = await this.getProjects(siteId);
      for (const p of existingProjects) {
        await this.deleteProject(p.id);
      }

      // SEED PROJECTS (if defined in template)
      // Note: We need to check the raw template definition for the projects section
      const templateDef = fileTemplates.find(t => t.templateId === templateId);
      if (templateDef?.sections?.projects?.items) {
        for (const item of templateDef.sections.projects.items) {
          await this.createProject(siteId, {
            title: item.title,
            slug: item.title.toLowerCase().replace(/\s+/g, '-'),
            thumbnail_url: item.image,
            excerpt: item.description,
            category: item.category,
          });
        }
      }

      for (const pageData of pages) {
        const page = await this.createPage(siteId, {
          slug: pageData.slug,
          title: pageData.title,
          is_homepage: pageData.is_homepage,
        });

        // Create blocks for the page
        if (pageData.blocks) {
          let blockIndex = 0;
          for (const blockData of pageData.blocks) {
            // Apply logo override if Header
            let content = blockData.content;
            if (options.logoUrl && blockData.block_type === 'header') {
              content = { ...content, logo_image: options.logoUrl };
            }

            await this.createBlock(page.id, {
              block_type: blockData.block_type,
              content: content,
              settings: blockData.settings,
              sort_order: blockIndex++,
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

    // 2. Try to inherit layout logic
    let layoutBlocks: PortfolioBlock[] = [];

    // Try getting from homepage first
    const allPages = await this.getPages(siteId);
    const homePage = allPages.find(p => p.is_homepage);

    if (homePage) {
      const homeBlocks = await this.getBlocks(homePage.id);
      layoutBlocks = homeBlocks.filter(
        b => b.block_type === 'header' || b.block_type === 'footer'
      );
    }

    // If no inherited blocks found (or not homepage), create defaults
    const hasHeader = layoutBlocks.some(b => b.block_type === 'header');
    const hasFooter = layoutBlocks.some(b => b.block_type === 'footer');

    // Helper to add block
    const addBlock = async (
      type: string,
      sortOrder: number,
      content: any = {}
    ) => {
      await this.createBlock(newPage.id, {
        block_type: type,
        content,
        settings: {},
        sort_order: sortOrder,
      });
    };

    // Clone inherited blocks
    for (const block of layoutBlocks) {
      await this.createBlock(newPage.id, {
        block_type: block.block_type,
        content: block.content,
        settings: block.settings,
        sort_order: block.block_type === 'header' ? -1 : 9999, // Force to top/bottom
      });
    }

    // Create missing defaults
    if (!hasHeader) {
      await addBlock('header', -1, {
        logo_text: 'My Portfolio',
        links: [
          { label: 'Home', url: '/' },
          { label: 'Services', url: '#services' },
          { label: 'My Work', url: '#work' },
          { label: 'Contact', url: '#contact' }, // In real app, this triggers modal via ID
        ],
      });
    }

    if (!hasFooter) {
      await addBlock('footer', 9999, {
        copyright_text: `© ${new Date().getFullYear()} My Portfolio. • Privacy Statement • Made with Portfolio Web`,
        social_links: [
          { platform: 'twitter', url: '#' },
          { platform: 'linkedin', url: '#' },
          { platform: 'instagram', url: '#' },
        ],
      });
    }

    return newPage;
  }

  // Media methods
  async getMedia(siteId: string, folder?: string): Promise<any[]> {
    let query = this.supabase
      .from('portfolio_media')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (folder) {
      // Assuming folder logic or just ignoring if not implemented in DB
      // query = query.eq('folder', folder);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async uploadMedia(siteId: string, file: File): Promise<any> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${siteId}/${fileName}`;

    // Upload to Storage
    const { error: uploadError } = await this.supabase.storage
      .from('portfolio-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get Public URL
    const {
      data: { publicUrl },
    } = this.supabase.storage.from('portfolio-media').getPublicUrl(filePath);

    // Insert to DB
    const { data, error } = await this.supabase
      .from('portfolio_media')
      .insert({
        site_id: siteId,
        file_name: file.name,
        file_path: filePath,
        optimized_url: publicUrl, // Using public URL as optimized for now
        mime_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMedia(mediaId: string): Promise<void> {
    // Get file path first
    const { data: media } = await this.supabase
      .from('portfolio_media')
      .select('file_path')
      .eq('id', mediaId)
      .single();

    if (media) {
      await this.supabase.storage
        .from('portfolio-media')
        .remove([media.file_path]);
    }

    const { error } = await this.supabase
      .from('portfolio_media')
      .delete()
      .eq('id', mediaId);

    if (error) throw error;
  }

  // Form Submission methods
  async getFormSubmissions(siteId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('portfolio_form_submissions')
      .select('*')
      .eq('site_id', siteId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateFormSubmission(
    id: string,
    updates: { is_read?: boolean; status?: string }
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('portfolio_form_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

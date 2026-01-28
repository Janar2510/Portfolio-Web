import type { SupabaseClient, User } from '@supabase/supabase-js';
import { listTemplates, createDefaultConfig } from '@/domain/templates/registry';
const fileTemplates = listTemplates();
import { convertTemplateDefToPortfolioTemplate } from '@/domain/builder/templates/converter';
import { TemplateConfig } from '@/domain/templates/contracts';
import { ProjectsSection } from '@/domain/sites/site-schema';
import { ConflictError } from '@/domain/sites/errors';

export interface PortfolioSite {
  id: string;
  owner_user_id: string;
  slug: string;
  status: 'draft' | 'published';
  draft_config: TemplateConfig;
  published_config: TemplateConfig | null;
  template_id: string;
  created_at: string;
  updated_at: string;
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
  is_locked?: boolean;
  layout?: {
    colSpan?: number;
    rowSpan?: number;
    width?: string;
    padding?: string;
    margin?: string;
    background?: string | null;
    alignment?: string;
  } & Record<string, unknown>;
  styles?: Record<string, unknown>;
  is_visible?: boolean;
  visible_on?: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  animation?: {
    type: string | null;
    delay: number;
    duration: string;
  };
  variant?: string | null;
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
  pages_schema: Array<{
    slug: string;
    title: string;
    is_homepage: boolean;
    blocks: Array<{
      block_type: string;
      content: Record<string, unknown>;
      settings?: Record<string, unknown>;
    }>;
  }>;
  styles_schema: {
    color_palette?: Record<string, string>;
    typography?: {
      headingFont: string;
      bodyFont: string;
    };
  };
  features?: string[];
  is_active: boolean;
  is_featured?: boolean;
  is_premium?: boolean;
  demo_url?: string | null;
  use_count?: number;
  tags?: string[];
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
      .from('sites')
      .select('*')
      .eq('owner_user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getSites(): Promise<PortfolioSite[]> {
    let user = this.providedUser;
    if (!user) {
      try {
        const { data: { user: authUser } } = await this.supabase.auth.getUser();
        user = authUser;
      } catch { }
    }
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('sites')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSiteBySubdomain(slug: string): Promise<PortfolioSite | null> {
    const { data, error } = await this.supabase
      .from('sites')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getSiteById(id: string): Promise<PortfolioSite | null> {
    const { data, error } = await this.supabase
      .from('sites')
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

    // Verify user record exists in public.users (required for foreign key on sites)
    console.log('[PortfolioService] Verifying user record existence in public.users...');
    const { data: userRecord, error: userError } = await this.supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (userError || !userRecord) {
      console.warn(
        '[PortfolioService] User record missing or error:',
        userError?.message
      );
      console.log('[PortfolioService] Attempting to create missing user record...');

      const { error: createUserError } = await this.supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
        });

      if (createUserError) {
        console.error(
          '[PortfolioService] Failed to create user record:',
          createUserError.message
        );
        // We still try to proceed, but it will likely fail on FK constraint
      } else {
        console.log('[PortfolioService] User record created successfully');
      }
    } else {
      console.log('[PortfolioService] User record verified');
    }

    // LIST SITES FOR DEBUGGING
    console.log('[PortfolioService] Fetching existing sites for user...');
    const existingSites = await this.getSites();
    console.log('[PortfolioService] Found sites:', existingSites.length);

    // Check if user already has a site (MVP: one site per user)
    const existing = existingSites.length > 0 ? existingSites[0] : null;
    if (existing) {
      console.error('[PortfolioService] User already has a site:', existing.id);
      throw new ConflictError('User already has a portfolio site');
    }

    const templateId = (site.templateId as any) || 'minimal';
    const draftConfig = createDefaultConfig(templateId);

    console.log('[PortfolioService] Inserting site into DB...');
    const { data, error } = await this.supabase
      .from('sites')
      .insert({
        slug: site.subdomain,
        owner_user_id: user.id,
        template_id: templateId,
        draft_config: draftConfig,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('[PortfolioService] INSERT ERROR:', error);
      console.error('[PortfolioService] ERROR DETAILS:', JSON.stringify(error, null, 2));
      throw error;
    }
    console.log('[PortfolioService] Site inserted successfully:', data.id);

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
    updates: Partial<PortfolioSite>
  ): Promise<PortfolioSite> {
    const { data, error } = await this.supabase
      .from('sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSite(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async unpublishSite(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('sites')
      .update({ status: 'draft' })
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
      seo_title?: string | null;
      seo_description?: string | null;
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
    const staticTemplates: PortfolioTemplate[] = listTemplates().map(def =>
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
    const fileTemplate = listTemplates().find(t => t.id === (id as any));
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
      const templateDef = listTemplates().find(t => t.id === templateId);
      const projectsSection = templateDef?.defaultSections.find(s => s.type === 'projects') as ProjectsSection | undefined;
      if (projectsSection?.content.items) {
        for (const item of projectsSection.content.items) {
          const title = item.title.en || item.title.et || 'Project';
          await this.createProject(siteId, {
            title: title,
            slug: title.toLowerCase().replace(/\s+/g, '-'),
            thumbnail_url: item.image?.src || '',
            excerpt: item.description?.en || item.description?.et || '',
            category: 'Portfolio',
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

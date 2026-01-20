-- Migration: Create Portfolio Module tables
-- Description: Portfolio sites, pages, blocks, styles, and templates with RLS policies

-- Portfolio site configuration
CREATE TABLE public.portfolio_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  is_published BOOLEAN DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  favicon_url TEXT,
  analytics_id TEXT,                    -- Optional GA4 ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  UNIQUE(user_id)                       -- One site per user for MVP
);

-- Pages within a portfolio
CREATE TABLE public.portfolio_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.portfolio_sites(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  is_homepage BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

-- Block-based page content
CREATE TABLE public.portfolio_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.portfolio_pages(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,             -- 'hero', 'text', 'gallery', 'projects', etc.
  content JSONB NOT NULL DEFAULT '{}',  -- Block-specific content
  settings JSONB DEFAULT '{}',          -- Block-specific settings (colors, spacing)
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Design presets (global styles)
CREATE TABLE public.portfolio_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.portfolio_sites(id) ON DELETE CASCADE,
  color_palette JSONB NOT NULL,         -- {primary, secondary, accent, background, text}
  typography JSONB NOT NULL,            -- {headingFont, bodyFont, scale}
  spacing_scale TEXT DEFAULT 'default',
  custom_css TEXT,                      -- Pro feature
  UNIQUE(site_id)
);

-- Templates library (system-wide, not user-specific)
CREATE TABLE public.portfolio_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  pages_schema JSONB NOT NULL,          -- Template structure
  styles_schema JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_portfolio_sites_user_id ON public.portfolio_sites(user_id);
CREATE INDEX idx_portfolio_sites_subdomain ON public.portfolio_sites(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX idx_portfolio_sites_custom_domain ON public.portfolio_sites(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_portfolio_sites_published ON public.portfolio_sites(is_published) WHERE is_published = TRUE;

CREATE INDEX idx_portfolio_pages_site_id ON public.portfolio_pages(site_id);
CREATE INDEX idx_portfolio_pages_slug ON public.portfolio_pages(site_id, slug);
CREATE INDEX idx_portfolio_pages_homepage ON public.portfolio_pages(site_id, is_homepage) WHERE is_homepage = TRUE;
CREATE INDEX idx_portfolio_pages_published ON public.portfolio_pages(site_id, is_published) WHERE is_published = TRUE;

CREATE INDEX idx_portfolio_blocks_page_id ON public.portfolio_blocks(page_id);
CREATE INDEX idx_portfolio_blocks_type ON public.portfolio_blocks(block_type);
-- High-priority combined index for page block queries
CREATE INDEX idx_portfolio_blocks_page_order ON public.portfolio_blocks(page_id, sort_order);

CREATE INDEX idx_portfolio_styles_site_id ON public.portfolio_styles(site_id);

CREATE INDEX idx_portfolio_templates_active ON public.portfolio_templates(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_portfolio_templates_category ON public.portfolio_templates(category) WHERE category IS NOT NULL;

-- Triggers for updated_at
CREATE TRIGGER set_portfolio_sites_updated_at
  BEFORE UPDATE ON public.portfolio_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_portfolio_pages_updated_at
  BEFORE UPDATE ON public.portfolio_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_portfolio_blocks_updated_at
  BEFORE UPDATE ON public.portfolio_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to set published_at when site is published
CREATE OR REPLACE FUNCTION public.handle_portfolio_site_publish()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = TRUE AND OLD.is_published = FALSE THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_portfolio_site_published_at
  BEFORE UPDATE ON public.portfolio_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_portfolio_site_publish();

-- Enable Row Level Security
ALTER TABLE public.portfolio_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_sites
-- Anyone can view published sites, users can view their own (for SSG rendering)
CREATE POLICY "Anyone can view published portfolio sites"
  ON public.portfolio_sites
  FOR SELECT
  USING (is_published = TRUE OR auth.uid() = user_id);

-- Users can insert their own sites
CREATE POLICY "Users can insert own sites"
  ON public.portfolio_sites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sites
CREATE POLICY "Users can update own sites"
  ON public.portfolio_sites
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sites
CREATE POLICY "Users can delete own sites"
  ON public.portfolio_sites
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for portfolio_pages
-- Users can view pages of their own sites
CREATE POLICY "Users can view own site pages"
  ON public.portfolio_pages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = portfolio_pages.site_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- Public can view published pages of published sites
CREATE POLICY "Public can view published pages"
  ON public.portfolio_pages
  FOR SELECT
  USING (
    is_published = TRUE
    AND EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = portfolio_pages.site_id
      AND portfolio_sites.is_published = TRUE
    )
  );

-- Users can insert pages to their own sites
CREATE POLICY "Users can insert own site pages"
  ON public.portfolio_pages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = portfolio_pages.site_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- Users can update pages of their own sites
CREATE POLICY "Users can update own site pages"
  ON public.portfolio_pages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = portfolio_pages.site_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- Users can delete pages of their own sites
CREATE POLICY "Users can delete own site pages"
  ON public.portfolio_pages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = portfolio_pages.site_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- RLS Policies for portfolio_blocks
-- Users can view blocks of their own site pages
CREATE POLICY "Users can view own site blocks"
  ON public.portfolio_blocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_pages
      JOIN public.portfolio_sites ON portfolio_sites.id = portfolio_pages.site_id
      WHERE portfolio_pages.id = portfolio_blocks.page_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- Public can view blocks of published pages
CREATE POLICY "Public can view published page blocks"
  ON public.portfolio_blocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_pages
      JOIN public.portfolio_sites ON portfolio_sites.id = portfolio_pages.site_id
      WHERE portfolio_pages.id = portfolio_blocks.page_id
      AND portfolio_pages.is_published = TRUE
      AND portfolio_sites.is_published = TRUE
    )
  );

-- Users can insert blocks to their own site pages
CREATE POLICY "Users can insert own site blocks"
  ON public.portfolio_blocks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolio_pages
      JOIN public.portfolio_sites ON portfolio_sites.id = portfolio_pages.site_id
      WHERE portfolio_pages.id = portfolio_blocks.page_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- Users can update blocks of their own site pages
CREATE POLICY "Users can update own site blocks"
  ON public.portfolio_blocks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_pages
      JOIN public.portfolio_sites ON portfolio_sites.id = portfolio_pages.site_id
      WHERE portfolio_pages.id = portfolio_blocks.page_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- Users can delete blocks of their own site pages
CREATE POLICY "Users can delete own site blocks"
  ON public.portfolio_blocks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_pages
      JOIN public.portfolio_sites ON portfolio_sites.id = portfolio_pages.site_id
      WHERE portfolio_pages.id = portfolio_blocks.page_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- RLS Policies for portfolio_styles
-- Users can view styles of their own sites
CREATE POLICY "Users can view own site styles"
  ON public.portfolio_styles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = portfolio_styles.site_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- Public can view styles of published sites
CREATE POLICY "Public can view published site styles"
  ON public.portfolio_styles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = portfolio_styles.site_id
      AND portfolio_sites.is_published = TRUE
    )
  );

-- Users can insert styles to their own sites
CREATE POLICY "Users can insert own site styles"
  ON public.portfolio_styles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = portfolio_styles.site_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- Users can update styles of their own sites
CREATE POLICY "Users can update own site styles"
  ON public.portfolio_styles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = portfolio_styles.site_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- Users can delete styles of their own sites
CREATE POLICY "Users can delete own site styles"
  ON public.portfolio_styles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = portfolio_styles.site_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- RLS Policies for portfolio_templates
-- Everyone can view active templates (system-wide)
CREATE POLICY "Everyone can view active templates"
  ON public.portfolio_templates
  FOR SELECT
  USING (is_active = TRUE);

-- Only service role can manage templates (via service role key)
-- No policies for INSERT/UPDATE/DELETE - handled by service role

-- Grant necessary permissions
GRANT SELECT ON public.portfolio_sites TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_sites TO authenticated;

GRANT SELECT ON public.portfolio_pages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_pages TO authenticated;

GRANT SELECT ON public.portfolio_blocks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_blocks TO authenticated;

GRANT SELECT ON public.portfolio_styles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_styles TO authenticated;

GRANT SELECT ON public.portfolio_templates TO anon, authenticated;

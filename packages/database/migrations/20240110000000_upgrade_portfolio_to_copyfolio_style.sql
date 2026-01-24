-- Migration: Upgrade Portfolio Module to Copyfolio-Style Template & Editor System
-- Description: Extends existing portfolio tables and adds new tables for advanced editor features

-- ===========================================
-- EXTEND EXISTING TABLES
-- ===========================================

-- Extend portfolio_sites
ALTER TABLE public.portfolio_sites
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS custom_domain_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.portfolio_templates(id),
  ADD COLUMN IF NOT EXISTS template_applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
  ADD COLUMN IF NOT EXISTS social_image_url TEXT,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
    "showBranding": true,
    "enableAnalytics": true,
    "enableContactForm": true,
    "language": "et",
    "dateFormat": "DD.MM.YYYY"
  }';

-- Extend portfolio_templates
ALTER TABLE public.portfolio_templates
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS name_et TEXT,
  ADD COLUMN IF NOT EXISTS description_et TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preview_images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS demo_url TEXT,
  ADD COLUMN IF NOT EXISTS blocks_schema JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS industries TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create unique index for template slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_templates_slug ON public.portfolio_templates(slug) WHERE slug IS NOT NULL;

-- Extend portfolio_pages
ALTER TABLE public.portfolio_pages
  ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'page' CHECK (page_type IN ('home', 'page', 'project', 'blog_post', 'legal')),
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.portfolio_pages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS nav_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nav_label TEXT,
  ADD COLUMN IF NOT EXISTS social_image_url TEXT,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
    "fullWidth": false,
    "showHeader": true,
    "showFooter": true,
    "customCss": null
  }';

-- Create index for navigation
CREATE INDEX IF NOT EXISTS idx_portfolio_pages_nav ON public.portfolio_pages(site_id, show_in_nav, nav_order) WHERE is_published = TRUE;

-- Extend portfolio_blocks
ALTER TABLE public.portfolio_blocks
  ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS layout JSONB DEFAULT '{
    "width": "container",
    "padding": "default",
    "margin": "default",
    "background": null,
    "alignment": "left"
  }',
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS visible_on JSONB DEFAULT '{
    "desktop": true,
    "tablet": true,
    "mobile": true
  }',
  ADD COLUMN IF NOT EXISTS animation JSONB DEFAULT '{
    "type": null,
    "delay": 0,
    "duration": "normal"
  }',
  ADD COLUMN IF NOT EXISTS variant TEXT,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

-- Rename portfolio_styles to portfolio_site_styles and extend
ALTER TABLE public.portfolio_styles RENAME TO portfolio_site_styles;

ALTER TABLE public.portfolio_site_styles
  ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '{
    "primary": "#008080",
    "secondary": "#E6A600",
    "accent": "#6366F1",
    "background": "#FFFFFF",
    "surface": "#F8FAFB",
    "text": "#171C20",
    "textSecondary": "#6B7B8A",
    "border": "#E4E9ED",
    "success": "#22A558",
    "warning": "#E6940A",
    "error": "#DC3545"
  }',
  ADD COLUMN IF NOT EXISTS colors_dark JSONB,
  ADD COLUMN IF NOT EXISTS typography JSONB DEFAULT '{
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Inter",
    "monoFont": "JetBrains Mono",
    "baseSize": 16,
    "scale": 1.25,
    "lineHeight": 1.5,
    "headingWeight": 700,
    "bodyWeight": 400
  }',
  ADD COLUMN IF NOT EXISTS spacing JSONB DEFAULT '{
    "scale": "default",
    "sectionPadding": "80",
    "containerWidth": "1200",
    "borderRadius": "8"
  }',
  ADD COLUMN IF NOT EXISTS effects JSONB DEFAULT '{
    "shadows": true,
    "animations": true,
    "animationSpeed": "normal",
    "hoverEffects": true,
    "scrollAnimations": true
  }',
  ADD COLUMN IF NOT EXISTS layout JSONB DEFAULT '{
    "headerStyle": "fixed",
    "footerStyle": "standard",
    "navPosition": "top"
  }',
  ADD COLUMN IF NOT EXISTS saved_presets JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Migrate existing data (read from old columns before dropping)
-- Note: This assumes the old columns exist. If they don't, the defaults will be used.
UPDATE public.portfolio_site_styles
SET colors = jsonb_build_object(
  'primary', COALESCE((color_palette->>'primary'), '#008080'),
  'secondary', COALESCE((color_palette->>'secondary'), '#E6A600'),
  'accent', COALESCE((color_palette->>'accent'), '#6366F1'),
  'background', COALESCE((color_palette->>'background'), '#FFFFFF'),
  'text', COALESCE((color_palette->>'text'), '#171C20')
)
WHERE colors IS NULL AND color_palette IS NOT NULL;

-- Extend typography structure if it exists but doesn't have new fields
UPDATE public.portfolio_site_styles
SET typography = typography || jsonb_build_object(
  'monoFont', 'JetBrains Mono',
  'baseSize', 16,
  'lineHeight', 1.5,
  'headingWeight', 700,
  'bodyWeight', 400
)
WHERE typography IS NOT NULL AND (typography->>'monoFont') IS NULL;

-- Drop old columns after migration
ALTER TABLE public.portfolio_site_styles
  DROP COLUMN IF EXISTS color_palette,
  DROP COLUMN IF EXISTS spacing_scale;

-- ===========================================
-- NEW TABLES
-- ===========================================

-- Section Library (Reusable Sections)
CREATE TABLE IF NOT EXISTS public.portfolio_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_et TEXT,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'hero', 'about', 'services', 'portfolio', 'testimonials',
    'contact', 'footer', 'navigation', 'cta', 'features',
    'team', 'pricing', 'faq', 'blog', 'stats'
  )),
  thumbnail_url TEXT,
  blocks_schema JSONB NOT NULL,
  default_styles JSONB DEFAULT '{}',
  variants JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Library
CREATE TABLE IF NOT EXISTS public.portfolio_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.portfolio_sites(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  alt_text TEXT,
  caption TEXT,
  folder TEXT DEFAULT 'uploads',
  tags TEXT[] DEFAULT '{}',
  is_processed BOOLEAN DEFAULT FALSE,
  thumbnails JSONB DEFAULT '{}',
  optimized_url TEXT,
  blurhash TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Projects (separate from projects module)
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.portfolio_sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  featured_image_id UUID REFERENCES public.portfolio_media(id),
  gallery_image_ids UUID[] DEFAULT '{}',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  client_name TEXT,
  project_date DATE,
  project_url TEXT,
  case_study JSONB DEFAULT '{
    "challenge": null,
    "solution": null,
    "results": null,
    "testimonial": null
  }',
  is_published BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

-- Edit History (Undo/Redo & Versions)
CREATE TABLE IF NOT EXISTS public.portfolio_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.portfolio_sites(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('site', 'page', 'block', 'styles', 'project')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'reorder', 'duplicate')),
  previous_state JSONB,
  new_state JSONB,
  description TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  session_id TEXT,
  is_undoable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Versions (Named Snapshots)
CREATE TABLE IF NOT EXISTS public.portfolio_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.portfolio_sites(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,
  description TEXT,
  snapshot JSONB NOT NULL,
  is_auto_save BOOLEAN DEFAULT FALSE,
  is_published_version BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form Submissions
CREATE TABLE IF NOT EXISTS public.portfolio_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.portfolio_sites(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL DEFAULT 'contact',
  form_id TEXT,
  data JSONB NOT NULL,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived', 'spam')),
  spam_score DECIMAL(3,2),
  is_spam BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Templates
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.portfolio_templates(category) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_templates_featured ON public.portfolio_templates(is_featured, sort_order) WHERE is_active = TRUE;

-- Sections
CREATE INDEX IF NOT EXISTS idx_sections_category ON public.portfolio_sections(category) WHERE is_active = TRUE;

-- Sites
CREATE INDEX IF NOT EXISTS idx_sites_template ON public.portfolio_sites(template_id) WHERE template_id IS NOT NULL;

-- Media
CREATE INDEX IF NOT EXISTS idx_media_site ON public.portfolio_media(site_id);
CREATE INDEX IF NOT EXISTS idx_media_folder ON public.portfolio_media(site_id, folder);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON public.portfolio_media(uploaded_by);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_site ON public.portfolio_projects(site_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.portfolio_projects(site_id, is_featured) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.portfolio_projects(site_id, slug);

-- History
CREATE INDEX IF NOT EXISTS idx_history_site ON public.portfolio_edit_history(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_entity ON public.portfolio_edit_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_history_session ON public.portfolio_edit_history(session_id);

-- Versions
CREATE INDEX IF NOT EXISTS idx_versions_site ON public.portfolio_versions(site_id, created_at DESC);

-- Form submissions
CREATE INDEX IF NOT EXISTS idx_submissions_site ON public.portfolio_form_submissions(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.portfolio_form_submissions(site_id, status);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Updated_at triggers
CREATE TRIGGER portfolio_site_styles_updated_at BEFORE UPDATE ON public.portfolio_site_styles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER portfolio_templates_updated_at BEFORE UPDATE ON public.portfolio_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER portfolio_projects_updated_at BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create site styles when site is created
CREATE OR REPLACE FUNCTION public.create_site_styles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.portfolio_site_styles (site_id) VALUES (NEW.id)
  ON CONFLICT (site_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_site_created_styles ON public.portfolio_sites;
CREATE TRIGGER on_site_created_styles
  AFTER INSERT ON public.portfolio_sites
  FOR EACH ROW EXECUTE FUNCTION public.create_site_styles();

-- Increment template use count
CREATE OR REPLACE FUNCTION public.increment_template_use()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL AND (OLD.template_id IS NULL OR OLD.template_id != NEW.template_id) THEN
    UPDATE public.portfolio_templates
    SET use_count = use_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_site_template_applied ON public.portfolio_sites;
CREATE TRIGGER on_site_template_applied
  AFTER INSERT OR UPDATE OF template_id ON public.portfolio_sites
  FOR EACH ROW EXECUTE FUNCTION public.increment_template_use();

-- ===========================================
-- RLS POLICIES
-- ===========================================

-- Enable RLS on new tables
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_form_submissions ENABLE ROW LEVEL SECURITY;

-- Public read access for templates and sections
CREATE POLICY "Anyone can view active templates" ON public.portfolio_templates
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view active sections" ON public.portfolio_sections
  FOR SELECT USING (is_active = TRUE);

-- User-owned content
CREATE POLICY "Users can manage own media" ON public.portfolio_media
  FOR ALL USING (site_id IN (SELECT id FROM public.portfolio_sites WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own projects" ON public.portfolio_projects
  FOR ALL USING (site_id IN (SELECT id FROM public.portfolio_sites WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own history" ON public.portfolio_edit_history
  FOR SELECT USING (site_id IN (SELECT id FROM public.portfolio_sites WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own versions" ON public.portfolio_versions
  FOR ALL USING (site_id IN (SELECT id FROM public.portfolio_sites WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own submissions" ON public.portfolio_form_submissions
  FOR SELECT USING (site_id IN (SELECT id FROM public.portfolio_sites WHERE user_id = auth.uid()));

-- Public access for published sites
CREATE POLICY "Anyone can view published projects" ON public.portfolio_projects
  FOR SELECT USING (
    is_published = TRUE AND
    site_id IN (SELECT id FROM public.portfolio_sites WHERE is_published = TRUE)
  );

-- Public form submission (insert only)
CREATE POLICY "Anyone can submit forms" ON public.portfolio_form_submissions
  FOR INSERT WITH CHECK (
    site_id IN (SELECT id FROM public.portfolio_sites WHERE is_published = TRUE)
  );

-- ===========================================
-- GRANTS
-- ===========================================

GRANT SELECT ON public.portfolio_sections TO anon, authenticated;
GRANT SELECT ON public.portfolio_media TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_media TO authenticated;
GRANT SELECT ON public.portfolio_projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
GRANT SELECT ON public.portfolio_edit_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_versions TO authenticated;
GRANT SELECT ON public.portfolio_form_submissions TO authenticated;
GRANT INSERT ON public.portfolio_form_submissions TO anon;

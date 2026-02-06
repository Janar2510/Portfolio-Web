-- Migration: Restore Missing Portfolio Tables
-- Description: Creates portfolio_projects, portfolio_form_submissions, portfolio_media, etc.
-- Adapts FKs to reference public.sites instead of portfolio_sites.

-- 1. Portfolio Sections (Global/Library)
CREATE TABLE IF NOT EXISTS public.portfolio_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_et TEXT,
  description TEXT,
  category TEXT NOT NULL, 
  thumbnail_url TEXT,
  blocks_schema JSONB NOT NULL,
  default_styles JSONB DEFAULT '{}',
  variants JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Portfolio Media
CREATE TABLE IF NOT EXISTS public.portfolio_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
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
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Portfolio Projects (Case Studies)
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
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

-- 4. Portfolio Edit History
CREATE TABLE IF NOT EXISTS public.portfolio_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  description TEXT,
  changed_by UUID REFERENCES auth.users(id),
  session_id TEXT,
  is_undoable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Portfolio Versions
CREATE TABLE IF NOT EXISTS public.portfolio_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,
  description TEXT,
  snapshot JSONB NOT NULL,
  is_auto_save BOOLEAN DEFAULT FALSE,
  is_published_version BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Portfolio Form Submissions
CREATE TABLE IF NOT EXISTS public.portfolio_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL DEFAULT 'contact',
  form_id TEXT,
  data JSONB NOT NULL,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  status TEXT DEFAULT 'new',
  spam_score DECIMAL(3,2),
  is_spam BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_form_submissions ENABLE ROW LEVEL SECURITY;

-- Policies

-- Projects: Public can view published, Owners can manage
CREATE POLICY "Public can view published projects" ON public.portfolio_projects
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Owners can manage projects" ON public.portfolio_projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.sites WHERE id = portfolio_projects.site_id AND owner_user_id = auth.uid())
  );

-- Submissions: Public can insert, Owners can view
CREATE POLICY "Public can insert submissions" ON public.portfolio_form_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view submissions" ON public.portfolio_form_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sites WHERE id = portfolio_form_submissions.site_id AND owner_user_id = auth.uid())
  );

-- Media: Owners can manage
CREATE POLICY "Owners can manage media" ON public.portfolio_media
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.sites WHERE id = portfolio_media.site_id AND owner_user_id = auth.uid())
  );

-- Sections: Public read
CREATE POLICY "Public can view sections" ON public.portfolio_sections
  FOR SELECT USING (is_active = TRUE);

-- Grants
GRANT SELECT ON public.portfolio_projects TO anon, authenticated;
GRANT ALL ON public.portfolio_projects TO authenticated;
GRANT INSERT ON public.portfolio_form_submissions TO anon, authenticated;
GRANT SELECT ON public.portfolio_form_submissions TO authenticated;
GRANT ALL ON public.portfolio_media TO authenticated;
GRANT SELECT ON public.portfolio_sections TO anon, authenticated;

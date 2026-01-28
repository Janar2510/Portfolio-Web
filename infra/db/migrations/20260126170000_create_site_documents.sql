-- Migration: Create Site Documents table for new Builder/Renderer flow
-- Description: Stores site configuration draft and published versions

CREATE TABLE public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.crm_organizations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    template_id TEXT NOT NULL,
    
    -- Versions
    config_draft JSONB NOT NULL DEFAULT '{}',
    config_published JSONB,
    
    -- Deployment
    custom_domain TEXT UNIQUE,
    domain_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed'
    
    -- Status
    publish_status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'preview', 'published'
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    last_preview_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT slug_kebab_case CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Site Releases for history and rollbacks
CREATE TABLE public.site_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    config JSONB NOT NULL,
    version INTEGER NOT NULL,
    published_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sites_user_id ON public.sites(user_id);
CREATE INDEX idx_sites_slug ON public.sites(slug);
CREATE INDEX idx_sites_custom_domain ON public.sites(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_site_releases_site_id ON public.site_releases(site_id);

-- Enable RLS
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_releases ENABLE ROW LEVEL SECURITY;

-- Triggers
CREATE TRIGGER set_sites_updated_at
    BEFORE UPDATE ON public.sites
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for sites
CREATE POLICY "Users can manage their own sites"
    ON public.sites
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view published sites"
    ON public.sites
    FOR SELECT
    USING (publish_status = 'published');

-- RLS Policies for site_releases
CREATE POLICY "Users can manage their own site releases"
    ON public.site_releases
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.sites
            WHERE sites.id = site_releases.site_id
            AND sites.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.sites TO authenticated;
GRANT SELECT ON public.sites TO anon;
GRANT ALL ON public.site_releases TO authenticated;
GRANT ALL ON public.site_releases TO anon; -- Allow select for public if needed? usually not.

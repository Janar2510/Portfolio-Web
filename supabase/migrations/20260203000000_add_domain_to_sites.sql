-- Migration: Add Custom Domain to Sites
-- Description: Adds custom_domain and verification status to public.sites

ALTER TABLE public.sites
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS custom_domain_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS sites_custom_domain_idx ON public.sites(custom_domain);

-- ============================================
-- SUBSCRIPTION & BILLING SCHEMA
-- ============================================

-- ===========================================
-- SUBSCRIPTION PLANS (Admin-managed)
-- ===========================================

CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  slug TEXT UNIQUE NOT NULL,  -- 'free', 'starter', 'professional', 'business'
  name TEXT NOT NULL,
  name_et TEXT,
  
  -- Description
  description TEXT,
  description_et TEXT,
  tagline TEXT,
  tagline_et TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  -- Stripe IDs
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  stripe_product_id TEXT,
  
  -- Features
  features JSONB NOT NULL DEFAULT '[]',
  
  -- Limits
  limits JSONB NOT NULL DEFAULT '{
    "portfolio_sites": 1,
    "pages_per_site": 5,
    "projects": 10,
    "crm_contacts": 50,
    "crm_deals": 20,
    "email_templates": 5,
    "storage_mb": 500,
    "team_members": 1
  }',
  
  -- Display
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  -- Trial
  trial_days INTEGER DEFAULT 14,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- USER SUBSCRIPTIONS
-- ===========================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN (
    'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'paused'
  )),
  
  -- Billing cycle
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Stripe references
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  -- Payment method
  payment_method_last4 TEXT,
  payment_method_brand TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ===========================================
-- BILLING HISTORY
-- ===========================================

CREATE TABLE public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  -- Invoice details
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  
  -- Amounts
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  tax_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  
  -- Description
  description TEXT,
  
  -- Invoice PDF
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  
  -- Period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  -- Dates
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- USAGE TRACKING
-- ===========================================

CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Current usage
  portfolio_sites INTEGER DEFAULT 0,
  pages_count INTEGER DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  crm_contacts_count INTEGER DEFAULT 0,
  crm_deals_count INTEGER DEFAULT 0,
  storage_used_mb DECIMAL(10,2) DEFAULT 0,
  team_members_count INTEGER DEFAULT 1,
  
  -- Period tracking
  api_calls_this_month INTEGER DEFAULT 0,
  emails_sent_this_month INTEGER DEFAULT 0,
  
  -- Reset date
  monthly_reset_at TIMESTAMPTZ DEFAULT NOW(),
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ===========================================
-- PROMO CODES
-- ===========================================

CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Discount
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  
  -- Applicability
  applicable_plans UUID[] DEFAULT '{}',
  billing_cycles TEXT[] DEFAULT ARRAY['monthly', 'yearly'],
  
  -- Limits
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  
  -- Dates
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  -- Stripe
  stripe_coupon_id TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TESTIMONIALS
-- ===========================================

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  quote TEXT NOT NULL,
  quote_et TEXT,
  
  -- Author
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_company TEXT,
  author_avatar_url TEXT,
  author_portfolio_url TEXT,
  
  -- Rating
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Display
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- LANDING PAGE CONTENT
-- ===========================================

CREATE TABLE public.landing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  
  content JSONB NOT NULL,
  
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(section, key)
);

-- ===========================================
-- FAQ ITEMS
-- ===========================================

CREATE TABLE public.faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  category TEXT DEFAULT 'general',
  
  question TEXT NOT NULL,
  question_et TEXT,
  answer TEXT NOT NULL,
  answer_et TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_billing_history_user ON public.billing_history(user_id);
CREATE INDEX idx_usage_tracking_user ON public.usage_tracking(user_id);
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code) WHERE is_active = TRUE;
CREATE INDEX idx_testimonials_featured ON public.testimonials(is_featured) WHERE is_active = TRUE;
CREATE INDEX idx_faq_category ON public.faq_items(category) WHERE is_active = TRUE;

-- ===========================================
-- RLS POLICIES
-- ===========================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Anyone can view active FAQ" ON public.faq_items FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Anyone can view active landing content" ON public.landing_content FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own billing history" ON public.billing_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can validate promo codes" ON public.promo_codes FOR SELECT USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- ===========================================
-- TRIGGERS
-- ===========================================

CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER usage_tracking_updated_at BEFORE UPDATE ON public.usage_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.create_user_usage_tracking() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usage_tracking (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_usage AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_user_usage_tracking();

CREATE OR REPLACE FUNCTION public.create_default_subscription() RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM public.subscription_plans WHERE slug = 'free' LIMIT 1;
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status, billing_cycle) VALUES (NEW.id, free_plan_id, 'active', 'monthly');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_subscription AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_default_subscription();

-- ===========================================
-- SEED DATA
-- ===========================================

INSERT INTO public.subscription_plans (slug, name, name_et, description, price_monthly, price_yearly, is_popular, sort_order, features, limits) VALUES
(
  'free',
  'Free',
  'Tasuta',
  'Perfect for trying out the platform',
  0, 0,
  FALSE, 0,
  '[
    {"key": "portfolio_sites", "value": 1, "label": "1 Portfolio site"},
    {"key": "pages", "value": 3, "label": "3 pages"},
    {"key": "projects", "value": 5, "label": "5 projects"},
    {"key": "branding", "value": true, "label": "Copifolio branding"}
  ]',
  '{"portfolio_sites": 1, "pages_per_site": 3, "projects": 5, "crm_contacts": 0, "storage_mb": 100}'
),
(
  'starter',
  'Starter',
  'Alustaja',
  'For freelancers getting started',
  9, 90,
  FALSE, 1,
  '[
    {"key": "portfolio_sites", "value": 1, "label": "1 Portfolio site"},
    {"key": "pages", "value": 10, "label": "10 pages"},
    {"key": "projects", "value": 20, "label": "20 projects"},
    {"key": "crm_contacts", "value": 100, "label": "100 CRM contacts"},
    {"key": "custom_domain", "value": true, "label": "Custom domain"},
    {"key": "no_branding", "value": true, "label": "Remove branding"},
    {"key": "analytics", "value": "basic", "label": "Basic analytics"}
  ]',
  '{"portfolio_sites": 1, "pages_per_site": 10, "projects": 20, "crm_contacts": 100, "crm_deals": 50, "storage_mb": 1000}'
),
(
  'professional',
  'Professional',
  'Professionaal',
  'For active freelancers and creatives',
  19, 190,
  TRUE, 2,
  '[
    {"key": "portfolio_sites", "value": 1, "label": "1 Portfolio site"},
    {"key": "pages", "value": -1, "label": "Unlimited pages", "unlimited": true},
    {"key": "projects", "value": -1, "label": "Unlimited projects", "unlimited": true},
    {"key": "crm_contacts", "value": 500, "label": "500 CRM contacts"},
    {"key": "crm_deals", "value": 200, "label": "200 deals"},
    {"key": "custom_domain", "value": true, "label": "Custom domain"},
    {"key": "no_branding", "value": true, "label": "Remove branding"},
    {"key": "analytics", "value": "advanced", "label": "Advanced analytics"},
    {"key": "email_templates", "value": 20, "label": "20 email templates"},
    {"key": "priority_support", "value": true, "label": "Priority support"}
  ]',
  '{"portfolio_sites": 1, "pages_per_site": -1, "projects": -1, "crm_contacts": 500, "crm_deals": 200, "storage_mb": 5000, "email_templates": 20}'
),
(
  'business',
  'Business',
  'Äri',
  'For agencies and growing businesses',
  39, 390,
  FALSE, 3,
  '[
    {"key": "portfolio_sites", "value": 3, "label": "3 Portfolio sites"},
    {"key": "pages", "value": -1, "label": "Unlimited pages", "unlimited": true},
    {"key": "projects", "value": -1, "label": "Unlimited projects", "unlimited": true},
    {"key": "crm_contacts", "value": -1, "label": "Unlimited CRM contacts", "unlimited": true},
    {"key": "crm_deals", "value": -1, "label": "Unlimited deals", "unlimited": true},
    {"key": "custom_domain", "value": true, "label": "Custom domains"},
    {"key": "no_branding", "value": true, "label": "Remove branding"},
    {"key": "analytics", "value": "advanced", "label": "Advanced analytics + A/B testing"},
    {"key": "email_templates", "value": -1, "label": "Unlimited email templates", "unlimited": true},
    {"key": "team_members", "value": 5, "label": "5 team members"},
    {"key": "api_access", "value": true, "label": "API access"},
    {"key": "priority_support", "value": true, "label": "Priority support + onboarding"}
  ]',
  '{"portfolio_sites": 3, "pages_per_site": -1, "projects": -1, "crm_contacts": -1, "crm_deals": -1, "storage_mb": 20000, "email_templates": -1, "team_members": 5}'
);

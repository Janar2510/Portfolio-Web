-- Migration: Create Email Integration Module tables
-- Description: Email accounts, messages, and templates with RLS policies

-- Connected email accounts
CREATE TABLE public.email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('outlook', 'apple')),
  email_address TEXT NOT NULL,
  display_name TEXT,
  credentials_encrypted TEXT,           -- Encrypted OAuth tokens or IMAP credentials
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  sync_state JSONB DEFAULT '{}',        -- Provider-specific sync cursor
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email_address)
);

-- Email messages (cached/synced)
CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,            -- Provider's message ID
  thread_id TEXT,                       -- For conversation grouping
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject TEXT,
  body_preview TEXT,                    -- First 200 chars
  body_html TEXT,
  from_address TEXT NOT NULL,
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[],
  has_attachments BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, external_id)
);

-- Email templates (user-created)
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  variables TEXT[],                     -- ['{{first_name}}', '{{company}}']
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_email_accounts_user_id ON public.email_accounts(user_id);
CREATE INDEX idx_email_accounts_provider ON public.email_accounts(provider);
CREATE INDEX idx_email_accounts_active ON public.email_accounts(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_email_accounts_email ON public.email_accounts(email_address);

CREATE INDEX idx_emails_account_id ON public.emails(account_id);
-- High-priority combined index for thread queries
CREATE INDEX idx_emails_account_thread ON public.emails(account_id, thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX idx_emails_contact_id ON public.emails(contact_id) WHERE contact_id IS NOT NULL;
-- High-priority index for contact email queries
CREATE INDEX idx_emails_deal_id ON public.emails(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_emails_direction ON public.emails(account_id, direction);
CREATE INDEX idx_emails_sent_at ON public.emails(account_id, sent_at);
CREATE INDEX idx_emails_received_at ON public.emails(account_id, received_at) WHERE received_at IS NOT NULL;
CREATE INDEX idx_emails_is_read ON public.emails(account_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_emails_from_address ON public.emails(from_address);
CREATE INDEX idx_emails_to_addresses ON public.emails USING GIN(to_addresses);
CREATE INDEX idx_emails_external_id ON public.emails(external_id);

CREATE INDEX idx_email_templates_user_id ON public.email_templates(user_id);
CREATE INDEX idx_email_templates_category ON public.email_templates(user_id, category) WHERE category IS NOT NULL;
CREATE INDEX idx_email_templates_name ON public.email_templates(user_id, name);

-- Triggers for updated_at
CREATE TRIGGER set_email_accounts_updated_at
  BEFORE UPDATE ON public.email_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update contact's last_contacted_at when email is received
CREATE OR REPLACE FUNCTION public.handle_email_contact()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contact_id IS NOT NULL AND NEW.direction = 'inbound' AND NEW.received_at IS NOT NULL THEN
    UPDATE public.contacts
    SET last_contacted_at = NEW.received_at
    WHERE id = NEW.contact_id
    AND (last_contacted_at IS NULL OR last_contacted_at < NEW.received_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_from_email
  AFTER INSERT ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_contact();

-- Trigger to create CRM activity when email is linked to contact/deal
CREATE OR REPLACE FUNCTION public.handle_email_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.contact_id IS NOT NULL OR NEW.deal_id IS NOT NULL) THEN
    INSERT INTO public.crm_activities (
      user_id,
      contact_id,
      deal_id,
      activity_type,
      title,
      description,
      metadata,
      is_completed,
      completed_at
    )
    SELECT
      email_accounts.user_id,
      NEW.contact_id,
      NEW.deal_id,
      'email',
      NEW.subject,
      NEW.body_preview,
      jsonb_build_object(
        'direction', NEW.direction,
        'from', NEW.from_address,
        'to', NEW.to_addresses,
        'sent_at', NEW.sent_at,
        'received_at', NEW.received_at
      ),
      TRUE,
      COALESCE(NEW.received_at, NEW.sent_at)
    FROM public.email_accounts
    WHERE email_accounts.id = NEW.account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_activity_from_email
  AFTER INSERT ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_activity();

-- Enable Row Level Security
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_accounts
-- Users can view their own email accounts
CREATE POLICY "Users can view own email accounts"
  ON public.email_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own email accounts
CREATE POLICY "Users can insert own email accounts"
  ON public.email_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own email accounts
CREATE POLICY "Users can update own email accounts"
  ON public.email_accounts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own email accounts
CREATE POLICY "Users can delete own email accounts"
  ON public.email_accounts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for emails
-- Users can view emails from their own accounts
CREATE POLICY "Users can view own account emails"
  ON public.emails
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.email_accounts
      WHERE email_accounts.id = emails.account_id
      AND email_accounts.user_id = auth.uid()
    )
  );

-- Users can insert emails to their own accounts
CREATE POLICY "Users can insert own account emails"
  ON public.emails
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.email_accounts
      WHERE email_accounts.id = emails.account_id
      AND email_accounts.user_id = auth.uid()
    )
  );

-- Users can update emails from their own accounts
CREATE POLICY "Users can update own account emails"
  ON public.emails
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.email_accounts
      WHERE email_accounts.id = emails.account_id
      AND email_accounts.user_id = auth.uid()
    )
  );

-- Users can delete emails from their own accounts
CREATE POLICY "Users can delete own account emails"
  ON public.emails
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.email_accounts
      WHERE email_accounts.id = emails.account_id
      AND email_accounts.user_id = auth.uid()
    )
  );

-- RLS Policies for email_templates
-- Users can view their own email templates
CREATE POLICY "Users can view own email templates"
  ON public.email_templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own email templates
CREATE POLICY "Users can insert own email templates"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own email templates
CREATE POLICY "Users can update own email templates"
  ON public.email_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own email templates
CREATE POLICY "Users can delete own email templates"
  ON public.email_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emails TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;

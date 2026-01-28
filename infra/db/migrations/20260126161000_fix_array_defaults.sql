-- Hotfix: Ensure all contacts have valid defaults for new columns
-- This fixes 400 errors when querying contacts after schema migration

-- Update contacts with NULL array fields to empty arrays
UPDATE public.contacts
SET additional_emails = '{}'
WHERE additional_emails IS NULL;

UPDATE public.contacts
SET additional_phones = '{}'
WHERE additional_phones IS NULL;

-- Ensure all contacts have visibility set
UPDATE public.contacts
SET visibility = 'owner'
WHERE visibility IS NULL;

-- Do the same for companies
UPDATE public.companies
SET visibility = 'owner'
WHERE visibility IS NULL;

-- Do the same for deals
UPDATE public.deals
SET visibility = 'owner'
WHERE visibility IS NULL;

-- Ensure activities participants is valid JSON array
UPDATE public.crm_activities
SET participants = '[]'
WHERE participants IS NULL;

-- Make columns NOT NULL now that we've backfilled
ALTER TABLE public.contacts
  ALTER COLUMN additional_emails SET DEFAULT '{}',
  ALTER COLUMN additional_phones SET DEFAULT '{}',
  ALTER COLUMN visibility SET DEFAULT 'owner';

ALTER TABLE public.companies
  ALTER COLUMN visibility SET DEFAULT 'owner';

ALTER TABLE public.deals
  ALTER COLUMN visibility SET DEFAULT 'owner';

ALTER TABLE public.crm_activities
  ALTER COLUMN participants SET DEFAULT '[]';

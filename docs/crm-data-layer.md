# CRM Data Layer Documentation

## Overview

The CRM data layer consists of 6 main tables with comprehensive RLS policies, indexes, and triggers for a complete customer relationship management system.

## Tables

### 1. `companies`
Company/organization records (optional - contacts can exist without companies).

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `name` (TEXT)
- `website` (TEXT, nullable)
- `industry` (TEXT, nullable)
- `size` (TEXT, nullable) - 'small', 'medium', 'large', 'enterprise'
- `address` (JSONB, nullable) - {street, city, country, postal}
- `notes` (TEXT, nullable)
- `custom_fields` (JSONB, default: {})
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_companies_user_id` on `user_id`
- `idx_companies_name` on `(user_id, name)`

**Triggers:**
- `set_companies_updated_at` - Updates `updated_at` on row update

### 2. `contacts`
Contact/lead records. Can be linked to a company.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `company_id` (UUID, FK → companies.id, nullable)
- `first_name` (TEXT)
- `last_name` (TEXT, nullable)
- `email` (TEXT, nullable)
- `phone` (TEXT, nullable)
- `job_title` (TEXT, nullable)
- `avatar_url` (TEXT, nullable)
- `social_links` (JSONB, default: {}) - {linkedin, twitter, etc.}
- `address` (JSONB, nullable)
- `lead_source` (TEXT, nullable) - 'referral', 'website', 'social', etc.
- `tags` (TEXT[], default: [])
- `custom_fields` (JSONB, default: {})
- `last_contacted_at` (TIMESTAMPTZ, nullable)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_contacts_user_id` on `user_id`
- `idx_contacts_company_id` on `company_id` (partial, WHERE company_id IS NOT NULL)
- `idx_contacts_email` on `email` (partial, WHERE email IS NOT NULL)
- `idx_contacts_name` on `(user_id, first_name, last_name)`
- `idx_contacts_tags` on `tags` (GIN index)
- `idx_contacts_last_contacted` on `last_contacted_at` (partial, WHERE last_contacted_at IS NOT NULL)

**Triggers:**
- `set_contacts_updated_at` - Updates `updated_at` on row update
- `update_contact_last_contacted` - Updates `last_contacted_at` when activity is created

### 3. `pipeline_stages`
Sales pipeline stages (e.g., Lead, Qualified, Proposal, Negotiation, Won, Lost).

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `name` (TEXT)
- `sort_order` (INTEGER, default: 0)
- `color` (TEXT, nullable)
- `probability` (INTEGER, default: 0) - Win probability percentage
- `is_won` (BOOLEAN, default: false)
- `is_lost` (BOOLEAN, default: false)
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_pipeline_stages_user_id` on `user_id`
- `idx_pipeline_stages_sort_order` on `(user_id, sort_order)`

### 4. `deals`
Deals/opportunities linked to contacts and companies, moving through pipeline stages.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `contact_id` (UUID, FK → contacts.id, nullable)
- `company_id` (UUID, FK → companies.id, nullable)
- `stage_id` (UUID, FK → pipeline_stages.id)
- `title` (TEXT)
- `value` (DECIMAL(12,2), nullable)
- `currency` (TEXT, default: 'EUR')
- `expected_close_date` (DATE, nullable)
- `actual_close_date` (DATE, nullable)
- `probability` (INTEGER, nullable)
- `notes` (TEXT, nullable)
- `lost_reason` (TEXT, nullable)
- `sort_order` (INTEGER, default: 0)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_deals_user_id` on `user_id`
- `idx_deals_contact_id` on `contact_id` (partial, WHERE contact_id IS NOT NULL)
- `idx_deals_company_id` on `company_id` (partial, WHERE company_id IS NOT NULL)
- `idx_deals_stage_id` on `stage_id`
- `idx_deals_sort_order` on `(stage_id, sort_order)`
- `idx_deals_expected_close` on `expected_close_date` (partial, WHERE expected_close_date IS NOT NULL)
- `idx_deals_value` on `(user_id, value)` (partial, WHERE value IS NOT NULL)

**Triggers:**
- `set_deals_updated_at` - Updates `updated_at` on row update
- `set_deal_close_date` - Sets `actual_close_date` and `probability = 100` when moved to won stage

### 5. `crm_activities`
Activity timeline events (emails, calls, meetings, notes, tasks) linked to contacts or deals.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `contact_id` (UUID, FK → contacts.id, nullable)
- `deal_id` (UUID, FK → deals.id, nullable)
- `activity_type` (TEXT) - 'email', 'call', 'meeting', 'note', 'task'
- `title` (TEXT, nullable)
- `description` (TEXT, nullable)
- `metadata` (JSONB, default: {}) - Type-specific data (email subject, call duration)
- `is_completed` (BOOLEAN, default: true)
- `due_date` (TIMESTAMPTZ, nullable)
- `completed_at` (TIMESTAMPTZ, nullable)
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- CHECK: `contact_id IS NOT NULL OR deal_id IS NOT NULL`

**Indexes:**
- `idx_crm_activities_user_id` on `user_id`
- `idx_crm_activities_contact_id` on `contact_id` (partial, WHERE contact_id IS NOT NULL)
- `idx_crm_activities_deal_id` on `deal_id` (partial, WHERE deal_id IS NOT NULL)
- `idx_crm_activities_type` on `activity_type`
- `idx_crm_activities_created` on `(contact_id, created_at)` (partial, WHERE contact_id IS NOT NULL)
- `idx_crm_activities_created_deal` on `(deal_id, created_at)` (partial, WHERE deal_id IS NOT NULL)
- `idx_crm_activities_due_date` on `due_date` (partial, WHERE due_date IS NOT NULL)

**Triggers:**
- `update_contact_last_contacted` - Updates contact's `last_contacted_at` when activity is created
- `set_activity_completed_at` - Sets `completed_at` when activity is marked as completed

### 6. `follow_ups`
Follow-up reminders linked to contacts or deals.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `contact_id` (UUID, FK → contacts.id, nullable)
- `deal_id` (UUID, FK → deals.id, nullable)
- `title` (TEXT)
- `due_date` (TIMESTAMPTZ)
- `is_completed` (BOOLEAN, default: false)
- `completed_at` (TIMESTAMPTZ, nullable)
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- CHECK: `contact_id IS NOT NULL OR deal_id IS NOT NULL`

**Indexes:**
- `idx_follow_ups_user_id` on `user_id`
- `idx_follow_ups_contact_id` on `contact_id` (partial, WHERE contact_id IS NOT NULL)
- `idx_follow_ups_deal_id` on `deal_id` (partial, WHERE deal_id IS NOT NULL)
- `idx_follow_ups_due_date` on `due_date`
- `idx_follow_ups_completed` on `is_completed` (partial, WHERE is_completed = FALSE)

**Triggers:**
- `set_follow_up_completed_at` - Sets `completed_at` when follow-up is marked as completed

## Row Level Security (RLS)

All tables have RLS enabled with the following policies (4 policies per table = 24 total):

### Policy Pattern
Each table has 4 policies:
1. **SELECT**: Users can view their own records (`auth.uid() = user_id`)
2. **INSERT**: Users can insert their own records (`WITH CHECK (auth.uid() = user_id)`)
3. **UPDATE**: Users can update their own records (`USING (auth.uid() = user_id)`)
4. **DELETE**: Users can delete their own records (`USING (auth.uid() = user_id)`)

### Tables with RLS
- ✅ `companies` - 4 policies
- ✅ `contacts` - 4 policies
- ✅ `pipeline_stages` - 4 policies
- ✅ `deals` - 4 policies
- ✅ `crm_activities` - 4 policies
- ✅ `follow_ups` - 4 policies

## Database Functions & Triggers

### Functions
1. **`handle_contact_activity()`**
   - Updates `contacts.last_contacted_at` when a completed activity is created
   - Triggered: `AFTER INSERT ON crm_activities`

2. **`handle_activity_completion()`**
   - Sets `crm_activities.completed_at` when activity is marked as completed
   - Triggered: `BEFORE UPDATE ON crm_activities`

3. **`handle_follow_up_completion()`**
   - Sets `follow_ups.completed_at` when follow-up is marked as completed
   - Triggered: `BEFORE UPDATE ON follow_ups`

4. **`handle_deal_won()`**
   - Sets `deals.actual_close_date` and `probability = 100` when deal is moved to won stage
   - Triggered: `BEFORE UPDATE ON deals`

5. **`handle_updated_at()`**
   - Updates `updated_at` timestamp on row update
   - Used by: `companies`, `contacts`, `deals`

## Relationships

```
profiles (users)
  ├── companies (1:N)
  │   └── contacts (N:1, optional)
  │   └── deals (N:1, optional)
  ├── contacts (1:N)
  │   ├── deals (1:N)
  │   ├── crm_activities (1:N)
  │   └── follow_ups (1:N)
  ├── pipeline_stages (1:N)
  │   └── deals (N:1)
  └── deals (1:N)
      ├── crm_activities (1:N)
      └── follow_ups (1:N)
```

## Migration Status

✅ **Migration Applied**: `20240104000000_create_crm_module.sql`
- Version: `20260120113203`
- Status: Complete
- All tables created
- All indexes created
- All triggers created
- All RLS policies applied (24 policies)

## Data Integrity

- Foreign key constraints ensure referential integrity
- CHECK constraints validate data (e.g., activities must have contact_id OR deal_id)
- Triggers maintain data consistency (e.g., auto-updating timestamps, last_contacted_at)
- RLS policies enforce multi-tenant security

## Performance Optimizations

- Comprehensive indexes on foreign keys and commonly queried fields
- Partial indexes for nullable foreign keys (reduces index size)
- GIN index on `contacts.tags` for efficient array queries
- Composite indexes for common query patterns (e.g., `(user_id, name)`, `(stage_id, sort_order)`)

## Usage Notes

1. **Companies are optional**: Contacts can exist without being linked to a company
2. **Activities require contact OR deal**: At least one must be specified
3. **Follow-ups require contact OR deal**: At least one must be specified
4. **Deal won trigger**: Automatically sets close date and probability when moved to won stage
5. **Contact last contacted**: Automatically updated when activities are created
6. **Custom fields**: Both companies and contacts support JSONB custom_fields for extensibility

## Next Steps

The CRM data layer is complete and ready for:
- Service layer implementation
- UI components
- API endpoints
- Integration with email module
- Integration with projects module

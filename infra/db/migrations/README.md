# Supabase Migrations

This directory contains Supabase database migrations that are applied via the Supabase CLI.

## Running Migrations

### Local Development

1. Start Supabase locally:
```bash
supabase start
```

2. Apply migrations:
```bash
supabase db reset
# or apply specific migration
supabase migration up
```

### Production

Push migrations to your Supabase project:

```bash
supabase db push
```

## Migration Files

- `20240101000000_create_profiles_and_user_settings.sql` - Creates profiles and user_settings tables with RLS policies
- `20240102000000_create_portfolio_module.sql` - Creates portfolio module tables (sites, pages, blocks, styles, templates) with RLS policies
- `20240103000000_create_projects_module.sql` - Creates project management module tables (projects, columns, tasks, subtasks, comments, attachments) with RLS policies
- `20240104000000_create_crm_module.sql` - Creates CRM module tables (companies, contacts, pipeline stages, deals, activities, follow-ups) with RLS policies
- `20240105000000_create_email_module.sql` - Creates email integration module tables (accounts, emails, templates) with RLS policies
- `20240106000000_create_analytics_module.sql` - Creates analytics and A/B testing module tables (events, experiments, variants, daily rollups) with RLS policies

# Migration Status

## ✅ All Migrations Applied Successfully!

1. ✅ **20240101000000_create_profiles_and_user_settings.sql** - Applied
   - Created `profiles` and `user_settings` tables
   - Set up RLS policies
   - Created triggers for profile creation

2. ✅ **20240102000000_create_portfolio_module.sql** - Applied
   - Portfolio sites, pages, blocks, styles, templates
   - RLS policies for public/private access

3. ✅ **20240103000000_create_projects_module.sql** - Applied
   - Projects, columns, tasks, subtasks, comments, attachments
   - Kanban board support

4. ✅ **20240104000000_create_crm_module.sql** - Applied
   - Companies, contacts, pipeline stages, deals, activities, follow-ups

5. ✅ **20240105000000_create_email_module.sql** - Applied
   - Email accounts, emails, email templates

6. ✅ **20240106000000_create_analytics_module.sql** - Applied
   - Analytics events, A/B experiments, variants, daily rollups

## How to Apply Remaining Migrations

### Option 1: Using Supabase CLI (Recommended)

```bash
cd /Users/janarkuusk/Portfolio-Web
supabase db push
```

Note: You'll need to enter your database password when prompted.

### Option 2: Using Supabase MCP Tools

Apply each migration using:
```
mcp_supabase_apply_migration
```

With:
- `project_id`: `pcltfprbgwqmymmveloj`
- `name`: Migration name (e.g., `create_portfolio_module`)
- `query`: Full SQL content from the migration file

### Option 3: Using Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/pcltfprbgwqmymmveloj/sql/new
2. Copy and paste each migration file's content
3. Run the SQL

## Verification

After applying all migrations, verify with:

```bash
supabase db remote exec "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
```

You should see 26 tables total.

# Supabase Project Setup Guide

## Project Information

- **Project URL:** https://pcltfprbgwqmymmveloj.supabase.co
- **Project Reference:** pcltfprbgwqmymmveloj

## Initial Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Authenticate with Supabase

```bash
supabase login
```

### 3. Link to Your Project

```bash
cd /Users/janarkuusk/Portfolio-Web
supabase link --project-ref pcltfprbgwqmymmveloj
```

### 4. Run Migrations

**Option A: Run all migrations at once**
```bash
supabase db push
```

**Option B: Run migrations individually**
```bash
# Run initial migration
supabase db push --file supabase/migrations/20240101000000_create_profiles_and_user_settings.sql

# Run remaining migrations
supabase db push
```

**Option C: Use the setup script**
```bash
./scripts/setup-supabase.sh
```

## Auth Configuration

### Email Auth (Default)

Email authentication is enabled by default. Configure in Supabase Dashboard:

1. Go to **Authentication → Providers**
2. **Email** provider should be enabled
3. Configure email templates if needed
4. Set up SMTP for production emails

### OAuth Providers

To enable OAuth providers (Google, GitHub, etc.):

1. Go to **Authentication → Providers**
2. Enable desired provider
3. Add OAuth credentials:
   - **Google:** Client ID and Secret from Google Cloud Console
   - **GitHub:** Client ID and Secret from GitHub OAuth Apps
   - **Microsoft:** Client ID and Secret from Azure AD
   - **Apple:** Client ID and Secret from Apple Developer

### Auth Settings

Recommended settings in **Authentication → Settings**:

- **Site URL:** `http://localhost:3000` (development)
- **Redirect URLs:** 
  - `http://localhost:3000/**`
  - `https://yourdomain.com/**` (production)
- **JWT expiry:** 3600 seconds (1 hour)
- **Enable signup:** Yes
- **Email confirmations:** 
  - **IMPORTANT:** Enable this in **Authentication → Providers → Email** settings
  - Go to Supabase Dashboard → Authentication → Providers → Email
  - Toggle **"Enable email confirmations"** to ON
  - Users will receive verification emails after signup
  - For local development with Supabase CLI, emails are captured in Inbucket at `http://localhost:54324`

## RLS Policies

All tables have RLS enabled with appropriate policies:

- **profiles:** Users can only access their own profile
- **user_settings:** Users can only access their own settings
- **portfolio_sites:** Public read for published sites, owner access for all
- **projects, tasks, etc.:** Owner-only access
- **analytics_events:** Public insert, owner-only read

Policies are defined in the migration files. Review them in:
- `supabase/migrations/20240101000000_create_profiles_and_user_settings.sql`
- Other migration files for module-specific policies

## Database Schema

After running migrations, you'll have:

1. **profiles** - User profiles extending auth.users
2. **user_settings** - User preferences and settings
3. **portfolio_sites** - Portfolio site configuration
4. **portfolio_pages** - Pages within portfolios
5. **portfolio_blocks** - Block-based content
6. **portfolio_styles** - Design presets
7. **portfolio_templates** - System templates
8. **projects** - Project containers
9. **project_columns** - Kanban board columns
10. **tasks** - Task management
11. **subtasks** - Checklist items
12. **task_comments** - Task discussions
13. **task_attachments** - File attachments
14. **companies** - Company records
15. **contacts** - Contact management
16. **pipeline_stages** - Sales pipeline stages
17. **deals** - Deal/opportunity management
18. **crm_activities** - Activity timeline
19. **follow_ups** - Follow-up reminders
20. **email_accounts** - Connected email accounts
21. **emails** - Cached email messages
22. **email_templates** - Email templates
23. **analytics_events** - Analytics tracking
24. **ab_experiments** - A/B test experiments
25. **ab_variants** - A/B test variants
26. **analytics_daily** - Aggregated daily analytics

## Environment Variables

Update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pcltfprbgwqmymmveloj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get these keys from:
- Supabase Dashboard → Settings → API
- **Project URL:** Already set above
- **anon key:** Public key for client-side access
- **service_role key:** Server-side key (keep secret!)

## Verification

After setup, verify:

1. **Check tables exist:**
   ```bash
   supabase db remote exec "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
   ```

2. **Check RLS is enabled:**
   ```bash
   supabase db remote exec "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
   ```

3. **Test auth:**
   - Try signing up a test user
   - Verify profile is created automatically
   - Check user_settings is created

## Troubleshooting

### Migration Errors

If migrations fail:
1. Check if tables already exist
2. Review error messages
3. Manually fix conflicts if needed
4. Use `supabase db reset` to start fresh (⚠️ deletes all data)

### RLS Policy Issues

If RLS blocks access:
1. Verify policies are created: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
2. Check user authentication: `SELECT auth.uid();`
3. Review policy conditions

### Connection Issues

If can't connect:
1. Verify project URL is correct
2. Check API keys are valid
3. Ensure project is active in Supabase Dashboard
4. Check network/firewall settings

## Next Steps

1. ✅ Run migrations
2. ✅ Configure auth providers
3. ✅ Set up environment variables
4. ✅ Test authentication flow
5. ✅ Verify RLS policies
6. ✅ Set up MCP server (see mcp-supabase-setup.md)

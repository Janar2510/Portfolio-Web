# Supabase Setup - Run These Commands

## Your Project
- **URL:** https://pcltfprbgwqmymmveloj.supabase.co
- **Reference:** pcltfprbgwqmymmveloj

## Commands to Run

### 1. Install Supabase CLI (if not installed)
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link to Your Project
```bash
cd /Users/janarkuusk/Portfolio-Web
supabase link --project-ref pcltfprbgwqmymmveloj
```

### 4. Run All Migrations
```bash
supabase db push
```

This will apply all 6 migrations:
1. ✅ Profiles and user_settings
2. ✅ Portfolio module
3. ✅ Projects module
4. ✅ CRM module
5. ✅ Email module
6. ✅ Analytics module

### 5. Verify Tables Were Created
```bash
supabase db remote exec "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
```

You should see 26 tables listed.

### 6. Verify RLS is Enabled
```bash
supabase db remote exec "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;"
```

All tables should have `rowsecurity = true`.

### 7. Get Your API Keys

Visit: https://supabase.com/dashboard/project/pcltfprbgwqmymmveloj/settings/api

Copy:
- **Project URL:** `https://pcltfprbgwqmymmveloj.supabase.co`
- **anon key:** (public key)
- **service_role key:** (keep secret!)

### 8. Create .env.local

```bash
cd apps/web
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://pcltfprbgwqmymmveloj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

Then edit `.env.local` and replace the placeholder keys.

### 9. Configure Auth in Dashboard

1. **Email Auth (should be enabled by default):**
   - Go to: https://supabase.com/dashboard/project/pcltfprbgwqmymmveloj/auth/providers
   - Verify Email provider is enabled

2. **Auth URL Configuration:**
   - Go to: https://supabase.com/dashboard/project/pcltfprbgwqmymmveloj/auth/url-configuration
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** Add `http://localhost:3000/**`

3. **OAuth Providers (optional):**
   - Enable Google, GitHub, etc. as needed
   - Add OAuth credentials from respective providers

### 10. Test the Setup

```bash
# Test database connection
supabase db remote exec "SELECT COUNT(*) FROM profiles;"

# Should return: 0 (no users yet, but table exists)
```

### 11. Configure MCP in Cursor

```bash
# Run the setup script
./scripts/setup-mcp.sh

# Or manually:
cp .cursor/mcp.json.example ~/.cursor/mcp.json
```

Then restart Cursor IDE.

## What Happens After Migrations

✅ **26 database tables** created
✅ **RLS policies** enabled on all tables
✅ **Triggers** set up for:
   - Automatic profile creation on signup
   - Updated_at timestamps
   - Task completion tracking
   - Deal close date tracking
   - Contact last_contacted_at updates
✅ **Indexes** created for performance
✅ **Functions** created for:
   - Updated_at handling
   - Profile creation
   - Activity tracking

## Verify Everything Works

Run the verification script:
```bash
./scripts/verify-supabase.sh
```

## Next: Start Building!

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

# Quick Start Guide

## Supabase Project Setup

Your Supabase project is configured:
- **Project URL:** https://pcltfprbgwqmymmveloj.supabase.co
- **Project Reference:** pcltfprbgwqmymmveloj

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

## Step 2: Authenticate and Link

```bash
# Login to Supabase
supabase login

# Link to your project
cd /Users/janarkuusk/Portfolio-Web
supabase link --project-ref pcltfprbgwqmymmveloj
```

## Step 3: Run Migrations

```bash
# Run all migrations
supabase db push
```

Or use the setup script:
```bash
./scripts/setup-supabase.sh
```

## Step 4: Get API Keys

1. Go to: https://supabase.com/dashboard/project/pcltfprbgwqmymmveloj/settings/api
2. Copy the following:
   - **Project URL:** `https://pcltfprbgwqmymmveloj.supabase.co`
   - **anon/public key:** For client-side access
   - **service_role key:** For server-side access (keep secret!)

## Step 5: Configure Environment Variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pcltfprbgwqmymmveloj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 6: Configure Auth Providers

1. Go to: https://supabase.com/dashboard/project/pcltfprbgwqmymmveloj/auth/providers
2. **Email provider:** Should be enabled by default
3. **OAuth providers:** Enable as needed (Google, GitHub, etc.)

### Auth Settings

Go to: https://supabase.com/dashboard/project/pcltfprbgwqmymmveloj/auth/url-configuration

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** Add `http://localhost:3000/**`

## Step 7: Verify Setup

```bash
./scripts/verify-supabase.sh
```

## Step 8: Configure MCP in Cursor

1. Run the MCP setup script:
   ```bash
   ./scripts/setup-mcp.sh
   ```

2. Or manually copy:
   ```bash
   cp .cursor/mcp.json.example ~/.cursor/mcp.json
   ```

3. Restart Cursor IDE

4. When prompted, authenticate with your Supabase account

## Step 9: Start Development

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

## What Gets Created

After running migrations, you'll have:

✅ **26 database tables** with RLS policies
✅ **Automatic profile creation** on user signup
✅ **All service layer** ready to use
✅ **Complete API structure** documented

## Troubleshooting

### Can't link project
- Make sure you're logged in: `supabase login`
- Verify project reference is correct
- Check you have access to the project

### Migration errors
- Check if tables already exist
- Review error messages
- Use `supabase db reset` to start fresh (⚠️ deletes data)

### RLS blocking access
- Verify policies are created
- Check user is authenticated
- Review policy conditions in migration files

## Next Steps

- ✅ Database setup complete
- ✅ Migrations ready to run
- ✅ Auth configuration guide provided
- ✅ MCP server configured
- 🚀 Ready to start building!

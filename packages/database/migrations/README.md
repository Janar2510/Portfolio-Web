# Database Migrations

This directory contains Supabase database migrations.

## Running Migrations

### Local Development

1. Start Supabase locally:
```bash
supabase start
```

2. Apply migrations:
```bash
supabase db reset
# or
supabase migration up
```

### Production

Migrations are typically applied via Supabase Dashboard or CLI:

```bash
supabase db push
```

## Migration Naming Convention

Migrations should follow the pattern: `YYYYMMDDHHMMSS_description.sql`

Example: `20240101000000_create_profiles_and_user_settings.sql`

## Migration Guidelines

1. **Always include RLS policies** - All tables must have Row Level Security enabled
2. **Multi-tenant by default** - All data must be scoped to `user_id` with RLS
3. **Include indexes** - Add indexes for frequently queried columns
4. **Use triggers for timestamps** - Automatically update `updated_at` fields
5. **Test migrations** - Always test migrations locally before applying to production

## Current Migrations

- `20240101000000_create_profiles_and_user_settings.sql` - Initial user profiles and settings tables

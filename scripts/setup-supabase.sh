#!/bin/bash

# Supabase Project Setup Script
# This script sets up the Supabase project with migrations and configuration

set -e

PROJECT_URL="https://pcltfprbgwqmymmveloj.supabase.co"
PROJECT_REF="pcltfprbgwqmymmveloj"

echo "🚀 Setting up Supabase project: $PROJECT_REF"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI is not installed"
  echo "Install it with: npm install -g supabase"
  exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Link to the project
echo "📎 Linking to Supabase project..."
supabase link --project-ref "$PROJECT_REF" || {
  echo "⚠️  Project may already be linked or you need to authenticate"
  echo "Run: supabase login"
  echo "Then: supabase link --project-ref $PROJECT_REF"
}

echo ""
echo "📦 Running migrations..."
echo ""

# Run migrations in order
MIGRATIONS=(
  "20240101000000_create_profiles_and_user_settings.sql"
  "20240102000000_create_portfolio_module.sql"
  "20240103000000_create_projects_module.sql"
  "20240104000000_create_crm_module.sql"
  "20240105000000_create_email_module.sql"
  "20240106000000_create_analytics_module.sql"
)

for migration in "${MIGRATIONS[@]}"; do
  if [ -f "supabase/migrations/$migration" ]; then
    echo "Running: $migration"
    supabase db push --file "supabase/migrations/$migration" || {
      echo "⚠️  Migration $migration may have already been applied"
    }
  fi
done

echo ""
echo "✅ Migrations completed"
echo ""
echo "📝 Next steps:"
echo "1. Configure auth providers in Supabase Dashboard"
echo "2. Set up OAuth providers (if needed)"
echo "3. Test the connection"
echo ""
echo "🔗 Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"

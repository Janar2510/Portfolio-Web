#!/bin/bash

# Verify Supabase Setup Script
# This script verifies that the Supabase project is properly configured

set -e

PROJECT_REF="pcltfprbgwqmymmveloj"

echo "🔍 Verifying Supabase project setup..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI is not installed"
  exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if project is linked
echo "📎 Checking project link..."
if supabase projects list | grep -q "$PROJECT_REF"; then
  echo "✅ Project is linked"
else
  echo "⚠️  Project not linked. Run: supabase link --project-ref $PROJECT_REF"
fi

echo ""
echo "📊 Checking database tables..."

# Check for key tables
TABLES=(
  "profiles"
  "user_settings"
  "portfolio_sites"
  "projects"
  "contacts"
  "deals"
  "email_accounts"
  "analytics_events"
)

for table in "${TABLES[@]}"; do
  if supabase db remote exec "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table';" 2>/dev/null | grep -q "1"; then
    echo "  ✅ $table exists"
  else
    echo "  ❌ $table missing"
  fi
done

echo ""
echo "🔒 Checking RLS policies..."

RLS_COUNT=$(supabase db remote exec "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';" 2>/dev/null | grep -oE '[0-9]+' | head -1)

if [ -n "$RLS_COUNT" ] && [ "$RLS_COUNT" -gt 0 ]; then
  echo "  ✅ Found $RLS_COUNT RLS policies"
else
  echo "  ⚠️  No RLS policies found (may need to run migrations)"
fi

echo ""
echo "✅ Verification complete"
echo ""
echo "📝 To view full database schema:"
echo "   supabase db remote exec \"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;\""

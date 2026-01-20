#!/bin/bash

# Script to apply all migrations to Supabase using MCP
# This is a helper script - migrations should be applied via MCP tools

echo "To apply migrations, use the Supabase MCP tools:"
echo "1. mcp_supabase_apply_migration for each migration file"
echo ""
echo "Migration files:"
ls -1 supabase/migrations/*.sql | grep -v README

#!/bin/bash

# Setup script for Supabase MCP Server
# This script helps configure the hosted Supabase MCP server for Cursor IDE

set -e

echo "🚀 Setting up Supabase MCP Server for Cursor IDE"
echo ""

# Check if .cursor directory exists
CURSOR_DIR="$HOME/.cursor"
if [ ! -d "$CURSOR_DIR" ]; then
  echo "Creating .cursor directory..."
  mkdir -p "$CURSOR_DIR"
fi

# Check if mcp.json already exists
MCP_CONFIG="$CURSOR_DIR/mcp.json"
if [ -f "$MCP_CONFIG" ]; then
  echo "⚠️  MCP configuration already exists at $MCP_CONFIG"
  read -p "Do you want to overwrite it? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
fi

# Create MCP configuration for hosted Supabase MCP
cat > "$MCP_CONFIG" << EOF
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
EOF

echo ""
echo "✅ MCP configuration created at $MCP_CONFIG"
echo ""
echo "📝 Next steps:"
echo "1. Restart Cursor IDE"
echo "2. When you first use MCP, you'll be prompted to authenticate with Supabase"
echo "3. Test the connection by asking the AI to query your database"
echo ""
echo "ℹ️  Note:"
echo "   - Using hosted Supabase MCP server (recommended)"
echo "   - Authentication happens via OAuth when first used"
echo "   - No API keys needed for basic setup"
echo ""
echo "🔒 Security reminder:"
echo "   - Never commit mcp.json to version control"
echo "   - The MCP server will have access to your Supabase projects"
echo "   - You can restrict access in Supabase dashboard if needed"
echo ""

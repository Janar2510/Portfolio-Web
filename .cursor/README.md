# Cursor IDE Configuration

This directory contains Cursor IDE-specific configuration files.

## MCP Server Configuration

To set up the Supabase MCP server:

### Quick Setup (Recommended)

1. **Run the setup script:**
   ```bash
   ./scripts/setup-mcp.sh
   ```

   Or manually copy the example configuration:
   ```bash
   cp .cursor/mcp.json.example ~/.cursor/mcp.json
   ```

2. **Restart Cursor IDE**

3. **Authenticate when prompted:**
   - When you first use MCP features, you'll be prompted to authenticate
   - Sign in with your Supabase account
   - The connection will be automatically configured

### Manual Setup

Alternatively, configure MCP servers directly in Cursor Settings:
- Open Cursor Settings
- Go to Features → MCP Servers
- Add:
  ```json
  {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp"
    }
  }
  ```

See [docs/mcp-supabase-setup.md](../docs/mcp-supabase-setup.md) for detailed instructions and alternative setup options.

## Security Note

⚠️ Never commit `mcp.json` with real credentials to version control. The `.cursor/` directory should be in `.gitignore`.

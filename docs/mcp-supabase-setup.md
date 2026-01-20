# MCP Server Setup for Supabase

This guide explains how to set up the Supabase MCP (Model Context Protocol) server for use with Cursor IDE.

## What is MCP?

MCP (Model Context Protocol) allows AI assistants to interact with external services like Supabase, enabling direct database queries, schema inspection, and more.

## Setup Instructions

### Option 1: Using Hosted Supabase MCP Server (Recommended)

Supabase provides a hosted MCP server that's the easiest to set up and maintain.

1. **Configure in Cursor:**

   Open Cursor Settings → Features → MCP Servers and add:

   ```json
   {
     "mcpServers": {
       "supabase": {
         "url": "https://mcp.supabase.com/mcp"
       }
     }
   }
   ```

2. **Authentication:**

   The hosted MCP server uses dynamic client registration with OAuth. When you first use it:
   - You'll be prompted to authenticate with your Supabase account
   - The connection will be automatically configured
   - No manual API keys needed for basic setup

3. **For CI/Non-Interactive Use:**

   If you need to use MCP in non-interactive environments, you can create a Personal Access Token (PAT) in your Supabase dashboard and configure it in the MCP server settings.

### Option 2: Custom MCP Server Script

Create a custom MCP server wrapper:

1. **Create MCP server script:**
   ```bash
   mkdir -p scripts/mcp
   ```

2. **Create `scripts/mcp/supabase-server.js`:**
   ```javascript
   #!/usr/bin/env node
   const { createClient } = require('@supabase/supabase-js');
   
   // Read from environment or config
   const supabaseUrl = process.env.SUPABASE_URL;
   const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
   
   const supabase = createClient(supabaseUrl, supabaseKey);
   
   // MCP server implementation
   // This is a simplified example - use a proper MCP server library
   ```

### Option 3: Direct Supabase CLI Integration

Use Supabase CLI with MCP:

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Configure MCP to use Supabase CLI:**
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "supabase",
         "args": ["db", "remote", "exec"]
       }
     }
   }
   ```

## Configuration File Location

MCP server configuration is typically stored in:

- **Cursor:** `~/.cursor/mcp.json` or in Cursor settings
- **VS Code with MCP extension:** `.vscode/mcp.json`

## Recommended Configuration

For this project, use the following configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server"
      ],
      "env": {
        "SUPABASE_URL": "YOUR_SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY": "YOUR_SUPABASE_SERVICE_ROLE_KEY"
      }
    }
  }
}
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit service role keys** to version control
2. Use environment variables for sensitive credentials
3. The service role key bypasses RLS - use with caution
4. Consider creating a read-only service role key for MCP access
5. Restrict MCP server access to trusted environments only

## Creating a Read-Only Service Role Key

For safer MCP access, create a read-only service role:

1. Go to Supabase Dashboard → Settings → API
2. Create a new service role key with limited permissions
3. Use this key for MCP server instead of full service role key

## Testing the Setup

Once configured, you can test by asking the AI assistant:

- "Show me the database schema"
- "List all tables in the database"
- "Query the profiles table"
- "Show RLS policies for portfolio_sites"

## Troubleshooting

### MCP Server Not Found
- Ensure the package is installed globally or use `npx`
- Check that the command path is correct

### Authentication Errors
- Verify your Supabase URL and service role key
- Check that the key has the necessary permissions

### Connection Issues
- Ensure your Supabase project is accessible
- Check network/firewall settings
- Verify the Supabase project is active

## Alternative: Local Development

For local development with Supabase CLI:

```json
{
  "mcpServers": {
    "supabase-local": {
      "command": "supabase",
      "args": ["db", "remote", "exec", "--local"],
      "cwd": "/path/to/Portfolio-Web"
    }
  }
}
```

## Resources

- [Supabase MCP Server](https://github.com/supabase/mcp-server)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Cursor MCP Documentation](https://cursor.sh/docs/mcp)

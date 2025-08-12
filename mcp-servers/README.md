# MCP Servers Configuration

Model Context Protocol (MCP) servers provide programmatic access to external services for AI agents.

## Available Servers

### Supabase MCP
- **Config**: `config/supabase.json`
- **Capabilities**: Database, Auth, Storage, Functions
- **Status**: Ready for configuration

### AWS MCP
- **Config**: `config/aws.json`
- **Capabilities**: S3, Lambda, CloudFront, RDS, SES
- **Status**: Ready for configuration

### Vercel MCP
- **Config**: `config/vercel.json`
- **Capabilities**: Deployments, Domains, Environment Variables
- **Status**: Ready for configuration

## Setup Instructions

1. **Install MCP CLI** (if not already installed):
```bash
npm install -g @modelcontextprotocol/cli
```

2. **Configure Environment Variables**:
Create a `.env` file in the root with:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
VERCEL_TOKEN=your-vercel-token
```

3. **Register Servers with Claude**:
Add to your Claude Desktop configuration:
```json
{
  "mcpServers": {
    "meterr-supabase": {
      "command": "node",
      "args": ["C:/Users/LeviFriedbauer/meterr/mcp-servers/supabase-server.js"]
    },
    "meterr-aws": {
      "command": "node",
      "args": ["C:/Users/LeviFriedbauer/meterr/mcp-servers/aws-server.js"]
    }
  }
}
```

## Usage

Once configured, Claude agents can use these servers to:
- Query and modify Supabase data
- Deploy to Vercel
- Manage AWS resources
- Automate infrastructure tasks

## Security

- Never commit credentials to git
- Use environment variables for all secrets
- Rotate keys regularly
- Limit permissions to minimum required
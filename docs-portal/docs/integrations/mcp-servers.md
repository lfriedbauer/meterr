---
title: MCP Server Integrations
description: Model Context Protocol servers for AI agent automation
audience: ["ai", "human"]
status: ready
last_updated: 2025-08-13
owner: team
sidebar_position: 1
---

# MCP Server Integrations

Model Context Protocol (MCP) servers provide programmatic access to external services for AI agents.

## Available Servers

### LLM Research Server
- **Location**: `mcp-servers/llm-research/`
- **Purpose**: Query multiple LLMs simultaneously for research
- **Capabilities**: OpenAI, Anthropic, Google, Perplexity, Grok queries
- **Status**: Created, needs dependency fixes

### Supabase MCP
- **Config**: `mcp-servers/config/supabase.json`
- **Capabilities**: Database, Auth, Storage, Functions
- **Status**: Configuration ready

### AWS MCP
- **Config**: `mcp-servers/config/aws.json`
- **Capabilities**: S3, Lambda, CloudFront, RDS, SES
- **Status**: Configuration ready

### Vercel MCP
- **Config**: `mcp-servers/config/vercel.json`
- **Capabilities**: Deployments, Domains, Environment Variables
- **Status**: Configuration ready

## Setup Instructions

### 1. Install MCP CLI
```bash
npm install -g @modelcontextprotocol/cli
```

### 2. Configure Environment Variables
Ensure `.env` file contains:
```env
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# AWS
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret

# Vercel
VERCEL_TOKEN=your-vercel-token

# LLM APIs (for research server)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
PERPLEXITY_API_KEY=your-perplexity-key
XAI_API_KEY=your-xai-key
```

### 3. Register with Claude Desktop
Add to Claude Desktop configuration:
```json
{
  "mcpServers": {
    "meterr-llm-research": {
      "command": "node",
      "args": ["C:/Users/Owner/Projects/meterr/mcp-servers/llm-research/dist/server.js"]
    },
    "meterr-supabase": {
      "command": "node",
      "args": ["C:/Users/Owner/Projects/meterr/mcp-servers/supabase-server.js"]
    },
    "meterr-aws": {
      "command": "node",
      "args": ["C:/Users/Owner/Projects/meterr/mcp-servers/aws-server.js"]
    },
    "meterr-vercel": {
      "command": "node",
      "args": ["C:/Users/Owner/Projects/meterr/mcp-servers/vercel-server.js"]
    }
  }
}
```

## Usage Examples

### Query Multiple LLMs
```typescript
// Using the LLM research server
const responses = await queryAllLLMs({
  prompt: "What are best practices for token optimization?",
  services: ["openai", "anthropic", "google"],
  saveResults: true
});
```

### Database Operations
```typescript
// Using Supabase MCP
const users = await supabase.from('users').select('*');
```

### Deployment Management
```typescript
// Using Vercel MCP
const deployment = await vercel.deploy({
  project: 'meterr-app',
  environment: 'production'
});
```

## Security Best Practices

- Never commit credentials to git
- Use environment variables for all secrets
- Rotate API keys regularly
- Limit permissions to minimum required
- Use separate keys for development/production

## Troubleshooting

### MCP Server Not Responding
1. Check environment variables are set
2. Verify server process is running
3. Check Claude Desktop configuration path is correct

### Authentication Errors
1. Verify API keys are valid
2. Check permissions on service accounts
3. Ensure tokens haven't expired

## Alternative: Direct Script Usage

If MCP servers aren't needed, use scripts directly:
```bash
# Query all LLMs without MCP
npx tsx scripts/query-all-llms.ts "Your research question here"
```
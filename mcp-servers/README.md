# MCP (Model Context Protocol) Infrastructure Documentation

> **Centralized documentation for all MCP servers and infrastructure tools**  
> Last updated: 2025-08-15

## Overview

Model Context Protocol (MCP) servers provide programmatic access to external services for AI agents in the meterr project. This is the single source of truth for all MCP-related infrastructure and tools.

## Architecture

```
meterr/
├── mcp-servers/              # MCP server implementations
│   ├── llm-research/        # Multi-LLM research server
│   ├── config/              # Server configurations
│   └── README.md            # This documentation
├── .claude/
│   └── mcp.json            # Claude Desktop MCP configuration
└── apps/app/scripts/        # Direct script alternatives
```

## Available MCP Servers

### 1. LLM Research Server (Active)
- **Location**: `mcp-servers/llm-research/`
- **Purpose**: Query multiple LLMs simultaneously for research and analysis
- **Status**: ✅ Active and configured
- **Capabilities**:
  - Query single LLM (OpenAI, Anthropic, Google, Perplexity, Grok)
  - Query all LLMs with same prompt
  - Execute research batches from JSON files
  - Analyze responses for patterns
  - Calculate research costs
  - Save results to files

### 2. Supabase MCP (Ready)
- **Config**: `config/supabase.json`
- **Purpose**: Database operations and authentication
- **Status**: ⚙️ Configuration ready, not active
- **Capabilities**:
  - Database queries and mutations
  - Authentication management
  - Storage operations
  - Edge Functions invocation

### 3. AWS MCP (Ready)
- **Config**: `config/aws.json`
- **Purpose**: AWS resource management
- **Status**: ⚙️ Configuration ready, not active
- **Capabilities**:
  - S3 bucket operations
  - Lambda function management
  - CloudFront distributions
  - RDS database operations
  - SES email services

### 4. Vercel MCP (Ready)
- **Config**: `config/vercel.json`
- **Purpose**: Deployment and environment management
- **Status**: ⚙️ Configuration ready, not active
- **Capabilities**:
  - Project deployments
  - Domain management
  - Environment variable configuration
  - Build monitoring

## Installation & Setup

### Prerequisites

1. **Install MCP CLI** (global):
```bash
npm install -g @modelcontextprotocol/cli
```

2. **Install Dependencies** (for LLM Research Server):
```bash
cd mcp-servers/llm-research
pnpm install
pnpm build
```

### Environment Configuration

Create or update `.env` file in project root:

```env
# LLM APIs (Required for research server)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
PERPLEXITY_API_KEY=pplx-...
XAI_API_KEY=xai-...

# Supabase (Required for Supabase MCP)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...

# AWS (Required for AWS MCP)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Vercel (Required for Vercel MCP)
VERCEL_TOKEN=...
VERCEL_TEAM_ID=team_...
```

### Claude Desktop Configuration

The MCP configuration is managed in `.claude/mcp.json`. This file defines all available servers and their settings.

**Current Configuration Status:**
- ✅ **filesystem**: Enabled (file system access)
- ✅ **llm-research**: Enabled (multi-LLM queries)
- ❌ **supabase**: Disabled (enable when needed)
- ❌ **aws**: Disabled (enable when needed)
- ❌ **vercel**: Disabled (enable when needed)

To enable additional servers, edit `.claude/mcp.json` and set `"enabled": true`.

## Usage Guide

### Using MCP Servers in Claude

Once configured, Claude can access MCP tools directly:

```typescript
// Example: Query all LLMs
await mcp.llmResearch.queryAllLLMs({
  prompt: "What are the best practices for token optimization?",
  temperature: 0.7
});

// Example: Analyze research results
await mcp.llmResearch.analyzeResponses({
  research_id: "batch-1234567890"
});
```

### Alternative: Direct Script Usage

For scenarios where MCP isn't available or needed, use scripts directly:

```bash
# Query multiple LLMs
cd apps/app
pnpm tsx scripts/query-llms-for-pivot.ts

# Test specific models
pnpm tsx scripts/test-claude-models.ts
pnpm tsx scripts/test-premium-models.ts
```

## Tool Capabilities

### LLM Research Server Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `query_single_llm` | Query one LLM service | service, prompt, model, temperature |
| `query_all_llms` | Query all configured LLMs | prompt, temperature |
| `execute_research_batch` | Run batch queries from JSON | batch_file |
| `analyze_responses` | Analyze patterns in responses | research_id |
| `save_research_results` | Save results to file | research_id, filename |
| `get_research_cost` | Calculate total costs | research_id |

## Security Best Practices

### API Key Management
- ✅ Store all keys in `.env` file
- ✅ Never commit `.env` to git
- ✅ Use different keys for dev/prod
- ✅ Rotate keys quarterly
- ✅ Use minimal required permissions

### Access Control
- Only enable MCP servers when actively needed
- Review `.claude/mcp.json` regularly
- Monitor API usage through provider dashboards
- Set up billing alerts for all services

## Troubleshooting

### Common Issues

#### MCP Server Not Responding
1. Check server is enabled in `.claude/mcp.json`
2. Verify environment variables are set
3. Check server build output: `cd mcp-servers/llm-research && pnpm build`
4. Review Claude Desktop logs

#### Authentication Errors
1. Verify API keys are valid and not expired
2. Check key has required permissions
3. Ensure billing is active on provider accounts
4. Test keys directly: `pnpm tsx scripts/test-setup.ts`

#### Build Errors (LLM Research Server)
```bash
cd mcp-servers/llm-research
pnpm clean
pnpm install
pnpm build
```

### Debug Commands

```bash
# Test environment variables
pnpm tsx scripts/test-setup.ts

# Test specific LLM
pnpm tsx scripts/test-claude-models.ts

# Check MCP configuration
cat .claude/mcp.json | jq '.servers'

# Verify server files exist
ls -la mcp-servers/llm-research/dist/
```

## Development Workflow

### Adding New MCP Servers

1. Create server implementation in `mcp-servers/[name]/`
2. Add configuration to `.claude/mcp.json`
3. Document in this README
4. Test with Claude Desktop
5. Create fallback scripts in `apps/app/scripts/`

### Modifying Existing Servers

1. Make changes in server source
2. Rebuild if TypeScript: `pnpm build`
3. Restart Claude Desktop to reload
4. Test functionality
5. Update documentation

## Performance Considerations

- **Rate Limiting**: Implement delays between API calls
- **Caching**: Results stored in `mcp-research-results/`
- **Batch Processing**: Use batch endpoints when available
- **Cost Tracking**: Monitor usage through `get_research_cost`

## Integration with Meterr Platform

MCP servers support the meterr platform by:
- Researching LLM pricing and capabilities
- Automating infrastructure management
- Facilitating multi-model comparisons
- Enabling rapid prototyping and testing

## Related Documentation

- **Scripts**: See `apps/app/scripts/` for standalone implementations
- **LLM Client**: See `packages/@meterr/llm-client/` for unified LLM interface
- **Environment Setup**: See root `.env.example` for all variables

## Maintenance

### Weekly Tasks
- Review API usage and costs
- Check for updated MCP server versions
- Verify all configured servers still work

### Monthly Tasks
- Rotate API keys if needed
- Clean up old research results
- Update server dependencies

### Quarterly Tasks
- Full security audit of keys and permissions
- Performance optimization review
- Documentation updates

## Support

For issues or questions:
1. Check this documentation first
2. Review server-specific logs
3. Test with direct scripts as fallback
4. Contact team for infrastructure support
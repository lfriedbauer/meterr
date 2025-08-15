---
title: MCP Server Integrations
description: Model Context Protocol servers for AI agent automation
audience: ["ai", "human"]
status: ready
last_updated: 2025-08-15
owner: team
sidebar_position: 1
---

# MCP Server Integrations

> **Note**: This is a client-facing overview. For complete infrastructure documentation, see [`/mcp-servers/README.md`](/mcp-servers/README.md)

## Overview

Model Context Protocol (MCP) servers enable AI agents to interact with external services programmatically. Meterr uses MCP for infrastructure automation and multi-LLM research capabilities.

## Available Integrations

- **LLM Research**: Query multiple AI providers simultaneously
- **Supabase**: Database and authentication operations  
- **AWS**: Cloud infrastructure management
- **Vercel**: Deployment and environment configuration

## Quick Start

1. **Install dependencies**:
```bash
npm install -g @modelcontextprotocol/cli
```

2. **Configure environment variables** (see `.env.example`)

3. **Enable servers** in `.claude/mcp.json`

## Usage in Meterr

MCP servers power several meterr features:
- Automated LLM cost comparison
- Infrastructure provisioning
- Multi-model research and analysis
- Deployment automation

## Documentation

For detailed setup, configuration, and troubleshooting:
- **Infrastructure Docs**: [`/mcp-servers/README.md`](/mcp-servers/README.md)
- **Scripts**: [`/apps/app/scripts/`](/apps/app/scripts/)
- **Configuration**: [`.claude/mcp.json`](/.claude/mcp.json)
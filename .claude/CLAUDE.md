# Claude Master Instructions - meterr.ai

## Project Overview
You are working on meterr.ai, an AI-powered expense tracking platform that monitors both traditional vendor spending and AI service usage. This is a scalable monorepo using Next.js, Supabase, and AWS.

## Architecture
- **Monorepo Structure**: Using pnpm workspaces
- **Multi-Agent System**: Orchestrated agent architecture with dynamic spawning
- **Deployment**: Vercel for frontend, AWS for infrastructure, Supabase for database

## Agent Roles
When working on this project, you may assume different agent roles:
- **Orchestrator**: Coordinate between agents and spawn new ones as needed
- **Architect**: System design and planning
- **Builder**: Implementation and coding
- **Validator**: Testing and quality assurance
- **Scribe**: Documentation and knowledge management
- **Spawner**: Create new specialized agents

## Working Directory
- Root: C:\Users\LeviFriedbauer\meterr
- Apps: apps/marketing, apps/app, apps/admin
- Packages: packages/@meterr/*
- UI Library: ui/
- Infrastructure: infrastructure/

## Key Commands
```bash
# Development
pnpm dev           # Run all apps
pnpm dev:marketing # Run marketing site
pnpm dev:app      # Run main app

# Building
pnpm build        # Build all
pnpm test         # Test all
pnpm lint         # Lint all

# Deployment
pnpm deploy:marketing
pnpm deploy:app
```

## Technology Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Infrastructure**: AWS (Lambda, S3, CloudFront), Vercel
- **AI Services**: OpenAI, Anthropic, Google AI
- **Payments**: Stripe

## Coding Standards
- TypeScript strict mode (no `any`, no `!`, no `as unknown`)
- Double quotes for strings
- Full error handling
- Comprehensive comments
- No placeholders in code

## Current Phase
Restructuring monorepo for scalable multi-agent architecture.

## MCP Servers Available
- Filesystem access
- Supabase operations (when configured)
- AWS services (when configured)
- Vercel deployments (when configured)
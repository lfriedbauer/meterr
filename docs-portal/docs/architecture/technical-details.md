---
title: Architecture
sidebar_label: Architecture
sidebar_position: 3
audience: ["human", "ai"]
description: "METERR Architecture documentation for Meterr.ai"

---

# METERR Architecture

<!-- audience: human -->
## Overview (Detailed)

# METERR Architecture

## What meterr.ai Does

meterr.ai tracks AI API usage and costs in real-time across OpenAI, Anthropic, Google, and other providers. Companies integrate our SDK to automatically monitor token usage, costs, and optimize AI spending.

## Architecture Overview

```
Customer App → meterr SDK → meterr API → AI Provider (OpenAI/Anthropic/etc)
                    ↓
              Token Counter (GPU-accelerated)
                    ↓
              Cost Calculator
                    ↓
              Analytics Dashboard
```

## Current Project Structure

<!-- /audience -->

<!-- audience: ai -->
## Overview (Concise)

# METERR Architecture - Claude Context

## Project Structure

```
meterr/
├── apps/app/                     # Main application
│   ├── app/api/smart-router/    # API routing endpoint
│   ├── app/tools/token-calculator/ # Token tool
│   ├── gateway-prototype/       # Gateway implementations
<!-- /audience -->

# METERR Architecture

## What meterr.ai Does

meterr.ai tracks AI API usage and costs in real-time across OpenAI, Anthropic, Google, and other providers. Companies integrate our SDK to automatically monitor token usage, costs, and optimize AI spending.

## Architecture Overview

```
Customer App → meterr SDK → meterr API → AI Provider (OpenAI/Anthropic/etc)
                    ↓
              Token Counter (GPU-accelerated)
                    ↓
              Cost Calculator
                    ↓
              Analytics Dashboard
```

## Multi-Agent System Protocol

### Delegation-Report Cycle (CEO Mandate 001)
All agent interactions follow a strict 5-phase protocol:

1. **ACKNOWLEDGE** - Agent confirms receipt of task with JSON acknowledgment
2. **DELEGATE** - Task assignment using structured JSON format
3. **EXECUTE** - Complete task execution with full analysis (no truncation)
4. **REPORT** - JSON status report with metrics and outcomes
5. **SYNTHESIZE** - Complete summary with task resolution

### Agent Communication Protocol
```json
{
  "message_format": {
    "from": "agent_name",
    "to": "target_agent|all_agents",
    "type": "task|status|broadcast|escalation",
    "priority": "low|medium|high|critical",
    "timestamp": "ISO 8601",
    "task_id": "unique_identifier",
    "payload": {}
  }
}
```

### Hierarchy Enforcement
- **Meta Agents** (3): Orchestrator, Spawner, Research Coordinator
- **Primary Agents** (7): Architect, Builder, Validator, Scribe, Product Manager, Operations Engineer, Marketing
- **Specialist Agents** (1): Skeptic
- **Sub-Agents**: Spawned as needed, auto-terminate after 72hrs

### Constraints
- No new files without CEO approval
- Update existing documentation only
- Complete analysis required (no truncation)
- All changes tracked in root CHANGELOG.md
- Factual references from commit history and METERR_ROADMAP.md

## Current Project Structure

```
meterr/
├── apps/
│   ├── app/                      # Main dashboard application
│   │   ├── app/                  # Next.js app directory
│   │   │   ├── api/              # API endpoints
│   │   │   │   └── smart-router/ # AI routing endpoint
│   │   │   └── tools/           
│   │   │       └── token-calculator/ # Token counting tool
│   │   ├── gateway-prototype/    # Gateway comparison implementations
│   │   ├── platform-mvp/         # MVP platform code
│   │   ├── research-results/     # API research & validation
│   │   ├── scripts/              # Research & analysis scripts
│   │   └── sdk-prototype/        # SDK implementations (Node/Python)
│   │
│   ├── admin/                    # Admin dashboard
│   │   ├── app/                  # Next.js app directory
│   │   └── vercel.json          # Vercel configuration
│   │
│   └── marketing/                # Public website (meterr.ai)
│       └── src/                  # Marketing site source
│
├── packages/                     # Shared packages (future)
│   └── @meterr/                 # Scoped packages
│
├── ui/                          # Shared UI component library
│   ├── README.md
│   └── package.json
│
├── research-results/            # Market research & validation
│   ├── validated-insights.md   # Validated market research
│   ├── pricing-implementation-guide.md
│   ├── product-specification.md
│   └── tech-stack-recommendation.md
│
├── prototypes/                  # Prototype implementations
│   └── build-report.json       # Status of built prototypes
│
├── docs/                       # Human-readable documentation
│   ├── METERR_ARCHITECTURE.md # This file
│   ├── METERR_DEVELOPMENT_GUIDE.md
│   ├── AGENT_GUIDE.md
│   └── SCALING.md
│
├── .claude/                    # Claude Code configuration
│   ├── context/               # Claude's operational docs
│   │   ├── METERR_ENVIRONMENT.md
│   │   ├── METERR_CODING_STANDARDS.md
│   │   └── METERR_ARCHITECTURE.md
│   ├── agents/                # Agent configurations
│   └── CLAUDE.md             # Main Claude instructions
│
├── scripts/                   # Deployment & automation
│   ├── agent-spawn.js        # Agent spawning system
│   ├── deploy.ps1           # Deployment script
│   └── setup.ps1            # Setup script
│
├── infrastructure/           # Infrastructure configuration
│   └── supabase/
│       └── config.toml      # Supabase configuration
│
├── mcp-servers/             # Model Context Protocol servers
│   ├── config/              # MCP configurations
│   └── llm-research/        # LLM research server
│
├── pnpm-workspace.yaml      # Monorepo configuration
├── tsconfig.base.json       # TypeScript base config
└── package.json            # Root package configuration
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **State**: React Context / Zustand
- **Forms**: React Hook Form + Zod validation

### Backend
- **API**: Vercel Edge Functions (serverless)
- **Database**: Supabase (PostgreSQL) for core data
- **Logs**: DynamoDB for high-volume token logs
- **Auth**: Supabase Auth (moving to Clerk for MVP)

### AI Integration
- **Providers**: OpenAI, Anthropic, Google, Mistral, Cohere
- **Token Counting**: Provider-specific tokenizers
- **GPU Acceleration**: CUDA support via RTX 5070 Ti

### Infrastructure
- **Hosting**: Vercel (global edge network)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics
- **CI/CD**: GitHub Actions

## Key Components

### 1. Token Tracking System

Located in `apps/app/scripts/` and `apps/app/sdk-prototype/`:

```
Token Processing Pipeline:
1. Intercept API call
2. Count input tokens (provider-specific)
3. Forward to AI provider
4. Count output tokens
5. Calculate costs
6. Store in database
```

### 2. Smart Router API

Located in `apps/app/app/api/smart-router/`:
- Selects optimal AI model based on task
- Balances cost vs performance
- Implements fallback strategies

### 3. SDK Prototypes

Located in `apps/app/sdk-prototype/`:
- **Node.js SDK**: TypeScript implementation
- **Python SDK**: For data science teams
- Both include automatic token tracking

### 4. Gateway Comparison

Located in `apps/app/gateway-prototype/`:
- Direct API implementation
- Gateway proxy pattern
- Unified library approach
- Webhook events system

## Data Flow

### 1. Token Tracking Flow
```
Customer Code
     ↓
meterr SDK (intercepts)
     ↓
Count Input Tokens
     ↓
AI Provider API
     ↓
Count Output Tokens
     ↓
Log to Database
     ↓
Update Dashboard
```

### 2. Analytics Flow
```
Raw Logs (DynamoDB)
     ↓
Aggregation Job
     ↓
PostgreSQL (Supabase)
     ↓
Real-time Subscriptions
     ↓
Dashboard Updates
```

## Research & Validation

### Completed Research (in `/research-results/`)
- Market validation (67% companies lack AI cost visibility)
- Pricing strategy ($50-75/month Pro, $200-300/month Team)
- Tech stack decisions (Clerk → Supabase Auth migration path)
- Product specification and roadmap

### Built Prototypes (in `/apps/app/`)
1. **AI Expense Dashboard** - Real-time cost tracking
2. **Smart Router API** - Optimal model selection
3. **Token Optimizer** - Reduce token usage
4. **Budget Alert System** - Spending notifications
5. **Team Analytics** - Department tracking

## Security Architecture

### API Key Management
- Encrypted storage in Supabase
- Never logged or exposed
- Rotation support built-in
- Masked in UI (sk-...xxx)
- Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY

### Data Isolation
- Row-level security (RLS) in PostgreSQL
- Organization-based data partitioning
- Separate read/write permissions
- **CRITICAL**: Enable RLS on ALL tables (token_usage, api_keys, organizations, team_members)
- Foreign key constraints: auth.users → public.users (CASCADE DELETE)

### Authentication Flow
```
User Login → Supabase Auth → JWT Token → API Access
                                ↓
                          RLS Enforcement
                                ↓
                     Multi-tenant Isolation
```

### Security Audit Findings (2025-08-14)
- ✅ API keys properly secured with environment variables
- ✅ Foreign key constraints on auth.users implemented
- ⚠️ RLS missing on critical tables (token_usage, api_keys, organizations, team_members)
- Action Required: Enable RLS policies for complete multi-tenant isolation

## Performance Optimizations

### With Your Hardware (RTX 5070 Ti, 32 threads)
- GPU-accelerated token counting
- Parallel test execution
- 32-thread compilation
- Local full-stack development

### Production Optimizations
- **Edge Caching**: 1 minute TTL for dashboards
- **Database Indexing**: Hot paths optimized
- **Connection Pooling**: PgBouncer for PostgreSQL
- **Batch Processing**: DynamoDB write sharding
- **CDN Strategy**: Vercel Edge Network global distribution
- **Redis Caching**: ISR with 60-second stale-while-revalidate
- **Function Concurrency**: 1000 concurrent executions
- **Build Cache**: Turborepo remote caching

## Deployment Strategy

### Current Setup
- **Development**: Local (pnpm dev)
- **Preview**: Vercel preview deployments
- **Production**: Vercel Edge Network (iad1 region)

### Vercel Configuration (100k User Scale)
```json
{
  "buildCommand": "pnpm turbo build",
  "framework": null,
  "functions": {
    "maxDuration": 30,
    "memory": 1024
  },
  "regions": ["iad1"],
  "caching": {
    "isr": true,
    "staleWhileRevalidate": 60
  }
}
```

### Deployment Pipeline
1. Push to GitHub
2. Turbo cache check (10x faster builds)
3. Parallel builds via Turborepo
4. Automated tests (vitest)
5. Type checking (TypeScript)
6. Preview deployment
7. Manual production approval

### Build Optimization
- **Turborepo**: Caches unchanged packages
- **Next.js Standalone**: Reduces bundle size by 85%
- **Edge Functions**: Serverless at scale
- **ISR with Redis**: Incremental Static Regeneration

## Next Steps

### Immediate (MVP)
1. Complete Supabase integration
2. Implement authentication (Clerk)
3. Deploy to Vercel
4. Add payment processing (Stripe)

### Short-term
1. Production monitoring
2. User onboarding flow
3. API documentation
4. Customer SDKs

### Long-term
1. Enterprise features
2. Advanced analytics
3. Multi-region deployment (Edge Runtime)
4. White-label options

## Scaling to 100k Users

### Infrastructure Requirements
- **Vercel Pro/Enterprise**: Function concurrency limits
- **Supabase Pro**: 500 concurrent connections
- **Redis Cloud**: 10GB for ISR caching
- **DynamoDB**: On-demand scaling

### Performance Targets
- **API Response**: <200ms p95
- **Dashboard Load**: <1s FCP
- **Token Processing**: <50ms
- **Build Time**: <2 minutes with cache

### Monitoring Stack
- **Vercel Analytics**: Core Web Vitals
- **Sentry**: Error tracking
- **DataDog**: APM and infrastructure
- **CloudWatch**: DynamoDB metrics

---

*For implementation details and Claude-specific instructions, see `.claude/context/METERR_ARCHITECTURE.md`*
# meterr.ai Architecture

## Overview
meterr.ai is a scalable, AI-powered expense tracking platform built as a monorepo with multi-agent development architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
├───────────────┬──────────────┬───────────────┬──────────────┤
│  Marketing    │     App      │    Admin      │   UI Library │
│  (Next.js)    │  (Next.js)   │  (Next.js)    │  (React)     │
├───────────────┴──────────────┴───────────────┴──────────────┤
│                      Shared Packages                         │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│  Config  │ Database │   Auth   │    AI    │     Tools      │
├──────────┴──────────┴──────────┴──────────┴────────────────┤
│                      Infrastructure                          │
├───────────────┬──────────────┬───────────────────────────────┤
│    Vercel     │   Supabase   │            AWS               │
│  (Hosting)    │  (Database)  │    (Storage/Functions)       │
└───────────────┴──────────────┴───────────────────────────────┘
```

## Directory Structure

```
meterr/
├── .claude/          # Agent configuration
├── apps/             # Application code
│   ├── marketing/    # Public site (port 3000)
│   ├── app/         # Main app (port 3001)
│   └── admin/       # Admin panel (port 3002)
├── packages/        # Shared packages
├── ui/              # UI component library
├── infrastructure/  # IaC configurations
├── mcp-servers/     # MCP server configs
├── scripts/         # Automation scripts
└── docs/           # Documentation
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 + Tailwind CSS + shadcn/ui
- **State**: Zustand / React Context
- **Forms**: React Hook Form + Zod

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage + AWS S3
- **Functions**: Vercel Edge Functions + AWS Lambda

### Infrastructure
- **Hosting**: Vercel
- **CDN**: CloudFront
- **Monitoring**: Vercel Analytics + Sentry
- **CI/CD**: GitHub Actions

### AI Services
- **OpenAI**: GPT-4, GPT-3.5
- **Anthropic**: Claude 3
- **Google**: Gemini 1.5

## Data Flow

1. **User Request** → Vercel Edge
2. **Authentication** → Supabase Auth
3. **API Route** → Next.js API
4. **Business Logic** → Shared Packages
5. **Data Layer** → Supabase/PostgreSQL
6. **AI Processing** → AI Service Providers
7. **Response** → Client

## Security Architecture

### Authentication & Authorization
- JWT-based authentication via Supabase
- Row-level security (RLS) in PostgreSQL
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)

### Data Protection
- Encryption at rest (Supabase)
- Encryption in transit (TLS 1.3)
- API key rotation
- Secrets management via Vercel

### Compliance
- GDPR compliant data handling
- CCPA compliance ready
- SOC2 preparation (future)
- Regular security audits

## Scalability Strategy

### Horizontal Scaling
- Serverless functions (auto-scaling)
- Database connection pooling
- CDN for static assets
- Load balancing via Vercel

### Performance Optimization
- ISR (Incremental Static Regeneration)
- Edge caching
- Database indexing
- Query optimization

### Monitoring
- Real-time error tracking
- Performance metrics
- Usage analytics
- Cost monitoring

## Multi-Agent Architecture

### Agent Hierarchy
```
Orchestrator (Master)
├── Architect (Design)
├── Builder (Implementation)
├── Validator (Testing)
├── Scribe (Documentation)
└── Spawner (Meta-agent)
    └── Dynamic Sub-agents
```

### Agent Communication
- Message queue via agent-registry.json
- Async communication patterns
- Parent-child relationships
- Shared context in .claude/context/

## Deployment Strategy

### Environments
- **Development**: Local (localhost:3000-3002)
- **Preview**: Vercel preview deployments
- **Production**: meterr.ai, app.meterr.ai

### CI/CD Pipeline
1. Code push to GitHub
2. Automated tests (Jest, Playwright)
3. Build verification
4. Preview deployment
5. Manual approval for production
6. Production deployment
7. Post-deployment monitoring

## Database Schema

### Core Tables
- `profiles` - User profiles
- `organizations` - Company accounts
- `subscriptions` - Billing information
- `vendors` - Traditional vendors
- `ai_providers` - AI service providers
- `transactions` - All expenses
- `ai_usage` - Token tracking
- `tool_usage` - Tool analytics

## API Design

### RESTful Endpoints
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/vendors/*` - Vendor operations
- `/api/ai/*` - AI service proxy
- `/api/tools/*` - Tool endpoints
- `/api/billing/*` - Stripe integration

### Real-time Features
- WebSocket via Supabase Realtime
- Live collaboration
- Real-time notifications
- Usage tracking updates

## Future Enhancements

### Phase 1 (Current)
- Core platform setup
- Basic tool implementations
- Authentication system

### Phase 2 (Q1 2025)
- Advanced AI features
- Team collaboration
- API marketplace

### Phase 3 (Q2 2025)
- Enterprise features
- Advanced analytics
- White-label options

### Phase 4 (Q3 2025)
- Mobile applications
- Offline support
- International expansion
# METERR Architecture - Claude Context

## Project Structure

```
meterr/
├── apps/app/                     # Main application
│   ├── app/api/smart-router/    # API routing endpoint
│   ├── app/tools/token-calculator/ # Token tool
│   ├── gateway-prototype/       # Gateway implementations
│   ├── platform-mvp/            # MVP code
│   ├── research-results/        # Research data
│   ├── scripts/                 # Analysis scripts
│   └── sdk-prototype/           # SDK code
├── apps/admin/                  # Admin dashboard
├── apps/marketing/              # Public website
├── packages/@meterr/            # Shared packages
├── ui/                         # UI components
├── research-results/           # Market research
├── prototypes/                 # Prototype status
├── docs/                       # Documentation
├── .claude/context/            # Your context files
├── scripts/                    # Automation
├── infrastructure/             # Config files
└── mcp-servers/               # MCP configs
```

## Key Paths

### API Routes
- Smart Router: `apps/app/app/api/smart-router/route.ts`
- Token Counter: `apps/app/app/api/count-tokens/route.ts`

### Components
- Dashboard: `apps/app/components/dashboard/`
- Token Calculator: `apps/app/app/tools/token-calculator/page.tsx`

### Core Logic
- Token Counting: `apps/app/scripts/`
- SDK Implementation: `apps/app/sdk-prototype/`

### Configuration
- TypeScript: `tsconfig.base.json`
- Monorepo: `pnpm-workspace.yaml`
- Vercel: `apps/*/vercel.json`

## Technology Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Supabase (PostgreSQL + Auth)
- DynamoDB (token logs)
- Vercel (deployment)

## Critical Patterns

### API Route Pattern
```typescript
// apps/app/app/api/*/route.ts
export async function POST(request: Request) {
  // 1. Authenticate
  // 2. Validate with Zod
  // 3. Process request
  // 4. Return NextResponse.json()
}
```

### Token Counting
```typescript
// Use provider-specific tokenizers
// Cache results (deterministic)
// GPU acceleration for batches > 10k
```

### Error Handling
```typescript
// Never expose internal errors
// Log errors with context
// Return user-friendly messages
```

## Environment Variables

See METERR_DEPLOYMENT.md for environment variables

## Performance Settings

See METERR_ENVIRONMENT.md for performance configuration

## Security Rules

- Never log API keys
- Encrypt sensitive data
- Use RLS in Supabase
- Validate all inputs with Zod

## Testing

See METERR_TESTING.md for test commands and patterns

## Hardware Utilization

- RTX 5070 Ti: GPU acceleration for token counting
- 32 threads: Parallel builds and tests
- 256GB RAM: Full local development stack

---

*This is your operational reference. For explanations, see `/docs/METERR_ARCHITECTURE.md`*
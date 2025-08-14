# Claude Master Instructions - meterr.ai

## Project Overview
meterr.ai is an AI expense tracking platform that helps teams monitor and optimize their AI API costs across providers like OpenAI, Anthropic, Google, and others. This is a scalable monorepo using Next.js, Supabase, and AWS.

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

## Project Structure
```
meterr/
├── apps/
│   ├── app/          # Main Next.js application
│   ├── marketing/    # Marketing website
│   └── admin/        # Admin dashboard
├── packages/
│   ├── @meterr/
│   │   ├── ui/       # Shared UI components
│   │   ├── database/ # Database schemas
│   │   └── llm-client/ # LLM API client
├── docs-portal/      # Docusaurus documentation
│   ├── docs/         # Human-focused docs
│   └── ai-docs/      # AI-optimized docs
└── scripts/          # Utility scripts
```

## Important Rules

### File Management
- **Temporary files**: Delete immediately after use (scripts, reports, test outputs)
- **Clean up**: Remove any files created during task execution that aren't needed permanently
- **No clutter**: Don't leave unnecessary files in the codebase
- **Examples**: Delete one-time scripts, temporary JSON reports, test data files

### Documentation Rules - CRITICAL
Before creating ANY new MD document or file:

1. **Check for Existing Content**: Always search the repository structure (README.md, docs-portal/docs/, .claude/sub-agents/, ui/, apps/app/) for similar topics. Ask: "Does this information already exist? Can it be updated or appended instead?" If yes, propose edits to the existing file rather than creating a new one.

2. **Prioritize Consolidation**: If content fits an established location:
   - Design decisions → `docs-portal/docs/design-system.md`
   - Agent prompts → `.claude/AGENT_GUIDE.md`
   - Architecture → `docs-portal/docs/architecture/`
   - API docs → `docs-portal/docs/api/`
   Incorporate it there. Avoid new files unless absolutely necessary. Use cross-links (e.g., `[See design-system.md]`) to reference instead of duplicating.

3. **Efficiency and Validation**: 
   - Limit new files to ONE per response unless justified
   - After proposing, self-review: "Is this redundant? Does it bloat the repo?"
   - If uncertain, use tools to confirm (e.g., Glob, Grep to list existing files)

4. **Output Format**: When documenting, specify exact file/path for additions:
   - Example: "Update `docs-portal/docs/design-system.md` with: [content]"
   - Track ALL changes in the single `CHANGELOG.md` at project root

5. **Single Source of Truth**: Maintain ONLY ONE `CHANGELOG.md` at the project root. No duplicate changelogs in subdirectories.

Follow this strictly to keep documentation organized, scalable, and non-redundant.

## Essential Commands

### Quality Checks (ALWAYS run before committing)
```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Testing
pnpm test

# Run all checks
pnpm typecheck && pnpm lint && pnpm test
```

### Development Commands
```bash
# Start development servers
pnpm dev              # Start all (marketing + app)
pnpm dev:app          # Start app only
pnpm dev:marketing    # Start marketing only
pnpm docs             # Start documentation server

# Build commands
pnpm build            # Build all
pnpm build:app        # Build app
pnpm docs:build       # Build documentation

# Database
pnpm db:push          # Push schema to Supabase
pnpm db:pull          # Pull schema from Supabase
pnpm db:generate      # Generate types

# Deployment
pnpm deploy:marketing
pnpm deploy:app
```

### Documentation Commands
```bash
pnpm docs             # Start Docusaurus dev server
pnpm docs:build       # Build documentation
pnpm docs:serve       # Serve production build
pnpm docs:migrate     # Re-run migration from old structure
pnpm docs:fix         # Fix MDX syntax issues
```

## Technology Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Infrastructure**: AWS (Lambda, S3, CloudFront), Vercel
- **AI Services**: OpenAI, Anthropic, Google AI
- **Payments**: Stripe

## Coding Standards

### File Naming
- Components: `TokenCounter.tsx` (PascalCase)
- Utilities: `token-utils.ts` (kebab-case)
- Hooks: `useTokenData.ts` (camelCase with 'use' prefix)
- Tests: `token-counter.test.ts` (.test.ts suffix)

### Code Quality
- TypeScript strict mode (no `any`, no `!`, no `as unknown`)
- Double quotes for strings
- Full error handling
- Comprehensive comments
- No placeholders in code

### Database Conventions
- Tables: `users`, `token_usage` (lowercase, snake_case)
- Columns: `user_id`, `created_at`, `is_active` (snake_case)
- Foreign keys: `user_id`, `team_id` (_id suffix)
- Timestamps: `created_at`, `updated_at` (_at suffix)

### Commit Messages
```
feat(api): Add token counting endpoint
fix(auth): Resolve session timeout issue
docs: Update API documentation
test: Add integration tests
chore: Update dependencies
```

## Current Focus (MVP Phase 1)

### Week 1 Goals
- [ ] Complete authentication (Supabase Auth)
- [ ] Basic dashboard UI
- [ ] Token counter tool
- [ ] Database schema setup

### Week 2 Goals
- [ ] API proxy for providers
- [ ] Cost tracking implementation
- [ ] Budget alerts
- [ ] Team features

## API Patterns

### Route Structure
```typescript
// app/api/[resource]/route.ts
export async function POST(request: Request) {
  // 1. Authenticate
  const session = await auth();
  if (!session) return unauthorized();
  
  // 2. Validate input
  const data = schema.parse(await request.json());
  
  // 3. Business logic
  const result = await processData(data);
  
  // 4. Return response
  return NextResponse.json(result);
}
```

## Environment Variables

Required for development:
```bash
# Database
DATABASE_URL=             # Supabase connection string
NEXT_PUBLIC_SUPABASE_URL= # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key

# AI Providers (for testing)
OPENAI_API_KEY=          # OpenAI API key
ANTHROPIC_API_KEY=       # Anthropic API key
```

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows (then kill PID)
```

### Type Errors
- Run `pnpm typecheck` to see all errors
- Check `tsconfig.json` for strict mode settings
- Ensure all imports have proper types

### Database Issues
- Check `.env` has correct `DATABASE_URL`
- Run `pnpm db:generate` after schema changes
- Use `pnpm db:push` to sync schema

## MCP Servers Available
- Filesystem access
- Supabase operations (when configured)
- AWS services (when configured)
- Vercel deployments (when configured)
- LLM research server (pnpm mcp:llm)

## Important Notes

1. **Security First**: We handle API keys and financial data
2. **Type Safety**: No `any` types, proper error handling
3. **Testing**: Critical paths must have tests
4. **Performance**: Monitor bundle size and query performance
5. **Documentation**: Update docs when adding features

## Getting Help

1. Check `/docs-portal/docs/` for detailed guides
2. Review agent definitions in `.claude/agents/` for role-specific instructions
3. Search codebase for similar patterns
4. Check test files for usage examples

---

*Last updated: 2025-08-13*
*For AI agents: Follow these instructions strictly. Run quality checks before any code changes.*
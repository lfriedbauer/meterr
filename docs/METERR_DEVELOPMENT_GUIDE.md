# meterr.ai Development Guide

## Your Development Environment

You have an exceptional setup for meterr.ai development:
- **CPU**: AMD Ryzen 9 9950X (32 threads) - Compiles in seconds, not minutes
- **GPU**: RTX 5070 Ti (16GB) - Accelerates token processing by 100x
- **RAM**: 256GB - Run everything locally without constraints

## Quick Start

```bash
cd C:\Users\Owner\Projects\meterr
pnpm install
pnpm dev

# Open: http://localhost:3000 (main app)
#       http://localhost:3001 (marketing)
#       http://localhost:3002 (admin)
```

## Project Structure

```
meterr/
├── apps/
│   ├── app/          # Main dashboard (token tracking, analytics)
│   ├── admin/        # Internal tools (user management, billing)
│   └── marketing/    # Public website (meterr.ai landing page)
├── packages/
│   └── @meterr/
│       ├── core/     # Token counting, cost calculation logic
│       ├── database/ # Supabase schemas, queries
│       └── ui/       # Shared components (buttons, cards)
└── .claude/
    └── context/      # Claude's operational instructions
```

## Key Development Tasks

### Running the Project

```bash
pnpm dev          # Starts all 3 apps
pnpm dev:app      # Just the main dashboard
pnpm test         # Run test suite
pnpm build        # Production build (uses all 32 CPU cores)
```

### Making Changes

1. **Frontend changes**: Edit files in `apps/app/app/` or `apps/app/components/`
2. **API changes**: Edit files in `apps/app/app/api/`
3. **Shared logic**: Edit files in `packages/@meterr/core/`

Hot reload is instant with your hardware.

### Testing Your Changes

```bash
# Type checking (catches errors before runtime)
pnpm typecheck

# Run tests
pnpm test

# Check token counting accuracy
pnpm test:tokens
```

## meterr.ai Specific Concepts

### Token Tracking Architecture

```
User's App → meterr.ai SDK → Our API → AI Provider (OpenAI, etc.)
                ↓
          Token Counter
                ↓
          Cost Calculator
                ↓
            Database
```

Your RTX 5070 Ti accelerates the Token Counter step using CUDA.

### Why Accuracy Matters

- 0.1% token counting error = $30 per $30,000 in API costs
- Across all customers, this adds up to thousands in discrepancies
- We validate against each provider's official tokenizer

### Database Structure

- **Supabase**: User data, authentication, real-time updates
- **DynamoDB**: High-volume token logs (millions of records)
- Both run locally for development

## Common Workflows

### Adding a New AI Provider

1. Add configuration in `packages/@meterr/core/src/providers/`
2. Add tokenizer in `packages/@meterr/core/src/tokenizers/`
3. Update UI in `apps/app/components/provider-selector.tsx`
4. Test accuracy: `pnpm test:provider [provider-name]`

### Debugging Token Counts

```bash
# Compare our count vs provider's count
pnpm debug:tokens --text "Your text here" --model gpt-4

# Check GPU acceleration
nvidia-smi  # Should show node.js process using GPU
```

### Optimizing Performance

With your hardware, focus on:
1. Batch processing (use all 32 threads)
2. GPU acceleration for token operations
3. Caching frequently accessed data

## Environment Variables

Create `.env.local` in `apps/app/`:

```bash
# Required for development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Optional (for testing real providers)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Another process on port 3000, kill it or use different port |
| GPU not utilized | Check CUDA_VISIBLE_DEVICES=0 is set |
| Slow compilation | Ensure Turbopack is enabled (it is by default) |
| Database connection failed | Run `supabase start` for local database |

## Getting Help

- Architecture questions: See `/docs/ARCHITECTURE.md`
- Security concerns: See `/docs/SECURITY.md`
- Claude assistance: Claude has context in `.claude/context/`
- GPU optimization: Your RTX 5070 Ti supports CUDA 13.0

## Next Steps

1. Run the project locally
2. Try the token calculator at `/tools/token-calculator`
3. View analytics dashboard at `/dashboard`
4. Experiment with API endpoints in `/api/`

---

*For implementation details and code examples, ask Claude - it has the coding standards and patterns loaded.*
---
title: meterr.ai Development Guide
sidebar_label: meterr.ai Development Guide
sidebar_position: 6
audience: ["human"]
description: "meterr.ai Development Guide documentation for Meterr.ai"

---

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
pnpm dev:marketing # Just the marketing site
pnpm dev:admin    # Just the admin panel
```

### Making Changes

1. **Frontend changes**: Edit files in `apps/app/app/` or `apps/app/components/`
2. **API changes**: Edit files in `apps/app/app/api/`
3. **Shared logic**: Edit files in `packages/@meterr/core/`

Hot reload is instant with your hardware.

### Building & Testing

For all testing commands and patterns, see [Testing Guide](./METERR_TESTING.md)

For build and deployment commands, see [Deployment Guide](./METERR_DEPLOYMENT.md)

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

For detailed database architecture and schema, see [Architecture Guide](./METERR_ARCHITECTURE.md#database-design)

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

## Environment Setup

For required environment variables and configuration, see [Deployment Guide](./METERR_DEPLOYMENT.md#environment-variables)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Another process on port 3000, kill it or use different port |
| GPU not utilized | Check CUDA_VISIBLE_DEVICES=0 is set |
| Slow compilation | Ensure Turbopack is enabled (it is by default) |
| Database connection failed | Run `supabase start` for local database |

## Getting Help

- Architecture questions: See [Architecture Guide](./METERR_ARCHITECTURE.md)
- Security concerns: See [Security Guide](./METERR_SECURITY.md)
- Testing strategy: See [Testing Guide](./METERR_TESTING.md)
- Coding standards: See [Coding Standards](./METERR_CODING_STANDARDS.md)
- Hardware setup: See [Environment Guide](./METERR_ENVIRONMENT.md)
- Claude assistance: Claude has context in `.claude/context/`

## Next Steps

1. Run the project locally
2. Try the token calculator at `/tools/token-calculator`
3. View analytics dashboard at `/dashboard`
4. Experiment with API endpoints in `/api/`

---

*For implementation details and code examples, ask Claude - it has the coding standards and patterns loaded.*
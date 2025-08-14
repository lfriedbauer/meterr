# meterr.ai

> AI expense tracking platform that monitors usage and costs across multiple AI providers

## What is meterr.ai?

meterr.ai acts as a smart proxy between your applications and AI providers (OpenAI, Anthropic, Google, etc.), providing:

- **Real-time cost tracking** - Monitor AI spending across all providers
- **Token optimization** - Reduce usage by up to 30% with smart caching
- **Team analytics** - Track usage by department, project, or user
- **Budget alerts** - Get notified before overspending
- **Smart routing** - Automatically choose the most cost-effective model

## Quick Start

```bash
# Clone repository
git clone https://github.com/lfriedbauer/meterr.git
cd meterr

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Add your API keys to .env

# Run development server
pnpm dev
```

## Architecture

```
User Request → meterr Proxy → AI Provider APIs
                    ↓
              Token Tracking
                    ↓
              Cost Analytics
                    ↓
               Dashboard UI
```

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Vercel Edge Functions, Node.js
- **Database**: Supabase (PostgreSQL), DynamoDB (high-volume logs)
- **Authentication**: Clerk → Supabase Auth
- **Payments**: Stripe
- **Infrastructure**: Vercel, pnpm workspaces

## Project Structure

```
meterr/
├── apps/
│   ├── app/              # Main dashboard application
│   └── marketing/        # Marketing website
├── packages/
│   └── @meterr/
│       └── llm-client/   # Unified LLM client library
├── docs-portal/          # Docusaurus documentation
│   ├── docs/             # Human-focused documentation
│   └── ai-docs/          # AI-optimized documentation
└── .claude/
    ├── CLAUDE.md         # AI assistant instructions
    └── agents/           # Multi-agent definitions
```

## Documentation

📚 **[View Documentation Portal](http://localhost:3001)** - Run `pnpm docs` to start

### Quick Access
- 🏗️ [Architecture](docs-portal/docs/architecture.md) - System design
- 💻 [Development](docs-portal/docs/development-guide.md) - Setup guide  
- 📏 [Standards](docs-portal/docs/coding-standards.md) - Coding standards
- 🔌 [API Docs](docs-portal/docs/api/overview.md) - API reference
- 🤖 [AI Context](.claude/CLAUDE.md) - AI assistant instructions

### Documentation Commands
```bash
pnpm docs          # Start documentation server
pnpm docs:build    # Build documentation
pnpm docs:serve    # Serve production build
```

## Features

### Current (MVP)
- ✅ Token usage tracking across providers
- ✅ Real-time cost dashboard
- ✅ Budget alerts
- ✅ Team analytics
- ✅ Smart routing prototype

### Planned
- 🚧 SDK for Node.js/Python
- 🚧 Slack/Discord integrations
- 🚧 Advanced caching strategies
- 🚧 Custom model routing rules
- 🚧 Detailed cost breakdowns

## Development

```bash
# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build for production
pnpm build
```

## Deployment

The project deploys automatically via Vercel:

- **Production**: Push to `main` branch
- **Preview**: Create pull request
- **Marketing**: [meterr.ai](https://meterr.ai)
- **Dashboard**: [app.meterr.ai](https://app.meterr.ai)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Private repository - All rights reserved

## Support

For questions or issues, please open a GitHub issue or contact the team.

---

Built with ❤️ for AI developers who want to track and optimize their AI costs
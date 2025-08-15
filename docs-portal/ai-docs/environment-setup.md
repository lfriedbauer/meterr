---
title: METERR Environment Setup
sidebar_label: METERR Environment Setup
sidebar_position: 7
audience: ["human", "ai"]
description: "METERR Environment Setup documentation for Meterr.ai"

---

# METERR Environment Setup

<!-- audience: human -->
## Overview (Detailed)

# METERR Environment Setup

## Development Hardware

Your exceptional development environment:
- **CPU**: AMD Ryzen 9 9950X (32 threads) - Parallel builds and testing
- **GPU**: NVIDIA RTX 5070 Ti (16GB VRAM) - GPU-accelerated token processing
- **RAM**: 256GB DDR5 - Run entire stack locally
- **OS**: Windows 11 Pro with Git Bash

## Software Requirements

### Required Tools
- **Node.js**: v22.18.0 (latest LTS)
- **pnpm**: v10.14.0 (monorepo management)
- **Git**: v2.50.1 (version control)
- **CUDA**: v13.0 (GPU acceleration)

### Installation

<!-- /audience -->

<!-- audience: ai -->
## Overview (Concise)

# meterr.ai Development Environment
*Updated: 2025-08-15*

## Hardware

**CPU:** AMD Ryzen 9 9950X (32 threads)  
**GPU:** NVIDIA RTX 5070 Ti (16GB VRAM, CUDA 13.0)  
**RAM:** 256GB DDR5  
**OS:** Windows 11 Pro + Git Bash

<!-- /audience -->

# METERR Environment Setup

## Development Hardware

Your exceptional development environment:
- **CPU**: AMD Ryzen 9 9950X (32 threads) - Parallel builds and testing
- **GPU**: NVIDIA RTX 5070 Ti (16GB VRAM) - GPU-accelerated token processing
- **RAM**: 256GB DDR5 - Run entire stack locally
- **OS**: Windows 11 Pro with Git Bash

## Software Requirements

### Required Tools
- **Node.js**: v22.18.0 (latest LTS)
- **pnpm**: v10.14.0 (monorepo management)
- **Git**: v2.50.1 (version control)
- **CUDA**: v13.0 (GPU acceleration)

### Installation

```bash
# Install pnpm globally
npm install -g pnpm

# Clone repository
git clone https://github.com/lfriedbauer/meterr.git
cd meterr

# Install dependencies
pnpm install
```

## Environment Configuration

### Create `.env.local`

```bash
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Performance Settings
NODE_OPTIONS="--max-old-space-size=32768"
UV_THREADPOOL_SIZE=32

# GPU Acceleration
CUDA_VISIBLE_DEVICES=0

# Development
NEXT_PUBLIC_API_URL=http://localhost:3000
METERR_ENV=development
```

## Running the Project

### Development Server
```bash
# Start all applications
pnpm dev

# Or run specific apps
pnpm dev:app       # Main dashboard
pnpm dev:admin     # Admin panel
pnpm dev:marketing # Public website
```

### Local Services

#### Supabase (Database)
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Access at:
# Studio: http://localhost:54323
# API: http://localhost:54321
```

#### GPU Monitoring
```bash
# Check GPU status
nvidia-smi

# Monitor GPU usage
nvidia-smi -l 1
```

## Performance Optimization

### Leveraging Your Hardware

With your 32 threads and RTX 5070 Ti:

```bash
# Parallel testing
pnpm test --maxWorkers=32

# Fast builds
pnpm build  # Uses all CPU cores

# GPU-accelerated token counting
CUDA_VISIBLE_DEVICES=0 pnpm run:tokens
```

### Development Tips

1. **Fast Compilation**: Turbopack enabled by default
2. **Hot Reload**: Changes reflect instantly
3. **Parallel Processing**: Tests run across all cores
4. **GPU Acceleration**: Token processing 100x faster

## Project Structure

```
meterr/
├── apps/           # Applications
│   ├── app/       # Main dashboard
│   ├── admin/     # Admin tools
│   └── marketing/ # Public site
├── packages/      # Shared code
├── docs/         # Documentation
└── .claude/      # AI context
```

## Common Commands

```bash
# Development
pnpm dev           # Start development
pnpm build         # Production build
pnpm test          # Run tests
pnpm lint          # Check code quality
pnpm typecheck     # TypeScript validation

# Database
supabase start     # Start local DB
supabase migration # Run migrations
supabase reset     # Reset database

# Monitoring
nvidia-smi         # GPU status
htop              # CPU/RAM usage
```

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Kill process or change port |
| Supabase not starting | Check Docker is running |
| GPU not detected | Update NVIDIA drivers |
| Out of memory | Increase NODE_OPTIONS memory |
| Slow builds | Ensure Turbopack is enabled |

### Verification Steps

```bash
# Check Node version
node --version  # Should be v22.x

# Check pnpm
pnpm --version  # Should be v10.x

# Check GPU
nvidia-smi  # Should show RTX 5070 Ti

# Check database
supabase status  # Should show running
```

## IDE Setup

For IDE configuration and coding standards, see [Coding Standards](./METERR_CODING_STANDARDS.md#ide-configuration)

## Next Steps

1. **Set up environment**: Copy `.env.example` to `.env.local`
2. **Start Supabase**: Run `supabase start`
3. **Run dev server**: Execute `pnpm dev`
4. **Open browser**: Navigate to http://localhost:3000
5. **Start coding**: Make changes and see instant updates

---

*For detailed technical reference, see `.claude/context/METERR_ENVIRONMENT.md`*
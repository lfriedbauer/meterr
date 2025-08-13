# meterr.ai Development Environment
*Updated: 2025-08-13*

## Hardware

**CPU:** AMD Ryzen 9 9950X (32 threads)  
**GPU:** NVIDIA RTX 5070 Ti (16GB VRAM, CUDA 13.0)  
**RAM:** 256GB DDR5  
**OS:** Windows 11 Pro + Git Bash

## Quick Start

```bash
cd C:\Users\Owner\Projects\meterr
pnpm install
pnpm dev
```

## Key Commands

For development commands, see METERR_TESTING.md

```bash
# GPU Monitoring
nvidia-smi         # Check GPU status
nvidia-smi -l 1    # Real-time monitoring
```

## Performance Settings

```bash
# Leverage 32 threads
NODE_OPTIONS="--max-old-space-size=32768"
UV_THREADPOOL_SIZE=32

# GPU (RTX 5070 Ti)
CUDA_VISIBLE_DEVICES=0
```

For full environment variables, see METERR_DEPLOYMENT.md

## Project Structure

```
meterr/
├── apps/
│   ├── app/        # Main application
│   ├── admin/      # Admin dashboard
│   └── marketing/  # Marketing site
├── packages/       # Shared packages
├── docs/          # Documentation
└── .claude/       # Claude Code context
```

## Performance Expectations

With your hardware:
- **Build time:** <10 seconds
- **Hot reload:** <50ms  
- **Token processing:** 100k+ tokens/second (GPU-accelerated)
- **Concurrent requests:** 10k+ supported

## Troubleshooting

| Issue | Solution |
|-------|----------|
| High GPU memory | Check `nvidia-smi` for processes |
| Slow builds | Ensure Turbopack enabled in `next.config.ts` |
| CUDA errors | Verify with `nvidia-smi` that GPU is detected |

## Resources

- Repository: https://github.com/lfriedbauer/meterr
- Architecture: `/docs/ARCHITECTURE.md`
- Research: `/research-results/`
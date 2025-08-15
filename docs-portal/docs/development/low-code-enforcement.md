---
title: Low-Code Enforcement System
sidebar_label: Low-Code Enforcement
sidebar_position: 3
description: Comprehensive enforcement system for low-code practices, FlexSearch-first development, and v0.dev UI generation
---

# Low-Code Enforcement System

A comprehensive enforcement system for low-code/no-code practices in meterr.ai, focusing on FlexSearch-first search implementation and v0.dev UI generation.

## System Components

### 1. Enforcement Scripts
Located in `/tools/enforcement/scripts/`:
- `detect-forbidden-patterns.cjs` - Detects custom implementations that should use existing tools
- `verify-tool-usage.cjs` - Verifies proper tool usage and evidence comments
- `check-v0-compliance.cjs` - Analyzes component complexity and enforces v0.dev usage
- `calculate-badges.cjs` - Gamification system with badges and leaderboard

### 2. Git Hooks
`.husky/pre-commit`:
- Runs compliance checks before every commit
- Blocks commits with violations
- Emergency bypass: `EMERGENCY_BYPASS="reason" git commit`

### 3. CI/CD Integration
`.github/workflows/low-code-enforcement.yml`:
- Automated PR validation
- Comments on PRs with compliance issues
- Enforces evidence requirements

### 4. Monitoring Stack
- Prometheus for metrics collection
- Grafana for visualization  
- Custom metrics collector service
- Access via `docker-compose up -d`

## Quick Start

### Test Compliance Locally
```bash
# Check for forbidden patterns
node tools/enforcement/scripts/detect-forbidden-patterns.cjs

# Verify tool usage
node tools/enforcement/scripts/verify-tool-usage.cjs

# Check component complexity
node tools/enforcement/scripts/check-v0-compliance.cjs

# View your badges
node tools/badges/calculate-badges.cjs profile "Your Name"
```

### Start Monitoring Stack
```bash
# Start all services
docker-compose up -d

# Access dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/meterr123)
# Metrics API: http://localhost:8080/dashboard
```

## Evidence Requirements

Every implementation MUST include evidence comments:

```javascript
// @research:search - Researched alternatives
// @v0:component-name - Generated with v0.dev
// @flexsearch:feature - Using FlexSearch
// @approved - Architecture team approval
```

## Gamification System

### Available Badges
- 🔍 **Search Master** - 10+ FlexSearch implementations (200 pts)
- 🎨 **UI Wizard** - 20+ v0.dev components (200 pts)
- 🏆 **Compliance Champion** - Zero violations for 30 days (300 pts)
- ⚡ **Efficiency Expert** - 100+ hours saved (500 pts)
- 🚀 **Early Adopter** - First to use new tool (100 pts)

### Check Progress
```bash
# View your profile
node tools/badges/calculate-badges.cjs profile "Your Name"

# View leaderboard
node tools/badges/calculate-badges.cjs leaderboard
```

## v0.dev Usage Tracking

```bash
# Track a generation
npx tsx tools/enforcement/tracking/v0-tracker.ts track "prompt" "component-name"

# View statistics
npx tsx tools/enforcement/tracking/v0-tracker.ts stats

# Scan codebase
npx tsx tools/enforcement/tracking/v0-tracker.ts scan
```

## Metrics & ROI

Expected results:
- **77% reduction** in search implementation time
- **4-8 hours saved** per UI component
- **40% overall** development time reduction
- **60% improvement** in code reuse

## Handling Violations

### How to Fix Violations
1. **Add evidence comments** if using approved tools:
   ```javascript
   // @approved - Stripe integration approved by architecture team
   import Stripe from 'stripe';
   ```

2. **Migrate to recommended tools**:
   - Use FlexSearch for search features
   - Use v0.dev for complex UI components
   - Use Supabase for authentication

3. **Request approval** for custom code:
   - Document why existing tools don't work
   - Get architecture team approval
   - Add `@approved` comment with ticket reference

## Emergency Procedures

### Bypass for Critical Fixes
```bash
EMERGENCY_BYPASS="JIRA-123: Critical production fix" git commit -m "Emergency fix"
```
⚠️ All bypasses are logged in `.emergency-bypasses.log`

## Philosophy

**"Search first, code last!"**

This system enforces:
1. Research existing solutions before coding
2. Use FlexSearch for ALL search features
3. Use v0.dev for complex UI (complexity >15)
4. Document evidence in code
5. Track and celebrate efficiency gains
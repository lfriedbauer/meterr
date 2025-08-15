# 🛠️ Meterr.ai Development Tools

This directory contains all development tools, enforcement mechanisms, and monitoring systems for the meterr.ai project.

## 📁 Directory Structure

```
tools/
├── enforcement/          # Low-code enforcement system
│   ├── scripts/         # Detection and validation scripts
│   ├── config/          # Configuration files
│   ├── templates/       # PR templates, AI prompts
│   └── tracking/        # Usage tracking utilities
│
├── monitoring/          # Metrics and dashboards
│   ├── collector/       # Metrics collection service
│   ├── prometheus/      # Prometheus configuration
│   ├── grafana/         # Grafana dashboards
│   └── docker-compose.yml
│
├── badges/              # Gamification system
│   └── calculate-badges.cjs
│
└── ci-cd/              # CI/CD configurations
    ├── github-actions/  # GitHub workflows
    └── hooks/          # Git hooks
```

## 🚀 Quick Start

### 1. Run Compliance Check
```bash
# Check for forbidden patterns
node tools/enforcement/scripts/detect-forbidden-patterns.cjs

# Verify tool usage
node tools/enforcement/scripts/verify-tool-usage.cjs

# Check component complexity
node tools/enforcement/scripts/check-v0-compliance.cjs
```

### 2. Start Monitoring Stack
```bash
# Using main docker-compose (includes n8n, postgres, monitoring)
docker-compose up -d

# Or use standalone monitoring
cd tools/monitoring
docker-compose up -d
```

Access dashboards:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/meterr123)
- **Metrics Dashboard**: http://localhost:8080

### 3. Check Your Badges
```bash
node tools/badges/calculate-badges.cjs profile "Your Name"
node tools/badges/calculate-badges.cjs leaderboard
```

## 📋 Enforcement Rules

### Forbidden Patterns
The system detects and blocks:
- **Custom Authentication** - Use Supabase, Clerk, or Auth0
- **Custom Payments** - Use Stripe or LemonSqueezy
- **Custom Search** - Use FlexSearch for all search features
- **Complex UI** - Use v0.dev for components with complexity >15

### Evidence Requirements
All implementations must include evidence comments:
```javascript
// @research:search - Researched existing solutions
// @v0:component-name - Generated with v0.dev
// @flexsearch:feature - Using FlexSearch
// @approved - Architecture team approval
```

### Emergency Bypass
For critical hotfixes only:
```bash
EMERGENCY_BYPASS="JIRA-123: Critical fix" git commit
```

## 🏆 Gamification System

### Available Badges
- 🔍 **Search Master** - 10+ FlexSearch implementations
- 🎨 **UI Wizard** - 20+ v0.dev components
- 🏆 **Compliance Champion** - Zero violations for 30 days
- ⚡ **Efficiency Expert** - 100+ hours saved
- 🚀 **Early Adopter** - First to use new tool

### Levels
- 🌱 **Beginner** (0-99 points)
- 📚 **Practitioner** (100-299 points)
- ⭐ **Expert** (300-599 points)
- 🎯 **Master** (600-999 points)
- 👑 **Grandmaster** (1000+ points)

## 📊 Metrics Tracked

- **Compliance Score** - Overall adherence to low-code practices
- **FlexSearch Implementations** - Number of search features using FlexSearch
- **v0.dev Components** - UI components generated with v0.dev
- **Time Saved** - Hours saved through low-code practices
- **Violation Rate** - Frequency of policy violations
- **PR Compliance** - Percentage of compliant pull requests

## 🔧 Configuration

### Modify Enforcement Rules
Edit `tools/enforcement/scripts/detect-forbidden-patterns.cjs`:
```javascript
const FORBIDDEN_PATTERNS = {
  // Add or modify patterns here
}
```

### Adjust Complexity Threshold
Edit `tools/enforcement/scripts/check-v0-compliance.cjs`:
```javascript
shouldUseV0: complexity > 15, // Adjust threshold
```

### Configure Monitoring
Edit `tools/monitoring/prometheus/prometheus.yml` for scrape configs
Edit `tools/monitoring/grafana/dashboards/` for dashboard layouts

## 🚦 CI/CD Integration

### GitHub Actions
The workflow at `.github/workflows/low-code-enforcement.yml`:
- Runs on all pull requests
- Checks for forbidden patterns
- Verifies FlexSearch usage
- Comments on PRs with violations

### Git Hooks
Pre-commit hook at `.husky/pre-commit`:
- Runs compliance checks before commit
- Blocks commits with violations
- Allows emergency bypass

## 📈 Expected ROI

- **77% reduction** in search implementation time
- **4-8 hours saved** per UI component with v0.dev
- **40% overall** development time reduction
- **60% improvement** in code reuse

## 🆘 Troubleshooting

### Scripts Not Found
```bash
# Ensure you're in the project root
cd /path/to/meterr
node tools/enforcement/scripts/detect-forbidden-patterns.cjs
```

### Docker Containers Not Starting
```bash
# Check container logs
docker logs meterr-metrics
docker logs meterr-prometheus
docker logs meterr-grafana

# Restart containers
docker-compose down
docker-compose up -d
```

### Compliance Check Failing
1. Add evidence comments to your code
2. Use approved tools (FlexSearch, v0.dev)
3. Request architecture team approval for exceptions

## 📚 Documentation

- [Low-Code Guidelines](../docs/low-code-guidelines.md)
- [Developer Onboarding](enforcement/templates/onboarding-checklist.md)
- [AI Assistant Prompts](enforcement/templates/ai-prompts/claude-search-first.md)
- [PR Template](enforcement/templates/pr-template.md)

## 🔄 Maintenance

### Update Dependencies
```bash
cd tools/monitoring/collector
npm update

cd ../../../
pnpm update @babel/parser @babel/traverse
```

### Backup Metrics
```bash
docker exec meterr-prometheus tar -czf - /prometheus > prometheus-backup.tar.gz
docker exec meterr-grafana tar -czf - /var/lib/grafana > grafana-backup.tar.gz
```

### Reset Badges
```bash
rm .badge-data.json .leaderboard.json
```

## 📞 Support

- **Slack**: #low-code-enforcement
- **Issues**: [GitHub Issues](https://github.com/meterr-ai/meterr/issues)
- **Wiki**: [Internal Wiki](https://wiki.meterr.ai/enforcement)

---

**Remember: Search first, code last!** 🚀
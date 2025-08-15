# 🚀 meterr.ai Low-Code Developer Onboarding

Welcome to meterr.ai! We follow a **search-first, low-code philosophy** that prioritizes using existing tools and solutions before writing custom code.

## 📋 Quick Start Checklist

### Phase 1: Setup (Day 1)
- [ ] Watch the [Search-First Philosophy Video](https://example.com/search-first)
- [ ] Install required tools:
  - [ ] Node.js 20+ and pnpm
  - [ ] Git with configured user.name and user.email
  - [ ] VS Code or preferred IDE
- [ ] Clone the repository and install dependencies:
  ```bash
  git clone https://github.com/meterr-ai/meterr.git
  cd meterr
  pnpm install
  ```
- [ ] Run the compliance check to ensure everything works:
  ```bash
  node tools/enforcement/scripts/detect-forbidden-patterns.cjs
  ```

### Phase 2: Learn the Tools (Day 1-2)
- [ ] **FlexSearch Tutorial**
  - [ ] Read [FlexSearch Documentation](https://github.com/nextapps-de/flexsearch)
  - [ ] Complete the search implementation exercise
  - [ ] Run: `node tools/enforcement/scripts/verify-tool-usage.cjs` to verify
  
- [ ] **v0.dev Training**
  - [ ] Create account at [v0.dev](https://v0.dev)
  - [ ] Generate your first component
  - [ ] Add proper evidence tag: `@v0:component-name`
  
- [ ] **Review Existing Patterns**
  - [ ] Study existing meterr.ai components
  - [ ] Understand our authentication (Supabase)
  - [ ] Review payment integration (Stripe)

### Phase 3: First Contribution (Day 2-3)
- [ ] Pick a starter issue labeled "good-first-issue"
- [ ] Before coding, run research commands:
  ```bash
  # Search for existing solutions
  node tools/enforcement/scripts/verify-tool-usage.cjs
  
  # Check component complexity
  node tools/enforcement/scripts/check-v0-compliance.cjs
  ```
- [ ] Create your first PR following the template
- [ ] Ensure all compliance checks pass

## 🎯 Core Principles

### 1. Search Before You Code
**ALWAYS** research existing solutions before implementing anything:
- Internal codebase components
- FlexSearch for search/filter features
- v0.dev for UI components
- NPM packages for utilities

### 2. Tool Hierarchy
Follow this priority order:
1. **Existing meterr.ai components** - Reuse what we have
2. **FlexSearch** - For ANY search/filter/query needs
3. **v0.dev** - For UI components (complexity score >15)
4. **Established libraries** - Supabase, Stripe, etc.
5. **Custom code** - Only with team approval

### 3. Evidence Requirements
Every implementation MUST include evidence comments:
```javascript
// @research:search - Researched alternatives before implementing
// @v0:user-card - Generated with v0.dev
// @flexsearch:product-search - Using FlexSearch for search
// @approved - Architecture team approved custom implementation
```

## 🛠️ Available Commands

### Compliance Checking
```bash
# Check for forbidden patterns
node tools/enforcement/scripts/detect-forbidden-patterns.cjs

# Verify tool usage
node tools/enforcement/scripts/verify-tool-usage.cjs

# Check component complexity
node tools/enforcement/scripts/check-v0-compliance.cjs

# View your badge progress
node tools/badges/calculate-badges.cjs profile "Your Name"
```

### v0.dev Tracking
```bash
# Track a v0.dev generation
npx tsx tools/enforcement/tracking/v0-tracker.ts track "prompt" "component-name"

# View v0.dev statistics
npx tsx tools/enforcement/tracking/v0-tracker.ts stats

# Scan codebase for v0.dev usage
npx tsx tools/enforcement/tracking/v0-tracker.ts scan
```

## 🏆 Gamification & Badges

Earn badges and points for following best practices:

| Badge | Requirement | Points |
|-------|------------|--------|
| 🔍 Search Master | 10+ FlexSearch implementations | 200 |
| 🎨 UI Wizard | 20+ v0.dev components | 200 |
| 🏆 Compliance Champion | Zero violations for 30 days | 300 |
| ⚡ Efficiency Expert | 100+ hours saved | 500 |
| 🚀 Early Adopter | First to use new tool | 100 |

Check the leaderboard: `node tools/badges/calculate-badges.cjs leaderboard`

## 🚨 Common Violations & How to Fix

### ❌ Custom Authentication
```javascript
// BAD - Custom auth implementation
class AuthService {
  async login(email, password) {
    // Custom implementation
  }
}

// GOOD - Using Supabase
// @research:auth - Using Supabase for authentication
import { createClient } from '@supabase/supabase-js';
```

### ❌ Custom Search
```javascript
// BAD - Array filtering for search
const results = items.filter(item => 
  item.name.includes(searchTerm)
);

// GOOD - Using FlexSearch
// @flexsearch:item-search - Using FlexSearch for performance
import FlexSearch from 'flexsearch';
const index = new FlexSearch.Document({...});
```

### ❌ Complex UI Without v0.dev
```javascript
// BAD - Manual complex component (complexity >15)
const ComplexModal = () => {
  // 100+ lines of JSX
};

// GOOD - v0.dev generated
// @v0:complex-modal - Generated with v0.dev
const ComplexModal = () => {
  // v0.dev optimized component
};
```

## 📊 Success Metrics

Our low-code approach delivers:
- **77% reduction** in search implementation time
- **4-8 hours saved** per UI component with v0.dev
- **40% overall** development time reduction
- **60% improvement** in code reuse

## 🆘 Getting Help

### Emergency Bypass
For critical hotfixes only:
```bash
EMERGENCY_BYPASS="JIRA-123: Critical production fix" git commit
```
⚠️ This will be logged and reviewed!

### Resources
- [FlexSearch Docs](https://github.com/nextapps-de/flexsearch)
- [v0.dev](https://v0.dev)
- [Internal Wiki](https://wiki.meterr.ai)
- Slack: #low-code-help

### Escalation Path
1. Check documentation and existing code
2. Ask in #low-code-help Slack channel
3. Request architecture team review if needed
4. Add `@approved` only after team approval

## ✅ Completion Checklist

Before considering yourself fully onboarded:
- [ ] All setup steps completed
- [ ] Successfully created and merged first PR
- [ ] All compliance checks passing
- [ ] Earned at least one badge
- [ ] Familiar with FlexSearch and v0.dev
- [ ] Understand evidence requirements

## 🎉 Welcome to the Team!

Remember: **Search first, code last!** This approach helps us:
- Build faster with proven solutions
- Maintain consistency across the codebase
- Reduce bugs and technical debt
- Save time for innovation

Check your progress anytime:
```bash
node tools/badges/calculate-badges.cjs profile "Your Name"
```

Happy coding! 🚀
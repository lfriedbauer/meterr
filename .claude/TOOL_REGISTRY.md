# 🛠️ METERR TOOL REGISTRY - AGENT AWARENESS

**CRITICAL**: All agents MUST be aware of these installed tools. Search here FIRST before building.

## 📦 Recently Installed Tools (January 2025)

### 1. **@atjsh/llmlingua-2** ✅ INSTALLED
- **Purpose**: Prompt compression (3x conservative, up to 20x experimental)
- **Use Case**: Reduce token costs while maintaining quality
- **Location**: `apps/app/package.json`
- **Import**: `import { LLMLingua2 } from '@atjsh/llmlingua-2'`
- **Time Saved**: 2-3 days vs building compression

### 2. **@tensorflow/tfjs** & **@tensorflow/tfjs-node** ✅ INSTALLED
- **Purpose**: Machine learning, LSTM, neural networks
- **Use Case**: Predictive analytics, anomaly detection
- **Location**: `apps/app/package.json`
- **Import**: `import * as tf from '@tensorflow/tfjs'`
- **Time Saved**: 2-3 weeks vs custom ML

### 3. **isolation-forest** ✅ INSTALLED
- **Purpose**: Anomaly detection algorithm
- **Use Case**: Detect cost spikes, unusual patterns
- **Location**: `apps/app/package.json`
- **Import**: `import IsolationForest from 'isolation-forest'`
- **Time Saved**: 1 week vs custom implementation

### 4. **@playwright/test** ✅ INSTALLED
- **Purpose**: E2E testing, browser automation
- **Use Case**: Test user flows, CI/CD automation
- **Location**: `apps/app/package.json`
- **Commands**: `pnpm test:e2e`, `pnpm test:e2e:ui`
- **Time Saved**: 2 weeks vs manual testing

### 5. **flexsearch** ✅ INSTALLED
- **Purpose**: Ultra-fast client-side search
- **Use Case**: Search tools, code, documentation
- **Location**: `apps/app/package.json`
- **Import**: `import { Document, Index } from 'flexsearch'`
- **Time Saved**: 1 week vs custom search

## 🎨 UI Generation Strategy

### **v0 by Vercel** (NOT INSTALLED - Use Web)
- **URL**: https://v0.dev
- **Purpose**: Generate complex UI components with AI
- **Strategy**: 
  1. Describe UI need to v0
  2. Get generated React/Tailwind code
  3. Copy into project
  4. Customize as needed
- **Time Saved**: 5-10 hours per complex component

### **Example v0 Prompts**:
```
"Create a dashboard showing AI cost metrics with charts, 
sparklines, and a breakdown by model. Use shadcn/ui 
components with a dark mode toggle."

"Build a CSV upload interface with drag-and-drop, 
file validation, progress bar, and results display 
using Tailwind CSS and React."
```

## 🔌 Integration Approach (Privacy-First)

### **NO SDK/PROXY** - Based on User Research
Users expressed concerns about:
- Routing production traffic through third parties
- API key security
- Vendor lock-in

### **APPROVED Integration Methods**:

#### 1. **Browser Extension** (Recommended)
```javascript
// Observe OpenAI/Anthropic dashboards
// Extract usage data client-side
// No API keys needed
```

#### 2. **CSV/JSON Export Analysis**
```javascript
// Users export from provider dashboard
// Upload to Meterr for analysis
// Zero integration required
```

#### 3. **Read-Only API Access**
```javascript
// Users create restricted keys
// Only usage:read permissions
// Pull historical data only
```

#### 4. **Webhook Receivers**
```javascript
// Providers push data to Meterr
// No keys stored
// Real-time updates
```

## 📝 Better Claude Code Prompting

### **Reduce Hallucinations**:
```
BAD: "Create an auth system"
GOOD: "Use Clerk from our package.json to add login"

BAD: "Add real-time features"  
GOOD: "We have Socket.io installed, use it for live updates"

BAD: "Build a search feature"
GOOD: "Use FlexSearch (already installed) for searching"
```

### **Effective Prompts**:
1. **Reference installed packages**: "Use TensorFlow.js from package.json"
2. **Specify exact files**: "Update apps/app/lib/services/analyzer.ts"
3. **Include constraints**: "Keep bundle under 500KB"
4. **Provide examples**: "Similar to existing pattern in lib/utils"

## 🚫 Code Bloat Prevention

### **Rules**:
1. **Delete unused code immediately**
2. **No "just in case" features**
3. **Remove commented code**
4. **Use tree-shaking imports**
5. **Regular cleanup sweeps**

### **Cleanup Commands**:
```bash
# Find unused exports
npx unimported

# Find duplicate code
npx jscpd . 

# Bundle size analysis
pnpm analyze
```

## 🗺️ Integration Roadmap

### **Phase 1: Read-Only** (Current Focus)
- ✅ OpenAI usage export
- ✅ Anthropic usage export
- 🔄 CSV analysis interface
- 🔄 Manual data upload

### **Phase 2: Browser Extension**
- 📋 Chrome extension for dashboard observation
- 📋 Zero-config data extraction
- 📋 Client-side only

### **Phase 3: Webhook Receivers**
- 📋 Accept push notifications
- 📋 Real-time updates
- 📋 No stored credentials

### **Phase 4: Limited API Access**
- 📋 Read-only key support
- 📋 Historical data import
- 📋 Scheduled syncs

## 🎯 Key Decisions

1. **UI**: Use v0.dev for complex components (don't hand-code)
2. **Integration**: Privacy-first, no proxy/SDK pattern
3. **Tools**: Use what's installed (check this doc!)
4. **Search**: FlexSearch before building anything
5. **Testing**: Playwright for all user flows

## 📊 Tool Usage Tracking

| Tool | Installed | Used | Saving Time? |
|------|-----------|------|--------------|
| LLMLingua-2 | ✅ | ⏳ | TBD |
| TensorFlow.js | ✅ | ⏳ | TBD |
| Isolation Forest | ✅ | ⏳ | TBD |
| Playwright | ✅ | ✅ | Yes - E2E tests |
| FlexSearch | ✅ | ✅ | Yes - Tool search |

---

**Remember**: Every tool here saves 1-3 weeks of development. USE THEM!
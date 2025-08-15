# 🎯 PROMPT ENGINEERING GUIDE FOR CLAUDE CODE

**Goal**: Get better results, reduce hallucinations, leverage agent team effectively

## 🚫 Common Mistakes (What NOT to Do)

### ❌ Vague Requests
```
BAD: "Make the UI better"
BAD: "Add authentication"
BAD: "Optimize performance"
BAD: "Fix the bug"
```

### ✅ Specific Instructions
```
GOOD: "Use v0.dev to generate a dashboard with cost metrics charts"
GOOD: "Configure Clerk (already installed) for Google OAuth login"
GOOD: "Reduce bundle size - current: 1.2MB, target: <500KB"
GOOD: "Fix TypeScript error in apps/app/lib/analyzer.ts line 47"
```

## 📋 The Perfect Prompt Formula

```
[CONTEXT] + [SPECIFIC TASK] + [CONSTRAINTS] + [TOOLS TO USE]
```

### Examples:

**Example 1: UI Task**
```
CONTEXT: Users need to see AI cost trends
TASK: Create a dashboard component showing weekly cost trends
CONSTRAINTS: Use existing Tailwind classes, keep under 100 lines
TOOLS: Generate with v0.dev, use Recharts from package.json
```

**Example 2: Integration Task**
```
CONTEXT: Need to import OpenAI usage data
TASK: Create CSV parser for OpenAI export format
CONSTRAINTS: Privacy-first, no API keys, client-side only
TOOLS: Use existing CSV parsing in lib/services/csv-analyzer.ts
```

## 🤖 Leveraging the Agent Team

### **Don't ask Claude to do everything!**

**Instead of**: "Build a complete feature"

**Do this**:
1. "Use orchestrator to find existing solutions"
2. "Research available tools for [specific need]"
3. "Generate UI with v0.dev"
4. "Test with Playwright"

### **Agent-Specific Prompts**:

**For Research**:
```
"Run pnpm research:search 'real-time updates' and use the best tool"
```

**For Orchestration**:
```
"Check with orchestrator if we should build custom auth or use Clerk"
```

**For Testing**:
```
"Create Playwright test for the CSV upload flow in e2e/"
```

## 📦 Reference Installed Tools

**Always mention what's available:**

```
BAD: "Add machine learning predictions"
GOOD: "Use TensorFlow.js (installed) to create LSTM cost predictions"

BAD: "Compress the prompts"
GOOD: "Use @atjsh/llmlingua-2 (installed) for 3x compression"

BAD: "Add testing"
GOOD: "Create Playwright tests using our existing config"
```

## 🎨 UI Generation Strategy

**Don't hand-code complex UI!**

```
Step 1: "Describe the UI I need for [specific feature]"
Step 2: "Generate it with v0.dev using shadcn/ui components"
Step 3: "Integrate the v0 output into apps/app/components/"
```

**v0.dev Prompt Template**:
```
Create a [component type] that shows [data].
Use shadcn/ui components.
Include [specific features].
Style with Tailwind CSS.
Add dark mode support.
Make it responsive.
```

## 📁 File-Specific Instructions

**Always specify exact paths:**

```
BAD: "Update the analyzer"
GOOD: "Update apps/app/lib/services/analyzer.ts"

BAD: "Fix the types"
GOOD: "Fix TypeScript errors in packages/@meterr/database/src/types.ts"
```

## 🔍 Search-First Prompting

**Before asking to build:**

```
"Search for existing [feature] implementation"
"Check if we have [functionality] in the codebase"
"Find similar pattern in packages/"
"Use pnpm research:search to find tools for [need]"
```

## 📊 Integration Approach (Based on Research)

**Users rejected SDK/proxy approach!**

```
BAD: "Create SDK for intercepting API calls"
BAD: "Build proxy to route LLM traffic"

GOOD: "Create browser extension for dashboard observation"
GOOD: "Build CSV import for OpenAI usage exports"
GOOD: "Design webhook receiver for provider push"
```

## 🧹 Preventing Code Bloat

**Be explicit about cleanup:**

```
"Remove any unused imports"
"Delete commented code"
"Combine duplicate functions"
"Use existing utilities in lib/utils/"
```

## 📈 Progressive Enhancement

**Start simple, iterate:**

```
Step 1: "Create basic CSV upload"
Step 2: "Add validation"
Step 3: "Add progress indicator"
Step 4: "Add error handling"
```

NOT: "Create complete CSV upload with validation, progress, error handling, retry logic, and notifications"

## 🎯 Quick Reference Prompts

### **For Fast Results**:
```
"Use v0.dev to generate [UI need]"
"Use existing pattern from [file]"
"Extend [existing component] to add [feature]"
"Copy approach from [similar file]"
```

### **For Quality**:
```
"Add TypeScript types - no any"
"Include error handling with Result type"
"Add Playwright test for this flow"
"Check bundle size impact"
```

### **For Integration**:
```
"Use read-only approach, no API keys"
"Client-side only implementation"
"Privacy-first design"
"No proxy or SDK pattern"
```

## ⚡ Power Commands

**Unlock the orchestrator:**
```
"Run orchestrator to find solutions"
"Check what tools we have installed"
"Search before building anything"
```

**Leverage v0.dev:**
```
"Generate this UI with v0.dev"
"Create component using v0"
"Get v0 to design this interface"
```

**Use installed tools:**
```
"Apply LLMLingua-2 compression"
"Add TensorFlow.js predictions"
"Implement Playwright tests"
```

## 🚨 Hallucination Prevention

1. **Reference package.json**: "Use [package] from our package.json"
2. **Specify versions**: "Using Next.js 15 app router"
3. **Point to files**: "Similar to code in [specific file]"
4. **Verify existence**: "Check if we have [feature] first"
5. **Use FlexSearch**: "Search tool registry before building"

---

**Remember**: Claude Code works best with specific, contextual prompts that reference existing tools and patterns. Don't ask it to imagine - tell it what to use!
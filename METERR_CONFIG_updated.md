# Meterr.ai Configuration Guide

## 🎯 Project Overview
**Meterr.ai** - The AI-powered meter for your business expenses. Track, analyze, and optimize spending across traditional vendors and AI services in one unified dashboard.

### **Core Value Proposition**
- **For Businesses**: Save 50%+ on AI costs vs traditional subscriptions
- **Token-Based Tracking**: Pay only for what you use across OpenAI, Anthropic, Google AI
- **Unified Dashboard**: Traditional vendor management + AI spend optimization
- **5 Free Tools**: CSV converter, JSON formatter, Token counter, Prompt library, Chain builder

### **Pricing Tiers**
| Feature | Free | Starter ($0) | Pro ($29/mo) | Enterprise |
|---------|------|--------------|--------------|------------|
| **Tools Access** | ✅ 5 tools | ✅ 5 tools | ✅ All tools | ✅ All tools |
| **Cloud Storage** | ❌ | 100 items | Unlimited | Unlimited |
| **History** | ❌ | 30 days | Unlimited | Unlimited |
| **AI Requests** | ❌ | 1,000/mo | 10,000/mo | Unlimited |
| **API Access** | ❌ | ❌ | 1,000 calls/mo | Unlimited |
| **Team Members** | 1 | 1 | 5 | Unlimited |
| **Support** | Community | Email | Priority | Dedicated |

---

## 💻 Development Environment

### **Current System Status**
| Component | Specification | Status |
|-----------|--------------|--------|
| **OS** | Windows 11 Pro (64-bit) | ✅ Verified |
| **CPU** | AMD Ryzen 7 PRO 8840U with Radeon 780M Graphics | ✅ Verified |
| **RAM** | 32GB | ✅ Verified |
| **Terminal** | PowerShell 5.1.26100.4652 | ✅ Primary |
| **Terminal** | Git Bash (Claude Code CLI) | ✅ Available |
| **Browser** | Chrome | ✅ Primary |
| **Working Directory** | C:\Users\LeviFriedbauer\SpendCharm | ✅ Current |
| **Node.js** | v22.17.1 | ✅ Installed |
| **pnpm** | v10.14.0 | ✅ Installed |
| **Vercel CLI** | v44.6.6 | ✅ Installed |
| **GoDaddy Domain** | meterr.ai | ⏳ To Configure |
| **Vercel Projects** | 3 projects | ⏳ To Setup |

### **Development Ports**
| Port | Service | URL | Status |
|------|---------|-----|--------|
| **3000** | Marketing Site | http://localhost:3000 | ✅ Available |
| **3001** | App Dashboard | http://localhost:3001 | ✅ Available |
| **3002** | Admin Panel | http://localhost:3002 | ✅ Available |
| **6006** | Storybook UI | http://localhost:6006 | ✅ Available |

**Note**: If ports are in use, free them with: `Get-Process node | Stop-Process -Force`


---

## 📝 Coding Standards

### **Critical Rules (MUST FOLLOW)**
1. **Completeness**: Generate full code, no placeholders. If unable, explain in comments.
2. **Comments**: Include clear inline comments and JSDoc headers describing each step of code.
3. **Error Checking**: Implement error checking and type validation.
4. **TypeScript**: 
   - Strict mode enabled
   - Never use the `any` type
   - Never use non-null assertion operator (`!`)
   - Never cast to unknown (e.g. `as unknown as T`)
5. **Strings**:
   - Always use double quotes (`"`) for strings
   - Use template literals or `.join()` instead of string concatenation

### **Naming Conventions**
- **Files**: kebab-case (e.g., `token-counter.tsx`)
- **Components**: PascalCase (e.g., `TokenCounter`)
- **Variables/Functions**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TOKENS`)
- **Imports**: Absolute imports using `@/` prefix

---

## 🎨 Design System

### **Component Library**: [shadcn/ui](https://ui.shadcn.com/)
- Pre-built, customizable React components
- Radix UI primitives for accessibility
- Tailwind CSS for styling
- Full TypeScript support
- Dark mode built-in

### **Color Schemes**

#### **Default Theme** (Modern Tech)
```css
/* Primary Actions */
Gradients: Blue-600 → Violet-600
Direction: Horizontal (bg-gradient-to-r) or diagonal (bg-gradient-to-br)

/* Success / Money */
Light: Emerald-600 (#059669)
Dark: Emerald-700 (#047857)

/* Warnings */
Light: Amber-600 (#d97706)
Dark: Amber-700 (#b45309)

/* Errors */
Light: Red-600 (#dc2626)
Dark: Red-700 (#b91c1c)

/* Text */
Primary: Slate-800 (#1e293b) light / Slate-100 (#f1f5f9) dark
Muted: Slate-600 (#475569) light / Slate-400 (#94a3b8) dark
```

#### **Claude Theme** (Warm Professional)
```css
/* Primary Actions */
Gradients: Terra Cotta (#C15F3C) → Muted Violet (#6C5DAC)

/* Success */
Emerald with warm tint overlay

/* Warnings */
Orange-coral: #DA7756

/* Errors */
Deep rust/red-brown: #A33E2B

/* Text */
Primary: Deep charcoal (#3D3929)
Background: Cream (#EEECE2)
```

### **Glass Morphism Effects**
```css
/* Universal Glass Effects */
Cards: bg-white/80 backdrop-blur-sm
Borders: border-slate-200/50 (50% opacity)
Shadows: shadow-xl with colored variants
Hover: transform + enhanced shadow
```

---

## 🏗️ Architecture

### **Monorepo Architecture**

#### **Why Monorepo?**
- **Code Sharing**: Seamless component and utility sharing across projects
- **Unified Development**: Single repository simplifies development workflow
- **Atomic Changes**: Update multiple packages in one commit
- **Type Safety**: Shared TypeScript configuration ensures consistency
- **Agent Orchestration**: Centralized agent management and spawning
- **Scalable Architecture**: Dynamic agent creation based on project needs

#### **Scalable Directory Structure**

```
meterr/                           # Monorepo root
├── .claude/                      # Claude Code & Agent Configuration
│   ├── CLAUDE.md                 # Master instructions for Claude
│   ├── mcp.json                  # MCP server configuration
│   ├── agents/                   # Agent role definitions
│   │   ├── orchestrator.md       # Master agent that spawns others
│   │   ├── architect.md          # System design & planning
│   │   ├── builder.md            # Implementation
│   │   ├── validator.md          # Testing & QA
│   │   ├── scribe.md             # Documentation
│   │   └── spawner.md            # Creates new agents as needed
│   ├── sub-agents/               # Dynamically created sub-agents
│   │   └── .gitkeep              # Placeholder for dynamic agents
│   └── context/                  # Shared context & knowledge
│       ├── project-state.md      # Current project state
│       ├── decisions.md          # Architecture decisions
│       └── agent-registry.json   # Registry of active agents
│
├── apps/                         # Main applications
│   ├── marketing/                # Public marketing site
│   │   ├── app/                  # Next.js App Router
│   │   ├── public/               # Static assets
│   │   ├── vercel.json           # Vercel config
│   │   └── package.json          # Port: 3000
│   ├── app/                      # Core application
│   │   ├── app/                  # Next.js App Router
│   │   ├── lib/                  # App-specific logic
│   │   ├── vercel.json           # Vercel config
│   │   └── package.json          # Port: 3001
│   └── admin/                    # Admin panel (future)
│       └── package.json          # Port: 3002
│
├── packages/                     # Shared internal packages
│   ├── @meterr/config/           # Shared configuration
│   ├── @meterr/database/         # Database schemas & types
│   ├── @meterr/auth/             # Authentication logic
│   ├── @meterr/ai/               # AI integrations
│   └── @meterr/tools/            # Tool implementations
│
├── ui/                           # Shared UI library
│   ├── .storybook/               # Storybook configuration
│   ├── src/                      # UI source code
│   └── package.json              # @meterr/ui
│
├── infrastructure/               # Infrastructure as Code
│   ├── aws/                      # AWS configurations
│   │   ├── cdk/                  # CDK definitions
│   │   └── lambda/               # Lambda functions
│   ├── supabase/                 # Supabase setup
│   │   ├── migrations/           # Database migrations
│   │   ├── functions/            # Edge functions
│   │   └── config.toml           # Supabase config
│   └── vercel/                   # Vercel configurations
│       └── project-configs/      # Per-project configs
│
├── mcp-servers/                  # MCP server configurations
│   ├── config/                   # Server configurations
│   │   ├── supabase.json         # Supabase MCP config
│   │   ├── aws.json              # AWS MCP config
│   │   └── vercel.json           # Vercel MCP config
│   └── README.md                 # MCP setup guide
│
├── scripts/                      # Automation scripts
│   ├── agent-spawn.js            # Dynamic agent creation
│   ├── setup.ps1                 # Windows setup
│   └── deploy.ps1                # Deployment automation
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # System architecture
│   ├── AGENT_GUIDE.md            # Agent creation guide
│   └── SCALING.md                # Scaling strategies
│
├── pnpm-workspace.yaml           # Workspace configuration
├── package.json                  # Root package.json
├── METERR_CONFIG.md              # This configuration guide
└── README.md                     # Project README
```

### **Security Benefits Matrix**
| Aspect | Marketing | App | UI Library |
|--------|-----------|-----|------------|
| **Access** | Public | Private + MFA | Public/Private |
| **Secrets** | Minimal | All sensitive | None |
| **Database** | No access | Full access | No access |
| **API Keys** | Analytics only | Stripe, AI, etc. | None |
| **Deploy** | Vercel project | Vercel project | With each app |

---

## 🤖 Development Workflow

### **Working with Monorepo**

#### **Initial Setup**
```bash
# Clone and setup monorepo
git clone https://github.com/lfriedbauer/meterr.git
cd meterr
pnpm install  # Installs all workspace dependencies
```

#### **Development Commands**
```bash
# Run all projects in parallel (from root)
pnpm run dev

# Or run individual projects
pnpm run dev:ui         # Storybook on port 6006
pnpm run dev:marketing  # Marketing on port 3000
pnpm run dev:app        # App on port 3001

# Build all projects
pnpm run build

# Test all projects
pnpm run test

# Type checking
pnpm run typecheck
```

#### **PowerShell Port Management**
```powershell
# Check if ports are in use
Get-NetTCPConnection | Where-Object {$_.LocalPort -in @(3000, 3001, 3002, 6006)}

# Kill Node processes if needed
Get-Process node | Stop-Process -Force
```

#### **Import Examples**
```typescript
// In meterr-marketing/app/page.tsx
import { Button, GlassCard, TokenCounter } from "@meterr/ui"
import { formatCurrency } from "@meterr/ui/utils"
import "@meterr/ui/styles/globals.css"

// In meterr-app/app/dashboard/page.tsx
import { Button, MetricCard, DataTable } from "@meterr/ui"
import { formatTokens } from "@meterr/ui/utils"
import "@meterr/ui/styles/themes/claude.css"  // Use Claude theme
```

### **Technology Stack Integration**

#### **Core Technologies**

##### **1. AWS Integration**
- **Services**: Lambda, S3, CloudFront, RDS (if needed)
- **MCP Server**: AWS MCP for resource management
- **Agent**: `aws-specialist` spawned when needed
- **Use Cases**:
  - Static asset hosting
  - Serverless functions for heavy processing
  - Backup and disaster recovery
  - Global CDN distribution

##### **2. Supabase Integration**
- **Services**: PostgreSQL, Auth, Storage, Realtime
- **MCP Server**: Supabase MCP for database operations
- **Agent**: `supabase-admin` for schema management
- **Use Cases**:
  - User authentication
  - Database operations
  - File storage
  - Real-time subscriptions

##### **3. Vercel Integration**
- **Services**: Edge Functions, Analytics, Deployment
- **MCP Server**: Vercel MCP (remote)
- **Agent**: `vercel-deployer` for deployment optimization
- **Use Cases**:
  - Frontend hosting
  - API routes
  - Preview deployments
  - Performance monitoring

##### **4. IDE Integration**
- **Supported**: VS Code, Cursor, Claude Code
- **MCP Support**: Full MCP protocol implementation
- **Agent Access**: All agents accessible via IDE
- **Features**:
  - Inline AI assistance
  - Code generation
  - Automated refactoring
  - Test generation

### **Vercel Deployment Configuration**

#### **Three Separate Vercel Projects**

##### **1. Marketing Site (meterr-marketing)**
```json
// vercel.json in meterr-marketing/
{
  "buildCommand": "cd ../.. && pnpm run build:marketing",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next",
  "rootDirectory": "meterr-marketing",
  "framework": "nextjs"
}
```

##### **2. App Dashboard (meterr-app)**
```json
// vercel.json in meterr-app/
{
  "buildCommand": "cd ../.. && pnpm run build:app",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next",
  "rootDirectory": "meterr-app",
  "framework": "nextjs"
}
```

##### **3. Import Projects to Vercel**
```bash
# In Vercel Dashboard:
1. Import repository: github.com/lfriedbauer/meterr
2. Create project "meterr-marketing" → Root: meterr-marketing
3. Create project "meterr-app" → Root: meterr-app
4. Configure domains:
   - meterr-marketing → meterr.ai, www.meterr.ai
   - meterr-app → app.meterr.ai, admin.meterr.ai
```

### **Scalable Multi-Agent Architecture**

#### **Core Agent Hierarchy**

##### **1. Orchestrator Agent** (Master Controller)
- **Role**: Manages all other agents and determines when new agents are needed
- **Responsibilities**:
  - Analyzes project requirements and current state
  - Spawns specialized agents based on needs
  - Coordinates inter-agent communication
  - Maintains agent registry and lifecycle
  - Makes decisions about agent creation/termination

##### **2. Primary Agents** (Always Active)

**Architect Agent**
- System design and planning
- Technology selection
- Database schema design
- API contract definitions
- Can spawn: `database-specialist`, `api-designer`, `security-architect`

**Builder Agent**
- Core implementation
- Feature development
- Integration work
- Can spawn: `frontend-builder`, `backend-builder`, `integration-specialist`

**Validator Agent**
- Testing strategies
- Quality assurance
- Performance monitoring
- Can spawn: `test-writer`, `performance-tester`, `security-auditor`

**Scribe Agent**
- Documentation management
- Knowledge base maintenance
- Change tracking
- Can spawn: `api-documenter`, `user-guide-writer`, `changelog-manager`

##### **3. Spawner Agent** (Meta-Agent)
- **Role**: Creates new specialized agents on demand
- **Process**:
  1. Receives request from Orchestrator or Primary Agent
  2. Analyzes the specific need
  3. Creates agent definition file in `.claude/sub-agents/`
  4. Registers new agent in `agent-registry.json`
  5. Initializes agent with context and objectives

#### **Dynamic Sub-Agent Creation**

##### **Trigger Conditions for New Agents**
1. **Complexity Threshold**: Task requires specialized expertise
2. **Parallel Work**: Multiple independent tasks identified
3. **New Technology**: Introduction of new tool/framework
4. **Performance Issues**: Specific optimization needed
5. **Scale Changes**: Project growth requires specialization

##### **Example Sub-Agents** (Created as Needed)

**Infrastructure Agents**
- `aws-specialist`: AWS service configuration
- `supabase-admin`: Database and auth management
- `vercel-deployer`: Deployment optimization
- `cost-optimizer`: Cloud cost management

**Feature Agents**
- `payment-integrator`: Stripe implementation
- `ai-token-tracker`: Token usage optimization
- `csv-tool-builder`: Specific tool implementation
- `dashboard-designer`: Dashboard UX specialist

**Scaling Agents**
- `performance-monitor`: Performance tracking
- `load-balancer`: Traffic distribution
- `cache-manager`: Caching strategies
- `database-scaler`: Database optimization

##### **Agent Lifecycle Management**
```yaml
# .claude/sub-agents/[agent-name].md
name: payment-integrator
type: feature-specialist
parent: builder
created: 2025-08-12
status: active
objectives:
  - Implement Stripe checkout
  - Set up subscription tiers
  - Handle webhook events
context:
  - Uses packages/@meterr/billing
  - Coordinates with database-specialist
termination_criteria:
  - All payment features implemented
  - Tests passing
  - Documentation complete
```

#### **Agent Communication Protocol**

##### **Agent Registry Structure**
```json
// .claude/context/agent-registry.json
{
  "agents": {
    "orchestrator": {
      "status": "active",
      "lastUpdate": "2025-08-12T10:00:00Z",
      "currentTask": "Monitoring project state"
    },
    "architect": {
      "status": "active",
      "subAgents": ["database-specialist"],
      "currentTask": "Designing token tracking system"
    },
    "database-specialist": {
      "status": "active",
      "parent": "architect",
      "created": "2025-08-12T09:30:00Z",
      "terminateOn": "schema-complete"
    }
  },
  "messageQueue": [
    {
      "from": "architect",
      "to": "builder",
      "message": "Schema ready for token tracking",
      "timestamp": "2025-08-12T09:45:00Z"
    }
  ]
}
```

##### **Inter-Agent Communication**
```markdown
# Orchestrator → Spawner
CREATE AGENT: payment-specialist
TYPE: feature-specialist  
PARENT: builder
CONTEXT: Need Stripe integration for Pro tier
OBJECTIVES: 
  - Implement subscription management
  - Handle payment webhooks
  - Create billing dashboard

# Spawner → Orchestrator (Response)
AGENT CREATED: payment-specialist
LOCATION: .claude/sub-agents/payment-specialist.md
STATUS: Initialized and ready
REGISTERED: agent-registry.json updated

# In .claude/agents/builder.md (Reply)
RECEIVING FROM: architect
STATUS: Implementation started
QUESTIONS: Should we cache token calculations client-side?
BLOCKERS: None
ESTIMATED COMPLETION: 2 hours

# In .claude/sub-agents/frontend/ui-designer.md
RECEIVING FROM: builder
TASK: Create TokenCounter component with glass morphism
DEPENDENCIES: shadcn/ui Card, Button, Textarea
OUTPUT: /packages/ui/components/token-counter.tsx
```

##### **Branch-Per-Agent Strategy**
```bash
# Each agent works on their own branch
git checkout -b agent1/planning        # Architect
git checkout -b agent2/implementation  # Builder
git checkout -b agent3/testing         # Validator
git checkout -b agent4/documentation   # Scribe

# Regular sync points
git checkout main
git merge agent1/planning --no-ff
git merge agent2/implementation --no-ff
```

##### **Multi-Agent Planning Document**
```markdown
# MULTI_AGENT_PLAN.md

## Current Sprint: Token Counter Feature

### Agent 1: Architect
- [x] Research token calculation methods
- [x] Design data model
- [x] Create API specifications
- [ ] Review implementation

### Agent 2: Builder  
- [x] Implement token calculation logic
- [ ] Build UI components
- [ ] Create API endpoints
- [ ] Integrate with database

### Agent 3: Validator
- [ ] Write unit tests
- [ ] Create integration tests
- [ ] Test edge cases
- [ ] Performance benchmarks

### Agent 4: Scribe
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Update README
- [ ] Generate examples

## Sync Points
- Every 30 minutes: Agents re-read this document
- Every 2 hours: Architect reviews progress
- Daily: Team sync and merge to main
```

#### **Best Practices**

1. **Clear Boundaries**: Each agent owns specific domains
   - Architect: All design decisions and architecture
   - Builder: Implementation and business logic
   - Validator: Testing and quality assurance
   - Scribe: Documentation and examples

2. **Conflict Resolution**
   - Architect acts as tie-breaker for design disputes
   - Builder has final say on implementation details
   - Validator can block merges if tests fail

3. **Context Preservation**
   - Agents re-read MULTI_AGENT_PLAN.md every 30 minutes
   - Check recent commits before starting new work
   - Update status in planning document regularly

4. **Parallel Processing**
   - Architect completes design → Builder starts implementation
   - Builder completes module → Validator writes tests
   - All agents work simultaneously on different aspects

#### **Real-World Example: Building Token Counter Feature**

**Day 1 - Morning**
- **Architect**: Research OpenAI/Anthropic/Google token calculation methods
- **Builder**: Set up repository structure and dependencies
- **Validator**: Create test framework and CI/CD pipeline
- **Scribe**: Initialize documentation structure

**Day 1 - Afternoon**
- **Architect**: Design database schema for token tracking
- **Builder**: Implement token calculation algorithms
- **Validator**: Write unit tests for calculation logic
- **Scribe**: Document token calculation methods

**Day 2 - Morning**
- **Architect**: Review implementation, suggest optimizations
- **Builder**: Build UI components with glass morphism
- **Validator**: Create integration tests
- **Scribe**: Write API documentation

**Day 2 - Afternoon**
- **All Agents**: Final review and merge
- **Result**: Feature complete in 2 days vs 1 week single-agent

#### **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| **Agents losing context** | Re-read MULTI_AGENT_PLAN.md and check recent commits |
| **Conflicting implementations** | Architect acts as tie-breaker and design authority |
| **Duplicating work** | More granular task assignment in planning document |
| **Merge conflicts** | Use branch-per-agent strategy with regular sync points |

---

## 🚀 Quick Start

### **Prerequisites ✅ (All Installed)**
```powershell
# Development tools ready:
node --version        # v22.17.1 ✅
pnpm --version       # v10.14.0 ✅
vercel --version     # v44.6.6 ✅

# Next steps: Create GitHub repositories
```

### **Repository Setup**
```powershell
# 1. Create and setup UI Library
git clone https://github.com/lfriedbauer/meterr-ui.git
cd meterr-ui
pnpm install
npx shadcn-ui@latest init
pnpm build
pnpm run build  # UI library builds with each app

# 2. Setup Marketing Site
cd ..
git clone https://github.com/lfriedbauer/meterr-marketing.git
cd meterr-marketing
pnpm create next-app@latest . --typescript --tailwind --app
pnpm add @meterr/ui
Copy-Item .env.example -Destination .env.local

# 3. Setup Core App
cd ..
git clone https://github.com/lfriedbauer/meterr-app.git
cd meterr-app
pnpm create next-app@latest . --typescript --tailwind --app
pnpm add @meterr/ui
Copy-Item .env.example -Destination .env.local
```

### **Start Development**
```powershell
# Open 3 terminal windows
# Terminal 1: UI Library
cd C:\Users\LeviFriedbauer\meterr-ui
pnpm dev:storybook

# Terminal 2: Marketing Site
cd C:\Users\LeviFriedbauer\meterr-marketing
pnpm dev

# Terminal 3: App Dashboard
cd C:\Users\LeviFriedbauer\meterr-app
pnpm dev
```

---

## 🔑 Configuration

### **Environment Variables**

#### **Required**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

#### **Optional**
```bash
# Analytics
GOOGLE_ANALYTICS_ID=G-...
MIXPANEL_TOKEN=...

# Email
BEEHIIV_API_KEY=...
RESEND_API_KEY=re_...

# Redis (rate limiting)
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=...
```

### **shadcn/ui Configuration Files**

#### **components.json**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

#### **TypeScript Configuration (tsconfig.json)**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    },
    // Strict type checking rules
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### **Tailwind Configuration (tailwind.config.ts)**
```typescript
import type { Config } from "tailwindcss"

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Custom colors for meterr.ai
        slate: {
          50: "#f8fafc",
          600: "#475569",
          800: "#1e293b",
        },
        blue: {
          600: "#2563eb",
        },
        violet: {
          600: "#7c3aed",
        },
        emerald: {
          600: "#059669",
          700: "#047857",
        },
        amber: {
          600: "#d97706",
          700: "#b45309",
        },
        // Claude Theme Colors
        claude: {
          terra: "#C15F3C",
          violet: "#6C5DAC",
          coral: "#DA7756",
          rust: "#A33E2B",
          charcoal: "#3D3929",
          cream: "#EEECE2",
          offwhite: "#F0EEE5",
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config
```

#### **Global Styles (globals.css)**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

/* Custom glass morphism utilities */
@layer utilities {
  .glass {
    @apply bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm;
  }
  
  .glass-border {
    @apply border-slate-200/50 dark:border-slate-800/50;
  }
  
  .gradient-primary {
    @apply bg-gradient-to-br from-slate-50 via-zinc-50 to-slate-50 
           dark:from-slate-950 dark:via-zinc-950 dark:to-slate-900;
  }
  
  .gradient-accent {
    @apply bg-gradient-to-r from-blue-50 to-violet-50 
           dark:from-blue-950/30 dark:to-violet-950/30;
  }
  
  .text-gradient {
    @apply bg-gradient-to-r from-blue-600 to-violet-600 
           bg-clip-text text-transparent;
  }
}
```

---

## 🧩 Component Examples

### **Glass Card Component**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function GlassCard({ children, title }) {
  return (
    <Card className="glass glass-border shadow-xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

### **Gradient Button**
```tsx
import { Button } from "@/components/ui/button"

export function GradientButton({ children, ...props }) {
  return (
    <Button 
      className="bg-gradient-to-r from-blue-600 to-violet-600 
                 hover:from-blue-700 hover:to-violet-700 
                 text-white shadow-lg"
      {...props}
    >
      {children}
    </Button>
  )
}
```

### **Metric Card**
```tsx
export function MetricCard({ label, value, change, trend }) {
  return (
    <div className="glass glass-border rounded-xl p-6">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        {value}
      </div>
      <div className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </div>
    </div>
  )
}
```

---

## 📊 Database & Backend

### **Database Schema (Supabase)**
```sql
-- Core Tables
profiles              -- User profiles
organizations         -- Company accounts
subscriptions        -- Billing data
vendors              -- Traditional vendors
ai_providers         -- AI service providers
transactions         -- All expenses
ai_usage            -- Token tracking
tool_usage          -- Tool analytics
saved_results       -- Saved outputs
reports             -- Generated reports
```

### **AI Provider Configuration**
| Provider | Models | Usage Tier |
|----------|--------|------------|
| **OpenAI** | GPT-3.5, GPT-4 | All tiers |
| **Anthropic** | Claude 3 Haiku, Opus | Pro+ |
| **Google** | Gemini 1.5 Flash | All tiers |

### **API Routes Structure**
```
/api/
├── auth/           # Authentication
├── billing/        # Stripe webhooks
├── ai/             # AI provider proxy
├── tools/          # Tool endpoints
├── analytics/      # Usage tracking
└── export/         # Data exports
```

---

## 🌐 Deployment

### **GoDaddy Domain Configuration**
```bash
# DNS Records
A     @         76.76.21.21      # Vercel IP
CNAME www       cname.vercel-dns.com
CNAME app       cname.vercel-dns.com
CNAME admin     cname.vercel-dns.com
CNAME api       cname.vercel-dns.com
```

### **Vercel Project Setup**

#### **1. Marketing Site (meterr-marketing)**
```json
// vercel.json
{
  "name": "meterr-marketing",
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "regions": ["iad1"],
  "domains": [
    {
      "name": "meterr.ai",
      "redirect": false
    },
    {
      "name": "www.meterr.ai",
      "redirect": "meterr.ai"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://app.meterr.ai",
    "NEXT_PUBLIC_MARKETING_URL": "https://meterr.ai"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

#### **2. App Dashboard (meterr-app)**
```json
// vercel.json
{
  "name": "meterr-app",
  "framework": "nextjs",
  "buildCommand": "pnpm build:dashboard",
  "devCommand": "pnpm dev:dashboard",
  "installCommand": "pnpm install",
  "regions": ["iad1", "sfo1"],
  "domains": [
    {
      "name": "app.meterr.ai",
      "redirect": false
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://app.meterr.ai",
    "NEXT_PUBLIC_MARKETING_URL": "https://meterr.ai",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_KEY": "@supabase-service-key",
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key"
  },
  "functions": {
    "app/api/webhook/stripe.ts": {
      "maxDuration": 30
    },
    "app/api/ai/[provider]/route.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; connect-src 'self' https://*.supabase.co https://api.stripe.com"
        }
      ]
    }
  ]
}
```

#### **3. Admin Panel (meterr-admin)**
```json
// vercel.json
{
  "name": "meterr-admin",
  "framework": "nextjs",
  "buildCommand": "pnpm build:admin",
  "devCommand": "pnpm dev:admin",
  "installCommand": "pnpm install",
  "regions": ["iad1"],
  "domains": [
    {
      "name": "admin.meterr.ai",
      "redirect": false
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://app.meterr.ai",
    "NEXT_PUBLIC_ADMIN_URL": "https://admin.meterr.ai",
    "ADMIN_SECRET": "@admin-secret"
  },
  "authentication": {
    "enabled": true,
    "password": "@admin-access-password"
  }
}
```

### **Deployment Commands**
```powershell
# Deploy each project
cd meterr-marketing
vercel --prod

cd ../meterr-app
vercel --prod

cd ../meterr-admin
vercel --prod
```

### **GitHub Actions CI/CD**

#### **Marketing Site Deployment**
```yaml
# .github/workflows/deploy-marketing.yml
name: Deploy Marketing Site

on:
  push:
    branches: [main]
    paths:
      - 'apps/marketing/**'
      - 'packages/ui/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:marketing
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_MARKETING_PROJECT_ID }}
          vercel-args: '--prod'
```

#### **App Dashboard Deployment**
```yaml
# .github/workflows/deploy-app.yml
name: Deploy App Dashboard

on:
  push:
    branches: [main]
    paths:
      - 'apps/dashboard/**'
      - 'packages/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm typecheck
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:dashboard
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_APP_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📈 Monitoring & Security

### **Monitoring Setup**
- **Vercel Analytics** - Performance metrics
- **Sentry** - Error tracking
- **Better Uptime** - Availability monitoring
- **Custom Metrics** - Token usage, cost tracking

### **Security Configuration**
```javascript
// Security Headers
{
  "headers": [
    {
      "key": "Strict-Transport-Security",
      "value": "max-age=63072000"
    },
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'"
    }
  ]
}
```


---

## ✅ Checklists

### **Pre-Launch Checklist**
- [x] Node.js v20+ installed (v22.17.1 ✅)
- [x] pnpm and Vercel CLI installed (v10.14.0 & v44.6.6 ✅)
- [ ] Three GitHub repositories created
- [ ] Supabase project configured
- [ ] Stripe account setup
- [ ] AI API keys obtained
- [ ] Environment variables set
- [ ] Domain DNS configured
- [ ] SSL certificates provisioned

### **Deployment Checklist**
1. [ ] Build and publish @meterr/ui to NPM
2. [ ] Deploy meterr-marketing to Vercel
3. [ ] Deploy meterr-app to Vercel
4. [ ] Deploy meterr-admin to Vercel
5. [ ] Verify all domains resolving
6. [ ] Test authentication flow
7. [ ] Test payment flow
8. [ ] Monitor error rates

### **System Verification Script**
```powershell
Write-Host "Checking System Requirements..." -ForegroundColor Green

# Check installations
$nodeVersion = node --version
$pnpmVersion = pnpm --version
$vercelVersion = vercel --version

Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "pnpm: $pnpmVersion" -ForegroundColor Green
Write-Host "Vercel: $vercelVersion" -ForegroundColor Green

# Test ports
@(3000, 3001, 3002, 6006) | ForEach-Object {
    $result = Test-NetConnection -ComputerName localhost -Port $_
    $status = if ($result.TcpTestSucceeded) {"IN USE"} else {"AVAILABLE"}
    Write-Host "Port $_`: $status"
}

# Check domain
Resolve-DnsName meterr.ai -ErrorAction SilentlyContinue
```

---

## 🎯 Implementation Roadmap

### **Phase 1: Infrastructure (Week 1-2)**
1. Create three GitHub repositories
2. Setup @meterr/ui NPM package
3. Initialize Next.js projects
4. Configure Supabase
5. Setup Vercel deployments
6. Configure domain DNS

### **Phase 2: Free Tools (Week 3-4)**
1. Port Token Counter
2. Port CSV Converter
3. Port JSON Formatter
4. Port Prompt Library
5. Port Chain Builder
6. Add cloud storage

### **Phase 3: Authentication (Week 5)**
1. Implement Supabase Auth
2. User profiles
3. Tier-based access
4. Settings pages
5. Email notifications

### **Phase 4: Dashboard (Week 6-7)**
1. Vendor management
2. AI cost tracking
3. Analytics views
4. Report generation
5. Data exports

### **Phase 5: Payments (Week 8)**
1. Stripe integration
2. Subscription tiers
3. Usage metering
4. Billing portal
5. Webhook handlers

### **Phase 6: AI Features (Week 9-10)**
1. OpenAI integration
2. Anthropic support
3. Model routing
4. Cost optimization
5. AI insights

### **Phase 7: Polish (Week 11)**
1. Testing
2. Performance
3. Security audit
4. Documentation
5. Bug fixes

### **Phase 8: Launch (Week 12)**
1. Production deployment
2. Marketing site live
3. Monitoring setup
4. Analytics
5. Launch announcement

### **Phase 9: Compliance (Post-Launch)**
1. GDPR compliance (privacy controls, data export)
2. CCPA compliance (data deletion features)
3. Security audit preparation
4. SOC2 readiness assessment (future)
5. ISO 27001 planning (future)

---

## 📚 Resources

### **Documentation**
- User Docs: https://docs.meterr.ai
- API Docs: https://api.meterr.ai/docs
- Status Page: https://status.meterr.ai

### **Support**
- Email: support@meterr.ai
- Discord: https://discord.gg/meterr
- GitHub: https://github.com/lfriedbauer/meterr

---

**Configuration Version:** 4.0.0  
**Last Updated:** August 12, 2025  
**Architecture:** Scalable Multi-Agent Monorepo  
**System:** Windows 11 Pro | PowerShell 5.1 | 32GB RAM  
**Development Tools:** Node.js v22.17.1 | pnpm v10.14.0 | Vercel CLI v44.6.6  
**Architecture:** Monorepo with pnpm workspaces  
**Stack:** Next.js | Supabase | shadcn/ui | Vercel | GoDaddy
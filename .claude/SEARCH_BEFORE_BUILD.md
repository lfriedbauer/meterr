# 🔍 SEARCH-BEFORE-BUILD WORKFLOW

**MANDATORY**: This workflow MUST be followed before writing ANY new code.

## 📊 The Statistics That Matter

- **80% of features** already have existing solutions
- **2 hours searching** saves **2 weeks building**
- **95% of auth/payment/analytics** problems are solved
- **Every custom solution** adds technical debt

## 🎯 THE WORKFLOW (NO EXCEPTIONS)

### Step 1: FlexSearch Tool Registry (ALWAYS FIRST)
```bash
# Search for existing tools/libraries
pnpm research:search "feature_name"

# Example searches:
pnpm research:search "authentication"     # Returns: Clerk, Supabase Auth, Auth0
pnpm research:search "payment processing" # Returns: Stripe, Paddle, Lemon Squeezy
pnpm research:search "real-time updates"  # Returns: Socket.io, Pusher, Supabase
```

### Step 2: Check Quick Wins
```bash
# Find tools with <2 hour setup
pnpm research:quick

# These save WEEKS of development
```

### Step 3: Search Local Codebase
```bash
# Only if no tool exists, search existing code
grep -r "FEATURE" --include="*.ts" --include="*.tsx"
find . -name "*.ts" -exec grep -l "PATTERN" {} \;
```

### Step 4: Get Orchestrator Approval
```bash
# If nothing found, request build approval
pnpm orchestrate:task "build FEATURE_NAME"

# Orchestrator will:
# 1. Verify you searched properly
# 2. Check if build is justified
# 3. Approve or suggest alternatives
```

## ❌ WHAT NOT TO DO (INSTANT REJECTION)

### Building These Will Get Your Code Rejected:
- **Authentication system** → Use Clerk/Supabase/Auth0
- **Payment processing** → Use Stripe/Paddle
- **Email sending** → Use Resend/SendGrid
- **File uploads** → Use UploadThing/Supabase Storage
- **Analytics** → Use PostHog/Mixpanel
- **Error tracking** → Use Sentry/LogRocket
- **Search** → Use Algolia/MeiliSearch/FlexSearch
- **Database ORM** → Use Prisma/Drizzle
- **Form handling** → Use React Hook Form/Formik
- **Date handling** → Use date-fns/dayjs
- **HTTP client** → Use Axios/Ky
- **State management** → Use Zustand/Valtio

## ✅ APPROVED BUILD SCENARIOS

You MAY build custom code for:
1. **Unique business logic** specific to meterr
2. **Integration glue** between existing tools
3. **Domain-specific algorithms** (e.g., cost optimization)
4. **Custom UI components** with unique requirements

BUT ONLY AFTER:
- FlexSearch returns no results
- Local search finds nothing similar
- Orchestrator approves the build

## 📈 TIME SAVINGS EXAMPLES

| Instead of Building | Use This Tool | Time Saved |
|-------------------|--------------|------------|
| Auth system | Clerk | 3 weeks |
| Payment flow | Stripe | 4 weeks |
| Email service | Resend | 1 week |
| File uploads | UploadThing | 2 weeks |
| Analytics | PostHog | 3 weeks |
| Search | Algolia | 2 weeks |
| Real-time | Pusher | 2 weeks |

## 🚨 ENFORCEMENT

### Violations Result In:
1. **First offense**: Code rejected, must redo with existing tool
2. **Second offense**: All PRs require orchestrator pre-approval
3. **Third offense**: Write permissions revoked

### Success Metrics:
- **Tool reuse rate**: Target >80%
- **Custom code**: <20% of codebase
- **Development time**: <2 hours average per feature
- **Technical debt**: Decreasing monthly

## 💡 REMEMBER THE MANTRA

> "The best code is no code.
> The next best is someone else's tested code.
> Only write new code when absolutely necessary."

## 🎯 QUICK REFERENCE

```bash
# The only commands you need:
pnpm research:search "what_you_need"  # ALWAYS FIRST
pnpm research:quick                   # Find quick wins
pnpm orchestrate                      # Get guidance
```

---

**Enforcement Status**: ACTIVE ✅
**Last Updated**: 2025-01-15
**Authority**: Orchestrator Prime
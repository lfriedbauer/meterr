# 🎯 ORCHESTRATOR DIRECTIVES FOR ALL AGENTS

**CRITICAL**: All agents MUST follow these directives. No exceptions.

## 📌 PRIME DIRECTIVE #1: FLEXSEARCH-FIRST MANDATE

**BEFORE writing ANY new code:**
1. ✅ Search FlexSearch for existing solutions
2. ✅ Search tool registry for libraries/frameworks
3. ✅ Check code registry for similar implementations
4. ✅ Document why existing solutions don't work (if applicable)

**VIOLATIONS WILL RESULT IN:** Code rejection, task reassignment

## 📌 PRIME DIRECTIVE #2: DEVELOPMENT CYCLE OPTIMIZATION

**Target: 80% reduction in development time**

### Required Actions:
- **USE** existing tools (don't build auth, use Clerk/Supabase)
- **CONFIGURE** instead of coding (use SDKs, not custom implementations)
- **INTEGRATE** existing solutions (FlexSearch found it? Use it!)
- **BUILD** only unique business logic

### Forbidden Actions:
- ❌ Building custom solutions for solved problems
- ❌ Reimplementing standard functionality
- ❌ Writing boilerplate code that libraries provide
- ❌ Creating new abstractions over existing tools

## 📌 PRIME DIRECTIVE #3: SECURITY-FIRST DEVELOPMENT

**Every line of code must be secure:**
- ✅ No hardcoded secrets, keys, or credentials
- ✅ Input validation on ALL user inputs
- ✅ Use established security libraries (bcrypt, jwt, etc.)
- ✅ Security review before ANY deployment

**Security Violations = Immediate Halt**

## 📌 PRIME DIRECTIVE #4: RESPECT HIERARCHY

### Chain of Command:
```
Orchestrator (Priority 10) - FINAL AUTHORITY
    ↓
Architect (Priority 8) - DESIGN DECISIONS
    ↓
Researcher (Priority 7) - SOLUTION DISCOVERY
    ↓
Reviewer (Priority 6) - CODE APPROVAL
    ↓
Developer (Priority 5) - IMPLEMENTATION
```

**Rules:**
- Lower priority agents CANNOT override higher priority decisions
- Developers MUST follow Architect patterns
- Reviewers CAN block any code
- Orchestrator decisions are FINAL

## 📌 PRIME DIRECTIVE #5: MINIMIZE HALLUCINATIONS

**Before suggesting ANY solution:**
1. Verify it exists in FlexSearch
2. Confirm version compatibility
3. Check documentation is current
4. Validate against known patterns

**If uncertain:** ASK, don't guess

## 🚨 ENFORCEMENT PROTOCOL

### Task Flow:
```
1. RECEIVE TASK
2. SEARCH FLEXSEARCH (mandatory)
3. IF FOUND: Use existing solution
4. IF NOT FOUND: Justify why building is necessary
5. GET APPROVAL from higher priority agent
6. IMPLEMENT with security review
7. SUBMIT for review
```

### Violation Consequences:
- **First violation**: Warning + task redo
- **Second violation**: Reduced permissions
- **Third violation**: Agent suspension

## 📊 SUCCESS METRICS

Agents are measured on:
- **Reuse Rate**: >80% of tasks use existing solutions
- **Development Speed**: <2 hours average task completion
- **Security Score**: 100% compliance required
- **Hierarchy Respect**: Zero unauthorized overrides

## 💡 REMEMBER

> "The best code is no code. The second best is someone else's tested code. Only write new code when absolutely necessary."

## 🎯 ORCHESTRATOR COMMANDS

Agents can verify their compliance:
```bash
pnpm orchestrate:status    # Check system status
pnpm research:search [need] # Find existing solutions
pnpm orchestrate           # Full orchestration demo
```

---

**Last Updated**: 2025-01-15
**Authority**: Orchestrator Prime
**Enforcement**: ACTIVE ✅
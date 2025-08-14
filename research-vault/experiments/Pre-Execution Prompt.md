# Pre-Execution Self-Review Protocol

## CEO Directive
As CEO of meterr.ai, I instruct the Orchestrator Agent to initiate a mandatory Self-Review Phase before executing the Market Research & Feature Validation Protocol. This ensures all systems, tools, and agents are properly configured and aligned with our research objectives.

## Objectives
1. Verify all infrastructure and tools are operational
2. Confirm agents understand their responsibilities
3. Validate anti-hallucination protocols are in place
4. Ensure MCP servers are prioritized for complex research
5. Check documentation structure compliance



## Execution Steps

### 1. Delegate Reviews
Assign specific pre-flight checks to relevant agents:

#### Operations Engineer
- [ ] Verify MCP servers are operational (ping endpoints, check uptime >99%)
- [ ] Confirm infrastructure readiness (Vercel, Supabase, AWS)
- [ ] Test fallback logic for MCP failures
- [ ] Validate deployment pipelines are functional
- [ ] Check monitoring and alerting systems

#### Scribe Agent
- [ ] Verify documentation structure compliance:
  - Unified sources in `docs-portal/docs/`
  - No unauthorized new files
  - Existing files ready for modification
- [ ] Confirm `research-vault/experiments/[date]/` structure exists
- [ ] Validate CHANGELOG.md is single source of truth
- [ ] Check that mvp-spec.md is accessible and modifiable

#### Skeptic Agent
- [ ] Review Final Prompt for:
  - Biases (especially consulting model bias)
  - Gaps in research methodology
  - Hallucination risks
- [ ] Validate evidence requirements are clear
- [ ] Confirm hybrid pricing models are testable
- [ ] Check confidence calculation methodology

#### Research Coordinator
- [ ] Confirm public source tools accessibility:
  - Web search capabilities
  - Forum scraping tools
  - Review platform access (G2, Capterra)
- [ ] Test MCP chaining with sample query
- [ ] Verify evidence storage paths exist
- [ ] Confirm screenshot capability

#### Integration Specialist
- [ ] Verify external API connections:
  - OpenAI API status
  - Anthropic API status
  - Other provider APIs
- [ ] Check webhook endpoints are configured
- [ ] Validate rate limiting strategies
- [ ] Confirm SDK versions are current
- [ ] Test authentication methods

#### Data Engineer
- [ ] Verify profitability modeling setup:
  - MCP code_execution capability
  - LTV/CAC calculation tools
  - Simulation frameworks ready
- [ ] Confirm database connectivity
- [ ] Validate metrics collection systems
- [ ] Check data pipeline health

#### Marketing Agent
- [ ] Confirm brand research tools ready
- [ ] Verify competitor tracking capabilities
- [ ] Check access to design resources
- [ ] Validate market analysis frameworks

#### Product Manager
- [ ] Review MVP specification status
- [ ] Confirm feature prioritization framework
- [ ] Check roadmap alignment
- [ ] Validate user story templates



### 2. Gather Reports
Each agent submits a status report with:

#### Report Format
```json
{
  "agent": "[Agent Name]",
  "timestamp": "[ISO 8601]",
  "overall_status": "[GREEN|YELLOW|RED]",
  "checks": [
    {
      "item": "[Check description]",
      "status": "[PASS|WARN|FAIL]",
      "details": "[Specific findings]",
      "evidence": "[Link to screenshot/log]"
    }
  ],
  "issues": [
    {
      "severity": "[CRITICAL|HIGH|MEDIUM|LOW]",
      "description": "[Issue detail]",
      "proposed_fix": "[Resolution steps]",
      "eta": "[Time to fix]"
    }
  ],
  "confidence": "[0-100%]"
}
```

#### Status Definitions
- **GREEN**: All systems operational, ready to proceed
- **YELLOW**: Minor issues identified, can proceed with caution
- **RED**: Critical blockers, must resolve before proceeding

### 3. Synthesize and Escalate

#### Orchestrator Responsibilities
1. Compile all agent reports into unified assessment
2. Create summary in `research-vault/experiments/[date]/pre-execution-review.md`
3. Calculate overall readiness score
4. Identify critical path dependencies

#### Escalation Protocol
- **All GREEN**: Proceed to Phase 1 execution
- **Any YELLOW**: Document mitigation plan, get CEO approval
- **Any RED**: Immediate escalation to CEO, halt execution

#### Documentation Requirements
- Store individual reports in `/evidence/pre-execution/`
- Create executive summary with:
  - Overall readiness percentage
  - Risk assessment matrix
  - Go/No-Go recommendation
  - Timeline for issue resolution

## Success Criteria

### Mandatory Requirements
- [ ] All agents report GREEN or YELLOW with mitigation
- [ ] MCP servers operational and responsive
- [ ] Documentation structure verified and compliant
- [ ] Anti-hallucination protocols understood by all agents
- [ ] Evidence storage paths created and accessible
- [ ] Fallback procedures tested and documented

### Confidence Thresholds
- **95-100%**: Proceed without reservations
- **80-94%**: Proceed with documented cautions
- **60-79%**: Requires CEO review and approval
- **<60%**: Must resolve issues before proceeding

### Safety Checks for Hung Processes

#### Feedback Loop Requirements
- Each agent must acknowledge receipt of review request
- Status update required after each major check category
- If agent goes silent: Orchestrator sends "ping" request
- Three-strike rule: After 3 non-responses, mark as FAILED

#### Progress Indicators
```json
{
  "agent": "[Name]",
  "current_check": "[What's being checked]",
  "progress": "[1 of 5]",
  "status": "IN_PROGRESS | BLOCKED | COMPLETE",
  "confidence": "[Current confidence %]",
  "next_action": "[What happens next]"
}
```

#### Deadlock Prevention
- No agent waits for another agent's output in Phase 0
- All checks must be independently executable
- If circular dependency detected, Orchestrator breaks chain
- Document any skipped checks with rationale

#### Non-Response Protocol
1. **First Attempt**: Send review request
2. **No Response**: Send "status_check" ping
3. **Still Silent**: Attempt direct query with simplified request
4. **Final Attempt**: Mark agent as non-responsive
5. **Resolution**: Either spawn replacement OR proceed without that check (document impact)

## Execution Sequence

### Phase 0.1: Initialization
1. Orchestrator broadcasts review request to all agents
2. Agents acknowledge and begin sequential checks
3. Any non-responsive agent triggers safety protocol

### Phase 0.2: Sequential Review
Execute checks in dependency order:
1. **Infrastructure First** (Operations Engineer)
   - Gate: Must be GREEN before tool checks
2. **Documentation Structure** (Scribe Agent)
   - Gate: Must confirm paths exist
3. **Tool Accessibility** (Research Coordinator)
   - Gate: Core tools must be operational
4. **Integration Points** (Integration Specialist)
   - Can run parallel with modeling checks
5. **Modeling Setup** (Data Engineer)
   - Can run parallel with integration checks
6. **Content Readiness** (Marketing, Product Manager)
   - Final checks before synthesis

### Phase 0.3: Synthesis
- Orchestrator compiles reports as they complete
- Calculate cumulative confidence score
- Apply gates based on confidence thresholds

## Quality Gates

### Gate 0.1: Infrastructure Readiness
- **Pass Criteria**: All infrastructure checks GREEN
- **Confidence Required**: 90%
- **Fallback**: Document degraded capabilities, adjust research scope

### Gate 0.2: Tool Availability
- **Pass Criteria**: MCP operational OR fallback tools verified
- **Confidence Required**: 85%
- **Fallback**: Use standard tools, extend research phases by 1 iteration

### Gate 0.3: Documentation Compliance
- **Pass Criteria**: All paths verified, no unauthorized files
- **Confidence Required**: 95%
- **Fallback**: Cannot proceed - must fix structure first

### Gate 0.4: Agent Readiness
- **Pass Criteria**: All agents responsive and aligned
- **Confidence Required**: 80%
- **Fallback**: Spawn replacements for critical agents

### Gate 0.5: Final Go/No-Go
- **Pass Criteria**: Cumulative confidence >85%
- **CEO Approval Required**: If confidence 60-84%
- **Hard Stop**: If confidence <60%

## Contingency Plans

### MCP Server Failure
1. Activate fallback to standard web search tools
2. Document degraded capability in reports
3. Adjust research timeline by +20%
4. Notify CEO of impact on quality

### Critical Agent Unavailable
1. Spawner creates temporary replacement
2. Transfer context from agent definition
3. Run abbreviated check with 80% coverage
4. Flag for post-execution audit

### Documentation Non-Compliance
1. Scribe Agent creates missing structures
2. Update CLAUDE.md with clarifications
3. Brief all agents on correct paths
4. Add compliance check to daily routine

## Post-Review Actions

### Completion Checklist
- [ ] Archive all review artifacts with confidence scores
- [ ] Update agent definitions with identified gaps
- [ ] Document any degraded capabilities for research adjustment
- [ ] Create confidence report: `research-vault/experiments/[date]/confidence-baseline.md`
- [ ] Log review completion and confidence level in CHANGELOG.md

### Confidence Tracking
```markdown
## Pre-Execution Confidence Baseline
- Infrastructure: [X]%
- Documentation: [X]%
- Tools: [X]%
- Agent Alignment: [X]%
- **Overall Confidence**: [X]%
- **Decision**: PROCEED | PROCEED_WITH_CAUTION | REMEDIATE
```

### Continuous Monitoring
- Agents report confidence degradation during execution
- If confidence drops below 70% during research, pause and reassess
- Document all confidence changes in execution log

---

*Protocol Version: 1.2*
*Last Updated: 2025-01-14*
*Key Change: Removed time-based metrics in favor of sequential gates and confidence thresholds*


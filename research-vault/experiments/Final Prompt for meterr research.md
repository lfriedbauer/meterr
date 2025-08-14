# Meterr.ai Market Research & Feature Validation Protocol

## Executive Summary
**Company**: meterr.ai - AI cost optimization platform  
**Mission**: To be determined through this research (potential: hybrid consultant + platform at finance-AI intersection)  
**Revenue Model**: To be validated through pricing study - comparing platform models AND hybrid consultant + platform models  
**Target Launch**: MVP validation with initial customers

## Strategic Context
We're exploring multiple pricing models and their hybrids to find the optimal approach:

**Pure Models:**
- **Model A - "Pay What You Save"**: Customers pay 20% of verified AI cost savings
- **Model B - Usage-Based + Markup**: Follow AI providers' model - pass through usage costs + fixed markup (e.g., 5-15%)
- **Model C - Hybrid Subscription**: Flat rate ($49/month) with usage caps
- **Model D - Pure Subscription**: Fixed monthly tiers regardless of usage

**Hybrid Combinations to Test:**
- **Model E - Choice Menu**: Let customers choose between "Pay What You Save" OR Usage+Markup OR Subscription
- **Model F - Graduated Hybrid**: Start with Usage+Markup, graduate to "Pay What You Save" after optimization
- **Model G - Segmented Pricing**: Different models for different personas (e.g., usage for solopreneurs, success fee for enterprise)
- **Model H - Base + Success**: Small subscription ($29) + lower success fee (10% of savings)
- **Model I - Credits System**: Buy credits upfront, use for either tracking OR optimization services
- **Model J - Consultant + Platform**: Platform access + consulting hours (quarterly reviews, AI spend audits, ROI analysis)
- **Model K - Financial Advisory**: Position as finance-AI experts with advisory services + platform

**Enterprise Services**: Custom implementations, optimization consulting, financial AI audits, ROI analysis

## Research Objectives

### Primary Goals
1. **Mission Statement Development**: Define our core mission based on market research
2. **Brand Identity & Product Feel**: Validate "meterr" name, develop visual identity, color schemes, product personality
3. **Customer Persona Refinement**: Develop detailed profiles of ideal customers with revenue ranges
4. **Competitive Intelligence**: Discover and analyze all relevant competitors in AI cost/monitoring space
5. **Feature Validation**: Identify must-have MVP features through customer discovery
6. **Pricing Model Validation**: Test "Pay What You Save" model with real customers (beware consulting bias)
7. **Market Gaps**: Unmet needs that justify our unique approach
8. **Customer Segmentation**: Define customer tiers by company size, revenue, and AI spend

### Success Metrics
- Develop clear, compelling mission statement based on research findings
- Identify 3-5 critical MVP features validated by potential customers
- Validate "Pay What You Save" model feasibility and customer acceptance
- Document specific advantages over competitors with evidence
- Benchmark platform costs against competitor pricing

## Execution Protocol

As the CEO of meterr.ai, I instruct the Orchestrator Agent to coordinate the following market research and validation cycle:

### Phase 1: Market Discovery, Brand Identity & Customer Profiling

**Step 1: Brand & Product Identity Research**
- **To**: Marketing Agent + Product Design Agent
- **Task**: Research brand positioning and visual identity:
  
  **Name Validation:**
  - Test "meterr" name recognition and associations
  - Alternative names if needed (but prefer keeping meterr)
  - Domain availability and trademark considerations
  
  **Visual Identity Research:**
  - Analyze competitor visual languages (colors, typography)
  - What colors convey trust + innovation in fintech/AI?
  - Dashboard aesthetics that feel premium but accessible
  - Balance professional (consulting) with approachable (self-serve)
  
  **Product Personality:**
  - Should feel like: Sophisticated? Playful? Technical? Simple?
  - Reference products with great feel (Stripe, Linear, Notion?)
  - How to avoid generic SaaS look
  
- **Output**: Brand identity hypotheses in `research-vault/experiments/[date]/brand-identity.md`
- **Gate 2 Approval Required**: CEO and Product Design Agent must approve brand direction before proceeding

**Step 2: Research Question Development**
- **To**: Research Coordinator + Marketing Agent
- **Task**: Develop targeted research questions covering:
  
  **Demographics (Expanded):**
  - Traditional companies (revenue, employees, industry)
  - Solopreneurs (individual revenue, client base)
  - Fractional executives (number of clients, aggregate spend)
  - Agencies/consultants (client AI spend managed)
  - Content creators (volume, frequency)
  - Indie hackers (bootstrapped, MRR levels)
  
  **Feature Exploration (Beyond Token Tracking):**
  - Current token tracking approach (if any)
  - Prompt management and optimization needs
  - Model selection automation desires
  - Budget alerting and approval workflows
  - Team/client usage attribution
  - Prompt library and sharing features
  - AI quality monitoring needs
  - Compliance and audit requirements
  - API key management pain points
  - Cost allocation and chargeback needs
  
  **Platform Flexibility Questions:**
  - What would make them switch from current solution?
  - Features they'd trade token tracking for?
  - Integration priorities (Slack, Teams, Jira, etc.)
  - Workflow automation opportunities
  - Reporting and analytics needs
  
- **Output**: Questions documented in `research-vault/experiments/[date]/research-questions.md`

**Step 3: Competitor Discovery & Analysis**
- **To**: Marketing Agent + Skeptic Agent + Research Coordinator + Integration Specialist
- **Task**: First DISCOVER competitors, then analyze:
  
  **Phase A - Competitor Discovery:**
  Find all companies in these categories:
  
  1. **Direct AI Cost Tracking** (May include):
     - OpenMeter (usage metering)
     - Helicone (LLM observability)
     - Langfuse (LLM engineering)
     - Portkey (AI gateway)
     - Langsmith (LangChain's tool)
     - Weights & Biases (AI experiment tracking)
     - Others found via search
  
  2. **Adjacent Solutions**:
     - Datadog (general observability, has AI features?)
     - New Relic (APM with AI monitoring?)
     - CloudWatch (AWS cost tracking)
     - GCP Cost Management
     - Azure Cost Management
  
  3. **Alternative Approaches**:
     - In-house built solutions
     - Spreadsheet tracking
     - Direct provider dashboards (OpenAI, Anthropic)
     - Open source tools (find on GitHub)
  
  4. **Emerging/Unknown Players**:
     - Search ProductHunt for "AI cost", "LLM monitoring"
     - Check YC latest batches for relevant startups
     - Review "Show HN" posts about AI tools
     - Search GitHub for starred AI monitoring repos
  
  **Phase B - Relevance Assessment:**
  For each discovered competitor:
  - Are they actually solving similar problems?
  - What's their primary focus vs. secondary features?
  - Who uses them and why?
  - Are they a real threat or different market?
  
  **Phase C - Deep Analysis** (Top 5-7 relevant ones):
  - Features and pricing
  - Customer reviews and complaints
  - Market positioning
  - Strengths and weaknesses
  - Why customers choose them
  - Why customers leave them
  
  **Phase D - Integration Capabilities** (Integration Specialist leads):
  - Number and types of AI provider integrations
  - API architecture (REST, GraphQL, WebSockets)
  - SDK availability and language support
  - Webhook capabilities for real-time events
  - Rate limiting and quota management strategies
  - Authentication methods supported (OAuth, API keys, JWT)
  - Data export/import capabilities
  - Third-party app marketplace or plugin system
  
- **Output**: 
  - Complete competitor landscape in `/competitor-discovery.md`
  - Detailed analysis of relevant competitors in `/competitor-analysis.md`

**Step 4: Market Research & Persona Development (NO CUSTOMERS YET)**
- **To**: Research Coordinator + Marketing Agent
- **Reality Check**: We have ZERO customers. All research must come from public sources.
  
  **How AI Agents Actually Research (Not Talking to Real People):**
  1. **Public Forum Analysis** (What agents CAN do):
     - Scrape Reddit, HN, Discord, IndieHackers discussions
     - Analyze sentiment in r/OpenAI, r/LocalLLaMA, r/ChatGPT
     - Quote real posts: "User xyz on HN said..." with links
     - Save screenshots in `/forum-evidence/`
  
  2. **Competitor Customer Analysis**:
     - First: Identify which competitors actually have customers/reviews
     - Mine G2, Capterra, ProductHunt for ALL discovered competitors
     - Extract pain points from 1-star reviews
     - Identify unmet needs from feature requests
     - Note if competitors have NO reviews (might be too new/small)
     - Document: Review date, rating, verified buyer status
  
  3. **Industry Research**:
     - Analyze OpenAI/Anthropic pricing discussions
     - Study AI cost complaints on Twitter/X
     - Review YC startup discussions about AI costs
     - Reference actual reports (McKinsey, Gartner) with citations
  
  4. **Prospect Outreach** (What we CANNOT do as AI):
     - AI agents cannot email/call real people
     - AI agents cannot conduct real interviews
     - AI agents cannot join Zoom calls
     - CEO/human must do actual prospect outreach
  
  **Creating Personas from Public Data:**
  - Build personas from competitor reviews
  - Use forum discussions to understand pain points
  - Estimate company sizes from public info
  - Mark ALL personas as "HYPOTHESIS - Not Validated"
  
  **What CEO/Humans Need to Do:**
  - Post on LinkedIn/Twitter to find prospects
  - Join AI communities and engage directly
  - Schedule real Zoom calls with prospects
  - Validate hypotheses through actual conversations
  
- **Output**: 
  - Hypothesis personas in `/personas/hypotheses/`
  - Forum evidence in `/evidence/forums/`
  - Competitor insights in `/evidence/competitors/`
  - NO fake interview transcripts

### Phase 2: Feature Prioritization & Platform Evolution

**Step 5: Platform Assessment & Pivot Analysis (Balance Consulting Appeal)**
- **To**: Product Manager + Architect + Builder + Integration Specialist
- **Task**: Evaluate current platform vs. market needs:
  
  **What We've Built:**
  - Token tracking system
  - Smart router API
  - Cost calculator
  - Basic dashboard
  
  **Integration Analysis (Integration Specialist Focus):**
  - Which providers do competitors support?
  - What webhooks and real-time features do they offer?
  - How do they handle rate limiting and quotas?
  - What's their API gateway architecture?
  - Do they offer SDKs or just REST APIs?
  - How do they manage multi-provider authentication?
  
  **What Market Might Want Instead (Based on Competitor Gaps):**
  - If competitors focus on observability → We focus on optimization
  - If competitors are enterprise-only → We focus on individuals
  - If competitors are complex → We focus on simplicity
  - If competitors are expensive → We focus on accessibility
  - Prompt optimization platform
  - AI quality monitoring
  - Team collaboration tools
  - Compliance/audit system
  - Model performance comparison
  - Automated cost optimization
  - **Seamless multi-provider integration** (Integration Specialist priority)
  - **Real-time usage webhooks** (Integration Specialist priority)
  - **Unified API gateway** (Integration Specialist priority)
  
  **Pivot Decision Framework:**
  - Keep: Features with strong market validation
  - Modify: Features that need adjustment
  - Kill: Features with no market demand
  - Build: New features with high demand
  - **Balance**: Don't over-index on consulting (everyone will say yes to free advice)
  - **Platform**: What makes the PRODUCT itself memorable/sticky?
  
- **Output**: Platform evolution plan in `docs/PLATFORM_PIVOT.md`

**Step 6: MVP Redefinition**
- **To**: Product Manager + Skeptic
- **Task**: Define MVP based on research (may differ from current build):
  
  **Core Value Proposition Options:**
  - A. AI Cost Tracker (current focus)
  - B. Prompt Management Platform
  - C. AI Quality Assurance Tool
  - D. Team AI Governance Solution
  - E. Multi-model Optimization Engine
  - F. Hybrid combining top needs
  
  **Feature Set Decision:**
  - Must-have features based on pain points
  - Nice-to-have features for differentiation
  - Features to explicitly NOT build
  
- **Output**: Revised MVP specification in `docs/MVP_SPEC_V2.md`

### Phase 3: Prototype Validation

**Step 7: Adaptive Prototyping with Brand Identity**
- **To**: Builder + Product Design Agent
- **Task**: Build/modify prototype based on market findings:
  
  **If Current Platform Aligns:**
  - Enhance existing token tracking
  - Add most-requested features
  - Improve UX based on pain points
  
  **If Pivot Needed:**
  - Build new core feature prototype
  - May be completely different from current
  - Focus on biggest market pain point
  
  **Prototype Requirements:**
  - Apply brand identity (colors, typography)
  - Create memorable product feel
  - Balance consulting sophistication with product simplicity
  - Make it feel different from generic SaaS
  - Test "meterr" branding throughout
  
- **Location**: `apps/app/app/tools/[feature-name]/`
- **Output**: Live URL and pivot rationale in `research-vault/experiments/[date]/prototypes.md`

**Step 8: User Testing (EVIDENCE-BASED)**
- **To**: Customer Success Agent + Research Coordinator
- **Task**: Test prototype with real users OR document inability to test:
  
  **If Real Users Available:**
  - Document who tested (name or "User #1")
  - Record session (video/screenshots)
  - Capture exact quotes and reactions
  - Time spent, actions taken
  - Save evidence in `/user-testing/session-recordings/`
  
  **If No Users Available Yet:**
  - State: "No users available for testing"
  - Create test plan for future: `/user-testing/test-plan.md`
  - Set up prototype for self-testing
  - Document what WOULD be tested
  - Use competitor reviews to predict issues
  
  **Testing Areas:**
  - Value proposition understanding
  - "Pay What You Save" model acceptance
  - Missing capabilities
  - Integration requirements
  
- **Output**: 
  - Real: Test recordings in `/user-testing/sessions/`
  - Hypothetical: Test plans in `/user-testing/plans/`
  - Always mark: "TESTED" vs "PLANNED"

**Step 9: Iteration**
- **To**: Builder + Product Manager
- **Task**: Refine prototype based on feedback:
  - Fix critical issues
  - Add most-requested features
  - Improve UX based on observations
- **Output**: Git commits with clear change descriptions

### Phase 4: Go-to-Market Strategy & Validation

**Step 10: Comprehensive Pricing Study (Beware Consulting Bias)**
- **To**: Marketing Agent + Product Manager + Skeptic Agent + Data Engineer
- **Task**: Test multiple pricing models and hybrids with real customers:
  
  **Pure Models Testing:**
  - A. "Pay What You Save" (20% of savings)
  - B. Usage + Markup (5-20% markup)
  - C. Subscription + Overages
  - D. Pure Subscription Tiers
  
  **Hybrid Models Testing:**
  - E. **Choice Menu**: Present 3 options, let customer choose
    - Profitability: Mix of high/low margin customers
    - Test: What % choose each option?
  
  - F. **Graduated Hybrid**: Evolution pricing
    - Month 1-3: Usage + 10% markup (prove value)
    - Month 4+: Switch to "Pay What You Save"
    - Profitability: Lower early revenue, higher later
  
  - G. **Segmented by Persona**:
    - Solopreneurs: Usage + 5% markup
    - SMBs: $99 subscription
    - Enterprise: "Pay What You Save"
    - Profitability: Optimize per segment
  
  - H. **Base + Success Combo**:
    - $29-49 base subscription
    - Plus 10% of savings (lower than pure success)
    - Profitability: Guaranteed revenue + upside
  
  - I. **Credits System**:
    - Buy credits in bulk (discount for volume)
    - Use for tracking OR optimization services
    - Profitability: Upfront cash flow
  
  **Profitability Analysis for Each Model (Gate 6 Validation Required):**
  - Calculate break-even customer count with real numbers
  - Model with 30%, 50%, 70% success rates
  - Infrastructure costs per customer (Vercel, Supabase actual pricing)
  - Support costs by model complexity (time estimates × hourly rates)
  - Cash flow timing (upfront vs. delayed)
  - **Validation**: Data Engineer must verify all cost assumptions
  - **Skeptic Review**: Challenge optimistic projections
  
  **Customer Testing (REAL OR SIMULATED):**
  - **Real Customers**: Document actual responses with evidence
  - **No Customers Yet**: Use these methods:
    - Analyze competitor pricing reactions in reviews
    - Study pricing discussions in forums
    - Create A/B test mockups for future testing
    - Document as "SIMULATION" or "HYPOTHESIS"
  - Track all evidence in `/pricing-evidence/`
  
  **Key Questions:**
  - Does offering choice increase conversion?
  - Which hybrid maximizes LTV/CAC?
  - Can we remain profitable with choice menu?
  - Should we start customers on one model and migrate them?
  - **Critical**: How do we avoid false positives from consulting appeal?
  - What makes the PLATFORM valuable without consulting?
  
- **Output**: Comprehensive pricing study with hybrid analysis in `research-vault/experiments/[date]/pricing-hybrid-study.md`

**Step 11: Go-to-Market Strategy Development**
- **To**: Marketing Agent + Architect + Operations Engineer + Integration Specialist
- **Task**: Define go-to-market approach:
  
  **Open Source vs. Private Decision:**
  - **Option A - Fully Open Source**:
    - Benefits: Trust, community contributions, marketing
    - Risks: Competitors fork, harder monetization
    - Examples: Plausible, PostHog, Supabase model
  
  - **Option B - Open Core**:
    - Core tracking: Open source
    - Advanced features: Proprietary
    - Examples: GitLab, Elastic model
  
  - **Option C - Source Available**:
    - Code visible but restrictive license
    - Cannot compete commercially
    - Examples: Sentry, MongoDB approach
  
  - **Option D - Fully Private**:
    - Traditional SaaS model
    - Protect IP completely
    - Examples: Most B2B SaaS
  
  **Distribution Strategy:**
  - GitHub presence and stars strategy
  - Product Hunt launch timing
  - HackerNews launch approach
  - Reddit community engagement
  - Developer influencer outreach
  
  **Initial Customer Acquisition:**
  - Where to find first 10 customers
  - Cold outreach vs. inbound
  - Community-led vs. sales-led
  - Free tier vs. trial approach
  
  **Integration Partnership Strategy** (Integration Specialist leads):
  - Partner with AI providers for marketplace listings
  - Build official integrations for popular tools (Zapier, Make)
  - Create developer-friendly SDKs and API documentation
  - Establish webhook templates for common use cases
  - Design plugin architecture for community extensions
  
- **Output**: Go-to-market strategy in `docs/GO_TO_MARKET.md`

**Step 12: Customer Segmentation & Tier Definition**
- **To**: Customer Success Agent + Marketing Agent + Data Engineer
- **Task**: 
  - Define customer segments based on research:
    - **Startup Tier**: Revenue range, typical AI spend, needs
    - **Scale-up Tier**: Revenue range, typical AI spend, needs
    - **Mid-Market Tier**: Revenue range, typical AI spend, needs
    - **Enterprise Tier**: Revenue range, typical AI spend, needs
  - For each tier, identify:
    - Average customer acquisition cost (CAC)
    - Expected lifetime value (LTV)
    - Success probability with "Pay What You Save"
    - Support requirements
    - Preferred buying process
- **Output**: Customer segmentation in `docs/CUSTOMER_SEGMENTS.md`

### Phase 5: Documentation & Synthesis

**Step 13: Final Report (EVIDENCE-BASED)**
- **To**: Scribe Agent + Skeptic Agent + Marketing Agent + Data Engineer
- **Task**: Document findings with clear evidence trail:
  
  **Required Report Sections:**
  1. **Data Sources Summary**:
     - Customers interviewed: 0 (we have no customers yet)
     - Forum posts analyzed (with counts and links)
     - Competitor reviews studied (with counts)
     - Industry reports referenced (with citations)
     - Prospects we could reach out to (for CEO to contact)
  
  2. **Customer Personas**:
     - Mark each as "VALIDATED" or "HYPOTHESIS"
     - Include source for every data point
     - Revenue ranges with evidence or marked "ESTIMATED"
     - AI spend with proof or "INFERRED FROM..."
  
  3. **Pricing Model Findings**:
     - Real feedback: Quote with attribution
     - Inferred preferences: Based on competitor reviews
     - Untested models: Marked as "REQUIRES TESTING"
  
  4. **Confidence Levels** (with percentages):
     - HIGH (80-100%): Direct customer feedback or industry data
     - MEDIUM (60-79%): Inferred from competitor reviews
     - LOW (40-59%): Hypothesis based on forum discussions
     - UNTESTED (<40%): No data available yet
     - Include confidence calculation for each major finding
  
  5. **Next Steps for Validation**:
     - What needs real customer testing
     - How to find test customers
     - Specific hypotheses to validate
  
- **Output**: `docs/MARKET_VALIDATION_REPORT.md` with evidence folder

**Step 14: Mission Statement Development**
- **To**: Orchestrator + Marketing Agent
- **Task**: Based on research findings:
  - Craft compelling mission statement
  - Ensure it reflects actual capabilities (not promises)
  - Align with customer needs discovered
  - Make it memorable and authentic
- **Output**: Proposed mission in `docs/MISSION_STATEMENT.md`

## Validation Requirements

### Confidence Measurement Methodology
How to calculate confidence percentages:
- **100% Confidence**: Direct evidence from multiple sources (e.g., consistent competitor features)
- **80-90% Confidence**: Strong patterns from public data (e.g., repeated pain points in forums)
- **60-70% Confidence**: Educated hypotheses based on indirect evidence
- **40-50% Confidence**: Assumptions requiring validation
- **<40% Confidence**: Insufficient data, need more research

Confidence Calculation Formula:
```
Confidence = (Data Sources × Quality × Consistency) / Total Possible Score
- Data Sources: Number of independent sources (max 10 points)
- Quality: Reliability of sources (max 10 points)
- Consistency: Agreement between sources (max 10 points)
```

### Anti-Hallucination Protocol

**FUNDAMENTAL RULE**: We have NO customers. All research comes from public sources, not interviews.

1. **No Hypotheticals**: All data must reference actual files/URLs
2. **Evidence Required**: Every claim needs supporting documentation with source
3. **Real Prototypes**: Must provide working Vercel URLs or state "prototype not built"
4. **Actual Feedback**: User responses must be verbatim quotes, not paraphrased
5. **Verifiable Metrics**: All numbers must trace to source data
6. **Source Attribution**: Every insight tagged with [SOURCE: location, date, person/username]
7. **Skeptic Review**: All quantitative claims vetted by Skeptic Agent
8. **Marketing Validation**: All positioning claims reviewed by Marketing Agent

**What AI Agents CAN Do:**
- Analyze competitor customer reviews (with links)
- Study public forum discussions (with screenshots)
- Review industry reports (with citations)
- Create testable hypotheses (marked as "HYPOTHESIS")
- Build prototypes for future testing (marked as "UNTESTED")
- Research open source vs. private code strategies

**What AI Agents CANNOT Do:**
- Interview real people
- Send emails to prospects
- Make phone calls
- Join video calls
- Pretend to have spoken with humans

**Unacceptable Practices:**
- Creating fictional interview responses
- Inventing customer quotes
- Making up survey results
- Claiming validation without evidence
- Using "customers said" without proof

### Quality Gates with Passage Metrics
- **Gate 1**: Research questions approved by CEO before execution
  - **Metric**: 100% questions address real market needs (not assumptions)
  - **Pass Criteria**: CEO approval received

- **Gate 2**: Brand identity and product feel approved by CEO/Product Design Agent (after Phase 1, Step 1)
  - **Metric**: 80% confidence in brand differentiation from competitors
  - **Pass Criteria**: 3+ visual concepts, name validation complete, CEO/Design approval

- **Gate 3**: Competitor analysis validated by Skeptic Agent
  - **Metric**: 90% coverage of actual competitors (not assumed ones)
  - **Pass Criteria**: 10+ competitors analyzed, 5+ deeply researched, gaps identified

- **Gate 4**: Prototype functional and deployed before testing
  - **Metric**: 100% core features operational on Vercel
  - **Pass Criteria**: Live URL accessible, brand identity applied, no critical bugs

- **Gate 5**: Quality user feedback documented (depth over quantity)
  - **Metric**: 70% confidence in feature priorities (even if hypothetical)
  - **Pass Criteria**: Evidence from 50+ forum posts/reviews analyzed

- **Gate 6**: "Pay What You Save" model validated with customer feedback
  - **Metric**: 60% positive sentiment from market research (accounting for consulting bias)
  - **Pass Criteria**: Clear understanding of platform value separate from consulting

- **Gate 7**: Profitability models validated by Data Engineer/Skeptic (after Phase 4 modeling)
  - **Metric**: 85% confidence in break-even calculations
  - **Pass Criteria**: Real cost data used, 3+ scenarios modeled, sensitivity analysis complete

### Success Criteria
✓ Forum and competitor review analysis provides actionable insights  
✓ 3-5 hypothesis personas developed (including solopreneurs, fractional)
✓ Platform pivot decision made based on market evidence
✓ 3-5 MVP features validated (may be different from current build)
✓ Clear feature roadmap beyond just token tracking
✓ Working prototype aligned with biggest market need
✓ Pricing models tested across different persona types
✓ Profitability model validated for diverse customer base
✓ Go-to-market strategy defined (open source vs. private)
✓ Customer segments defined with clear value props for each
✓ Competitive advantages identified (or pivot if none exist)
✓ Mission statement aligned with actual market needs
✓ List of prospects for CEO to contact directly

## Communication Protocol

### Reporting Structure
- **Daily Standup**: Orchestrator reports progress to CEO
- **Phase Gates**: Formal review at each phase completion
- **Blockers**: Immediate escalation of any impediments
- **Decisions**: CEO approval required for phase transitions

### Documentation Standards
- Use existing docs-portal/docs/ structure (single source of truth)
- Modify existing files rather than creating new ones
- Final deliverables in `docs/` directory
- Git commits with clear descriptions

## Timeline & Phase Completion Metrics
- **Phases progress based on completion, not fixed days**
- **Focus on quality of insights over speed**
- **Each phase gates on meaningful results**

### Phase Completion Criteria
- **Phase 1 Complete**: 75% confidence in brand identity + 80% competitor landscape understood
- **Phase 2 Complete**: 70% confidence in platform direction + MVP features prioritized
- **Phase 3 Complete**: Prototype deployed + testing plan documented
- **Phase 4 Complete**: 65% confidence in pricing model viability (accounting for biases)
- **Phase 5 Complete**: All findings documented with confidence levels + mission statement drafted

## Agent Responsibilities

### Meta Agents
- **Orchestrator**: Overall coordination and CEO reporting
- **Research Coordinator**: Customer research execution
- **Spawner**: Create specialized sub-agents as needed

### Primary Agents
- **Product Manager**: Feature prioritization and MVP definition
- **Marketing**: Competitive analysis and pricing strategy
- **Builder**: Prototype development and iteration
- **Architect**: Technical feasibility assessment
- **Operations Engineer**: Deployment and infrastructure
- **Scribe**: Documentation and reporting
- **Validator**: Quality assurance and testing

### Specialist Agents
- **Skeptic**: Challenge assumptions and validate claims
- **Product Design**: UX/UI for prototypes
- **Customer Success**: User testing coordination
- **Security Auditor**: Assess enterprise requirements
- **Performance Tester**: Validate scalability claims
- **Data Engineer**: Analytics and metrics setup
- **Integration Specialist**: External API connections and provider integrations

## Key Focus Areas

### Competitor Landscape Understanding
Before assuming our competitors, we need to discover:

**Who Are We Actually Competing Against?**
- Is it really OpenMeter, Helicone, Langfuse?
- Are there bigger players we're missing (Datadog, New Relic)?
- What about in-house solutions and spreadsheets?
- Are there open source alternatives?
- Who has traction and customers vs. who's just noise?

### Platform Direction & Feature Evolution
Balance what we've built with what market actually needs:

**Critical Strategic Questions:**
- Is token tracking the right core value prop?
- What features would make us indispensable?
- Should we pivot to prompt management or quality monitoring?
- Can we combine multiple pain points into one platform?
- What would make someone pay immediately?
- What are competitors NOT doing that we could own?

**Feature Exploration Beyond Current Build:**
- Prompt optimization and versioning
- AI quality and hallucination detection
- Team collaboration and approval workflows
- Compliance and audit trails (financial focus)
- Model performance benchmarking
- Automated prompt improvement
- Cost allocation for departments/clients
- AI usage governance and policies
- **Financial-AI Features**:
  - ROI analysis tools
  - Financial reporting dashboards
  - AI spend audit capabilities
  - Budget forecasting
  - Cost-benefit analysis tools

### Customer Persona Development
Define our ideal customer profiles (ICPs):

**Expanded Demographics:**
- Solopreneurs ($100K-1M revenue, personal AI use)
- Fractional CXOs (managing 3-10 clients)
- Indie hackers (bootstrapped, $5K-50K MRR)
- Agencies (managing client AI spend)
- Content creators (high-volume AI usage)
- Traditional SMBs and enterprises

**Key Questions to Answer:**
- Who feels the most pain right now?
- What company size has budget and urgency?
- Do individuals need different features than teams?
- How do fractional executives manage multi-client costs?
- What would make a solopreneur pay $49/month?
- Who makes the buying decision in each segment?

**Persona Dimensions to Capture:**
1. **Business Profile Types**
   - Traditional Companies (revenue, employee count, industry)
   - Solopreneurs (individual revenue, client types)
   - Fractional Executives (number of clients, aggregate spend)
   - Consultants/Agencies (client AI spend they manage)
   - Freelancers (project-based AI usage)
   - Content Creators (volume-based AI usage)
   
2. **AI Usage Profile**
   - Monthly AI spend (personal vs. client billable)
   - Number of AI providers used
   - Use cases (customer service, content, analytics, development)
   - Current cost tracking methods
   - Who pays the AI bills (self, clients, company)
   
3. **Buying Behavior**
   - Decision-making process (instant vs. committee)
   - Budget source (personal, expense account, client pass-through)
   - Payment preferences (credit card, invoice, client reimbursement)
   - Price sensitivity by persona type

4. **Success Indicators**
   - What makes them likely to achieve savings?
   - Red flags that indicate poor fit
   - Onboarding requirements
   - Support needs (self-serve vs. high-touch)

### Mission Statement Development
The research should help us articulate:
- What problem we uniquely solve
- Who we serve best (based on persona research)
- How we create value
- Why we exist beyond making money

### Profitability Model Validation
Critical analysis required:
- **Customer Success Rate**: What percentage of customers must achieve savings for meterr to break even?
- **Service Cost Analysis**: 
  - Infrastructure costs per customer (Vercel, Supabase, compute)
  - Support costs (onboarding, ongoing help)
  - Development/maintenance allocation
- **Savings Duration Models**:
  - 6-month sharing: Higher percentage but shorter commitment
  - 12-month sharing: Balanced approach
  - Perpetual sharing: Lower percentage but ongoing revenue
  - Annual reset vs. continuous baseline
- **Risk Scenarios**:
  - If only 30% of customers save money, can we survive?
  - How long can we support non-saving customers?
  - Should we "graduate" successful customers to flat rate after X months?

### Pricing Model Validation & Hybrid Profitability Analysis

**Core Principle:** Test if offering multiple models simultaneously can maintain profitability through portfolio diversification.

**Pure Models Analysis:**
- **A. Pay What You Save**: 20% of savings, $5K cap
- **B. Usage + Markup**: 5-20% markup on API costs
- **C. Subscription + Usage**: Base fee + overages
- **D. Pure Subscription**: Fixed tiers

**Hybrid Models to Validate:**

**E. Choice Menu Approach:**
- Offer 3 options simultaneously on pricing page
- Research: What % chooses each? Can we predict choosers?
- Profitability: Model portfolio mix scenarios
- Risk: Adverse selection (unprofitable customers choose certain models)

**F. Graduated Evolution:**
- Start: Usage + 10% (Months 1-3)
- Prove: Track and show savings
- Graduate: Move to Pay What You Save (Month 4+)
- Profitability: Lower initial revenue but higher retention?

**G. Persona-Based Segmentation:**
- Solopreneurs: Usage + 5% (low margin, low support)
- SMBs: $99 subscription (predictable, medium margin)
- Enterprise: Pay What You Save (high margin if successful)
- Profitability: Each segment optimized for its economics

**H. Base + Success Hybrid:**
- $29-49 monthly base (covers platform costs)
- 10% of savings (lower than pure success model)
- Profitability: Guaranteed break-even + upside

**I. Credits System:**
- Buy credits upfront ($100 = 110 credits)
- Use for tracking OR optimization
- Profitability: Cash flow positive immediately

**Profitability Modeling Requirements:**
- Model 100 customers across different pricing options
- Calculate weighted average margin
- Identify minimum viable mix for profitability
- Test sensitivity to customer self-selection
- Determine if complexity cost < revenue benefit

### Customer Segmentation Examples
Research should define clear tiers including both traditional and non-traditional segments:

**Traditional Company Segmentation (to be validated):**
- **Startup**: $1-10M revenue, $500-5K/mo AI spend
- **Scale-up**: $10-50M revenue, $5K-25K/mo AI spend  
- **Mid-Market**: $50-250M revenue, $25K-100K/mo AI spend
- **Enterprise**: $250M+ revenue, $100K+/mo AI spend

**Individual/Alternative Segmentation (to be validated):**
- **Solopreneur**: $100K-1M personal revenue, $100-2K/mo AI spend
- **Fractional CXO**: Managing 3-10 clients, $2K-20K/mo aggregate AI spend
- **Consultant/Agency**: $500K-5M revenue, managing $5K-100K/mo client AI spend
- **Freelancer**: $50K-200K revenue, $50-500/mo AI spend
- **Content Creator**: Variable revenue, $100-5K/mo AI spend

For each segment, determine:
- Likelihood of achieving savings
- Average savings percentage possible
- Cost to serve (self-serve vs. support needed)
- Sales cycle length (instant vs. enterprise sales)
- Support requirements
- Payment method preferences
- Whether they need client billing features

## Continuous Improvement Loop
1. **Measure**: Track actual results vs expectations
2. **Learn**: Document insights and surprises
3. **Adjust**: Refine based on evidence
4. **Focus**: Quality feedback over quantity metrics

## Critical Research Biases to Avoid

### The Consulting Trap
Everyone will say yes to free/cheap consulting, but that doesn't validate the platform:
- **False Positive**: "Would you like AI cost optimization advice?" → Always yes
- **Real Question**: "Would you pay for this PLATFORM without consulting?"
- **Balance**: Find what makes the product itself valuable and memorable

### Brand & Product Feel Importance
In a commoditized AI market, differentiation comes from:
- **Brand Identity**: "meterr" name recognition and recall
- **Visual Design**: Colors, typography that stand out
- **Product Feel**: Interaction quality that competitors lack
- **Emotional Connection**: What feeling does using meterr evoke?

## Critical Profitability Considerations

The "Pay What You Save" model's attractiveness to customers creates unique challenges:

### The Attraction-Profitability Paradox
- **Customer Appeal**: Zero-risk proposition attracts many customers
- **Profitability Risk**: Not all customers will achieve savings
- **Key Question**: Can we be profitable if success rate is <50%?

### Pricing Models to Test
**Pure Models:**
1. **Pure Success Fee**: 20% of savings only ("Pay What You Save")
2. **Usage + Markup**: Pass-through pricing + 5-20% markup (like AI providers)
3. **Hybrid Subscription**: Base fee + usage overages (like Vercel/Supabase)
4. **Pure Subscription**: Fixed tiers with usage limits

**Hybrid Combinations:**
5. **Choice Menu**: Let customers self-select their preferred model
6. **Graduated Evolution**: Start simple (usage), evolve to sophisticated (success fee)
7. **Persona-Based**: Different pricing for solopreneurs vs. enterprises
8. **Base + Success**: Guaranteed revenue + performance upside
9. **Credits System**: Prepaid credits for flexibility
10. **Time-Based Migration**: 6-month intro pricing then optimize

**Profitability Safeguards:**
- Minimum viable revenue per customer
- Portfolio approach (mix of model types)
- Migration paths between models
- Escape clauses for unprofitable accounts

### Research Must Answer
**Profitability Questions:**
- What's our actual cost to serve each customer segment?
- What success rate makes us profitable for each model?
- Can hybrid models maintain profitability while offering choice?
- What's the optimal mix of pricing models for portfolio profitability?
- Should we cap the number of "Pay What You Save" customers?

**Model Comparison:**
- Which pricing model has the best unit economics?
- Does offering choice increase or decrease conversion?
- What's the LTV/CAC ratio for each model and hybrid?
- Which hybrid model best balances growth and profitability?
- Can usage-based markup compete with discovered competitors?

**Customer Preference:**
- Do different personas prefer different pricing models?
- Will customers accept model transitions (graduated pricing)?
- What percentage would choose each option in a choice menu?
- How price-sensitive is each persona to different models?

**Strategic Questions:**
- How long should we share in the savings?
- Should we "fire" non-performing customers or migrate them?
- Can we identify likely-to-save customers during onboarding?
- Should we limit certain models to certain customer sizes?
- Does offering multiple models dilute our positioning?
- Is complexity worth the conversion/retention benefits?

---

*This protocol ensures systematic market validation with flexibility to pivot the platform substantially based on actual market needs, rather than forcing a preconceived solution.*
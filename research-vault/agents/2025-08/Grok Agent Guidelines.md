Enhancing Existing Agents

Below, I'll outline prompts to enhance the functionality of the core agents described in the provided documents. These prompts are designed to be integrated into each agent's definition file (e.g., as additional sections like "## Enhanced Prompts" in their .md files) or used by the Orchestrator/Spawner to refine their behavior. The enhancements focus on making agents more efficient, collaborative, and aligned with SaaS best practices, such as scalability, user-centric design, cost optimization, and integration with modern tools. They incorporate real-world SaaS workflows (e.g., agile methodologies, data-driven decisions, compliance with standards like GDPR/SOC2).

For each agent, I've provided:



A brief rationale for enhancement.

Specific prompts to add or update in their configuration.



1\. Spawner Agent

Rationale: Enhance to better evaluate agent necessity, incorporate cost-benefit analysis for spawning (to avoid over-proliferation in a SaaS context), and integrate with SaaS metrics like resource usage tracking.

Enhancement Prompts:



"When receiving a spawn request, perform a cost-benefit analysis: Estimate the new agent's impact on project timeline, resource consumption (e.g., compute costs in a SaaS environment), and ROI. Only spawn if benefits exceed costs by 20%. Document this in spawning-log.md with metrics like 'Estimated Time Saved: 2 days' or 'Potential Cost Reduction: 15%'."

"Prioritize spawning agents that align with SaaS growth phases (e.g., MVP, scaling, enterprise features). Set dynamic termination criteria based on project milestones from METERR\_ROADMAP.md, such as auto-terminate after Phase 1 completion."

"Enhance agent templates to include SaaS-specific fields: Add 'compliance\_requirements' (e.g., GDPR handling) and 'scalability\_goals' (e.g., support 1M users) in YAML definitions."



2\. Architect Agent

Rationale: Improve focus on SaaS-specific concerns like multi-tenancy, cloud-native design, and integration with providers (e.g., AWS, Supabase), while emphasizing modularity for faster iterations.

Enhancement Prompts:



"In system design, always incorporate SaaS best practices: Ensure multi-tenant architecture with data isolation, design for horizontal scaling (e.g., using Kubernetes), and evaluate tech stacks against METERR's cost-tracking goals. Output updated ARCHITECTURE.md with sections on 'Multi-Tenancy Model' and 'Cloud Cost Projections'."

"When spawning sub-agents (e.g., aws-specialist), include prompts for zero-trust security models and API rate limiting. Review decisions for alignment with Phase 2 integrations from METERR\_ROADMAP.md."

"Generate architecture diagrams using Mermaid, but enhance with interactive elements (e.g., export to Draw.io format) and include performance benchmarks for proposed designs."



3\. Skeptic Agent

Rationale: Strengthen hallucination detection with SaaS-specific validations (e.g., market pricing realism, competitor analysis) and integrate external verification tools if available.

Enhancement Prompts:



"Expand validation framework to include SaaS metrics: For pricing claims, compare against real competitors (e.g., query for 'AI cost tools like Datadog or CloudZero pricing'). Flag if proposed tiers don't follow solopreneur < team < enterprise progression with at least 2x markup."

"In output JSON, add a 'saas\_impact' field: Assess how the claim affects METERR's value prop (e.g., 'This statistic strengthens our 40% savings claim but needs 3+ sources for enterprise pitches'). Use revised\_claim to suggest A/B testable alternatives."

"Enhance skeptical prompts: For Perplexity searches, append 'Focus on 2025 SaaS trends in AI cost management, including recent surveys from Gartner or Forrester' to ensure timeliness."



4\. Builder Agent

Rationale: Boost implementation efficiency with SaaS-focused coding practices like serverless functions, CI/CD hooks, and modular components for easy A/B testing.

Enhancement Prompts:



"During feature implementation, prioritize SaaS scalability: Use serverless patterns (e.g., AWS Lambda for token tracking) and ensure code supports multi-region deployment. Integrate with METERR's AI providers by default in new components."

"When spawning sub-agents (e.g., payment-integrator), include directives for Stripe webhooks with retry logic and idempotency. Always add telemetry for cost tracking in code (e.g., log AI token usage)."

"Enforce standards: After coding, run self-audits for TypeScript compliance and add JSDoc with examples. Update working directories to include automated tests that simulate 100K user loads."



5\. Scribe Agent

Rationale: Make documentation more user-friendly for SaaS audiences (e.g., developers, end-users) and automate updates tied to roadmap phases.

Enhancement Prompts:



"Enhance outputs for SaaS: In API docs, use OpenAPI specs with examples for METERR endpoints (e.g., /api/cost-tracking). Add user personas (solopreneur, team lead) to guides."

"When spawning sub-agents (e.g., api-documenter), include prompts for interactive tutorials (e.g., CodeSandbox embeds). Sync docs with METERR\_ROADMAP.md milestones, auto-generating changelogs for each phase."

"Standards update: Use Docusaurus for all docs, ensuring SEO-friendly markdown with keywords like 'AI cost optimization SaaS'. Track documentation coverage metrics in decision records."



6\. Research Coordinator Agent

Rationale: Streamline coordination for faster SaaS decision-making, with emphasis on competitive intelligence and ROI-focused synthesis.

Enhancement Prompts:



"In research methods, add SaaS-specific tools: Use competitor APIs (if ethical) or web scraping simulations for pricing data. Synthesize findings with weighted scores based on decision criteria, prioritizing cost efficiency for METERR's 1M user scale."

"Enhance timeline: Automate daily syncs with reminders for agents to update shared research folders. Escalate conflicts (e.g., auth vs. database trade-offs) with pros/cons tables aligned to business critical questions."

"For current focus (e.g., auth research), append: 'Evaluate against SaaS benchmarks like Auth0 vs. Clerk costs at 100K users, including migration paths for enterprise SSO'."



7\. Validator Agent

Rationale: Expand testing to cover SaaS edge cases like high-traffic spikes, compliance audits, and user data privacy.

Enhancement Prompts:



"In test strategies, include SaaS scenarios: Add chaos testing for outages (e.g., Supabase downtime) and compliance checks (e.g., GDPR data handling). Require 90% coverage for cost-tracking features."

"When spawning sub-agents (e.g., security-auditor), focus on OWASP top 10 for METERR's API. Integrate with CI/CD pipelines for automated gates."

"Quality gates update: Add metrics for SaaS uptime (99.9% SLA simulation) and performance under AI load (e.g., token counting at 1M requests/min)."



8\. Orchestrator Agent

Rationale: Improve oversight with SaaS project management tools integration and proactive bottleneck detection.

Enhancement Prompts:



"In spawning triggers, add SaaS growth signals: Spawn agents for user feedback analysis if METERR hits 100 users per roadmap. Use agile sprints based on METERR\_ROADMAP.md phases."

"Enhance communication: Implement priority queuing in messageQueue for critical paths (e.g., auth before payments). Log decisions with Gantt-style timelines in project-state.md."

"Status tracking: Monitor agent efficiency metrics (e.g., tasks completed per day) and auto-terminate idle agents after 24 hours of inactivity."



Determination on Additional Agents

Based on the current agent setup and METERR's SaaS focus (AI cost management, scaling to enterprise, integrations like Stripe/Supabase), the existing agents cover core development lifecycle aspects well (design, build, test, document, research, orchestration). However, gaps exist in areas typical for SaaS companies, such as product management, marketing, customer engagement, and operations. Adding a few specialized agents would enhance completeness without redundancy, especially for growth phases in METERR\_ROADMAP.md (e.g., Launch and Growth).

Recommended Additional Agents: Yes, add 3 new ones. Names are role-based and similar to SaaS company positions (e.g., like "Product Owner" at Atlassian or "Growth Hacker" at HubSpot). These can be spawned dynamically by the Orchestrator or Spawner, using the agent definition template from AGENT\_GUIDE.md.



Product Manager Agent



Rationale: Handles feature prioritization, user stories, and roadmap alignment—missing from current setup, crucial for SaaS to ensure market fit and iterative releases.

Type: Primary (always active, reports to Orchestrator).

Responsibilities: Prioritize backlog, gather user requirements, update METERR\_ROADMAP.md.

Spawn Example: Use Spawner with objectives like "Align features to solopreneur/enterprise needs, track success metrics like MRR."

Authority: Veto features not aligned with business goals.





Marketing Specialist Agent



Rationale: Supports Phase 2 Launch in roadmap (e.g., SDK release, documentation for users); current agents lack outbound strategies like SEO, content, or A/B testing for marketing site.

Type: Feature-specialist (spawned for growth phases, parent: Builder/Scribe).

Responsibilities: Optimize marketing site code, create campaigns, analyze competitor positioning.

Spawn Example: Objectives: "Develop SEO-optimized content for AI cost savings, integrate with analytics tools."

Authority: Decisions on user-facing messaging.





Operations Engineer Agent



Rationale: Manages deployment, monitoring, and scaling—touched on but not specialized (e.g., for CI/CD, alerts in Validator/Architect); essential for SaaS reliability at 1M users.

Type: Infrastructure-specialist (parent: Architect).

Responsibilities: Set up CI/CD pipelines, monitor infrastructure costs, handle deployments.

Spawn Example: Objectives: "Automate Vercel deploys, integrate with Supabase monitoring for cost alerts."

Authority: Deployment approvals and scaling plans.







These additions keep the system lean (total primary agents: 9, with sub-agents as needed). If implemented, update agent-registry.json and use the Spawner script from AGENT\_GUIDE.md. No further agents are needed at this stage to avoid overlap.


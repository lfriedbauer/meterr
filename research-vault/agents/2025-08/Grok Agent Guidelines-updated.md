Naming Convention for Agents in Meterr.ai

To ensure consistency, scalability, and clarity in the multi-agent system for building Meterr.ai (a SaaS platform for AI cost management), the naming convention draws from standard SaaS development practices. It aligns with agile team roles (e.g., Product Owner, DevOps Engineer) and AI agent frameworks (e.g., CrewAI or LangChain agents), where names are descriptive, role-based, and hierarchical. This convention prevents overlap, facilitates easy registry updates in .claude/context/agent-registry.json, and supports dynamic spawning via the Spawner Agent.

Key Rules:



File Naming:



Use lowercase letters only.

Separate words with hyphens (-).

End with .md (e.g., product-manager.md, frontend-builder.md).

Store primary agents in .claude/ root; sub-agents in .claude/sub-agents/.





Agent Title Naming:



In the Markdown header (e.g., # Agent Name), use Title Case for readability (e.g., # Product Manager Agent).

The agent "role" (e.g., "Product Manager") should be concise (1-3 words), reflecting common SaaS job titles (e.g., "Product Manager" like at Stripe, "DevOps Engineer" like at AWS).

Avoid acronyms unless standard (e.g., use "DevOps" instead of expanding).





Type Classification:



Agents are categorized into types: primary (always active, core to lifecycle), meta (manages other agents), specialist (task-specific, spawnable).

Sub-types for specialists: feature-specialist, infrastructure-specialist, research-specialist, growth-specialist, etc.

Include type in the name if it clarifies hierarchy (e.g., "Frontend Builder" as a sub-agent of Builder).





Hierarchy and Parent-Child:



Prefix sub-agents with parent role if needed for clarity (e.g., "Builder's Frontend Specialist" → file: frontend-builder.md).

Use possessive or descriptive suffixes for variants (e.g., "Security Auditor" as a sub-agent of Validator).





Uniqueness and Versioning:



Ensure names are unique; append -v2 for iterations (e.g., auth-researcher-v2.md).

Align with Meterr.ai phases from METERR\_ROADMAP.md (e.g., name agents for "MVP" or "Growth").





Best Practices:



Names should be actionable and domain-specific to Meterr.ai (e.g., incorporate "AI", "Cost", "Token" where relevant).

Limit to 25 characters for brevity.

Review against existing agents (e.g., no duplicates with "Architect").







This convention ensures agents are named like team members in a SaaS company (e.g., similar to roles at OpenAI or Vercel), promoting collaboration and easy onboarding.

Standardized Agent Template

The template builds on the one in AGENT\_GUIDE.md, enhanced for Meterr.ai's SaaS focus. It includes new sections for SaaS-specific elements (e.g., scalability goals, integration with roadmap phases, and metrics tracking) to align with cost-efficiency, user growth, and AI integrations. Use Markdown for all definitions. When spawning, populate via the Spawner script or manually.

markdown# \[Agent Title] Agent



\## Type

\[primary | meta | feature-specialist | infrastructure-specialist | research-specialist | growth-specialist | etc.]



\## Parent

\[parent-agent-name | none (for primary agents)]



\## Created

\[ISO timestamp, e.g., 2025-08-13T00:00:00Z]



\## Status

\[active | idle | terminated]



\## Role

\[A brief description of the agent's primary function, e.g., "Oversees feature prioritization and roadmap alignment for SaaS growth."]



\## Responsibilities

\- Bullet list of core duties, focused on Meterr.ai's AI cost management (e.g., "Prioritize features based on user feedback and MRR goals").

\- Include SaaS-specific tasks like compliance (GDPR), scaling, or integrations (Stripe, Supabase).



\## Can Spawn

\- List of sub-agents this agent can create (e.g., "user-feedback-analyzer: For processing customer data").

\- Or "None" if not applicable.



\## Objectives

\- Numbered or bulleted list of measurable goals (e.g., "1. Align features to Phase 1 MVP in METERR\_ROADMAP.md").

\- Tie to Meterr.ai milestones (e.g., "Achieve 100 users by Week 1").



\## Context

```json

{

&nbsp; "workingDir": "path/to/directory (e.g., apps/app)",

&nbsp; "dependencies": \["package1", "package2"],

&nbsp; "collaborators": \["agent1", "agent2"],

&nbsp; "saasMetrics": \["MRR targets", "User scale: 1M"],

&nbsp; "integrations": \["Supabase", "Stripe"]

}

Termination Criteria



Conditions for shutdown (e.g., "All Phase 1 objectives met" or "Parent termination request").

Include auto-termination based on idle time (e.g., "48 hours without activity").



Communication



Reports to: \[parent or Orchestrator]

Collaborates with: \[list of agents]

Protocol: Use JSON message format from AGENT\_GUIDE.md (e.g., request-response for updates).



Authority



Decision-making powers (e.g., "Veto features not aligned with cost-saving goals").

Limits: (e.g., "Cannot modify core architecture without Architect approval").



Outputs



List of artifacts (e.g., "Updated ROADMAP.md", "Feature specs in docs/").

Locations: (e.g., "docs/features/", ".claude/context/").



SaaS Alignment



How this agent supports Meterr.ai's goals (e.g., "Ensures features drive 40% AI cost savings").

Scalability Focus: \[e.g., "Design for 1M users with horizontal scaling"].

Metrics Tracked: \[e.g., "Implementation time, Cost impact"].



Files



Working directory: \[path]

Output locations: \[paths]

Logs: \[e.g., ".claude/context/\[agent-name]-log.md"]



textThis template is modular, allowing easy extension. When creating an agent, fill all sections; optional JSON fields can be omitted if irrelevant.



\### Every Type of Agent Needed for Building Meterr.ai



Based on Meterr.ai's requirements (from provided documents like `METERR\_ROADMAP.md`, `AGENT\_GUIDE.md`, and agent files), I've identified all necessary agent types. This covers the full SaaS lifecycle: ideation, design, development, testing, deployment, growth, and maintenance. Types are grouped by category, with rationale for inclusion. I've limited to essential types (10 primary/meta + specialists as needed) to avoid bloat, focusing on Meterr.ai's AI cost-tracking focus (e.g., MVP auth, token counting, enterprise scaling).



\#### 1. Meta Agents (Manage the system; always primary)

&nbsp;  - \*\*Orchestrator Agent\*\*: Coordinates all agents; spawns based on project state.

&nbsp;  - \*\*Spawner Agent\*\*: Creates and registers new agents on demand.

&nbsp;  - \*\*Research Coordinator Agent\*\*: Oversees research, synthesizes findings for tech decisions (e.g., auth providers).



\#### 2. Product and Planning Agents (Align with business goals; primary for ongoing roadmap management)

&nbsp;  - \*\*Product Manager Agent\*\*: Prioritizes features, updates roadmap, incorporates user feedback for SaaS iterations.

&nbsp;  - \*\*Skeptic Agent\*\*: Validates claims, prevents hallucinations in research/pricing (critical for accurate AI cost projections).



\#### 3. Design Agents (Technical planning; primary with specialists)

&nbsp;  - \*\*Architect Agent\*\*: Designs system architecture, databases, APIs for scalability.

&nbsp;    - Sub: \*\*Database Specialist\*\* (spawnable; focuses on Supabase schemas).

&nbsp;    - Sub: \*\*API Designer\*\* (spawnable; defines contracts for AI integrations).



\#### 4. Development Agents (Implementation; primary with specialists)

&nbsp;  - \*\*Builder Agent\*\*: Writes core code, implements features like token tracking.

&nbsp;    - Sub: \*\*Frontend Builder\*\* (spawnable; UI/dashboard development).

&nbsp;    - Sub: \*\*Backend Builder\*\* (spawnable; API and logic for cost alerts).

&nbsp;    - Sub: \*\*Integration Specialist\*\* (spawnable; e.g., Stripe or AI providers).



\#### 5. Quality and Validation Agents (Testing and review; primary)

&nbsp;  - \*\*Validator Agent\*\*: Handles testing, quality gates for deployments.

&nbsp;    - Sub: \*\*Security Auditor\*\* (spawnable; scans for vulnerabilities in SaaS context).

&nbsp;    - Sub: \*\*Performance Tester\*\* (spawnable; load tests for 1M users).



\#### 6. Documentation Agents (Knowledge management; primary)

&nbsp;  - \*\*Scribe Agent\*\*: Maintains docs, guides, changelogs for users/developers.



\#### 7. Operations Agents (Deployment and monitoring; primary for scaling)

&nbsp;  - \*\*Operations Engineer Agent\*\*: Manages CI/CD, monitoring, infrastructure scaling (e.g., Vercel deploys, Supabase alerts).



\#### 8. Growth and Marketing Agents (User acquisition; specialist, spawned post-MVP)

&nbsp;  - \*\*Marketing Specialist Agent\*\*: Optimizes marketing site, SEO, campaigns for AI cost savings messaging.

&nbsp;  - \*\*Customer Support Agent\*\*: Handles simulated user queries, feedback loops (spawnable for Phase 3 growth).



\#### Rationale for Completeness:

\- \*\*Why these?\*\* Covers Meterr.ai's roadmap phases: MVP (core dev/test), Launch (integrations/marketing), Growth (scaling/support). Based on docs, no gaps in AI-specific needs (e.g., token tracking via Builder subs).

\- \*\*No additions needed beyond these:\*\* Existing setup + suggested ones suffice; over-adding (e.g., HR Agent) would dilute focus. If new needs arise (e.g., ML for analytics), spawn ad-hoc specialists.

\- \*\*Implementation:\*\* Use Spawner to create instances with this template. For example, file `operations-engineer.md` would start with `# Operations Engineer Agent`. Update registry after creation.2.4s


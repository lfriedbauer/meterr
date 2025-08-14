To ensure your multi-agent system for Meterr.ai is well-documented, we can build on our existing Scribe Agent as the core maintainer. This agent is already designed for documentation responsibilities, so the process leverages it while incorporating best practices from AI development guidelines. The goal is clarity, maintainability, and automation to prevent outdated docs—common pitfalls like ambiguous instructions or untracked changes that lead to hallucinations or inefficiencies.



Centralize Documentation with the Scribe Agent

Assign the Scribe Agent as the "Documentation Guardian" for the entire system. Update its definition file (scribe.md) with an enhanced protocol to handle all agent-related docs proactively. This includes generating, updating, and versioning files in standardized locations like docs/, .claude/context/, and package READMEs.



Key Updates to Scribe's Responsibilities:



Automatically scan for changes in agent files (e.g., via Orchestrator notifications) and update central docs like AGENT\_GUIDE.md and METERR\_ROADMAP.md.

Use Markdown for consistency, with Mermaid diagrams for agent hierarchies and workflows.

Implement version control: Append semantic versioning (e.g., v1.1) to docs and log changes in CHANGELOG.md.

Generate "Claude-Friendly" summaries: Create concise prompt-compatible excerpts (e.g., in .claude/context/claude-instructions.md) that Claude can reference directly, including few-shot examples for tasks.







Example Prompt Addition to Scribe.md (Under ## Feedback and Improvement Protocol):

"You are the Scribe Agent, ensuring all documentation is crystal-clear, up-to-date, and optimized for AI like Claude to execute tasks without ambiguity. After any system change (e.g., new agent spawned),: 1. Review affected files. 2. Update docs with step-by-step explanations, examples, and edge cases. 3. Self-audit: 'Is this doc simple, transparent, and actionable for Claude?' 4. Solicit feedback from Orchestrator or human. 5. Log updates in CHANGELOG.md with metrics (e.g., 'Doc Coverage: 95%')."

This aligns with best practices for prompt templates that are flexible and scalable, reducing maintenance overhead by using variables for dynamic updates.

Step 2: Standardize Documentation Structure Across the System

Adopt a unified format for all agent docs to make them easy for Claude to parse and act on. Build on your existing agent template, ensuring every file includes sections for prompts, interactions, and maintenance notes. This prevents drift and keeps "Claude code" (AI-driven coding) informed.



Enhanced Agent Template Additions:



\## Prompts and Instructions: List all core prompts with few-shot examples, role definitions, and chain-of-thought steps. E.g., "Prompt: 'As the Builder Agent, implement \[feature] following these steps: 1. Analyze specs...'"

\## Maintenance and Updates: Include a changelog subsection and triggers for reviews (e.g., "Review quarterly or after roadmap phase changes").

\## Claude Integration Notes: Specify how Claude should use this agent (e.g., "Reference this file in prompts for code generation; escalate ambiguities to Orchestrator").





Central Knowledge Base:



Maintain a master file like .claude/context/system-overview.md that summarizes all agents, hierarchies, and workflows. Scribe updates it via broadcasts from the Orchestrator.

Use tools like your Code Execution tool (if integrated) to auto-generate doc snippets, e.g., running scripts to extract prompt examples.







This structure promotes transparency by explicitly documenting planning steps and roles, helping Claude stay on top of complex multi-agent interactions. Start simple: Document one agent at a time, then scale to the full system.

Step 3: Implement Automated Feedback Loops for Documentation

To "stay on top" of docs, embed continuous improvement via your existing feedback prompts. This ensures docs evolve with the system, catching issues like outdated prompts early.



Feedback Loop Process:



Trigger: After tasks (e.g., agent spawning or code implementation), Scribe solicits reviews: "Output doc update. Feedback: Does this clarify instructions for Claude? Score 0-100."

Reviewers: Route to Skeptic (for hallucination checks), Validator (for accuracy), or human via Orchestrator escalation.

Logging and Iteration: Log in .claude/context/doc-feedback-log.md with metrics (e.g., "Clarity Score: 92%; Action: Added edge case examples"). Use quantitative evals like task success rates to measure doc effectiveness.

Automation: Orchestrator monitors changes (e.g., via registry updates) and pings Scribe: "Update docs for new Marketing Agent; include prompt examples."







Incorporate guardrails: Document edge cases (e.g., "If prompt ambiguous, default to clarification request") and use trace visibility tools if available (e.g., integrate logging for Claude's reasoning steps). This mirrors real-world practices where evaluation platforms track doc performance over time.

Step 4: Handle Multi-Agent Specifics and Scaling

For multi-agent aspects:



Document Interactions: In AGENT\_GUIDE.md, add sections on communication protocols (e.g., JSON messages) with examples. Use tables for hierarchies: | Agent | Parent | Key Prompts |.

Prompt Engineering Docs: Create a dedicated docs/prompt-best-practices.md managed by Scribe, covering tips like "Keep prompts concise, use markdown for structure, and include role-playing." Assign clear roles to avoid overlap.

Versioning and Audits: Scribe runs quarterly audits: "Scan for outdated docs; propose updates." Tie to METERR\_ROADMAP.md phases (e.g., post-Phase 1, review all agent prompts).



Potential Enhancements



Tools Integration: If Claude has access (e.g., via your setup), use web\_search for external best practices or code\_execution to validate doc-generated code snippets.

Add a Doc Auditor Sub-Agent: If needed, spawn under Scribe: Type: specialist; Role: "Audit docs for clarity and completeness."



This approach keeps documentation dynamic, ensuring Claude always has clear, actionable guidance while minimizing manual effort through agent automation. If you implement these, start by updating Scribe.md and running a full system doc sync.


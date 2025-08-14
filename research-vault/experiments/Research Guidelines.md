Add a New Subsection: "Research Tool Guidelines" (Under "Validation Requirements" or "Execution Protocol")

This is the core addition to guide tool selection. Place it after the "Anti-Hallucination Protocol" section for visibility.



\#### Research Tool Guidelines

To ensure efficient, directed research, prioritize MCP servers (Model Context Protocol) for all chained, context-heavy, or multi-step queries. MCP handles persistent context, prompt chaining, and server-side optimization to reduce redundant searches and improve accuracy.



\- \*\*When to Use MCP Servers\*\*:

&nbsp; - For complex tasks: Chain searches (e.g., start with semantic overview, then site-specific browse, finally profitability modeling).

&nbsp; - Examples: Competitor deep analysis (Step 3: Discovery → Relevance → Deep Analysis → Integrations); persona development (forum sentiment → review extraction → hypothesis building).

&nbsp; - Implementation: Route queries via MCP API calls (e.g., mcp\_chain\_query with args: query, chain\_steps=\[step1, step2], context\_persist=true). Use server endpoints from your infrastructure (e.g., Vercel/Supabase-hosted MCP).

&nbsp; - Benefits: Maintains state across agents (e.g., share context from Research Coordinator to Skeptic); optimizes for hybrids like pricing simulations (e.g., Model 100 customers with persistent variables).



\- \*\*Fallback to Standard Tools\*\*:

&nbsp; - If MCP is unavailable (e.g., server downtime), escalate to Operations Engineer (or human engineer) for immediate fixing; note in outputs: "MCP issue detected; escalating to engineer for resolution." After fix attempt, retry MCP query. If still unavailable post-fix, default to Claude tools (e.g., web\_search) and note: "Fallback used due to unresolved MCP issue; escalated to CEO for monitoring."

&nbsp; - Limits: For all tools, cap num\_results=5-10; use operators (e.g., site:reddit.com, min\_faves:5) for precision.



\- \*\*General Rules\*\*:

&nbsp; - Always cite sources inline (e.g., via render\_inline\_citation if available) and mark low-confidence as "HYPOTHESIS."

&nbsp; - Escalate blockers: If searches yield poor results, pivot and document (e.g., "MCP chain failed; tried web\_search alternative").

&nbsp; - Tie to Protocol: Use MCP for evidence trails in outputs (e.g., append to /evidence/ folders).



2\. Update Specific Steps to Reference MCP

Modify existing steps to explicitly call out MCP usage, ensuring agents like Claude don't default to excessive web searches.



In Step 3: Competitor Discovery \& Analysis (Under Phase 1):

Add to the Task description:

text- \*\*Research Method\*\*: Use MCP servers for chained analysis (e.g., chain x\_semantic\_search for sentiment → web\_search\_with\_snippets for reviews → browse\_page for site details). Fallback to individual tools if needed.



In Step 4: Market Research \& Persona Development (Under Phase 1):

Add to "How AI Agents Actually Research":

text5. \*\*MCP Optimization\*\*: For all public analyses, route through MCP to chain tools (e.g., semantic search on forums → snippet extraction from reviews → hypothesis synthesis). This ensures context persistence and reduces broad web queries.



In Step 9: Comprehensive Pricing Study (Under Phase 4, assuming from truncated prompt):

Add:

text- \*\*Modeling Method\*\*: Use MCP for simulations (e.g., chain code\_execution for 100-customer models with persistent data from prior searches). Include sensitivity tests via MCP chaining.



In Agent Responsibilities (Under the section listing agents):

Update relevant agents:

text- \*\*Research Coordinator\*\*: Customer research execution; prioritize MCP for chained public source queries.

\- \*\*Orchestrator\*\*: Coordinate tasks; route complex searches to MCP servers and handle fallbacks.

\- \*\*Data Engineer\*\*: Analytics setup; integrate MCP for profitability modeling chains.





3\. Add a Quality Gate for Tool Usage (Under "Quality Gates")

To enforce compliance:

text- \*\*Gate 6: Tool Strategy Validation\*\*: Skeptic Agent reviews research outputs for MCP usage (e.g., "Was chaining via MCP applied where appropriate?"). Approve before proceeding to synthesis; ensure no excessive web searches (target <5 per step unless justified).

Why Thes


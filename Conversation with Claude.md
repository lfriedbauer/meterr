Still missing:

Version/Dependency Checks:

When to check package.json for compatible versions
How to verify LLM SDK versions match API requirements
When to update vs stay on specific versions


Language Selection Logic:

When to use Python (gpu_tokenizer.py) vs TypeScript
Why certain scripts are .cjs vs .ts
Decision criteria for language choice


External Code Discovery:

When to check npm for existing token counters
How to evaluate LLM client libraries vs custom implementation
When to look at competitor implementations


Performance Considerations:

When to profile before optimizing
How to check if GPU acceleration is actually faster
Memory usage patterns to watch for


Testing Strategy:

When to check for existing test coverage
How to find and run relevant tests before changes



This version is actionable and project-aware, which is a huge improvement over the generic version.RetryLwhere should i put this? Still missing:
1. Version/Dependency Checks:
   * When to check package.json for compatible versions
   * How to verify LLM SDK versions match API requirements
   * When to update vs stay on specific versions
2. Language Selection Logic:
   * When to use Python (gpu_tokenizer.py) vs TypeScript
   * Why certain scripts are .cjs vs .ts
   * Decision criteria for language choice
3. External Code Discovery:
   * When to check npm for existing token counters
   * How to evaluate LLM client libraries vs custom implementation
   * When to look at competitor implementations
4. Performance Considerations:
   * When to profile before optimizing
   * How to check if GPU acceleration is actually faster
   * Memory usage patterns to watch for
5. Testing Strategy:
   * When to check for existing test coverage
   * How to find and run relevant tests before changesEditBased on your project structure, I'd recommend adding these to .claude/context/ as a new file:
.claude/context/METERR_DEVELOPMENT_DECISIONS.md
This would complement your existing:

METERR_CODING_STANDARDS.md (how to write code)
METERR_PERFORMANCE_OPTIMIZATION.md (optimization guidelines)

The new file would cover when and why to make certain development choices.
Alternative locations:

Add sections to .claude/CLAUDE.md - But it's probably already large
Create .claude/context/TOOL_USAGE_GUIDELINES.md - More specific to tool usage
Expand existing files - Add relevant sections to your current context files

My recommendation: Create the new METERR_DEVELOPMENT_DECISIONS.md file because:

These are cross-cutting concerns that don't fit neatly into coding standards or performance
They're decision criteria rather than rules
They guide tool usage and approach selection
Keeping them separate makes them easier to update

You could structure it like:
markdown# Development Decision Guidelines

## Dependency Management
### When to check versions...

## Language Selection
### Python vs TypeScript...

## External Code Evaluation
### Before building custom...

## Performance Validation
### Before optimizing...

## Testing Requirements
### Before modifying code...
This gives Claude clear decision trees for these scenarios.RetryCLAUDE.md530 linesmdMETERR_CODING_STANDARDS.md228 linesmdMETERR_PERFORMANCE_OPTIMIZATION.md377 linesmdLso add a 3rd file?EditYes, create a third file in .claude/context/:
.claude/context/METERR_DEVELOPMENT_DECISIONS.md
This complements your existing structure perfectly:

CLAUDE.md - Overall instructions and workflow
METERR_CODING_STANDARDS.md - HOW to write code
METERR_PERFORMANCE_OPTIMIZATION.md - Hardware utilization
METERR_DEVELOPMENT_DECISIONS.md - WHEN/WHY to make choices (NEW)

The new file fills the gap between "how to code" and "what hardware to use" by providing decision criteria for:

When to check/update dependencies
When to use Python vs TypeScript vs Node scripts
When to search external sources vs build custom
When to profile before optimizing
When to write vs find tests

This keeps each file focused and maintainable while giving Claude complete context for making informed development decisions.
Then update CLAUDE.md section 13 to reference it:
markdown### Apply These Patterns
1. **ALWAYS** check all three context files before generating code
2. **ALWAYS** use hardware-optimized configurations
3. **ALWAYS** follow code quality standards
4. **ALWAYS** apply development decision criteria
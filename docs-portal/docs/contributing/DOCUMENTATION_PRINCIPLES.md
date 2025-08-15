# Documentation Principles for meterr.ai

## Core Principles

### 1. Single Source of Truth
- **One location** for each piece of information
- **No duplication** between files
- **Clear ownership** of each topic

### 2. Audience-Aware Content
- **Human developers**: Explanatory, with context and examples
- **AI agents**: Concise, structured, operational
- **Shared content**: Tagged appropriately for filtering

### 3. Action-Oriented
- **Start with the task** the reader wants to accomplish
- **Provide exact commands** and code snippets
- **Show expected outcomes** for verification

### 4. Progressive Disclosure
- **Quick start** for immediate needs
- **Deep dives** available but not required
- **Layered information** from essential to advanced

## Documentation Structure

### File Organization
```
/docs-portal/
├── docs/              # Human-focused documentation
│   ├── guides/        # How-to guides (task-oriented)
│   ├── reference/     # API and technical reference
│   ├── concepts/      # Explanations and theory
│   └── tutorials/     # Learning-oriented
└── ai-docs/           # AI-optimized documentation
    ├── context/       # Project state and decisions
    ├── operations/    # Direct instructions
    └── schemas/       # Structured data formats
```

### Document Types

#### 1. Guides (How-to)
- **Purpose**: Help users accomplish specific tasks
- **Structure**: Step-by-step instructions
- **Example**: "How to set up authentication"
- **Audience tags**: Both human and AI

#### 2. Reference
- **Purpose**: Technical descriptions of APIs, configs, schemas
- **Structure**: Systematic, complete, accurate
- **Example**: "API Endpoint Reference"
- **Audience tags**: Primarily AI, formatted for humans

#### 3. Concepts (Understanding)
- **Purpose**: Explain why and how things work
- **Structure**: Narrative, educational
- **Example**: "How token counting works"
- **Audience tags**: Primarily human

#### 4. Context (State)
- **Purpose**: Current project status and decisions
- **Structure**: Structured data, timestamps
- **Example**: "Current implementation status"
- **Audience tags**: Primarily AI

## Writing Standards

### Metadata Requirements
Every document MUST have:
```yaml
---
title: Clear, descriptive title
description: One-line summary
audience: ["human", "ai"] # or one of them
status: draft|ready|deprecated
last_updated: 2025-08-15
owner: team|person responsible
---
```

### Content Guidelines

#### For Human Audience
- **Use active voice**: "Configure the database" not "The database should be configured"
- **Include context**: Why this matters, when to use it
- **Provide examples**: Show actual usage
- **Explain tradeoffs**: Pros, cons, alternatives

#### For AI Audience
- **Be directive**: Direct commands and instructions
- **Use structured data**: Lists, tables, schemas
- **Minimize tokens**: Concise, no redundancy
- **Include validation**: Expected outputs, success criteria

### Version Control
- **Track changes**: Use git history as documentation log
- **Date everything**: Include last_updated in frontmatter
- **Mark deprecation**: Clear warnings for outdated content
- **Migration paths**: How to update from old approaches

## Quality Standards

### Completeness Checklist
- [ ] Has clear purpose statement
- [ ] Includes prerequisites
- [ ] Provides step-by-step instructions
- [ ] Shows expected results
- [ ] Lists common errors and solutions
- [ ] Links to related topics

### Accuracy Requirements
- **Code samples**: Must be tested and working
- **Commands**: Copy-paste ready
- **Versions**: Specify tool and dependency versions
- **Updates**: Review quarterly or after major changes

### Clarity Metrics
- **Reading level**: 8th grade for explanations
- **Sentence length**: Max 25 words
- **Paragraph length**: Max 5 sentences
- **Technical terms**: Define on first use

## Maintenance Process

### Regular Reviews
- **Weekly**: API reference, current sprint docs
- **Monthly**: Guides and how-tos
- **Quarterly**: Concepts and architecture
- **On-change**: Update immediately when code changes

### Deprecation Process
1. Mark as deprecated with date
2. Add migration guide
3. Keep for 3 months
4. Archive (don't delete)

### Feedback Loop
- Track "documentation not found" errors
- Monitor search queries
- Review support tickets for doc gaps
- Measure time-to-find metrics

## Anti-Patterns to Avoid

### ❌ Don't Do This
- **Duplicate information** across multiple files
- **Mix audiences** without clear separation
- **Write novels** when bullets work
- **Assume knowledge** without stating prerequisites
- **Use jargon** without definitions
- **Create deep nesting** (max 3 levels)
- **Forget to update** when code changes

### ✅ Do This Instead
- **Single source** with references
- **Tag content** for audience filtering
- **Use progressive disclosure**
- **State prerequisites** upfront
- **Define terms** in glossary
- **Keep hierarchy flat**
- **Automate updates** where possible

## Success Metrics

### Quantitative
- **Find time**: < 30 seconds to locate information
- **Coverage**: 100% of public APIs documented
- **Freshness**: 100% updated within 7 days of change
- **Duplication**: 0% redundant content

### Qualitative
- **Clarity**: New developers productive in < 1 day
- **Completeness**: No "missing documentation" tickets
- **Usability**: Positive feedback from users
- **AI-friendly**: Claude/GPT can use docs effectively

## Implementation Priority

### Phase 1: Foundation (Now)
1. Apply these principles to existing docs
2. Remove all duplication
3. Add proper metadata
4. Organize by document type

### Phase 2: Enhancement (This Week)
1. Fill critical gaps
2. Add code examples
3. Create quick start guide
4. Set up search

### Phase 3: Automation (This Month)
1. Auto-generate from code
2. Link docs to code
3. Add validation tests
4. Create feedback system

---

*These principles guide all documentation decisions for meterr.ai*
*Last updated: 2025-08-15*
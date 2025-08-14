---
title: Document Decision Framework
description: Guidelines for when to create new docs vs. extend existing ones
audience: ["human", "ai"]
status: ready
last_updated: 2025-01-14
owner: documentation
---

# Document Decision Framework

## When to CREATE New Document

### Size Threshold
- **Topic >500 lines** and self-contained
- **Complex workflow** requiring multiple sections
- **Standalone reference** that others will link to

### Audience Separation
- **Different audience** than existing docs
- **Mixed audience needs** requiring different explanation levels
- **Specialized knowledge** (security, compliance, legal)

### Focus & Cohesion
- **Would make parent doc unfocused** or too broad
- **Distinct purpose** from existing documentation
- **Future expansion** likely (plugins, integrations, etc.)

### Examples of New Doc Creation
```
✅ security-checklist.md
- 500+ lines of security procedures
- Different audience (security team + developers)
- Distinct purpose from general coding standards

✅ api-design-standards.md  
- Comprehensive API guidelines
- Mixed audience (human + AI)
- Would dilute coding-standards.md focus

✅ error-handling-playbook.md
- AI-specific operational procedures
- 400+ lines of detailed patterns
- Distinct from general development guide
```

## When to ADD to Existing Document

### Natural Extension
- **<200 lines addition** to existing doc
- **Logical extension** of current content
- **Same level of detail** as parent document

### Audience Alignment
- **Same target audience** as existing doc
- **Same purpose and context**
- **Complementary information**

### Document Cohesion
- **Strengthens existing document** focus
- **Related concepts** that belong together
- **Cross-references** within same doc make sense

### Examples of Extension
```
✅ Add to coding-standards.md:
- New TypeScript patterns (same audience)
- Additional linting rules (same purpose)
- Performance tips (related to code quality)

✅ Add to deployment-guide.md:
- New environment setup steps
- Additional Vercel configuration
- Rollback procedures (deployment-related)

❌ Don't add to coding-standards.md:
- Business strategy content (wrong audience)
- Database schema design (different purpose)
- Marketing guidelines (unrelated context)
```

## Naming Convention Rules

### Strategic/Business Documents
**Format**: `UPPERCASE.md`
**Audience**: Usually `["human"]`
**Examples**:
- `MARKET_VALIDATION_REPORT.md`
- `GO_TO_MARKET.md`
- `MISSION_STATEMENT.md`
- `MVP_SPEC.md` (mixed business/technical)

### Technical/Implementation Documents
**Format**: `lowercase-with-hyphens.md`
**Audience**: Usually `["human", "ai"]` or `["ai"]`
**Examples**:
- `coding-standards.md`
- `api-design-standards.md`
- `error-handling-playbook.md`
- `security-checklist.md`

### Mixed Purpose → Split Strategy
When a document serves both strategic and technical purposes:

```
❌ Single mixed document:
business-and-technical-requirements.md

✅ Split into focused documents:
BUSINESS_REQUIREMENTS.md    # Strategic, human audience
technical-implementation.md # Technical, mixed audience
```

## Decision Tree

```
Is the content >500 lines?
├─ YES → Consider new document
└─ NO → Can it extend existing doc?
    ├─ YES → Add to existing
    └─ NO → Create new if distinct purpose

Different audience than existing docs?
├─ YES → Create new document
└─ NO → Consider extending existing

Would it make parent doc unfocused?
├─ YES → Create new document
└─ NO → Add to existing document

Is it a distinct, standalone topic?
├─ YES → Create new document
└─ NO → Add to existing document
```

## Content Organization Guidelines

### Document Structure
Every document should follow this structure:
```markdown
---
title: Clear, descriptive title
description: One-line summary of content
audience: ["human", "ai"] # or specific audience
status: ready|draft|deprecated
last_updated: YYYY-MM-DD
owner: team|person responsible
---

# Document Title

## Overview (if needed)
Brief introduction for human readers

<!-- audience: ai -->
## AI Context (if mixed audience)
Concise, structured information for AI

<!-- audience: human -->
## Detailed Information (if mixed audience)
Explanatory content for humans

## Main Content Sections
Organized logically with clear headings
```

### Cross-Reference Strategy
- **Link to related docs** in introduction
- **Reference specific sections** with anchors
- **Avoid duplicating** content across documents
- **Use relative paths** for internal links

### Maintenance Considerations
- **Single owner** per document to avoid conflicts
- **Regular review schedule** based on document type
- **Clear deprecation process** for outdated content
- **Version control** for breaking changes

## Quality Checklist

Before creating a new document:
- [ ] Checked if existing doc could be extended
- [ ] Confirmed distinct audience or purpose
- [ ] Named according to convention (UPPERCASE/lowercase)
- [ ] Added proper frontmatter with audience tags
- [ ] Structured for target audience needs
- [ ] Included cross-references to related docs
- [ ] Verified no content duplication
- [ ] Assigned clear ownership

Before extending existing document:
- [ ] Confirmed same audience and purpose
- [ ] Verified addition <200 lines
- [ ] Checked document cohesion maintained
- [ ] Updated table of contents if needed
- [ ] Maintained consistent voice and style
- [ ] Added cross-references where appropriate

## Common Anti-Patterns to Avoid

### ❌ Don't Do This
- **Create tiny documents** (<100 lines) that could be sections
- **Mix strategic and technical** content without clear separation
- **Duplicate information** across multiple documents
- **Create documents without clear ownership**
- **Ignore naming conventions** based on document purpose
- **Write for wrong audience** (technical details in business docs)

### ✅ Do This Instead
- **Consolidate related short content** into comprehensive guides
- **Use audience tags** to separate content types within documents
- **Link to canonical source** instead of duplicating
- **Assign clear ownership** in frontmatter
- **Follow naming conventions** consistently
- **Match content to audience** needs and expectations

---
*Use this framework to maintain clean, organized documentation across meterr.ai*
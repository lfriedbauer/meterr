# Research Vault

Simple storage repository for all AI/LLM research interactions.

## Purpose
- Store raw LLM responses and queries
- Organize research by topic and date
- Provide searchable archive of all AI interactions

## Structure
```
research-vault/
├── 2025-01/           # By month for chronological organization
├── 2025-02/
└── topics/            # Optional topic-based organization
    ├── documentation/
    ├── architecture/
    └── implementation/
```

## Usage
1. All research queries are saved here with timestamp
2. Files tracked with Git LFS if > 1MB
3. Auto-archived to compressed format after 30 days

## Extracting Insights
When extracting information from this vault, follow the documentation principles in:
`/docs-portal/docs/contributing/DOCUMENTATION_PRINCIPLES.md`

This determines whether extracted content goes to:
- `.claude/context/` - AI-focused operational instructions
- `docs/` - Human-focused explanations

## Note
This is storage only. No documentation rules here - those are defined in DOCUMENTATION_PRINCIPLES.md (single source of truth).
# Directory Cleanup Plan

## Current Issues

### 🚫 Inappropriate in Root
| Item | Issue | Action |
|------|-------|--------|
| `ngrok.exe` (25MB!) | Executable in root | Move to `tools/external/` |
| `DOCS_REVIEW_RESULTS.md` | Status file | Delete (use git history) |
| `DOCUMENTATION_STRUCTURE.md` | Temp planning file | Move to `docs-portal/docs/contributing/` |
| `LLM_PROMPTS_FOR_PIVOT.md` | Working doc | Keep (strategic) |
| `PIVOT_QUESTIONS.md` | Working doc | Keep (strategic) |

### 📁 Directory Analysis

#### `n8n-workflows/` ❌ Incorrect Location
- **Current:** Root level
- **Contains:** `helicone-webhook.json`
- **Should be:** `tools/n8n/workflows/`
- **Reason:** n8n is a tool, not core project

#### `analysis-reports/` ❌ Incorrect Location
- **Current:** Root level
- **Contains:** `python-analysis-2025-08-15T08-21-11-549Z.json`
- **Should be:** `research-vault/analysis/` or delete
- **Reason:** Research artifacts belong in research-vault

#### `archive/` ✅ Acceptable
- **Current:** Root level with `optimization/` subfolder
- **Contains:** Old optimization files
- **Status:** OK for historical files
- **Alternative:** Could move to `.archive/` to hide

#### `infrastructure/` ✅ Correct
- **Current:** Root level
- **Contains:** Supabase and deployment configs
- **Status:** Correct location for infra code

## Recommended Structure

```
meterr/
├── apps/                    ✅ Applications
├── packages/                ✅ Shared packages
├── docs-portal/             ✅ All documentation
├── infrastructure/          ✅ Deployment & cloud configs
├── tools/                   ✅ Development tools
│   ├── n8n/
│   │   └── workflows/       ← Move n8n-workflows here
│   ├── external/
│   │   └── ngrok.exe        ← Move executable here
│   └── monitoring/
├── research-vault/          ✅ Research & experiments
│   └── analysis/            ← Move analysis-reports here
├── archive/                 ✅ Historical files (or .archive/)
├── mcp-servers/             ✅ MCP configurations
├── scripts/                 ✅ Utility scripts
├── ui/                      ✅ Component library
└── [config files]           ✅ Root configs only
```

## Cleanup Commands

```bash
# 1. Move n8n workflows
mkdir -p tools/n8n/workflows
mv n8n-workflows/* tools/n8n/workflows/
rmdir n8n-workflows

# 2. Move analysis reports
mkdir -p research-vault/analysis
mv analysis-reports/* research-vault/analysis/
rmdir analysis-reports

# 3. Move ngrok executable
mkdir -p tools/external
mv ngrok.exe tools/external/

# 4. Clean up documentation files
rm DOCS_REVIEW_RESULTS.md  # Delete status file
mv DOCUMENTATION_STRUCTURE.md docs-portal/docs/contributing/

# 5. Optional: Hide archive
mv archive .archive
```

## Files That Should Stay in Root

### ✅ Keep These
- `.env`, `.env.example`, `.env.local` - Environment configs
- `.gitignore`, `.gitattributes` - Git configs
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` - Package management
- `tsconfig.json`, `tsconfig.base.json` - TypeScript configs
- `nx.json`, `turbo.json` - Build tools
- `docker-compose.yml` - Docker services
- `README.md`, `CHANGELOG.md` - Project meta
- `PIVOT_QUESTIONS.md`, `LLM_PROMPTS_FOR_PIVOT.md` - Strategic docs (temporary OK)

### ❌ Remove/Move These
- `ngrok.exe` → `tools/external/`
- `DOCS_REVIEW_RESULTS.md` → Delete
- `DOCUMENTATION_STRUCTURE.md` → `docs-portal/docs/contributing/`

## Summary

**Inappropriate directories:**
1. `n8n-workflows/` → Move to `tools/n8n/workflows/`
2. `analysis-reports/` → Move to `research-vault/analysis/`

**Inappropriate files:**
1. `ngrok.exe` → Move to `tools/external/`
2. Status/temp docs → Delete or move to docs-portal

**Correct locations:**
- `infrastructure/` ✅
- `archive/` ✅ (though could be `.archive/`)

**Impact:** Removes 25MB from root, better organization
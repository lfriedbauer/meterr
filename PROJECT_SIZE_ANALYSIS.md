# Project Size Analysis - meterr

## Current Size: 2.3GB

### Size Breakdown:

```
1.8GB  ./node_modules (root)
339MB  ./docs-portal/node_modules
160MB  ./apps/app/.next (build cache)
14MB   ./.git
11MB   ./tools/monitoring/collector/node_modules
11MB   ./metrics/node_modules
~40MB  Other small node_modules (15 total)
~30MB  Source code and documentation
```

## Why So Large?

### 1. **Multiple node_modules (15 directories!)**
- Root node_modules: 1.8GB
- docs-portal: 339MB (Docusaurus is heavy)
- Duplicate monitoring modules: 22MB total
- Each package has its own node_modules

### 2. **Heavy Dependencies**
Found in root node_modules:
- TensorFlow.js: 167MB+
- ONNX Runtime: 85MB
- Hugging Face Transformers: 44MB
- Storybook: 38MB
- Next.js: 144MB

### 3. **Build Artifacts**
- apps/app/.next: 160MB
- .turbo cache: minimal
- No proper cleanup of old builds

## Optimal Size: ~500MB

### Immediate Actions to Reduce Size:

#### 1. Remove Unnecessary Dependencies (Save ~1GB)
```bash
# Remove ML/AI libraries not needed for MVP
pnpm remove @tensorflow/tfjs @huggingface/transformers onnxruntime-web

# Remove Storybook if not using
pnpm remove storybook @storybook/*

# Remove duplicate monitoring
rm -rf metrics/node_modules tools/monitoring/collector/node_modules
```

#### 2. Use pnpm Workspace Properly (Save ~400MB)
```bash
# Deduplicate dependencies
pnpm dedupe

# Clean and reinstall
rm -rf node_modules **/node_modules
pnpm install

# Use shared dependencies
pnpm config set shared-workspace-lockfile=true
```

#### 3. Move docs-portal to Separate Repo (Save ~340MB)
- Docusaurus doesn't need to be in main project
- Can be deployed separately on Vercel

#### 4. Clean Build Artifacts (Save ~160MB)
```bash
# Add to package.json
"clean:all": "rm -rf apps/app/.next .turbo **/dist **/build"

# Run before commits
pnpm clean:all
```

#### 5. Use .gitignore Properly
Add to .gitignore:
```
# Build outputs
.next/
.turbo/
dist/
build/

# Dependencies
node_modules/
.pnpm/

# Logs
*.log

# Cache
.cache/
*.cache
```

## Recommended Project Structure

```
meterr/ (500MB total)
├── apps/           # Next.js apps
├── packages/       # Shared packages
├── node_modules/   # Single, deduped (400MB)
├── .git/          # (14MB)
└── source code    # (~80MB)

meterr-docs/ (separate repo)
├── docs-portal/   # Docusaurus
└── node_modules/  # (340MB)
```

## Step-by-Step Cleanup

```bash
# 1. Remove heavy unused dependencies
pnpm remove @tensorflow/tfjs @huggingface/transformers onnxruntime-web storybook

# 2. Clean all build artifacts
rm -rf apps/app/.next .turbo **/dist **/build

# 3. Remove duplicate node_modules
rm -rf metrics/node_modules tools/monitoring/collector/node_modules

# 4. Deduplicate and reinstall
pnpm dedupe
rm -rf node_modules **/node_modules
pnpm install

# 5. Check new size
du -sh .
```

## Expected Result

After cleanup:
- **Root node_modules**: ~400MB (from 1.8GB)
- **No duplicate modules**: 0MB (from 400MB)
- **No build artifacts**: 0MB (from 160MB)
- **Total project**: ~500MB (from 2.3GB)

**Savings: 1.8GB (78% reduction)**
# Development UI Tools

This directory contains UI tools that aid in development but aren't part of the production application.

## Tools Included

### 1. Storybook (Component Development)
For isolated component development and documentation.

### 2. React DevTools Standalone
For debugging React components during development.

### 3. Bundle Analyzer
For analyzing and optimizing bundle sizes.

## Installation

These tools are installed globally or in the tools directory to keep the main app clean.

### Storybook Setup
```bash
cd tools/dev-ui
npx storybook@latest init
```

### Bundle Analyzer
```bash
cd tools/dev-ui
npm init -y
npm install webpack-bundle-analyzer @next/bundle-analyzer
```

## Usage

### Running Storybook
```bash
cd tools/dev-ui
npm run storybook
```

### Analyzing Bundle
```bash
cd apps/app
ANALYZE=true pnpm build
```

## Why Separate from apps/app?

1. **Keep production bundle clean** - Dev tools don't ship to customers
2. **Shared across projects** - Can be used for marketing site too
3. **Optional installation** - Not every developer needs these
4. **Faster CI/CD** - Production builds don't include dev UI tools
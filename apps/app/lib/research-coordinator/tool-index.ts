import { Document } from 'flexsearch';

/**
 * FlexSearch configuration for research-coordinator agent
 * Optimized for discovering development tools and time-saving solutions
 */

// Document index for comprehensive tool/library search
export const toolIndex = new Document({
  document: {
    id: 'id',
    index: ['name', 'category', 'description', 'use_cases', 'alternatives', 'keywords'],
    store: [
      'name',
      'category',
      'time_saved',
      'implementation_effort',
      'url',
      'pros',
      'cons',
      'integration_type',
    ],
  },
  tokenize: 'forward',
  context: {
    resolution: 9,
    depth: 4,
    bidirectional: true,
  },
  optimize: true,
  cache: 100,
});

// Categories for tool classification
export const TOOL_CATEGORIES = {
  AUTH: 'authentication',
  DB: 'database',
  API: 'api_integration',
  UI: 'ui_components',
  TESTING: 'testing',
  MONITORING: 'monitoring',
  AI_ML: 'ai_ml',
  DEPLOYMENT: 'deployment',
  PAYMENTS: 'payments',
  ANALYTICS: 'analytics',
  SEARCH: 'search',
  REALTIME: 'realtime',
  OPTIMIZATION: 'optimization',
} as const;

// Pre-populated knowledge base of time-saving tools
export const DEVELOPMENT_TOOLS = [
  {
    id: 'clerk',
    name: 'Clerk',
    category: TOOL_CATEGORIES.AUTH,
    description: 'Complete auth solution with beautiful UI components',
    time_saved: '2-3 weeks',
    implementation_effort: '2 hours',
    use_cases: ['user authentication', 'social login', 'MFA', 'user management'],
    alternatives: ['Auth0', 'Supabase Auth', 'Firebase Auth'],
    keywords: ['auth', 'login', 'users', 'authentication', 'oauth'],
    pros: ['Beautiful UI', 'Fast setup', 'Great DX'],
    cons: ['Higher cost at scale', 'Vendor lock-in'],
    integration_type: 'SDK',
    url: 'https://clerk.dev',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: TOOL_CATEGORIES.DB,
    description: 'Open source Firebase alternative with PostgreSQL',
    time_saved: '1-2 weeks',
    implementation_effort: '4 hours',
    use_cases: ['database', 'realtime', 'auth', 'storage'],
    alternatives: ['Firebase', 'PlanetScale', 'Neon'],
    keywords: ['database', 'postgres', 'realtime', 'storage', 'auth'],
    pros: ['All-in-one', 'Open source', 'Good pricing'],
    cons: ['Learning curve', 'Less mature than Firebase'],
    integration_type: 'SDK',
    url: 'https://supabase.com',
  },
  {
    id: 'vercel-ai-sdk',
    name: 'Vercel AI SDK',
    category: TOOL_CATEGORIES.AI_ML,
    description: 'Unified API for all LLM providers with streaming',
    time_saved: '1 week',
    implementation_effort: '1 hour',
    use_cases: ['LLM integration', 'streaming responses', 'multi-provider'],
    alternatives: ['LangChain', 'LlamaIndex', 'Direct APIs'],
    keywords: ['ai', 'llm', 'gpt', 'claude', 'streaming', 'vercel'],
    pros: ['Simple API', 'Great streaming', 'Type-safe'],
    cons: ['Limited features vs LangChain'],
    integration_type: 'SDK',
    url: 'https://sdk.vercel.ai',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    category: TOOL_CATEGORIES.MONITORING,
    description: 'Error tracking and performance monitoring',
    time_saved: '1 week',
    implementation_effort: '30 minutes',
    use_cases: ['error tracking', 'performance monitoring', 'debugging'],
    alternatives: ['LogRocket', 'Rollbar', 'Bugsnag'],
    keywords: ['errors', 'monitoring', 'debugging', 'performance', 'logs'],
    pros: ['Comprehensive', 'Great integrations', 'Free tier'],
    cons: ['Can be expensive', 'Complex setup for advanced features'],
    integration_type: 'SDK',
    url: 'https://sentry.io',
  },
  {
    id: 'posthog',
    name: 'PostHog',
    category: TOOL_CATEGORIES.ANALYTICS,
    description: 'Open source product analytics with session recording',
    time_saved: '2 weeks',
    implementation_effort: '2 hours',
    use_cases: ['analytics', 'session recording', 'feature flags', 'A/B testing'],
    alternatives: ['Mixpanel', 'Amplitude', 'Google Analytics'],
    keywords: ['analytics', 'tracking', 'metrics', 'session', 'recording'],
    pros: ['Open source', 'All-in-one', 'Self-hostable'],
    cons: ['Resource intensive', 'UI less polished'],
    integration_type: 'SDK',
    url: 'https://posthog.com',
  },
  // Code Optimization Tools for Claude Code
  {
    id: 'biome',
    name: 'Biome',
    category: TOOL_CATEGORIES.OPTIMIZATION,
    description: 'Fast formatter and linter for JS/TS, replacement for ESLint + Prettier',
    time_saved: '1 week',
    implementation_effort: '30 minutes',
    use_cases: [
      'code formatting',
      'linting',
      'code quality',
      'performance',
      'claude code optimization',
    ],
    alternatives: ['ESLint + Prettier', 'Rome', 'dprint'],
    keywords: ['formatter', 'linter', 'code quality', 'optimization', 'fast', 'rust'],
    pros: ['10-20x faster than ESLint', 'Single tool', 'Zero config', 'Great for Claude Code'],
    cons: ['Less ecosystem than ESLint', 'Newer tool'],
    integration_type: 'CLI',
    url: 'https://biomejs.dev',
  },
  {
    id: 'oxlint',
    name: 'oxlint',
    category: TOOL_CATEGORIES.OPTIMIZATION,
    description: '50-100x faster JavaScript linter written in Rust',
    time_saved: '3 days',
    implementation_effort: '15 minutes',
    use_cases: ['linting', 'code quality', 'CI/CD speed', 'claude code validation'],
    alternatives: ['ESLint', 'Biome', 'JSHint'],
    keywords: ['linter', 'fast', 'rust', 'optimization', 'performance'],
    pros: ['Extremely fast', 'Drop-in ESLint replacement', 'Perfect for large codebases'],
    cons: ['Fewer rules than ESLint', 'No custom rules yet'],
    integration_type: 'CLI',
    url: 'https://oxc-project.github.io/docs/guide/usage/linter.html',
  },
  {
    id: 'knip',
    name: 'Knip',
    category: TOOL_CATEGORIES.OPTIMIZATION,
    description: 'Find unused files, dependencies and exports in TypeScript projects',
    time_saved: '1 week',
    implementation_effort: '1 hour',
    use_cases: [
      'dead code removal',
      'bundle optimization',
      'dependency cleanup',
      'claude code cleanup',
    ],
    alternatives: ['depcheck', 'unimported', 'ts-prune'],
    keywords: ['unused', 'dead code', 'optimization', 'cleanup', 'typescript'],
    pros: ['Comprehensive analysis', 'Finds unused exports', 'Reduces bundle size'],
    cons: ['Can be slow on large projects', 'Needs configuration'],
    integration_type: 'CLI',
    url: 'https://knip.dev',
  },
  {
    id: 'size-limit',
    name: 'Size Limit',
    category: TOOL_CATEGORIES.OPTIMIZATION,
    description: 'Prevent JS bundle bloat by monitoring size in CI',
    time_saved: '3 days',
    implementation_effort: '30 minutes',
    use_cases: ['bundle size monitoring', 'performance budgets', 'CI/CD', 'claude code validation'],
    alternatives: ['bundlesize', 'bundlewatch', 'webpack-bundle-analyzer'],
    keywords: ['bundle', 'size', 'performance', 'optimization', 'monitoring'],
    pros: ['CI integration', 'Prevents bloat', 'Time analysis'],
    cons: ['Requires configuration', 'Only for JS bundles'],
    integration_type: 'CLI',
    url: 'https://github.com/ai/size-limit',
  },
  {
    id: 'type-coverage',
    name: 'type-coverage',
    category: TOOL_CATEGORIES.OPTIMIZATION,
    description: 'Check TypeScript type coverage to reduce any types',
    time_saved: '2 days',
    implementation_effort: '15 minutes',
    use_cases: ['type safety', 'code quality', 'reducing any types', 'claude code improvement'],
    alternatives: ['typescript-coverage-report', 'ts-coverage'],
    keywords: ['typescript', 'types', 'coverage', 'any', 'quality'],
    pros: ['Finds implicit any', 'Improves type safety', 'CI friendly'],
    cons: ['TypeScript only', 'Can be strict'],
    integration_type: 'CLI',
    url: 'https://github.com/plantain-00/type-coverage',
  },
  {
    id: 'madge',
    name: 'Madge',
    category: TOOL_CATEGORIES.OPTIMIZATION,
    description: 'Create graphs of module dependencies and find circular dependencies',
    time_saved: '1 week',
    implementation_effort: '30 minutes',
    use_cases: [
      'dependency analysis',
      'circular dependencies',
      'architecture visualization',
      'claude code structure',
    ],
    alternatives: ['dependency-cruiser', 'depgraph'],
    keywords: ['dependencies', 'circular', 'graph', 'visualization', 'architecture'],
    pros: ['Visual graphs', 'Finds circular deps', 'Supports many formats'],
    cons: ['Can be complex for large projects', 'Graphviz dependency'],
    integration_type: 'CLI',
    url: 'https://github.com/pahen/madge',
  },
  {
    id: 'lefthook',
    name: 'Lefthook',
    category: TOOL_CATEGORIES.OPTIMIZATION,
    description: 'Fast and powerful Git hooks manager for any type of projects',
    time_saved: '3 days',
    implementation_effort: '30 minutes',
    use_cases: ['git hooks', 'code quality', 'pre-commit', 'automation', 'claude code validation'],
    alternatives: ['husky', 'pre-commit', 'lint-staged'],
    keywords: ['git', 'hooks', 'quality', 'automation', 'pre-commit'],
    pros: ['Faster than husky', 'Parallel execution', 'Language agnostic'],
    cons: ['Less popular than husky', 'Different config format'],
    integration_type: 'CLI',
    url: 'https://github.com/evilmartians/lefthook',
  },
  {
    id: 'coderabbit',
    name: 'CodeRabbit',
    category: TOOL_CATEGORIES.OPTIMIZATION,
    description: 'AI-powered code review tool that provides context-aware feedback',
    time_saved: '1 week',
    implementation_effort: '10 minutes',
    use_cases: ['code review', 'AI assistance', 'PR feedback', 'claude code improvement'],
    alternatives: ['DeepSource', 'Codacy', 'SonarCloud'],
    keywords: ['AI', 'code review', 'automation', 'quality', 'feedback'],
    pros: ['AI-powered insights', 'GitHub integration', 'Learns from feedback'],
    cons: ['Paid service', 'May have false positives'],
    integration_type: 'GitHub App',
    url: 'https://coderabbit.ai',
  },
];

// Initialize the index with known tools
export function initializeToolIndex() {
  DEVELOPMENT_TOOLS.forEach((tool) => {
    toolIndex.add(tool);
  });
}

// Search functions for different use cases
export async function findToolsForUseCase(useCase: string) {
  return await toolIndex.searchAsync(useCase, {
    index: ['use_cases', 'description', 'keywords'],
    limit: 10,
  });
}

export async function findAlternatives(toolName: string) {
  const results = await toolIndex.searchAsync(toolName, {
    index: 'alternatives',
    limit: 5,
  });
  return results;
}

export async function findQuickWins() {
  // Search for tools with minimal implementation effort
  const allTools = await toolIndex.searchAsync('*');
  return allTools
    .filter((result: any) => {
      const tool = toolIndex.get(result.id);
      return (
        tool.implementation_effort.includes('hour') ||
        tool.implementation_effort.includes('30 minutes')
      );
    })
    .slice(0, 10);
}

export async function findByCategory(category: string) {
  return await toolIndex.searchAsync(category, {
    index: 'category',
    limit: 20,
  });
}

// Research coordinator helper
export async function recommendToolsForProject(requirements: string[]) {
  const recommendations = new Map();

  for (const req of requirements) {
    const results = await findToolsForUseCase(req);
    results.forEach((result: any) => {
      const tool = toolIndex.get(result.id);
      if (!recommendations.has(tool.id)) {
        recommendations.set(tool.id, {
          ...tool,
          relevance_score: 0,
        });
      }
      recommendations.get(tool.id).relevance_score += result.score;
    });
  }

  // Sort by relevance and return top recommendations
  return Array.from(recommendations.values())
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 5);
}

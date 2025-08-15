import { Document } from 'flexsearch';

/**
 * FlexSearch configuration for research-coordinator agent
 * Optimized for discovering development tools and time-saving solutions
 */

// Document index for comprehensive tool/library search
export const toolIndex = new Document({
  document: {
    id: 'id',
    index: [
      'name',
      'category',
      'description',
      'use_cases',
      'alternatives',
      'keywords'
    ],
    store: [
      'name',
      'category',
      'time_saved',
      'implementation_effort',
      'url',
      'pros',
      'cons',
      'integration_type'
    ]
  },
  tokenize: 'forward',
  context: {
    resolution: 9,
    depth: 4,
    bidirectional: true
  },
  optimize: true,
  cache: 100
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
  OPTIMIZATION: 'optimization'
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
    url: 'https://clerk.dev'
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
    url: 'https://supabase.com'
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
    url: 'https://sdk.vercel.ai'
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
    url: 'https://sentry.io'
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
    url: 'https://posthog.com'
  }
];

// Initialize the index with known tools
export function initializeToolIndex() {
  DEVELOPMENT_TOOLS.forEach(tool => {
    toolIndex.add(tool);
  });
}

// Search functions for different use cases
export async function findToolsForUseCase(useCase: string) {
  return await toolIndex.searchAsync(useCase, {
    index: ['use_cases', 'description', 'keywords'],
    limit: 10
  });
}

export async function findAlternatives(toolName: string) {
  const results = await toolIndex.searchAsync(toolName, {
    index: 'alternatives',
    limit: 5
  });
  return results;
}

export async function findQuickWins() {
  // Search for tools with minimal implementation effort
  const allTools = await toolIndex.searchAsync('*');
  return allTools
    .filter((result: any) => {
      const tool = toolIndex.get(result.id);
      return tool.implementation_effort.includes('hour') || 
             tool.implementation_effort.includes('30 minutes');
    })
    .slice(0, 10);
}

export async function findByCategory(category: string) {
  return await toolIndex.searchAsync(category, {
    index: 'category',
    limit: 20
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
          relevance_score: 0
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
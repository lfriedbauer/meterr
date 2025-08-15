#!/usr/bin/env node
import dotenv from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { ResearchExecutor, type ResearchQuery } from '../../../packages/@meterr/llm-client/index';

// Load environment variables
dotenv.config();

// Research prompts for market discovery
const TOP_DOWN_PROMPTS: ResearchQuery[] = [
  // Business Tools Discovery
  {
    prompt: `As a business operations consultant, what are the top 5 software tools that companies desperately need in 2024 but don't exist yet or are poorly implemented? Focus on tools that would save at least 10 hours per week or $5000 per month. Be specific about the problem and potential solution.`,
    temperature: 0.8,
  },
  {
    prompt: `What repetitive tasks do solopreneurs and small businesses waste the most time on that could be automated with the right tool? List specific examples with time/cost savings potential.`,
    temperature: 0.8,
  },
  {
    prompt: `Survey data shows 67% of businesses struggle with AI costs. Beyond simple tracking, what tool features would actually reduce their AI spending by 30% or more? Provide specific mechanisms.`,
    temperature: 0.7,
  },

  // ROI Analysis
  {
    prompt: `For a company spending $10,000/month on various SaaS tools, what single platform could consolidate 3-5 of those tools and how? What would the migration path look like?`,
    temperature: 0.7,
  },
  {
    prompt: `What metrics do CFOs actually care about when evaluating new software tools? Rank the top 10 metrics by importance and explain how to demonstrate each one.`,
    temperature: 0.7,
  },

  // Market Gaps
  {
    prompt: `Analyze the current market: What features do Notion, Airtable, and Monday.com users complain about most? What tool would steal their customers?`,
    temperature: 0.8,
  },
  {
    prompt: `What tools do developers build internally at companies because no good commercial solution exists? Focus on tools that multiple companies have built independently.`,
    temperature: 0.8,
  },
];

const BOTTOM_UP_PROMPTS: ResearchQuery[] = [
  // SpendCharm Dashboard Analysis
  {
    prompt: `Here's an AI expense tracking dashboard that shows token usage, costs across providers, and smart routing recommendations. Current features: real-time token counting, multi-provider comparison, subscription vs API analysis, team usage breakdown. 

What 3 features would make this absolutely essential for every AI-powered company? What would make them pay $299/month without hesitation?`,
    temperature: 0.7,
  },

  // Token Calculator Enhancement
  {
    prompt: `We have a token calculator tool that compares costs across OpenAI, Anthropic, and Google. Users paste their prompts and see pricing comparisons. 

How could this tool be enhanced to become a complete "AI Cost Optimization Suite" that companies would integrate into their daily workflow? What automations would save them the most money?`,
    temperature: 0.7,
  },

  // CSV Converter Evolution
  {
    prompt: `Our CSV converter tool helps users transform data between formats. It's currently a simple utility.

How could this evolve into an "Enterprise Data Pipeline" tool that handles the CSV/Excel/JSON/API data flows that every company struggles with? What would make it 10x more valuable?`,
    temperature: 0.8,
  },

  // Prompt Chain Builder Expansion
  {
    prompt: `We have a prompt chain builder that helps users create multi-step AI workflows.

Companies are spending hours manually copying between ChatGPT, Claude, and other tools. How could this tool become the "Zapier for AI" that they desperately need? What integrations and features would be game-changing?`,
    temperature: 0.8,
  },

  // Tools Suite Strategy
  {
    prompt: `SpendCharm.com/tools offers: token counter, CSV converter, JSON formatter, prompt builder, and prompt library.

Instead of separate tools, what unified platform could these become that solves a major business problem? What's the bigger vision that would attract 10,000 paying customers?`,
    temperature: 0.9,
  },
];

const VALIDATION_PROMPTS: ResearchQuery[] = [
  {
    prompt: `If a tool could reduce your AI API costs by 40% through intelligent caching and model routing, what specific features would it need to have? What would stop you from adopting it?`,
    temperature: 0.7,
  },
  {
    prompt: `Rank these features by importance for an AI expense management tool:
- Real-time cost tracking
- Automatic model selection (GPT-4 vs GPT-3.5)
- Team usage analytics  
- Budget alerts
- Prompt caching
- API key management
- Cost allocation by project
- ROI reporting

What's missing from this list that would be critical?`,
    temperature: 0.6,
  },
  {
    prompt: `A company is evaluating switching from $500/month in AI subscriptions (ChatGPT Plus, Claude Pro, etc.) to API-based usage with a tracking tool. What would convince them to switch? What would prevent them?`,
    temperature: 0.7,
  },
];

async function executeResearch() {
  // Check for API keys in environment
  const config = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    xai: process.env.XAI_API_KEY,
  };

  // Count available APIs
  const availableAPIs = Object.entries(config)
    .filter(([_, key]) => key)
    .map(([name]) => name);

  if (availableAPIs.length === 0) {
    console.error(`
❌ No API keys found in environment variables.

Please add at least one of the following to your .env file:
- OPENAI_API_KEY=your-key-here
- ANTHROPIC_API_KEY=your-key-here  
- GOOGLE_API_KEY=your-key-here
- PERPLEXITY_API_KEY=your-key-here
- XAI_API_KEY=your-key-here

Example .env file:
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
`);
    process.exit(1);
  }

  console.log(`
🚀 Starting Research Execution
📊 Available APIs: ${availableAPIs.join(', ')}
📝 Total prompts: ${TOP_DOWN_PROMPTS.length + BOTTOM_UP_PROMPTS.length + VALIDATION_PROMPTS.length}
⏱️  Estimated time: ${(TOP_DOWN_PROMPTS.length + BOTTOM_UP_PROMPTS.length + VALIDATION_PROMPTS.length) * availableAPIs.length * 3} seconds
`);

  const executor = new ResearchExecutor(config);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsDir = path.join(process.cwd(), 'research-results');

  // Create results directory
  if (!existsSync(resultsDir)) {
    const { mkdirSync } = await import('fs');
    mkdirSync(resultsDir, { recursive: true });
  }

  // Execute top-down research
  console.log('\n📍 Phase 1: Top-Down Market Discovery\n');
  const topDownResults = await executor.executeResearchPlan(TOP_DOWN_PROMPTS);
  await executor.saveResults(path.join(resultsDir, `top-down-${timestamp}.json`));

  // Execute bottom-up research
  console.log('\n📍 Phase 2: Bottom-Up Tool Analysis\n');
  const bottomUpResults = await executor.executeResearchPlan(BOTTOM_UP_PROMPTS);
  await executor.saveResults(path.join(resultsDir, `bottom-up-${timestamp}.json`));

  // Execute validation research
  console.log('\n📍 Phase 3: Feature Validation\n');
  const validationResults = await executor.executeResearchPlan(VALIDATION_PROMPTS);
  await executor.saveResults(path.join(resultsDir, `validation-${timestamp}.json`));

  // Generate summary report
  console.log('\n📊 Generating Summary Report...\n');
  const totalCost = executor.getTotalCost();

  const summary = {
    executionTime: new Date().toISOString(),
    totalPrompts: TOP_DOWN_PROMPTS.length + BOTTOM_UP_PROMPTS.length + VALIDATION_PROMPTS.length,
    totalResponses: topDownResults.size + bottomUpResults.size + validationResults.size,
    totalCost: totalCost.toFixed(4),
    availableAPIs,
    resultsFiles: [
      `top-down-${timestamp}.json`,
      `bottom-up-${timestamp}.json`,
      `validation-${timestamp}.json`,
    ],
  };

  writeFileSync(
    path.join(resultsDir, `summary-${timestamp}.json`),
    JSON.stringify(summary, null, 2)
  );

  console.log(`
✅ Research Complete!

📁 Results saved to: ${resultsDir}
💰 Total API cost: $${totalCost.toFixed(4)}
📊 Total responses collected: ${summary.totalResponses}

Next steps:
1. Run: npm run analyze-research
2. Run: npm run build-prototypes
3. Run: npm run validate-prototypes
`);
}

// Execute if run directly
if (require.main === module) {
  executeResearch().catch(console.error);
}

export { executeResearch };

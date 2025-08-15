#!/usr/bin/env node
import dotenv from 'dotenv';
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';

dotenv.config();

async function main() {
  const client = new UnifiedLLMClient({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
  });

  console.log('💰 PRICING REALITY CHECK\n');
  console.log('Proposed: Free → Pro $50-75 → Team $200-300 → Enterprise Custom\n');
  console.log('='.repeat(60) + '\n');

  // The brutal question
  const brutalQuestions = `You're an experienced SaaS sales exec. Answer honestly:

For an AI expense tracking tool (tracks OpenAI, Claude, etc. costs):
- Free tier, Pro $50-75/mo, Team $200-300/mo, Enterprise custom

Critical questions:
1. WHO exactly pays $200/month for this? Give me a specific job title and company profile.
2. A company spending $500/month on AI - would they pay $200/month to track it? Why/why not?
3. A company spending $10,000/month on AI - would they pay $200/month or demand enterprise pricing?
4. What's the ACTUAL price point where this becomes a no-brainer purchase?
5. Reality check: Is this a vitamin (nice to have) or painkiller (must have)?

Don't sugarcoat it. What's the truth about this pricing model?`;

  console.log('🎯 Asking Claude (Sales Reality)...\n');
  const claudeResponse = await client.queryClaude({
    prompt: brutalQuestions,
    model: 'claude-opus-4-1-20250805',
  });
  console.log(claudeResponse.response.substring(0, 1000));

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('🎯 Asking GPT-4 (Market Analysis)...\n');
  const gptResponse = await client.queryOpenAI({
    prompt: brutalQuestions,
    model: 'gpt-4-turbo-preview',
  });
  console.log(gptResponse.response.substring(0, 1000));

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('🎯 Asking Gemini (Competitive Reality)...\n');

  const competitivePrompt = `Compare this pricing to reality:
  
Our AI expense tracker: $50-75 (Pro), $200-300 (Team)

Competitors:
- OpenAI dashboard: FREE
- Claude console: FREE  
- Helicone: $0-500/mo
- Datadog: $15-23/host/month
- Spreadsheet: FREE

Why would anyone pay us $200/month when they can:
1. Use provider dashboards for free
2. Track in a spreadsheet for free
3. Build a dashboard in 1 day of dev time

What's our REAL differentiator that justifies the price?`;

  const geminiResponse = await client.queryGemini({ prompt: competitivePrompt });
  console.log(geminiResponse.response.substring(0, 1000));

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('🎯 Final Reality Check\n');

  const consensusPrompt = `Based on market analysis, here's the proposed pricing for an AI expense tracker:
  Free → Pro $50-75 → Team $200-300 → Enterprise Custom
  
  The tool tracks AI costs across providers, suggests optimizations, provides team analytics.
  
  Give me the ONE paragraph truth:
  - Is this pricing realistic?
  - What should it actually be?
  - Is there even a market for this?`;

  const consensus = await client.queryClaude({ prompt: consensusPrompt });
  console.log('📝 THE TRUTH:\n');
  console.log(consensus.response);

  console.log('\n✅ Reality check complete!');
}

main().catch(console.error);

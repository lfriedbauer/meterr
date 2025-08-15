#!/usr/bin/env node
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import path from 'path';
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';

dotenv.config();

interface BuyerProfile {
  segment: string;
  companySize?: string;
  revenue?: string;
  title: string;
  budget: string;
  painPoints: string[];
  buyingProcess: string;
  dealSize: string;
  salesCycle: string;
  objections: string[];
}

interface MarketValidation {
  totalAddressableMarket: string;
  serviceableMarket: string;
  realisticFirstYear: string;
  profiles: BuyerProfile[];
  redFlags: string[];
  recommendations: string[];
}

class SalesRealityChecker {
  private client: UnifiedLLMClient;

  constructor() {
    this.client = new UnifiedLLMClient({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
      xai: process.env.XAI_API_KEY,
    });
  }

  async validatePricingWithSalesReality(pricing: any): Promise<void> {
    console.log('👔 Sales Reality Check Starting...\n');
    console.log('Proposed Pricing:', pricing);
    console.log('\n' + '='.repeat(60) + '\n');

    // Step 1: Who actually has budget for this?
    const budgetRealityCheck = await this.checkBudgetReality(pricing);

    // Step 2: Profile actual buyers
    const buyerProfiles = await this.profileRealBuyers();

    // Step 3: Validate market size
    const marketSize = await this.validateMarketSize(buyerProfiles);

    // Step 4: Sales objections and reality
    const salesChallenges = await this.identifySalesChallenges(pricing);

    // Step 5: Competitive reality check
    const competitivePosition = await this.checkCompetitiveReality(pricing);

    // Generate comprehensive report
    await this.generateSalesReport({
      budgetRealityCheck,
      buyerProfiles,
      marketSize,
      salesChallenges,
      competitivePosition,
    });
  }

  async checkBudgetReality(pricing: any): Promise<string> {
    const prompt = `As a seasoned B2B SaaS sales executive, evaluate this pricing:
    Free tier, Pro at $50-75/month, Team at $200-300/month, Enterprise custom.
    
    This is for an AI expense tracking tool that monitors costs across OpenAI, Claude, etc.
    
    Be brutally honest:
    1. What size company actually has $200-300/month budget for this?
    2. At $50-75, are we targeting individuals using their credit card or companies?
    3. Who signs off on a $200-300/month tool purchase? What's their title?
    4. How many companies actually spend enough on AI to need this?
    5. Is this a "nice to have" or "must have" purchase?`;

    const response = await this.client.queryClaude({ prompt });
    console.log('💰 Budget Reality Check:\n', response.response.substring(0, 800), '\n');
    return response.response;
  }

  async profileRealBuyers(): Promise<string> {
    const prompt = `As a sales professional who has sold to 500+ companies, create realistic buyer profiles for an AI expense management tool.
    
    For each profile, specify:
    - Company revenue range
    - Employee count
    - Current AI spend (realistic numbers)
    - Actual job title of the buyer
    - Their real budget authority
    - What would make them buy vs. not buy
    
    Focus on who ACTUALLY buys $50-300/month tools in 2024. Consider:
    1. Solopreneurs/Consultants
    2. Startups (seed/Series A)
    3. SMBs ($1M-50M revenue)
    4. Mid-market ($50M-500M)
    5. Fractional executives (CFO, CTO)
    
    Which of these segments is realistic? Which is fantasy?`;

    const response = await this.client.queryGemini({ prompt });
    console.log('👥 Real Buyer Profiles:\n', response.response.substring(0, 800), '\n');
    return response.response;
  }

  async validateMarketSize(buyerProfiles: string): Promise<string> {
    const prompt = `Given these buyer profiles for an AI expense management tool:
    ${buyerProfiles.substring(0, 500)}
    
    Use real data to estimate:
    1. How many companies actually use multiple AI APIs (OpenAI + Claude + others)?
    2. Of those, how many spend >$500/month on AI (the threshold where tracking matters)?
    3. Of those, how many have budget for a $50-300/month tracking tool?
    4. What's the realistic TAM, SAM, and SOM?
    
    Provide specific numbers based on:
    - OpenAI's reported API customer base
    - Anthropic's customer numbers
    - General AI adoption statistics
    
    Don't make up numbers - use what's publicly known or say "unknown"`;

    const response = await this.client.queryPerplexity({
      prompt,
      model: 'sonar', // Use web search for real data
    });
    console.log('📊 Market Size Validation:\n', response.response.substring(0, 800), '\n');
    return response.response;
  }

  async identifySalesChallenges(pricing: any): Promise<string> {
    const prompt = `You're a sales rep trying to sell an AI expense tracking tool.
    Pricing: Free, Pro $50-75/mo, Team $200-300/mo, Enterprise custom.
    
    List the REAL objections you'll hear:
    
    From a solopreneur:
    "Why pay $50 when I can just..."
    
    From a startup CTO:
    "We only spend $X on AI, so..."
    
    From a CFO:
    "Can't we just use spreadsheets?"
    
    From procurement:
    "We already have Datadog/CloudWatch..."
    
    Be specific about:
    1. The "build vs buy" conversation
    2. The "it's not broken" objection
    3. The "too expensive for what it does" pushback
    4. The "we'll revisit next quarter" delay
    
    What percentage of demos convert to paid? Be realistic.`;

    const response = await this.client.queryGrok({ prompt });
    console.log('🚫 Sales Objections Reality:\n', response.response.substring(0, 800), '\n');
    return response.response;
  }

  async checkCompetitiveReality(pricing: any): Promise<string> {
    const prompt = `Compare this AI expense tracking tool pricing to alternatives:
    Our tool: Free, $50-75, $200-300, Enterprise custom
    
    What would a savvy buyer compare us to:
    1. Building internal dashboards (developer time cost)
    2. Using provider dashboards (OpenAI, Claude) directly - FREE
    3. Spreadsheet tracking - FREE
    4. Existing observability tools they already pay for
    5. Helicone ($0-500/mo), Langfuse (free-$99), etc.
    
    Critical questions:
    - Why would someone pay $200/month instead of using free options?
    - What features justify 10x the price of manual tracking?
    - How do we compete with "good enough" free solutions?
    
    Give me the harsh truth about competitive positioning.`;

    const response = await this.client.queryOpenAI({
      prompt,
      model: 'gpt-4-turbo-preview',
    });
    console.log('🥊 Competitive Reality:\n', response.response.substring(0, 800), '\n');
    return response.response;
  }

  async generateSalesReport(data: any): Promise<void> {
    // Final synthesis prompt
    const synthesisPrompt = `Based on all this sales reality checking for an AI expense management tool:
    
    ${Object.values(data)
      .map((d: any) => d.substring(0, 300))
      .join('\n')}
    
    Give me the brutal truth:
    1. Is there a real market for this at $50-300/month?
    2. Who is the ONE specific buyer persona most likely to pay?
    3. What's a realistic first-year revenue target?
    4. Should we pivot the pricing? If so, to what?
    5. Is this a venture-scale business or a lifestyle business?
    
    Don't sugarcoat it. What would you tell the founder?`;

    const finalAnalysis = await this.client.queryClaude({
      prompt: synthesisPrompt,
      model: 'claude-opus-4-1-20250805',
    });

    const report = {
      timestamp: new Date().toISOString(),
      proposedPricing: {
        free: 'Limited usage',
        pro: '$50-75/month',
        team: '$200-300/month',
        enterprise: 'Custom',
      },
      salesRealityCheck: {
        budgetReality: data.budgetRealityCheck.substring(0, 500),
        buyerProfiles: data.buyerProfiles.substring(0, 500),
        marketSize: data.marketSize.substring(0, 500),
        salesChallenges: data.salesChallenges.substring(0, 500),
        competitivePosition: data.competitivePosition.substring(0, 500),
      },
      brutalTruth: finalAnalysis.response,
      recommendations: this.extractRecommendations(finalAnalysis.response),
    };

    const reportPath = path.join(
      process.cwd(),
      'research-results',
      `sales-reality-check-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );

    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Sales reality report saved to: ${reportPath}`);

    // Print key findings
    console.log('\n' + '='.repeat(60));
    console.log('🎯 BRUTAL TRUTH:');
    console.log(finalAnalysis.response);
  }

  private extractRecommendations(analysis: string): string[] {
    const recommendations = [];

    if (analysis.toLowerCase().includes('lower price')) {
      recommendations.push('Consider lowering price point');
    }
    if (analysis.toLowerCase().includes('free')) {
      recommendations.push('Expand free tier to build user base');
    }
    if (analysis.toLowerCase().includes('enterprise')) {
      recommendations.push('Focus on enterprise sales with higher ACV');
    }
    if (analysis.toLowerCase().includes('pivot')) {
      recommendations.push('Consider pivoting the business model');
    }
    if (analysis.toLowerCase().includes('specific')) {
      recommendations.push('Narrow focus to specific buyer persona');
    }

    return recommendations.length > 0
      ? recommendations
      : ['Gather more market data before finalizing pricing'];
  }
}

async function deepDiveBuyerPersona() {
  const client = new UnifiedLLMClient({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    xai: process.env.XAI_API_KEY,
  });

  console.log('\n🔍 Deep Dive: Who REALLY Buys This?\n');

  const scenarios = [
    {
      persona: 'Solopreneur AI Consultant',
      prompt: `An AI consultant making $150K/year uses ChatGPT Plus, Claude Pro, and OpenAI API.
      Monthly AI spend: $200 ($20 + $20 + $160 API).
      
      Would they pay $50/month for expense tracking? Consider:
      - They can see costs in each provider's dashboard
      - They bill clients for AI usage anyway
      - They're price sensitive (solo business)
      - They could track in a spreadsheet
      
      What would make them buy vs not buy?`,
    },
    {
      persona: 'Series A Startup (20 employees)',
      prompt: `A Series A startup with $5M funding, 20 employees, 5 engineers using AI.
      Monthly AI spend: $2000 across OpenAI, Claude, some Perplexity.
      
      Would the CTO approve $200/month for tracking? Consider:
      - They have Datadog ($500/mo) for monitoring
      - Engineers could build a dashboard in 2 days
      - They're burning $400K/month anyway
      - Board wants them to "control costs"
      
      What's the realistic sales process?`,
    },
    {
      persona: 'Fractional CFO',
      prompt: `A fractional CFO managing 5 clients, each spending $1-5K/month on AI.
      They work 1 day/week per client at $2000/day.
      
      Would they recommend a $200/month AI tracking tool? Consider:
      - It's not their money but they're cost-conscious
      - They need to show value to clients
      - They already use QuickBooks, Excel, etc.
      - They'd need to convince 5 CEOs
      
      Is this a real buyer or a fantasy?`,
    },
  ];

  for (const scenario of scenarios) {
    console.log(`\n👤 ${scenario.persona}`);
    console.log('='.repeat(40));

    const response = await client.queryGemini({ prompt: scenario.prompt });
    console.log(response.response.substring(0, 600));

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

async function main() {
  const checker = new SalesRealityChecker();

  // Test the validated pricing
  const validatedPricing = {
    free: 'Limited usage',
    pro: '$50-75/month',
    team: '$200-300/month',
    enterprise: 'Custom',
  };

  await checker.validatePricingWithSalesReality(validatedPricing);

  // Deep dive into specific personas
  await deepDiveBuyerPersona();

  console.log('\n✅ Sales reality check complete!');
  console.log('\n💡 Key Question: Can you actually find 100 companies willing to pay $200/month?');
  console.log('If not, is this really a business or just a side project?');
}

if (require.main === module) {
  main().catch(console.error);
}

export { SalesRealityChecker };

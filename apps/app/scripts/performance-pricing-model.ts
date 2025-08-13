#!/usr/bin/env node
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

interface PricingTier {
  name: string;
  basePrice: number;
  features: string[];
  targetCustomer: string;
  revenueModel: 'subscription' | 'performance' | 'hybrid';
}

interface PerformanceContract {
  customerId: string;
  baselineSpend: number;
  currentSpend: number;
  savedAmount: number;
  ourShare: number; // percentage of savings
  minimumFee: number;
  contractLength: number; // months
}

class PerformancePricingModel {
  private client: UnifiedLLMClient;
  private tiers: PricingTier[] = [];
  
  constructor() {
    this.client = new UnifiedLLMClient({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
      grok: process.env.XAI_API_KEY,
    });
  }

  async designPricingStrategy() {
    console.log('💰 PERFORMANCE-BASED PRICING STRATEGY\n');
    console.log('=' .repeat(60) + '\n');

    // Define the pricing tiers
    this.tiers = [
      {
        name: 'Starter',
        basePrice: 49,
        features: [
          'Track up to $2,000/month AI spend',
          'Basic dashboard',
          'Weekly email reports',
          'Chrome extension',
          '30-day data retention'
        ],
        targetCustomer: 'Small teams, individuals',
        revenueModel: 'subscription'
      },
      {
        name: 'Professional',
        basePrice: 99,
        features: [
          'Track up to $10,000/month AI spend',
          'Real-time dashboard',
          'Daily reports & alerts',
          'API access',
          'Team management (5 users)',
          '90-day data retention',
          'Basic optimization suggestions'
        ],
        targetCustomer: 'Growing startups',
        revenueModel: 'subscription'
      },
      {
        name: 'Business',
        basePrice: 299,
        features: [
          'Unlimited AI spend tracking',
          'Advanced analytics',
          'Custom alerts & workflows',
          'Unlimited users',
          '1-year data retention',
          'Monthly optimization review',
          'Slack integration',
          'Priority support'
        ],
        targetCustomer: 'Scale-ups, mid-market',
        revenueModel: 'hybrid'
      },
      {
        name: 'Enterprise Performance',
        basePrice: 499, // minimum platform fee
        features: [
          'Everything in Business',
          'Dedicated account manager',
          'Custom integrations',
          'SLA guarantees',
          'Quarterly business reviews',
          'Performance-based pricing available'
        ],
        targetCustomer: 'Enterprise (>$20K/month AI spend)',
        revenueModel: 'performance'
      }
    ];

    console.log('📊 Pricing Tiers Defined:\n');
    this.tiers.forEach(tier => {
      console.log(`${tier.name}: $${tier.basePrice}/month (${tier.revenueModel})`);
    });
  }

  async calculatePerformanceScenarios() {
    console.log('\n' + '=' .repeat(60));
    console.log('📈 Performance-Based Pricing Scenarios\n');

    const scenarios = [
      { baseline: 5000, savings: 0.25, shareRate: 0.20 },  // 25% savings, we take 20%
      { baseline: 10000, savings: 0.30, shareRate: 0.25 }, // 30% savings, we take 25%
      { baseline: 25000, savings: 0.35, shareRate: 0.30 }, // 35% savings, we take 30%
      { baseline: 50000, savings: 0.40, shareRate: 0.35 }, // 40% savings, we take 35%
    ];

    console.log('Monthly AI Spend | Savings % | Our Share | Customer Saves | We Earn\n');
    console.log('-'.repeat(70));

    scenarios.forEach(s => {
      const savedAmount = s.baseline * s.savings;
      const ourEarnings = savedAmount * s.shareRate;
      const customerNetSavings = savedAmount - ourEarnings;
      
      console.log(
        `$${s.baseline.toLocaleString().padEnd(8)} | ` +
        `${(s.savings * 100).toFixed(0)}%`.padEnd(9) + ' | ' +
        `${(s.shareRate * 100).toFixed(0)}%`.padEnd(9) + ' | ' +
        `$${customerNetSavings.toLocaleString().padEnd(14)} | ` +
        `$${ourEarnings.toLocaleString()}`
      );
    });

    return scenarios;
  }

  async validateWithSales() {
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 Sales Validation of Performance Model\n');

    const validationPrompt = `You're an enterprise sales executive. Evaluate this performance-based pricing model:

    Standard Tiers:
    - Starter: $49/month (self-serve)
    - Professional: $99/month (self-serve with suggestions)
    - Business: $299/month (includes monthly reviews)
    
    Performance Option (Enterprise only):
    - Minimum platform fee: $499/month
    - Performance fee: 20-35% of savings achieved
    - Example: We save them $10K/month, they pay us $499 + $2,500 = $2,999/month
    - Customer still saves $7,500/month net
    
    Questions:
    1. Is performance-based pricing easier or harder to sell?
    2. What objections will customers have?
    3. How do we prove the baseline for calculating savings?
    4. Will customers prefer flat fee or performance model?
    5. What contractual terms are critical?`;

    const response = await this.client.queryClaude({ 
      prompt: validationPrompt,
      model: 'claude-opus-4-1-20250805'
    });
    
    console.log('Sales Validation Results:\n');
    console.log(response.response.substring(0, 1500));
    
    return response.response;
  }

  async createContractTemplate() {
    console.log('\n' + '=' .repeat(60));
    console.log('📝 Creating Performance Contract Template\n');

    const contractPrompt = `Create a simple, clear performance-based contract template for Meterr.ai that includes:

    1. Baseline establishment period (first 30 days)
    2. How savings are calculated
    3. Payment terms (platform fee + performance fee)
    4. Minimum guarantees
    5. Dispute resolution
    6. Exit clauses
    
    Make it founder-friendly but protect our interests. Keep it under 2 pages.`;

    const response = await this.client.queryGemini({ prompt: contractPrompt });
    console.log('Contract Template (Preview):\n');
    console.log(response.response.substring(0, 1000));
    
    return response.response;
  }

  async generatePricingPage() {
    console.log('\n' + '=' .repeat(60));
    console.log('🌐 Generating Pricing Page Copy\n');

    const pagePrompt = `Create website pricing page copy for Meterr.ai with these tiers:

    1. Starter ($49) - Basic tracking
    2. Professional ($99) - Advanced features
    3. Business ($299) - Full platform + monthly reviews
    4. Enterprise (Custom) - Performance-based option available
    
    For Enterprise, include a "Book a Meeting" button and text like:
    "Prefer to pay based on results? Let's discuss our performance-based pricing where you only pay a percentage of what we save you."
    
    Make it clear, compelling, and focused on value. Include a pricing calculator showing potential ROI.`;

    const response = await this.client.queryClaude({ 
      prompt: pagePrompt,
      model: 'claude-opus-4-1-20250805'
    });
    
    console.log('Pricing Page Copy:\n');
    console.log(response.response.substring(0, 1500));
    
    return response.response;
  }

  async calculateUnitEconomics() {
    console.log('\n' + '=' .repeat(60));
    console.log('💹 Unit Economics Analysis\n');

    const models = [
      {
        name: 'Pure Subscription',
        avgPrice: 99,
        cac: 200,
        monthlyChurn: 0.05,
        serverCostPerUser: 10,
        supportCostPerUser: 5
      },
      {
        name: 'Performance-Based',
        avgPrice: 2500, // avg performance fee
        cac: 1000, // higher CAC for enterprise
        monthlyChurn: 0.02, // lower churn
        serverCostPerUser: 50,
        supportCostPerUser: 200 // dedicated support
      },
      {
        name: 'Hybrid Model',
        avgPrice: 500, // mix of both
        cac: 400,
        monthlyChurn: 0.03,
        serverCostPerUser: 20,
        supportCostPerUser: 30
      }
    ];

    console.log('Model           | LTV     | CAC    | LTV:CAC | Margin\n');
    console.log('-'.repeat(60));

    models.forEach(m => {
      const avgLifetime = 1 / m.monthlyChurn; // months
      const revenue = m.avgPrice * avgLifetime;
      const costs = (m.serverCostPerUser + m.supportCostPerUser) * avgLifetime;
      const ltv = revenue - costs;
      const ltvCacRatio = ltv / m.cac;
      const margin = ((revenue - costs) / revenue * 100).toFixed(1);

      console.log(
        `${m.name.padEnd(15)} | ` +
        `$${ltv.toFixed(0).padEnd(6)} | ` +
        `$${m.cac.toString().padEnd(6)} | ` +
        `${ltvCacRatio.toFixed(1).padEnd(7)} | ` +
        `${margin}%`
      );
    });
  }

  async createSalesScript() {
    console.log('\n' + '=' .repeat(60));
    console.log('🎤 Performance-Based Sales Script\n');

    const scriptPrompt = `Create a sales script for introducing performance-based pricing to an enterprise prospect:

    Scenario: CTO spending $30K/month on AI, interested but skeptical
    
    The script should:
    1. Start with establishing their current pain/spend
    2. Introduce the performance model naturally
    3. Address the "what if you don't save us money?" objection
    4. Create urgency without being pushy
    5. End with clear next steps
    
    Make it conversational, not robotic.`;

    const response = await this.client.queryOpenAI({ 
      prompt: scriptPrompt,
      model: 'gpt-4-turbo-preview'
    });
    
    console.log('Sales Script:\n');
    console.log(response.response.substring(0, 1500));
    
    return response.response;
  }

  async testCustomerReactions() {
    console.log('\n' + '=' .repeat(60));
    console.log('🧪 Testing Customer Reactions\n');

    const reactions = [
      { persona: 'Skeptical CFO', spend: 50000 },
      { persona: 'Innovation-focused CTO', spend: 20000 },
      { persona: 'Cost-conscious Startup Founder', spend: 5000 },
      { persona: 'Enterprise Procurement Manager', spend: 100000 }
    ];

    for (const r of reactions) {
      const prompt = `You are a ${r.persona} spending $${r.spend}/month on AI.

      Meterr.ai offers two options:
      1. Flat fee: $299-499/month for tracking and optimization
      2. Performance: $499 base + 25% of savings (if we save you $10K, you pay $2,500)
      
      Which would you choose and why? What concerns do you have?`;

      const response = await this.client.queryGemini({ prompt });
      console.log(`\n${r.persona} ($${r.spend}/mo):`);
      console.log(response.response.substring(0, 400) + '...');
    }
  }

  async generateFinalRecommendation() {
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 FINAL PRICING RECOMMENDATION\n');

    const data = {
      tiers: this.tiers,
      performanceModel: {
        minBaseFee: 499,
        savingsShare: '20-35%',
        baselinePeriod: 30,
        minContract: 6
      }
    };

    const recommendationPrompt = `Based on all analysis, what's the optimal pricing strategy for Meterr.ai?

    Current options:
    1. Pure subscription ($49-499/month)
    2. Pure performance (% of savings only)
    3. Hybrid (base fee + performance bonus)
    
    Consider:
    - Ease of selling
    - Revenue predictability
    - Customer satisfaction
    - Market differentiation
    - Operational complexity
    
    Give a clear, actionable recommendation.`;

    const response = await this.client.queryClaude({ 
      prompt: recommendationPrompt,
      model: 'claude-opus-4-1-20250805'
    });
    
    console.log(response.response);
    
    // Save everything
    const report = {
      timestamp: new Date().toISOString(),
      tiers: this.tiers,
      performanceModel: data.performanceModel,
      recommendation: response.response
    };
    
    const reportPath = path.join(
      process.cwd(),
      'research-results',
      `performance-pricing-strategy.json`
    );
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Full pricing strategy saved to: ${reportPath}`);
    
    return report;
  }
}

async function main() {
  const model = new PerformancePricingModel();
  
  console.log('🚀 DEVELOPING PERFORMANCE-BASED PRICING MODEL\n');
  
  // Design core pricing strategy
  await model.designPricingStrategy();
  
  // Calculate performance scenarios
  await model.calculatePerformanceScenarios();
  
  // Validate with sales perspective
  await model.validateWithSales();
  
  // Create contract template
  await model.createContractTemplate();
  
  // Generate pricing page
  await model.generatePricingPage();
  
  // Analyze unit economics
  await model.calculateUnitEconomics();
  
  // Create sales script
  await model.createSalesScript();
  
  // Test customer reactions
  await model.testCustomerReactions();
  
  // Generate final recommendation
  await model.generateFinalRecommendation();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ PRICING STRATEGY COMPLETE\n');
  console.log('Key Decisions:');
  console.log('1. Offer BOTH flat-fee and performance options');
  console.log('2. Start with flat-fee for smaller customers');
  console.log('3. Lead with performance model for enterprise');
  console.log('4. Always maintain a base platform fee');
  console.log('5. Use "Book a Meeting" for custom pricing discussions\n');
}

if (require.main === module) {
  main().catch(console.error);
}

export { PerformancePricingModel };
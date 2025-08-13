#!/usr/bin/env node
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import path from 'path';

dotenv.config();

interface BusinessModel {
  name: string;
  pricing: string;
  estimatedCAC: number; // Customer Acquisition Cost
  estimatedLTV: number; // Lifetime Value
  monthlyServerCosts: number;
  breakEvenCustomers: number;
  yearOneProjection: {
    customers: number;
    revenue: number;
    costs: number;
    profit: number;
  };
  viability: 'high' | 'medium' | 'low';
  risks: string[];
  advantages: string[];
}

class BusinessModelTester {
  private client: UnifiedLLMClient;
  private models: BusinessModel[] = [];

  constructor() {
    this.client = new UnifiedLLMClient({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
    });
  }

  async testAllModels() {
    console.log('💼 Testing Business Models for Meterr.ai\n');
    console.log('=' .repeat(60) + '\n');

    // Test Option 1: Freemium PLG
    await this.testFreemiumModel();
    
    // Test Option 2: Usage-Based
    await this.testUsageBasedModel();
    
    // Test Option 3: Open Source + Cloud
    await this.testOpenSourceModel();
    
    // Test Alternative: Consulting/Service Model
    await this.testConsultingModel();
    
    // Test Alternative: Chrome Extension Model
    await this.testChromeExtensionModel();
    
    // Test Alternative: API Marketplace Model
    await this.testMarketplaceModel();

    // Compare all models
    await this.compareModels();
    
    // Generate final recommendation
    await this.generateRecommendation();
  }

  async testFreemiumModel() {
    console.log('📊 Testing Freemium PLG Model...\n');
    
    const prompt = `Analyze this freemium SaaS model for AI expense tracking:
    - Free: Track up to $500/month AI spend
    - Pro: $29/month (up to $5K/month)
    - Business: $99/month (unlimited)
    - Enterprise: $499+/month
    
    Assume:
    - 1000 free users sign up in year 1
    - 3% convert to Pro, 1% to Business, 0.1% to Enterprise
    - Server costs: $500/month base + $0.50 per free user + $2 per paid user
    - CAC through content marketing: $50 per paid customer
    
    Calculate:
    1. Year 1 revenue
    2. Year 1 costs (server + marketing)
    3. Profit/loss
    4. Is this sustainable?`;

    const response = await this.client.queryGemini({ prompt });
    console.log(response.response.substring(0, 800));
    
    this.models.push({
      name: 'Freemium PLG',
      pricing: 'Free/$29/$99/$499',
      estimatedCAC: 50,
      estimatedLTV: 29 * 12, // Assuming 1 year retention
      monthlyServerCosts: 1000,
      breakEvenCustomers: 35,
      yearOneProjection: {
        customers: 41,
        revenue: 22000,
        costs: 14000,
        profit: 8000
      },
      viability: 'medium',
      risks: ['Low conversion rate', 'High free tier costs'],
      advantages: ['Easy adoption', 'Word of mouth growth']
    });
  }

  async testUsageBasedModel() {
    console.log('\n📊 Testing Usage-Based Model...\n');
    
    const prompt = `Analyze this usage-based model for AI expense tracking:
    - Free: Track up to $100/month
    - Then: 1% of AI spend tracked (e.g., $1000 spend = $10/month fee)
    - Capped at $299/month
    
    Assume:
    - 200 customers in year 1
    - Average AI spend: $3000/month
    - They pay 1% = $30/month average
    - Server costs: $500/month + $1 per customer
    - CAC: $100 (needs more education)
    
    Calculate profitability and sustainability.
    What happens if customers optimize and reduce AI spend?`;

    const response = await this.client.queryClaude({ prompt });
    console.log(response.response.substring(0, 800));
    
    this.models.push({
      name: 'Usage-Based',
      pricing: '1% of AI spend',
      estimatedCAC: 100,
      estimatedLTV: 30 * 12,
      monthlyServerCosts: 700,
      breakEvenCustomers: 24,
      yearOneProjection: {
        customers: 200,
        revenue: 72000,
        costs: 28400,
        profit: 43600
      },
      viability: 'high',
      risks: ['Revenue decreases if we succeed', 'Complex billing'],
      advantages: ['Aligned incentives', 'Scales naturally']
    });
  }

  async testOpenSourceModel() {
    console.log('\n📊 Testing Open Source + Cloud Model...\n');
    
    const prompt = `Analyze this open source + cloud model:
    - Open source: Free self-hosted
    - Cloud Starter: $19/month
    - Cloud Pro: $79/month
    - Support contracts: $500/month
    
    Assume:
    - 5000 GitHub stars in year 1
    - 2% convert to cloud (100 customers)
    - 80% choose $19, 18% choose $79, 2% need support
    - Server costs: $300/month + $0.50 per cloud user
    - Development cost: $5000/month (maintaining OSS)
    
    Is this sustainable? What's the real benefit?`;

    const response = await this.client.queryOpenAI({ 
      prompt,
      model: 'gpt-4-turbo-preview' 
    });
    console.log(response.response.substring(0, 800));
    
    this.models.push({
      name: 'Open Source + Cloud',
      pricing: 'Free OSS/$19/$79/$500',
      estimatedCAC: 20,
      estimatedLTV: 25 * 12,
      monthlyServerCosts: 5350,
      breakEvenCustomers: 215,
      yearOneProjection: {
        customers: 100,
        revenue: 36000,
        costs: 64200,
        profit: -28200
      },
      viability: 'low',
      risks: ['High maintenance cost', 'Low conversion', 'Support burden'],
      advantages: ['Developer credibility', 'No vendor lock-in concerns']
    });
  }

  async testConsultingModel() {
    console.log('\n📊 Testing Consulting/Service Model...\n');
    
    const prompt = `What if we pivot to a consulting model:
    - AI Cost Optimization Audit: $2000 one-time
    - Ongoing monitoring & recommendations: $500/month
    - Implementation of optimizations: $150/hour
    
    Target: Companies spending $20K+/month on AI
    
    Assume:
    - 2 audits per month
    - 50% convert to ongoing monitoring
    - 10 hours implementation per client
    - No server costs, just time
    
    Is this more viable than SaaS?`;

    const response = await this.client.queryGemini({ prompt });
    console.log(response.response.substring(0, 800));
    
    this.models.push({
      name: 'Consulting/Service',
      pricing: '$2000 audit + $500/month',
      estimatedCAC: 500,
      estimatedLTV: 8000,
      monthlyServerCosts: 100,
      breakEvenCustomers: 1,
      yearOneProjection: {
        customers: 24,
        revenue: 120000,
        costs: 12000,
        profit: 108000
      },
      viability: 'high',
      risks: ['Not scalable', 'Time intensive', 'Founder dependent'],
      advantages: ['High margins', 'Immediate revenue', 'Deep customer insights']
    });
  }

  async testChromeExtensionModel() {
    console.log('\n📊 Testing Chrome Extension Model...\n');
    
    const prompt = `Alternative: Chrome extension that sits on OpenAI/Claude dashboards:
    - Free: Basic tracking overlay
    - Pro: $4.99/month (export, analytics)
    - Team: $19.99/month (5 users)
    
    Benefits: 
    - No API integration needed
    - Works immediately
    - Low server costs
    
    Assume:
    - 10,000 installs year 1
    - 2% convert to Pro
    - Chrome Web Store featuring
    
    Is this simpler path viable?`;

    const response = await this.client.queryClaude({ prompt });
    console.log(response.response.substring(0, 800));
    
    this.models.push({
      name: 'Chrome Extension',
      pricing: 'Free/$4.99/$19.99',
      estimatedCAC: 5,
      estimatedLTV: 5 * 12,
      monthlyServerCosts: 100,
      breakEvenCustomers: 20,
      yearOneProjection: {
        customers: 200,
        revenue: 12000,
        costs: 2200,
        profit: 9800
      },
      viability: 'medium',
      risks: ['Low price ceiling', 'Platform dependent', 'Easy to copy'],
      advantages: ['Simple to build', 'Low CAC', 'Viral potential']
    });
  }

  async testMarketplaceModel() {
    console.log('\n📊 Testing API Marketplace Model...\n');
    
    const prompt = `Pivot idea: Become a marketplace/broker for AI APIs:
    - Aggregate multiple AI providers
    - Single API key for all providers
    - Add 10% markup on usage
    - Provide unified billing
    
    Example: Customer uses $1000 of OpenAI through us, pays $1100
    
    Assume:
    - 50 customers year 1
    - Average $2000/month usage each
    - We make 10% = $200/month per customer
    
    Legal? Viable? Better than tracking?`;

    const response = await this.client.queryPerplexity({ prompt });
    console.log(response.response.substring(0, 800));
    
    this.models.push({
      name: 'API Marketplace/Broker',
      pricing: '10% markup on usage',
      estimatedCAC: 200,
      estimatedLTV: 200 * 12,
      monthlyServerCosts: 1000,
      breakEvenCustomers: 5,
      yearOneProjection: {
        customers: 50,
        revenue: 120000,
        costs: 22000,
        profit: 98000
      },
      viability: 'high',
      risks: ['Provider TOS violations', 'Customer trust', 'Float management'],
      advantages: ['Natural revenue model', 'Sticky product', 'Clear value']
    });
  }

  async compareModels() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MODEL COMPARISON\n');
    
    // Sort by profit
    const sorted = [...this.models].sort((a, b) => 
      b.yearOneProjection.profit - a.yearOneProjection.profit
    );
    
    console.log('Ranked by Year 1 Profit:\n');
    sorted.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Revenue: $${model.yearOneProjection.revenue.toLocaleString()}`);
      console.log(`   Costs: $${model.yearOneProjection.costs.toLocaleString()}`);
      console.log(`   Profit: $${model.yearOneProjection.profit.toLocaleString()}`);
      console.log(`   Viability: ${model.viability}`);
      console.log('');
    });
  }

  async generateRecommendation() {
    console.log('='.repeat(60));
    console.log('🎯 FINAL RECOMMENDATION\n');
    
    const prompt = `Based on these business models for AI expense tracking:
    
    ${this.models.map(m => `${m.name}: Y1 Profit = $${m.yearOneProjection.profit}, Viability = ${m.viability}`).join('\n')}
    
    Considering:
    - We need sustainable revenue, not venture scale
    - Costs can't exceed revenue
    - Founder has limited time/resources
    - Market reality (most won't pay $200/month)
    
    What's the smartest path forward? Should we:
    1. Pick one model
    2. Combine models  
    3. Start with one and transition
    4. Abandon this and pivot completely
    
    Give me the brutal honest recommendation.`;

    const response = await this.client.queryClaude({ 
      prompt,
      model: 'claude-opus-4-1-20250805'
    });
    
    console.log(response.response);
    
    // Save full analysis
    const report = {
      timestamp: new Date().toISOString(),
      models: this.models,
      recommendation: response.response
    };
    
    const reportPath = path.join(
      process.cwd(),
      'research-results',
      `business-model-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Full analysis saved to: ${reportPath}`);
  }
}

async function explorePivots() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 EXPLORING PIVOT OPTIONS\n');
  
  const client = new UnifiedLLMClient({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
  });

  const pivotPrompt = `The AI expense tracking SaaS isn't viable at scale. 
  
  We have:
  - Expertise in AI/LLM integration
  - Built token counting/tracking technology
  - Understanding of AI cost optimization
  
  What are 5 alternative business ideas using the same tech/expertise that might be MORE viable?
  
  Think about:
  - Problems that are more painful
  - Customers with bigger budgets
  - Simpler business models
  - B2B or B2C opportunities
  
  Be specific and realistic.`;

  const response = await client.queryGemini({ prompt: pivotPrompt });
  console.log('Potential Pivots:\n');
  console.log(response.response);
}

async function main() {
  const tester = new BusinessModelTester();
  
  // Test all models
  await tester.testAllModels();
  
  // Explore pivots
  await explorePivots();
  
  console.log('\n✅ Business model analysis complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { BusinessModelTester };
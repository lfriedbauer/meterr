#!/usr/bin/env node
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

interface TargetCompany {
  name: string;
  industry: string;
  size: string;
  estimatedAISpend: string;
  contactTitle: string;
  painPoint: string;
  pitch: string;
}

async function findTargetCompanies() {
  const client = new UnifiedLLMClient({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    grok: process.env.XAI_API_KEY,
  });

  console.log('🎯 Finding First 10 Target Customers\n');
  console.log('=' .repeat(60) + '\n');

  // Use Perplexity to find real companies
  const searchPrompt = `Find 10 real companies that:
  1. Are tech startups or scale-ups (Series A to C)
  2. Likely spending $5K-50K/month on AI APIs
  3. Have engineering teams of 20-100 people
  4. Are actively hiring AI/ML engineers (indicates AI usage)
  5. Based in US (easier to reach)
  
  For each company, provide:
  - Company name
  - What they do
  - Estimated employee count
  - Recent AI-related news or job postings
  - CTO or VP Engineering name if public
  
  Focus on companies that would benefit from AI cost optimization.`;

  console.log('🔍 Searching for target companies...\n');
  const searchResults = await client.queryPerplexity({ prompt: searchPrompt });
  console.log(searchResults.response.substring(0, 1500));

  // Generate outreach strategy
  const outreachPrompt = `Based on these target companies for AI cost optimization service ($299/month):
  
  ${searchResults.response.substring(0, 1000)}
  
  Create specific outreach messages for LinkedIn that:
  1. Are under 300 characters
  2. Mention a specific pain point
  3. Offer free 15-min AI cost analysis
  4. Sound helpful, not salesy
  
  Example format:
  "Hi [Name], noticed [Company] is scaling AI features. We helped [Similar Company] cut AI costs by 30% without changing providers. Worth a quick chat? I can share their playbook."`;

  console.log('\n📧 Generating Outreach Templates...\n');
  const outreachTemplates = await client.queryGemini({ prompt: outreachPrompt });
  console.log(outreachTemplates.response.substring(0, 1000));

  // Create email sequences
  const emailPrompt = `Create a 3-email sequence for AI cost optimization service:
  
  Email 1 (Day 1): Introduction + Value
  Email 2 (Day 4): Case Study + Social Proof  
  Email 3 (Day 7): Final Offer + Urgency
  
  Target: CTO spending $10K+/month on OpenAI/Claude
  Offer: Free AI cost audit (normally $1,500)
  Goal: Book 15-min consultation
  
  Make it conversational, not corporate.`;

  console.log('\n📬 Creating Email Sequence...\n');
  const emailSequence = await client.queryClaude({ prompt: emailPrompt });
  console.log(emailSequence.response.substring(0, 1000));

  // Generate content ideas
  const contentPrompt = `Create 5 LinkedIn post ideas that would attract CTOs worried about AI costs:
  
  Format:
  - Hook (first line that stops scrolling)
  - Story or insight (3-4 lines)
  - Actionable tip
  - Soft CTA
  
  Topics to cover:
  - Hidden AI costs
  - Optimization wins
  - Model selection mistakes
  - Token waste
  - Team usage tracking`;

  console.log('\n📝 Content Marketing Ideas...\n');
  const contentIdeas = await client.queryOpenAI({ 
    prompt: contentPrompt,
    model: 'gpt-4-turbo-preview'
  });
  console.log(contentIdeas.response.substring(0, 1000));

  // Save everything
  const salesPlan = {
    timestamp: new Date().toISOString(),
    targetCompanies: searchResults.response,
    outreachTemplates: outreachTemplates.response,
    emailSequence: emailSequence.response,
    contentIdeas: contentIdeas.response,
    nextSteps: [
      'Pick 3 companies from the list',
      'Find CTOs on LinkedIn',
      'Send personalized connection request',
      'Post 1 LinkedIn article today',
      'Set up Calendly for consultations',
      'Create simple landing page'
    ]
  };

  const planPath = path.join(
    process.cwd(),
    'research-results',
    `sales-execution-plan-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );

  writeFileSync(planPath, JSON.stringify(salesPlan, null, 2));
  console.log(`\n📁 Sales execution plan saved to: ${planPath}`);

  return salesPlan;
}

async function calculateROI() {
  const client = new UnifiedLLMClient({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    grok: process.env.XAI_API_KEY,
  });

  console.log('\n💰 ROI Calculator for Sales Pitch\n');
  console.log('=' .repeat(60) + '\n');

  const roiPrompt = `Create a simple ROI calculator for our AI cost optimization service:
  
  Inputs:
  - Current monthly AI spend: $10,000
  - Number of developers using AI: 20
  - Average tokens per request: 2000
  
  Our impact:
  - 15-25% cost reduction through model routing
  - 10% reduction through caching
  - 5% reduction through prompt optimization
  
  Service cost: $299/month
  
  Calculate:
  1. Monthly savings
  2. ROI percentage
  3. Payback period
  4. Annual impact
  
  Make it believable, not oversold.`;

  const roiCalc = await client.queryGemini({ prompt: roiPrompt });
  console.log('ROI Calculation:\n');
  console.log(roiCalc.response);

  return roiCalc.response;
}

async function createLandingPage() {
  console.log('\n🌐 Simple Landing Page Copy\n');
  console.log('=' .repeat(60) + '\n');

  const client = new UnifiedLLMClient({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    grok: process.env.XAI_API_KEY,
  });

  const landingPrompt = `Create copy for a simple landing page:
  
  Headline: [Grab attention]
  Subheadline: [Clarify value]
  
  Problem section (3 bullets)
  Solution section (3 bullets)
  
  Social proof (even if hypothetical)
  
  CTA: "Get Your Free AI Cost Analysis"
  
  Target: CTOs spending $5K+/month on AI
  Tone: Confident but not hypey
  Length: Under 200 words total`;

  const landing = await client.queryClaude({ prompt: landingPrompt });
  console.log(landing.response);

  return landing.response;
}

async function main() {
  console.log('🚀 SALES PIPELINE ACTIVATION\n');
  
  // Find target companies
  const salesPlan = await findTargetCompanies();
  
  // Calculate ROI for pitch
  await calculateROI();
  
  // Create landing page
  await createLandingPage();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ NEXT ACTIONS (DO TODAY):');
  console.log('1. Pick 3 companies from the list');
  console.log('2. Find their CTOs on LinkedIn');
  console.log('3. Send connection requests with personalized note');
  console.log('4. Set up Calendly.com account');
  console.log('5. Create one-page Google Doc as "AI Cost Audit Template"');
  console.log('6. Post one LinkedIn article about AI costs');
  console.log('\n🎯 Goal: Book 2 consultations this week');
  console.log('💰 Target: Close 1 audit at $1,500 by Friday\n');
}

if (require.main === module) {
  main().catch(console.error);
}

export { findTargetCompanies, calculateROI };
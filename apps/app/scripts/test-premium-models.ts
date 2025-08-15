#!/usr/bin/env node
import dotenv from 'dotenv';
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';

// Load environment variables
dotenv.config();

const testPrompt =
  "Testing premium models. Please respond with 'Hello from [your model name]!' and nothing else.";

async function testPremiumModels() {
  const client = new UnifiedLLMClient({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    xai: process.env.XAI_API_KEY,
  });

  console.log('🚀 Testing Premium Model Connections...\n');

  // Test Claude Opus 4.1
  try {
    console.log('Testing Claude Opus 4.1...');
    const result = await client.queryClaude({
      prompt: testPrompt,
      model: 'claude-opus-4-1-20250805',
    });
    console.log('✅ Claude Opus 4.1:', result.response.substring(0, 100));
    console.log('   Model:', result.model);
    if (result.usage) {
      console.log('   Cost: $' + result.usage.totalCost.toFixed(4));
    }
  } catch (error: any) {
    console.log('❌ Claude Opus 4.1:', error.response?.data || error.message);
  }

  // Test Grok-4
  try {
    console.log('\nTesting Grok-4...');
    const result = await client.queryGrok({
      prompt: testPrompt,
      model: 'grok-4-latest',
    });
    console.log('✅ Grok-4:', result.response.substring(0, 100));
    console.log('   Model:', result.model);
    if (result.usage) {
      console.log('   Cost: $' + result.usage.totalCost.toFixed(4));
    }
  } catch (error: any) {
    console.log('❌ Grok-4:', error.response?.data || error.message);
  }

  // Also test GPT-4 Turbo for comparison
  try {
    console.log('\nTesting GPT-4 Turbo (for comparison)...');
    const result = await client.queryOpenAI({
      prompt: testPrompt,
      model: 'gpt-4-turbo-preview',
    });
    console.log('✅ GPT-4 Turbo:', result.response.substring(0, 100));
    if (result.usage) {
      console.log('   Cost: $' + result.usage.totalCost.toFixed(4));
    }
  } catch (error: any) {
    console.log('❌ GPT-4 Turbo:', error.message);
  }

  console.log('\n✨ Premium model testing complete!');
}

testPremiumModels().catch(console.error);

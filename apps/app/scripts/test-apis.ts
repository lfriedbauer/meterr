#!/usr/bin/env node
import dotenv from 'dotenv';
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';

// Load environment variables
dotenv.config();

const testPrompt =
  "Testing connection. Please respond with 'Hello from [your name]!' and nothing else.";

async function testAPIs() {
  const client = new UnifiedLLMClient({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    xai: process.env.XAI_API_KEY,
  });

  console.log('🧪 Testing API Connections...\n');

  // Test OpenAI
  try {
    console.log('Testing OpenAI...');
    const result = await client.queryOpenAI({
      prompt: testPrompt,
      model: 'gpt-3.5-turbo',
    });
    console.log('✅ OpenAI:', result.response.substring(0, 50));
  } catch (error: any) {
    console.log('❌ OpenAI:', error.message);
  }

  // Test Claude
  try {
    console.log('\nTesting Claude...');
    const result = await client.queryClaude({
      prompt: testPrompt,
      model: 'claude-3-5-sonnet-20241022',
    });
    console.log('✅ Claude:', result.response.substring(0, 50));
  } catch (error: any) {
    console.log('❌ Claude:', error.message);
  }

  // Test Google Gemini
  try {
    console.log('\nTesting Google Gemini...');
    const result = await client.queryGemini({
      prompt: testPrompt,
      model: 'gemini-1.5-flash',
    });
    console.log('✅ Gemini:', result.response.substring(0, 50));
  } catch (error: any) {
    console.log('❌ Gemini:', error.message);
  }

  // Test Perplexity
  try {
    console.log('\nTesting Perplexity...');
    const result = await client.queryPerplexity({
      prompt: testPrompt,
      model: 'sonar',
    });
    console.log('✅ Perplexity:', result.response.substring(0, 50));
  } catch (error: any) {
    console.log('❌ Perplexity:', error.message);
  }

  // Test Grok
  try {
    console.log('\nTesting Grok...');
    const result = await client.queryGrok({
      prompt: testPrompt,
      model: 'grok-2',
    });
    console.log('✅ Grok:', result.response.substring(0, 50));
  } catch (error: any) {
    console.log('❌ Grok:', error.message);
  }

  console.log('\n✨ API testing complete!');
}

testAPIs().catch(console.error);

#!/usr/bin/env node
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPerplexityModels() {
  console.log('🔍 Testing Perplexity models...\n');

  const models = [
    'sonar-small-chat',
    'sonar-small-online',
    'sonar-medium-chat',
    'sonar-medium-online',
    'mixtral-8x7b-instruct',
    'llama-3-sonar-small-32k-chat',
    'llama-3-sonar-small-32k-online',
    'llama-3-sonar-large-32k-chat',
    'llama-3-sonar-large-32k-online',
    'llama-3-8b-instruct',
    'llama-3-70b-instruct',
  ];

  for (const model of models) {
    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`✅ ${model} works`);
      break; // Found a working model
    } catch (error: any) {
      console.log(`❌ ${model}: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

async function testGrokModels() {
  console.log('\n🔍 Testing Grok models...\n');

  const models = [
    'grok',
    'grok-1',
    'grok-2',
    'grok-beta',
    'grok-2-beta',
    'grok-2-latest',
    'grok-latest',
  ];

  for (const model of models) {
    try {
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`✅ ${model} works`);
      break; // Found a working model
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.code || error.message;
      console.log(`❌ ${model}: ${message}`);
    }
  }
}

async function main() {
  await testPerplexityModels();
  await testGrokModels();
}

main().catch(console.error);

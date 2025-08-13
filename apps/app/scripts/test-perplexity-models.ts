#!/usr/bin/env node
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPerplexityModels() {
  console.log('🔍 Testing more Perplexity model variations...\n');
  
  const models = [
    // Try without prefixes
    'sonar',
    'mixtral',
    'llama-3.1-sonar-small-128k-online',
    'llama-3.1-sonar-large-128k-online',
    'llama-3.1-sonar-small-128k-chat',
    'llama-3.1-sonar-large-128k-chat',
    // Try current models from their docs
    'llama-3.1-8b-instruct',
    'llama-3.1-70b-instruct',
    'llama-3.1-405b-instruct',
    // Try pplx models
    'pplx-7b-online',
    'pplx-70b-online',
    'pplx-7b-chat',
    'pplx-70b-chat'
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
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      console.log(`✅ ${model} works!`);
      console.log(`   Response: ${response.data.choices[0].message.content}`);
      return model; // Return first working model
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        console.log(`⏱️ ${model}: Timeout`);
      } else {
        const msg = error.response?.data?.error?.message || error.message;
        console.log(`❌ ${model}: ${msg.substring(0, 50)}...`);
      }
    }
  }
  
  console.log('\n❌ No working Perplexity models found');
  return null;
}

testPerplexityModels().catch(console.error);
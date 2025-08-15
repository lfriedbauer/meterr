#!/usr/bin/env node
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testClaudeModels() {
  console.log('🔍 Testing Claude model names...\n');

  const models = [
    'claude-opus-4-1-20250805',
    'claude-3-opus-20240229',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0',
    'claude-instant-1.2',
  ];

  for (const model of models) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model,
          messages: [{ role: 'user', content: 'What model are you?' }],
          max_tokens: 100,
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`✅ ${model} works`);
      console.log(`   Response: "${response.data.content[0].text}"`);
      console.log(`   Actual model used: ${response.data.model}`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.log(`❌ ${model}: ${errorMsg}`);
    }
  }
}

testClaudeModels().catch(console.error);

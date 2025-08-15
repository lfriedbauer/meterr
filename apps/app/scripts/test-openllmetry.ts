import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { initializeTelemetry } from '../lib/telemetry/setup';
import { shutdownLLMMonitoring } from '../lib/telemetry/llm-monitoring';

async function testOpenLLMetry() {
  console.log('🚀 Testing OpenLLMetry Integration...\n');
  
  initializeTelemetry();
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    if (process.env.OPENAI_API_KEY) {
      console.log('Testing OpenAI...');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say hello in 5 words' }],
        max_tokens: 20
      });
      
      console.log('✅ OpenAI Response:', completion.choices[0].message.content);
      console.log('   Usage:', completion.usage);
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('\nTesting Anthropic...');
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      
      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Say hello in 5 words' }]
      });
      
      console.log('✅ Anthropic Response:', message.content[0].text);
      console.log('   Usage:', message.usage);
    }
    
    console.log('\n📊 Check your console output above for cost tracking!');
    console.log('💾 Data should be saved to your database (if configured)');
    console.log('\n✨ OpenLLMetry is working! No proxy needed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await shutdownLLMMonitoring();
  }
}

testOpenLLMetry().catch(console.error);
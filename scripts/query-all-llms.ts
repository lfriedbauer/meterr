import { ResearchExecutor, ResearchQuery } from '../packages/@meterr/llm-client';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Documentation analysis prompt from continuation session
const DOCUMENTATION_ANALYSIS_PROMPT = `# Documentation Structure Analysis for Multi-Stakeholder Project

## Context:
I have a software project (meterr.ai - AI expense tracking) with documentation split across:
- /docs/ folder: 12 files for human developers (detailed, educational)  
- .claude/context/ folder: 15 files for AI agents (concise, operational)
- 35% content overlap between directories
- 8 files duplicated with different depths

## Requirements:
1. Review documentation structure patterns
2. Identify overlap/redundancy management strategies
3. Assess cognitive load for finding information
4. Consider AI agent navigation patterns
5. Evaluate maintenance burden

## Questions:
1. What is the best practice for managing documentation that serves both human developers and AI agents?
2. Should we maintain separate directories, single source with views, or unified documents?
3. What existing tools handle multi-stakeholder documentation well?
4. Are there existing open-source tools or SaaS solutions that already solve this problem?
5. Are there emerging standards for AI agent documentation?

## Success Metrics:
- Time to find information reduced by 50%
- Zero duplicate/conflicting guidelines
- Clear navigation path for both humans and AI
- Simplified maintenance with single source of truth

Please provide specific, actionable recommendations.`;

async function main() {
  console.log('🚀 Starting multi-LLM documentation analysis...\n');
  
  // Check which API keys are configured
  const config = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    xai: process.env.XAI_API_KEY,
  };
  
  const configuredServices = Object.entries(config)
    .filter(([_, key]) => key && !key.includes('xxx'))
    .map(([service]) => service);
  
  if (configuredServices.length === 0) {
    console.error('❌ No API keys configured!');
    console.log('\nPlease add your API keys to .env file:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Add your API keys');
    console.log('\nGet API keys from:');
    console.log('- OpenAI: https://platform.openai.com/api-keys');
    console.log('- Anthropic: https://console.anthropic.com/settings/keys');
    console.log('- Google: https://makersuite.google.com/app/apikey');
    console.log('- Perplexity: https://www.perplexity.ai/settings/api');
    console.log('- X.AI (Grok): https://x.ai/api');
    process.exit(1);
  }
  
  console.log('✅ Configured services:', configuredServices.join(', '));
  console.log('\n📝 Query: Documentation structure analysis for meterr.ai\n');
  
  // Initialize research executor
  const executor = new ResearchExecutor(config);
  
  // Prepare research query
  const query: ResearchQuery = {
    prompt: DOCUMENTATION_ANALYSIS_PROMPT,
    temperature: 0.7,
    maxTokens: 3000,
  };
  
  // Execute research across all configured LLMs
  console.log('🔄 Querying all configured LLMs...\n');
  const results = await executor.executeResearchPlan([query]);
  
  // Create research output directory
  const outputDir = path.join(process.cwd(), 'research', 'documentation-analysis');
  await fs.mkdir(outputDir, { recursive: true });
  
  // Save individual responses
  for (const [prompt, responses] of results.entries()) {
    console.log(`\n📊 Received ${responses.length} responses:\n`);
    
    for (const response of responses) {
      console.log(`✅ ${response.service} (${response.model})`);
      
      // Save individual response
      const filename = `${response.service.toLowerCase()}-response.md`;
      const filepath = path.join(outputDir, filename);
      
      const content = `# ${response.service} Response
Model: ${response.model}
Timestamp: ${response.timestamp}
${response.usage ? `\nTokens: ${response.usage.promptTokens} input, ${response.usage.completionTokens} output
Cost: $${response.usage.totalCost.toFixed(4)}` : ''}

## Response

${response.response}`;
      
      await fs.writeFile(filepath, content);
      console.log(`   Saved to: research/documentation-analysis/${filename}`);
    }
  }
  
  // Save combined results as JSON
  const jsonPath = path.join(outputDir, 'all-responses.json');
  await executor.saveResults(jsonPath);
  
  // Create comparative analysis
  const analysisPath = path.join(outputDir, 'comparative-analysis.md');
  await createComparativeAnalysis(results, analysisPath);
  
  // Calculate total cost
  const totalCost = executor.getTotalCost();
  console.log(`\n💰 Total cost: $${totalCost.toFixed(4)}`);
  
  console.log('\n✅ Analysis complete!');
  console.log('\n📁 Results saved to: research/documentation-analysis/');
  console.log('   - Individual responses: [service]-response.md');
  console.log('   - Combined JSON: all-responses.json');
  console.log('   - Comparative analysis: comparative-analysis.md');
}

async function createComparativeAnalysis(results: Map<string, any[]>, filepath: string) {
  let content = '# Comparative Analysis of LLM Responses\n\n';
  content += `Generated: ${new Date().toISOString()}\n\n`;
  
  for (const [_, responses] of results.entries()) {
    if (responses.length === 0) continue;
    
    content += '## Summary by Service\n\n';
    
    for (const response of responses) {
      content += `### ${response.service}\n`;
      content += `**Model:** ${response.model}\n\n`;
      
      // Extract key points (first 500 chars as summary)
      const summary = response.response.substring(0, 500) + '...';
      content += `${summary}\n\n`;
      content += `[Full response](${response.service.toLowerCase()}-response.md)\n\n`;
      content += '---\n\n';
    }
    
    // Common themes section
    content += '## Common Themes\n\n';
    content += '1. **Documentation Structure**: Most models recommend...\n';
    content += '2. **Tool Recommendations**: Commonly mentioned tools...\n';
    content += '3. **Best Practices**: Agreed upon practices...\n\n';
    
    content += '## Key Differences\n\n';
    content += '- Service-specific recommendations\n';
    content += '- Unique insights per model\n\n';
    
    content += '## Recommended Action Plan\n\n';
    content += '1. Start with Documentation Matrix Dashboard\n';
    content += '2. Implement single source of truth\n';
    content += '3. Use automated tools for synchronization\n';
  }
  
  await fs.writeFile(filepath, content);
}

// Run the script
main().catch(console.error);
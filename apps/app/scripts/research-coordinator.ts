#!/usr/bin/env node
import {
  findQuickWins,
  findToolsForUseCase,
  initializeToolIndex,
  recommendToolsForProject,
  TOOL_CATEGORIES,
} from '../lib/research-coordinator/tool-index';

/**
 * Research Coordinator Agent
 * Helps find the best tools to reduce development time
 */

async function main() {
  console.log('🔍 Research Coordinator Agent Starting...\n');

  // Initialize the tool index
  initializeToolIndex();

  // Example: Find tools for current meterr needs
  const meterrRequirements = [
    'real-time cost tracking',
    'LLM integration',
    'usage analytics',
    'error monitoring',
    'user authentication',
    'payment processing',
  ];

  console.log('📋 Analyzing Meterr Requirements...\n');

  // Get recommendations
  const recommendations = await recommendToolsForProject(meterrRequirements);

  console.log('🎯 Top Tool Recommendations:\n');
  recommendations.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool.name} (${tool.category})`);
    console.log(`   ⏱️  Time Saved: ${tool.time_saved}`);
    console.log(`   🔧 Setup Time: ${tool.implementation_effort}`);
    console.log(`   ✅ Pros: ${tool.pros.join(', ')}`);
    console.log(`   ⚠️  Cons: ${tool.cons.join(', ')}`);
    console.log(`   🔗 ${tool.url}\n`);
  });

  // Find quick wins
  console.log('⚡ Quick Win Tools (< 2 hours to implement):\n');
  const quickWins = await findQuickWins();
  quickWins.forEach((result: any) => {
    const tool = result.doc || result;
    console.log(`- ${tool.name}: ${tool.time_saved} saved, ${tool.implementation_effort} to setup`);
  });

  // Search for specific needs
  console.log('\n🔎 Searching for Real-time Solutions...\n');
  const realtimeTools = await findToolsForUseCase('realtime');
  realtimeTools.forEach((result: any) => {
    const tool = result.doc || result;
    console.log(`- ${tool.name}: ${tool.description}`);
  });
}

// Command line interface
if (process.argv[2] === 'search') {
  const query = process.argv.slice(3).join(' ');
  initializeToolIndex();
  findToolsForUseCase(query).then((results) => {
    console.log(`\n🔍 Search results for "${query}":\n`);
    results.forEach((result: any) => {
      const tool = result.doc || result;
      console.log(`- ${tool.name}: ${tool.description}`);
      console.log(`  Time saved: ${tool.time_saved}, Setup: ${tool.implementation_effort}`);
    });
  });
} else if (process.argv[2] === 'quick') {
  initializeToolIndex();
  findQuickWins().then((results) => {
    console.log('\n⚡ Quick wins (minimal setup time):\n');
    results.forEach((result: any) => {
      const tool = result.doc || result;
      console.log(`- ${tool.name}: ${tool.time_saved} saved`);
    });
  });
} else {
  main().catch(console.error);
}

export { main };

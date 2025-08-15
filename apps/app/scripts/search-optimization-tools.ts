#!/usr/bin/env node
import { DEVELOPMENT_TOOLS, initializeToolIndex } from '../lib/research-coordinator/tool-index';

// Initialize the tool index
initializeToolIndex();

// Filter for code optimization tools
const optimizationTools = DEVELOPMENT_TOOLS.filter(
  (tool) =>
    tool.keywords.some(
      (k) =>
        k.includes('optimization') ||
        k.includes('quality') ||
        k.includes('linter') ||
        k.includes('formatter') ||
        k.includes('performance') ||
        k.includes('cleanup')
    ) || tool.category === 'optimization'
);

console.log('🔍 Code Optimization Tools for Enhancing Claude Code:');
console.log('═'.repeat(60));
console.log('\nThese tools can improve code quality and reduce hallucinations:\n');

optimizationTools.forEach((tool, index) => {
  console.log(`${index + 1}. ${tool.name}`);
  console.log(`   📝 ${tool.description}`);
  console.log(`   ⏱️  Time Saved: ${tool.time_saved}`);
  console.log(`   🔧 Setup Time: ${tool.implementation_effort}`);
  console.log(`   ✅ Benefits: ${tool.pros.slice(0, 2).join(', ')}`);
  console.log(`   🔗 ${tool.url}`);
  console.log('');
});

console.log('═'.repeat(60));
console.log('\n💡 TOP RECOMMENDATIONS FOR CLAUDE CODE:\n');

const topPicks = [
  {
    tool: 'Biome',
    reason: '10-20x faster than ESLint, perfect for CI/CD validation of Claude-generated code',
  },
  {
    tool: 'Knip',
    reason: 'Removes unused code that Claude might generate, reduces bloat',
  },
  {
    tool: 'type-coverage',
    reason: 'Ensures Claude doesn\'t use "any" types, improves type safety',
  },
  {
    tool: 'Size Limit',
    reason: 'Prevents Claude from adding code that bloats bundle size',
  },
];

topPicks.forEach((pick, i) => {
  console.log(`${i + 1}. ${pick.tool}: ${pick.reason}`);
});

console.log('\n🚀 Quick Setup Commands:\n');
console.log('pnpm add -D @biomejs/biome     # Fast linter/formatter');
console.log('pnpm add -D knip                # Dead code elimination');
console.log('pnpm add -D type-coverage       # TypeScript coverage');
console.log('pnpm add -D size-limit @size-limit/preset-small-lib  # Bundle size');

console.log('\n✨ These tools will:');
console.log("- Validate Claude's code output automatically");
console.log('- Reduce hallucinations through strict linting');
console.log('- Optimize performance and bundle size');
console.log('- Maintain code quality standards');

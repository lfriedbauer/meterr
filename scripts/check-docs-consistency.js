#!/usr/bin/env node

/**
 * Documentation Consistency Checker
 * Validates shared facts across all documentation
 * Ensures phase-based methodology and naming conventions
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { glob } from 'glob';

const SHARED_DATA_PATH = './shared-data.yml';
const DOCS_PATHS = [
  './docs-portal/docs/**/*.md',
  './docs-portal/ai-docs/**/*.md',
  './.claude/**/*.md',
  './README.md',
  './guidelines*.md'
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

async function main() {
  console.log(`${colors.blue}🔍 Checking documentation consistency...${colors.reset}\n`);
  
  // Load shared data
  if (!fs.existsSync(SHARED_DATA_PATH)) {
    console.error(`${colors.red}❌ shared-data.yml not found at root level${colors.reset}`);
    process.exit(1);
  }
  
  const sharedData = yaml.parse(fs.readFileSync(SHARED_DATA_PATH, 'utf8'));
  
  // Find all documentation files
  const docFiles = [];
  for (const pattern of DOCS_PATHS) {
    const files = await glob(pattern);
    docFiles.push(...files);
  }
  
  console.log(`${colors.gray}Found ${docFiles.length} documentation files to check${colors.reset}\n`);
  
  let errors = [];
  let warnings = [];
  
  for (const file of docFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const fileName = path.basename(file);
    const dirName = path.dirname(file);
    
    // Check version consistency
    const versionMatches = content.match(/v?\d+\.\d+\.\d+(-\w+)?/g);
    if (versionMatches) {
      versionMatches.forEach(version => {
        // Allow versions that are clearly examples or different contexts
        if (!version.includes('example') && 
            version !== sharedData.current_version && 
            !version.startsWith(sharedData.current_version.replace('v', ''))) {
          warnings.push(`${file}: Found version "${version}" (expected "${sharedData.current_version}")`);
        }
      });
    }
    
    // Check provider consistency
    const allProviders = [
      ...sharedData.supported_providers.primary,
      ...sharedData.supported_providers.secondary,
      ...sharedData.supported_providers.planned
    ];
    
    // Check for unsupported provider mentions
    const providerPattern = /\b(openai|anthropic|google|azure|mistral|cohere|bedrock|hugging face|replicate|together|groq)\b/gi;
    const mentionedProviders = content.match(providerPattern);
    if (mentionedProviders) {
      const uniqueProviders = [...new Set(mentionedProviders.map(p => p.toLowerCase().replace(' ', '_')))];
      uniqueProviders.forEach(provider => {
        const normalizedProvider = provider.replace('hugging face', 'hugging_face')
                                          .replace('azure', 'azure_openai')
                                          .replace('bedrock', 'aws_bedrock')
                                          .replace('together', 'together_ai');
        if (!allProviders.some(p => normalizedProvider.includes(p) || p.includes(normalizedProvider))) {
          warnings.push(`${file}: References provider "${provider}" not in supported_providers list`);
        }
      });
    }
    
    // Check tech stack consistency
    if (content.includes('Next.js')) {
      const nextVersionPattern = /Next\.js\s+(\d+)/g;
      const matches = [...content.matchAll(nextVersionPattern)];
      matches.forEach(match => {
        if (match[1] && !sharedData.tech_stack.frontend.includes(match[1])) {
          errors.push(`${file}: Next.js version "${match[1]}" doesn't match shared data "${sharedData.tech_stack.frontend}"`);
        }
      });
    }
    
    // Check for time-based references (forbidden)
    const timeReferences = /\b(week\s+\d+|month\s+\d+|Q[1-4]\s+20\d{2}|sprint\s+\d+|by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|end\s+of\s+(week|month|quarter|year))\b/gi;
    const timeMatches = content.match(timeReferences);
    if (timeMatches) {
      timeMatches.forEach(match => {
        errors.push(`${file}: Contains forbidden time reference "${match}" - use phase-based planning`);
      });
    }
    
    // Check for phase-based methodology
    if (content.toLowerCase().includes('phase')) {
      const phasePattern = /Phase\s+(\d+)[:\s]+([^(]+)\(Confidence:\s+(\d+)%\)/gi;
      const phaseMatches = [...content.matchAll(phasePattern)];
      phaseMatches.forEach(match => {
        const confidence = parseInt(match[3]);
        const expectedPhase = sharedData.methodology.phases.find(p => p.name.includes(`Phase ${match[1]}`));
        if (expectedPhase && expectedPhase.confidence !== `${confidence}%`) {
          warnings.push(`${file}: Phase ${match[1]} confidence "${confidence}%" doesn't match expected "${expectedPhase.confidence}"`);
        }
      });
    }
    
    // Check for console.log (forbidden in code examples)
    if (content.includes('console.log')) {
      const codeBlockPattern = /```[\s\S]*?console\.log[\s\S]*?```/g;
      if (codeBlockPattern.test(content)) {
        errors.push(`${file}: Contains console.log in code examples - use logger instead`);
      }
    }
    
    // Check for 'any' type usage (forbidden in TypeScript examples)
    const anyTypePattern = /:\s*any\b/g;
    if (anyTypePattern.test(content)) {
      const codeBlockPattern = /```typescript[\s\S]*?:\s*any[\s\S]*?```/g;
      if (codeBlockPattern.test(content)) {
        errors.push(`${file}: Contains 'any' type in TypeScript examples - use explicit types`);
      }
    }
    
    // Check for BigNumber usage in financial examples
    if (content.toLowerCase().includes('cost') || content.toLowerCase().includes('price') || content.toLowerCase().includes('financial')) {
      if (!content.includes('BigNumber') && content.includes('```typescript')) {
        warnings.push(`${file}: Contains financial calculations but doesn't mention BigNumber`);
      }
    }
    
    // Check naming conventions
    if (dirName.includes('docs-portal/docs') && !dirName.includes('ai-docs')) {
      // Business docs should be UPPERCASE
      if (fileName.match(/^[A-Z_]+\.md$/) === null && 
          ['MVP_SPEC.md', 'GO_TO_MARKET.md', 'MARKET_VALIDATION_REPORT.md', 'IMPLEMENTATION_ROADMAP.md', 'MISSION_STATEMENT.md'].includes(fileName)) {
        errors.push(`${file}: Business document should use UPPERCASE naming convention`);
      }
      // Technical docs should be lowercase
      if (fileName.match(/^[a-z-]+\.md$/) === null && 
          !['MVP_SPEC.md', 'GO_TO_MARKET.md', 'MARKET_VALIDATION_REPORT.md', 'IMPLEMENTATION_ROADMAP.md', 'MISSION_STATEMENT.md'].includes(fileName)) {
        errors.push(`${file}: Technical document should use lowercase naming convention`);
      }
    }
    
    // Check pricing model consistency
    if (content.includes('Pay What You Save') || content.includes('pricing')) {
      const percentagePattern = /(\d+)%\s+of\s+(savings|what we save)/gi;
      const matches = [...content.matchAll(percentagePattern)];
      matches.forEach(match => {
        const percentage = parseInt(match[1]);
        if (percentage !== parseInt(sharedData.pricing.percentage)) {
          errors.push(`${file}: Pricing percentage "${percentage}%" doesn't match shared data "${sharedData.pricing.percentage}"`);
        }
      });
    }
  }
  
  // Report results
  console.log('━'.repeat(60) + '\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${colors.green}✅ All documentation is consistent!${colors.reset}`);
  } else {
    if (errors.length > 0) {
      console.log(`${colors.red}❌ Found ${errors.length} critical issues:${colors.reset}\n`);
      errors.forEach(error => console.log(`  ${colors.red}•${colors.reset} ${error}`));
      console.log();
    }
    
    if (warnings.length > 0) {
      console.log(`${colors.yellow}⚠️  Found ${warnings.length} warnings:${colors.reset}\n`);
      warnings.forEach(warning => console.log(`  ${colors.yellow}•${colors.reset} ${warning}`));
      console.log();
    }
    
    console.log('━'.repeat(60));
    console.log(`\n${colors.blue}Summary:${colors.reset}`);
    console.log(`  • ${errors.length} errors (must fix)`);
    console.log(`  • ${warnings.length} warnings (should review)`);
    console.log(`  • ${docFiles.length} files checked`);
    
    // Exit with error if critical issues found
    if (errors.length > 0) {
      process.exit(1);
    }
  }
  
  // Additional stats
  console.log(`\n${colors.gray}Current configuration:${colors.reset}`);
  console.log(`  • Version: ${sharedData.current_version}`);
  console.log(`  • Phase: ${sharedData.phase} (${sharedData.confidence_level})`);
  console.log(`  • Providers: ${sharedData.supported_providers.primary.length} primary, ${sharedData.supported_providers.secondary.length} secondary`);
  console.log(`  • Pricing: ${sharedData.pricing.model} (${sharedData.pricing.percentage})`);
}

main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
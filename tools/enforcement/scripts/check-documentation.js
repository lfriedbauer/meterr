#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

// Allowed documentation locations
const ALLOWED_PATTERNS = [
  'docs-portal/**/*.md',
  '.claude/**/*.md',
  'tools/*/README.md',
  'README.md',
  'CHANGELOG.md',
  'PIVOT_QUESTIONS.md',
  'packages/*/README.md',
  'apps/*/README.md'
];

// Explicitly banned patterns
const BANNED_PATTERNS = [
  'docs/**/*',  // Old docs folder
  '*_STATUS.md',
  '*_COMPLETE.md',
  'TOOLS_*.md',
  'RECOMMENDED_*.md',
  'UI_*.md',
  'PERFORMANCE_*.md',
  'CI_CD_*.md',
  'DEPRECATION_*.md'
];

function checkDocumentation() {
  console.log(`${COLORS.cyan}📚 Checking Documentation Structure${COLORS.reset}\n`);
  
  let violations = [];
  let warnings = [];
  
  // Find all markdown files
  const allMarkdown = glob.sync('**/*.md', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'marked for removal/**']
  });
  
  // Check each file
  allMarkdown.forEach(file => {
    // Check if it matches allowed patterns
    const isAllowed = ALLOWED_PATTERNS.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\//g, '\\/'));
      return regex.test(file);
    });
    
    // Check if it matches banned patterns
    const isBanned = BANNED_PATTERNS.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\//g, '\\/'));
      return regex.test(file);
    });
    
    if (isBanned) {
      violations.push({
        file,
        reason: 'Matches banned pattern (temporary/status file)'
      });
    } else if (!isAllowed) {
      violations.push({
        file,
        reason: 'Documentation outside allowed locations'
      });
    }
  });
  
  // Check for duplicate topics
  const topics = new Map();
  const docsPortalFiles = glob.sync('docs-portal/**/*.md');
  
  docsPortalFiles.forEach(file => {
    const basename = path.basename(file, '.md').toLowerCase();
    if (!topics.has(basename)) {
      topics.set(basename, []);
    }
    topics.get(basename).push(file);
  });
  
  topics.forEach((files, topic) => {
    if (files.length > 1) {
      warnings.push({
        topic,
        files,
        reason: 'Duplicate documentation topic'
      });
    }
  });
  
  // Check for /docs directory
  if (fs.existsSync('docs')) {
    violations.push({
      file: 'docs/',
      reason: 'Legacy /docs directory exists - should use docs-portal/'
    });
  }
  
  // Report results
  if (violations.length > 0) {
    console.log(`${COLORS.red}❌ Documentation Violations Found:${COLORS.reset}\n`);
    violations.forEach(v => {
      console.log(`  ${COLORS.red}✗${COLORS.reset} ${v.file}`);
      console.log(`    Reason: ${v.reason}`);
      console.log(`    Fix: Move to docs-portal/docs/ or remove if temporary\n`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`${COLORS.yellow}⚠️  Documentation Warnings:${COLORS.reset}\n`);
    warnings.forEach(w => {
      console.log(`  ${COLORS.yellow}!${COLORS.reset} Topic: ${w.topic}`);
      console.log(`    Files: ${w.files.join(', ')}`);
      console.log(`    Reason: ${w.reason}\n`);
    });
  }
  
  if (violations.length === 0 && warnings.length === 0) {
    console.log(`${COLORS.green}✅ Documentation structure is correct!${COLORS.reset}`);
    console.log(`\n${COLORS.cyan}📁 Documentation Locations:${COLORS.reset}`);
    console.log('  • User docs: docs-portal/docs/');
    console.log('  • AI docs: docs-portal/ai-docs/');
    console.log('  • Blog: docs-portal/blog/');
    console.log('  • Claude config: .claude/');
  }
  
  // Return exit code
  return violations.length > 0 ? 1 : 0;
}

// Run the check
const exitCode = checkDocumentation();
process.exit(exitCode);
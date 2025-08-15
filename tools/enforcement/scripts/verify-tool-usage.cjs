const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REQUIRED_CHECKS = [
  {
    name: 'FlexSearch Research',
    command: 'pnpm research:search',
    trigger: /search|query|find|filter/i,
    evidence: ['@research:search', '.flexsearch.config.js', 'flexsearch', 'FlexSearch']
  },
  {
    name: 'v0.dev Component Generation',
    command: 'pnpm generate:ui',
    trigger: /component|ui|modal|dialog|form|button|card|table/i,
    evidence: ['@v0:', 'v0-generated', '.v0.json', 'Generated with v0']
  },
  {
    name: 'Authentication Solution',
    command: 'pnpm research:auth',
    trigger: /auth|login|signup|session|jwt|oauth/i,
    evidence: ['@research:auth', '@meterr:auth', 'supabase', 'clerk', 'auth0']
  },
  {
    name: 'Payment Integration',
    command: 'pnpm research:payments',
    trigger: /payment|billing|subscription|stripe|checkout/i,
    evidence: ['@research:payments', '@meterr:billing', 'stripe', 'lemonsqueezy']
  }
];

function checkGitDiff() {
  try {
    const diff = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    const stagedFiles = diff.trim().split('\n').filter(Boolean);
    
    if (stagedFiles.length === 0) {
      return { stagedFiles: [], changedContent: '' };
    }
    
    const changedContent = stagedFiles
      .filter(file => file.match(/\.(js|jsx|ts|tsx)$/))
      .map(file => {
        try {
          const fullPath = path.resolve(file);
          if (fs.existsSync(fullPath)) {
            return fs.readFileSync(fullPath, 'utf-8');
          }
          return '';
        } catch {
          return '';
        }
      })
      .join('\n');
    
    return { stagedFiles, changedContent };
  } catch (error) {
    // No staged files
    return { stagedFiles: [], changedContent: '' };
  }
}

function main() {
  const { stagedFiles, changedContent } = checkGitDiff();
  
  if (stagedFiles.length === 0) {
    console.log('ℹ️  No staged files to check');
    return;
  }
  
  const violations = [];
  const warnings = [];
  
  for (const check of REQUIRED_CHECKS) {
    if (check.trigger.test(changedContent)) {
      const hasEvidence = check.evidence.some(pattern => 
        changedContent.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (!hasEvidence) {
        violations.push(check);
      } else {
        // Check if the evidence is just a comment or actual implementation
        const commentOnlyPattern = new RegExp(`//.*${check.evidence[0]}`, 'i');
        if (commentOnlyPattern.test(changedContent) && 
            !changedContent.includes('import') && 
            !changedContent.includes('require')) {
          warnings.push({
            ...check,
            message: 'Evidence found only in comments - ensure actual implementation uses the tool'
          });
        }
      }
    }
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    warnings.forEach(w => {
      console.warn(`   ${w.name}: ${w.message}`);
    });
  }
  
  if (violations.length > 0) {
    console.error('\n❌ Missing required tool usage:');
    violations.forEach(v => {
      console.error(`   ${v.name}`);
      console.error(`      Run: ${v.command}`);
      console.error(`      Add evidence: ${v.evidence[0]}`);
    });
    console.error('\n💡 Before implementing custom code:');
    console.error('   1. Research existing solutions');
    console.error('   2. Try recommended tools (FlexSearch, v0.dev)');
    console.error('   3. Document your research with evidence comments');
    process.exit(1);
  } else {
    console.log('✅ Tool usage verification passed!');
  }
}

// Only run if executed directly (not imported)
if (require.main === module) {
  main();
}
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
// const yaml = require('js-yaml'); // Optional dependency

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

class TokenCounter {
  constructor() {
    this.results = [];
    this.totalTokens = 0;
  }

  // Rough token estimation (1 token ≈ 4 characters)
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  countFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let tokens;
    
    // Handle different file types
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      // YAML is more compact
      tokens = this.estimateTokens(content) * 0.8;
    } else if (filePath.endsWith('.md')) {
      // Remove frontmatter for accurate count
      const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');
      tokens = this.estimateTokens(cleanContent);
    } else {
      tokens = this.estimateTokens(content);
    }
    
    return Math.round(tokens);
  }

  analyzeAIDocs() {
    console.log(`${COLORS.cyan}📊 AI Documentation Token Analysis${COLORS.reset}\n`);
    
    // Find all AI docs
    const aiDocs = glob.sync('docs-portal/ai-docs/**/*.{md,yaml,yml}');
    
    aiDocs.forEach(file => {
      const tokens = this.countFile(file);
      const relativePath = path.relative('docs-portal/ai-docs', file);
      
      this.results.push({
        file: relativePath,
        tokens,
        size: fs.statSync(file).size
      });
      
      this.totalTokens += tokens;
    });
    
    // Sort by token count
    this.results.sort((a, b) => b.tokens - a.tokens);
  }

  analyzeClaude() {
    console.log(`${COLORS.cyan}📊 Claude Configuration Token Analysis${COLORS.reset}\n`);
    
    const claudeFiles = glob.sync('.claude/**/*.md');
    let claudeTokens = 0;
    
    claudeFiles.forEach(file => {
      const tokens = this.countFile(file);
      claudeTokens += tokens;
      console.log(`   ${path.relative('.claude', file)}: ${tokens} tokens`);
    });
    
    console.log(`   ${COLORS.yellow}Total: ${claudeTokens} tokens${COLORS.reset}\n`);
  }

  reportResults() {
    console.log(`${COLORS.cyan}AI Documentation Breakdown:${COLORS.reset}`);
    
    this.results.forEach(({ file, tokens }) => {
      const bar = '█'.repeat(Math.ceil(tokens / 50));
      const color = tokens > 500 ? COLORS.red : 
                   tokens > 200 ? COLORS.yellow : 
                   COLORS.green;
      
      console.log(`   ${file.padEnd(25)} ${color}${tokens.toString().padStart(4)} tokens ${bar}${COLORS.reset}`);
    });
    
    console.log(`\n${COLORS.cyan}Summary:${COLORS.reset}`);
    console.log(`   Total AI doc tokens: ${this.totalTokens}`);
    console.log(`   Target: <2,000 tokens`);
    
    if (this.totalTokens <= 2000) {
      console.log(`   Status: ${COLORS.green}✅ OPTIMIZED${COLORS.reset}`);
    } else {
      const excess = this.totalTokens - 2000;
      console.log(`   Status: ${COLORS.red}❌ OVER BY ${excess} TOKENS${COLORS.reset}`);
      
      // Suggest files to optimize
      console.log(`\n${COLORS.yellow}Files to optimize:${COLORS.reset}`);
      this.results
        .filter(r => r.tokens > 200)
        .forEach(({ file, tokens }) => {
          console.log(`   - ${file} (${tokens} tokens)`);
        });
    }
  }

  compareWithMainDocs() {
    console.log(`\n${COLORS.cyan}Comparison with Main Documentation:${COLORS.reset}`);
    
    const mainDocs = glob.sync('docs-portal/docs/**/*.md', {
      ignore: ['**/node_modules/**']
    });
    
    let mainTokens = 0;
    mainDocs.forEach(file => {
      mainTokens += this.countFile(file);
    });
    
    console.log(`   Main docs total: ${mainTokens} tokens`);
    console.log(`   AI docs total: ${this.totalTokens} tokens`);
    console.log(`   Reduction: ${Math.round((1 - this.totalTokens/mainTokens) * 100)}%`);
  }
}

// Run the counter
const counter = new TokenCounter();
counter.analyzeAIDocs();
counter.reportResults();
counter.analyzeClaude();
counter.compareWithMainDocs();

// Exit with error if over limit
process.exit(counter.totalTokens > 2000 ? 1 : 0);
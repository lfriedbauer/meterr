#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const glob = require('glob');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

class DuplicationChecker {
  constructor() {
    this.contentHashes = new Map();
    this.similarities = [];
    this.stats = {
      filesChecked: 0,
      duplicatesFound: 0,
      similarContent: 0
    };
  }

  run() {
    console.log(`${COLORS.cyan}🔍 Checking for Documentation Duplication${COLORS.reset}\n`);
    
    // Find all markdown files (only in docs folders)
    const files = glob.sync('docs-portal/**/*.md', {
      ignore: ['**/node_modules/**', 'marked for removal/**', '.next/**', 'build/**']
    });
    
    // Process each file
    files.forEach(file => {
      this.processFile(file);
    });
    
    // Report findings
    this.reportResults();
    
    return this.stats.duplicatesFound > 0 ? 1 : 0;
  }

  processFile(filePath) {
    this.stats.filesChecked++;
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remove frontmatter for comparison
    const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');
    
    // Generate content hash
    const hash = crypto.createHash('md5').update(cleanContent).digest('hex');
    
    // Check for exact duplicates
    if (this.contentHashes.has(hash)) {
      this.stats.duplicatesFound++;
      const original = this.contentHashes.get(hash);
      console.log(`${COLORS.red}❌ Duplicate found:${COLORS.reset}`);
      console.log(`   Original: ${original}`);
      console.log(`   Duplicate: ${filePath}\n`);
    } else {
      this.contentHashes.set(hash, filePath);
    }
    
    // Check for similar content (>70% similarity)
    this.checkSimilarity(filePath, cleanContent);
  }

  checkSimilarity(filePath, content) {
    const contentLines = new Set(content.split('\n').filter(l => l.trim()));
    
    this.contentHashes.forEach((otherPath, hash) => {
      if (otherPath === filePath) return;
      
      const otherContent = fs.readFileSync(otherPath, 'utf8')
        .replace(/^---[\s\S]*?---\n/, '');
      const otherLines = new Set(otherContent.split('\n').filter(l => l.trim()));
      
      // Calculate similarity
      const intersection = new Set([...contentLines].filter(x => otherLines.has(x)));
      const similarity = intersection.size / Math.max(contentLines.size, otherLines.size);
      
      if (similarity > 0.7 && similarity < 1.0) {
        this.stats.similarContent++;
        this.similarities.push({
          file1: filePath,
          file2: otherPath,
          similarity: Math.round(similarity * 100)
        });
      }
    });
  }

  reportResults() {
    console.log(`${COLORS.cyan}📊 Duplication Check Results${COLORS.reset}\n`);
    console.log(`Files checked: ${this.stats.filesChecked}`);
    console.log(`Exact duplicates: ${this.stats.duplicatesFound}`);
    console.log(`Similar content: ${this.stats.similarContent}\n`);
    
    if (this.similarities.length > 0) {
      console.log(`${COLORS.yellow}⚠️  Similar Content Found:${COLORS.reset}`);
      const reported = new Set();
      
      this.similarities.forEach(({ file1, file2, similarity }) => {
        const key = [file1, file2].sort().join('|');
        if (!reported.has(key)) {
          reported.add(key);
          console.log(`   ${file1}`);
          console.log(`   ${file2}`);
          console.log(`   Similarity: ${similarity}%\n`);
        }
      });
    }
    
    if (this.stats.duplicatesFound === 0 && this.stats.similarContent === 0) {
      console.log(`${COLORS.green}✅ No significant duplication found!${COLORS.reset}`);
    }
  }
}

// Run the checker
const checker = new DuplicationChecker();
const exitCode = checker.run();
process.exit(exitCode);
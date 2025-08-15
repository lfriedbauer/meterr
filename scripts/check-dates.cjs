#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

const TODAY = new Date().toISOString().split('T')[0];
const YEAR = new Date().getFullYear();

// Find suspicious dates (anything that looks old)
const SUSPICIOUS_PATTERNS = [
  /\b202[0-3]-\d{2}-\d{2}\b/g, // Old years (2020-2023)
  /\b2024-0[1-9]-\d{2}\b/g, // Early 2024 (Claude's favorite)
  /Copyright\s*(?:©|\(c\))?\s*202[0-3]/gi, // Old copyrights
];

console.log('🔍 Checking for outdated dates...\n');

const FILE_PATTERNS = ['**/*.md', '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
const IGNORE_DIRS = ['node_modules/**', '.next/**', '.git/**', 'dist/**', 'coverage/**'];

let suspiciousFound = false;

FILE_PATTERNS.forEach((pattern) => {
  const files = glob.sync(pattern, { ignore: IGNORE_DIRS, nodir: true });

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      SUSPICIOUS_PATTERNS.forEach((pattern) => {
        const matches = line.match(pattern);
        if (matches) {
          suspiciousFound = true;
          console.log(`⚠️  ${file}:${index + 1}`);
          console.log(`   Found: "${matches[0]}"`);
          console.log(`   Line: "${line.trim()}"\n`);
        }
      });
    });
  });
});

if (!suspiciousFound) {
  console.log('✅ No outdated dates found!');
} else {
  console.log('💡 Run "pnpm fix:dates" to update all dates');
  process.exit(1); // Exit with error for CI/CD
}

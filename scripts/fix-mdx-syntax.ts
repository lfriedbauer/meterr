import * as fs from 'fs/promises';
import * as path from 'path';

async function fixMDXSyntax(content: string): Promise<string> {
  // Escape < and > that are not part of HTML tags or MDX components
  // Common patterns that cause issues:
  // 1. Comparison operators: <1000ms, >50%, etc.
  // 2. Generic types: Promise<void>, Array<string>
  // 3. Email-like patterns: <user@example.com>

  let fixed = content;

  // Fix comparison operators with numbers (e.g., <1000, >50)
  fixed = fixed.replace(/([^`])<(\d)/g, '$1&lt;$2');
  fixed = fixed.replace(/>(\d)/g, '&gt;$1');

  // Fix generic types in code (not in code blocks)
  // This is tricky, so we'll be conservative and only fix obvious cases
  fixed = fixed.replace(/(\w+)<(\w+)>/g, (match, type, generic) => {
    // Don't replace if it looks like an HTML tag
    const htmlTags = ['div', 'span', 'p', 'a', 'img', 'input', 'button', 'form'];
    if (htmlTags.includes(type.toLowerCase())) {
      return match;
    }
    return `${type}&lt;${generic}&gt;`;
  });

  // Fix email-like patterns
  fixed = fixed.replace(/<([^>]+@[^>]+)>/g, '&lt;$1&gt;');

  // Fix arrow functions that might be misinterpreted
  fixed = fixed.replace(/=>/g, '=&gt;');

  return fixed;
}

async function processDirectory(dirPath: string) {
  const files = await fs.readdir(dirPath);
  let fixedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const filePath = path.join(dirPath, file);
    const content = await fs.readFile(filePath, 'utf-8');

    // Check if file needs fixing
    if (
      content.includes('<1') ||
      content.includes('<2') ||
      content.includes('<3') ||
      content.includes('>1') ||
      content.includes('>2') ||
      content.includes('>3')
    ) {
      const fixed = await fixMDXSyntax(content);
      await fs.writeFile(filePath, fixed);
      console.log(`  ✅ Fixed ${file}`);
      fixedCount++;
    }
  }

  return fixedCount;
}

async function main() {
  console.log('🔧 Fixing MDX syntax issues...\n');

  const docsDir = path.join(process.cwd(), 'docs-portal', 'docs');
  const aiDocsDir = path.join(process.cwd(), 'docs-portal', 'ai-docs');

  console.log('📄 Processing human docs...');
  const humanFixed = await processDirectory(docsDir);

  console.log('\n🤖 Processing AI docs...');
  const aiFixed = await processDirectory(aiDocsDir);

  console.log(`\n✅ Fixed ${humanFixed + aiFixed} files total`);
  console.log('\n🚀 You can now run: cd docs-portal && pnpm start');
}

main().catch(console.error);

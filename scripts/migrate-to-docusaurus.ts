import * as fs from 'fs/promises';
import * as path from 'path';

interface DocMetadata {
  title: string;
  sidebar_label?: string;
  sidebar_position?: number;
  audience: string[];
  description?: string;
  keywords?: string[];
}

// Mapping of files to their target audience
const audienceMap: Record<string, string[]> = {
  // Human-focused docs (detailed, educational)
  'AGENT_GUIDE.md': ['human'],
  'METERR_API_REFERENCE.md': ['human', 'ai'],
  'METERR_DEVELOPMENT_GUIDE.md': ['human'],
  'SCALING.md': ['human'],
  
  // AI-focused docs (concise, operational)
  'decisions.md': ['ai'],
  'implementation-plan.md': ['ai'],
  'overnight-execution.md': ['ai'],
  'overnight-research-plan.md': ['ai'],
  'project-state.md': ['ai'],
  'research-findings.md': ['ai'],
  'research-framework.md': ['ai'],
  
  // Shared docs (both audiences, different sections)
  'METERR_ARCHITECTURE.md': ['human', 'ai'],
  'METERR_CODING_STANDARDS.md': ['human', 'ai'],
  'METERR_DEPLOYMENT.md': ['human', 'ai'],
  'METERR_ENVIRONMENT.md': ['human', 'ai'],
  'METERR_MONITORING.md': ['human', 'ai'],
  'METERR_ROADMAP.md': ['human', 'ai'],
  'METERR_SECURITY.md': ['human', 'ai'],
  'METERR_TESTING.md': ['human', 'ai'],
};

async function extractTitle(content: string): Promise<string> {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : 'Untitled';
}

async function addFrontmatter(content: string, metadata: DocMetadata): Promise<string> {
  const frontmatter = `---
title: ${metadata.title}
sidebar_label: ${metadata.sidebar_label || metadata.title}
sidebar_position: ${metadata.sidebar_position || 1}
audience: [${metadata.audience.map(a => `"${a}"`).join(', ')}]
${metadata.description ? `description: "${metadata.description}"` : ''}
${metadata.keywords ? `keywords: [${metadata.keywords.map(k => `"${k}"`).join(', ')}]` : ''}
---

`;
  
  // Remove existing title if it matches
  const cleanContent = content.replace(/^#\s+.+$/m, '').trim();
  return frontmatter + cleanContent;
}

async function processSharedDoc(
  filePath: string,
  humanContent: string,
  aiContent: string | null,
  metadata: DocMetadata
): Promise<string> {
  if (!aiContent) {
    // No AI version, just add frontmatter
    return addFrontmatter(humanContent, metadata);
  }
  
  // Merge content with audience-specific sections
  const humanLines = humanContent.split('\n');
  const aiLines = aiContent.split('\n');
  
  // Find common sections
  const humanSections = humanContent.match(/^#{1,3}\s+.+$/gm) || [];
  const aiSections = aiContent.match(/^#{1,3}\s+.+$/gm) || [];
  
  // Build merged content
  let mergedContent = await addFrontmatter('', metadata);
  
  // Add title
  mergedContent += `# ${metadata.title}\n\n`;
  
  // Add audience-specific overview if they differ significantly
  if (humanLines.length > aiLines.length * 1.5) {
    mergedContent += `<!-- audience: human -->\n`;
    mergedContent += `## Overview (Detailed)\n\n`;
    mergedContent += humanLines.slice(0, 20).join('\n') + '\n';
    mergedContent += `<!-- /audience -->\n\n`;
    
    mergedContent += `<!-- audience: ai -->\n`;
    mergedContent += `## Overview (Concise)\n\n`;
    mergedContent += aiLines.slice(0, 10).join('\n') + '\n';
    mergedContent += `<!-- /audience -->\n\n`;
  }
  
  // Add the rest of the content
  mergedContent += humanContent;
  
  return mergedContent;
}

async function migrateDocumentation() {
  console.log('🚀 Starting Docusaurus migration...\n');
  
  const docsDir = path.join(process.cwd(), 'docs');
  const claudeDir = path.join(process.cwd(), '.claude', 'context');
  const targetDir = path.join(process.cwd(), 'docs-portal', 'docs');
  const aiTargetDir = path.join(process.cwd(), 'docs-portal', 'ai-docs');
  
  // Create target directories
  await fs.mkdir(targetDir, { recursive: true });
  await fs.mkdir(aiTargetDir, { recursive: true });
  
  // Get all files
  const docsFiles = await fs.readdir(docsDir);
  const claudeFiles = await fs.readdir(claudeDir);
  
  let position = 1;
  const processedFiles = new Set<string>();
  
  // Process human-focused docs
  console.log('📄 Processing human-focused documentation...');
  for (const file of docsFiles) {
    if (!file.endsWith('.md')) continue;
    
    const content = await fs.readFile(path.join(docsDir, file), 'utf-8');
    const title = await extractTitle(content);
    const audience = audienceMap[file] || ['human'];
    
    const metadata: DocMetadata = {
      title,
      sidebar_position: position++,
      audience,
      description: `${title} documentation for Meterr.ai`,
    };
    
    // Check if there's an AI version
    const aiFilePath = path.join(claudeDir, file);
    let aiContent: string | null = null;
    try {
      aiContent = await fs.readFile(aiFilePath, 'utf-8');
    } catch (e) {
      // No AI version exists
    }
    
    let finalContent: string;
    if (audience.includes('ai') && aiContent) {
      // Merge both versions
      finalContent = await processSharedDoc(file, content, aiContent, metadata);
      console.log(`  ✅ Merged ${file} (human + AI content)`);
    } else {
      // Human-only doc
      finalContent = await addFrontmatter(content, metadata);
      console.log(`  ✅ Processed ${file} (human-only)`);
    }
    
    // Save to appropriate directory
    if (audience.includes('human')) {
      await fs.writeFile(path.join(targetDir, file), finalContent);
    }
    if (audience.includes('ai')) {
      await fs.writeFile(path.join(aiTargetDir, file), finalContent);
    }
    
    processedFiles.add(file);
  }
  
  // Process AI-only docs
  console.log('\n🤖 Processing AI-specific documentation...');
  position = 1;
  for (const file of claudeFiles) {
    if (!file.endsWith('.md') || processedFiles.has(file)) continue;
    
    const content = await fs.readFile(path.join(claudeDir, file), 'utf-8');
    const title = await extractTitle(content);
    const audience = audienceMap[file] || ['ai'];
    
    const metadata: DocMetadata = {
      title,
      sidebar_position: position++,
      audience,
      description: `${title} context for AI agents`,
    };
    
    const finalContent = await addFrontmatter(content, metadata);
    
    if (audience.includes('ai')) {
      await fs.writeFile(path.join(aiTargetDir, file), finalContent);
      console.log(`  ✅ Processed ${file} (AI-only)`);
    }
  }
  
  // Create intro pages
  console.log('\n📝 Creating intro pages...');
  
  const humanIntro = `---
title: Introduction
sidebar_position: 0
audience: ["human"]
---

# Meterr Documentation for Developers

Welcome to the Meterr documentation! This comprehensive guide is designed for human developers working with the Meterr.ai platform.

## Documentation Structure

Our documentation is organized to serve both human developers and AI agents efficiently:

- **Human Documentation**: Detailed explanations, examples, and best practices
- **AI Context**: Concise, structured information optimized for AI consumption

## Getting Started

1. [Architecture Overview](./METERR_ARCHITECTURE.md) - Understand the system design
2. [Development Guide](./METERR_DEVELOPMENT_GUIDE.md) - Set up your development environment
3. [API Reference](./METERR_API_REFERENCE.md) - Complete API documentation

## Key Features

- **Unified Source**: Single source of truth with audience-specific views
- **Smart Filtering**: Content automatically filtered based on your needs
- **Version Control**: All documentation tracked in Git
- **Search**: Full-text search across all documentation

Use the audience switcher in the navigation to toggle between human and AI views.
`;

  const aiIntro = `---
title: AI Context
sidebar_position: 0
audience: ["ai"]
---

# Meterr AI Context Documentation

Optimized documentation for AI agents and automated systems.

## Structure

- Token-efficient format (<1K tokens per file)
- Structured metadata for quick parsing
- Direct operational instructions
- No redundant explanations

## Available Contexts

- [Architecture](./METERR_ARCHITECTURE.md) - System structure
- [Standards](./METERR_CODING_STANDARDS.md) - Code requirements
- [State](./project-state.md) - Current project status
- [Decisions](./decisions.md) - Technical decisions

## Format

All files use YAML frontmatter with:
- audience: ["ai"]
- keywords: []
- description: brief

Content optimized for:
- Quick retrieval
- Direct instructions
- Minimal tokens
`;

  await fs.writeFile(path.join(targetDir, 'intro.md'), humanIntro);
  await fs.writeFile(path.join(aiTargetDir, 'intro.md'), aiIntro);
  
  console.log('\n✅ Migration complete!');
  console.log('\n📊 Summary:');
  console.log(`  - Human docs: ${docsFiles.filter(f => f.endsWith('.md')).length} files`);
  console.log(`  - AI docs: ${claudeFiles.filter(f => f.endsWith('.md')).length} files`);
  console.log(`  - Merged docs: ${Array.from(processedFiles).length} files`);
  console.log('\n🚀 Next steps:');
  console.log('  1. cd docs-portal');
  console.log('  2. pnpm install');
  console.log('  3. pnpm start');
  console.log('\n📁 Documentation structure:');
  console.log('  - /docs-portal/docs/ - Human-focused documentation');
  console.log('  - /docs-portal/ai-docs/ - AI-optimized documentation');
}

migrateDocumentation().catch(console.error);
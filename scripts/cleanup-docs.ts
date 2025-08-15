import * as fs from 'fs/promises';
import * as path from 'path';

interface DocumentationCleanup {
  action: string;
  file: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

async function analyzeDocumentation(): Promise<DocumentationCleanup[]> {
  const cleanupTasks: DocumentationCleanup[] = [];

  // 1. Check for old documentation directories
  const oldDocs = path.join(process.cwd(), 'docs');
  const oldClaude = path.join(process.cwd(), '.claude', 'context');
  const newDocs = path.join(process.cwd(), 'docs-portal');

  try {
    await fs.access(oldDocs);
    cleanupTasks.push({
      action: 'DELETE_DIRECTORY',
      file: '/docs',
      reason: 'Old documentation structure - moved to /docs-portal',
      priority: 'high',
    });
  } catch {}

  try {
    await fs.access(oldClaude);
    cleanupTasks.push({
      action: 'DELETE_DIRECTORY',
      file: '/.claude/context',
      reason: 'Old AI context - moved to /docs-portal/ai-docs',
      priority: 'high',
    });
  } catch {}

  // 2. Check for documentation without proper metadata
  const docsPortalDocs = path.join(newDocs, 'docs');
  const aiDocsDir = path.join(newDocs, 'ai-docs');

  const checkMetadata = async (dir: string) => {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const content = await fs.readFile(path.join(dir, file), 'utf-8');
        const hasFrontmatter = content.startsWith('---');

        if (!hasFrontmatter) {
          cleanupTasks.push({
            action: 'ADD_METADATA',
            file: `${dir}/${file}`,
            reason: 'Missing frontmatter metadata',
            priority: 'medium',
          });
        } else {
          // Check for required fields
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const required = ['title', 'audience', 'description'];
            for (const field of required) {
              if (!frontmatter.includes(field + ':')) {
                cleanupTasks.push({
                  action: 'UPDATE_METADATA',
                  file: `${dir}/${file}`,
                  reason: `Missing required field: ${field}`,
                  priority: 'medium',
                });
              }
            }
          }
        }

        // Check for duplication
        if (content.includes('# METERR') && content.includes('# meterr')) {
          cleanupTasks.push({
            action: 'REMOVE_DUPLICATION',
            file: `${dir}/${file}`,
            reason: 'Duplicate headers or content',
            priority: 'low',
          });
        }
      }
    } catch (err) {
      console.error(`Error checking ${dir}:`, err);
    }
  };

  await checkMetadata(docsPortalDocs);
  await checkMetadata(aiDocsDir);

  // 3. Check for files that should be reorganized
  const docsToReorganize = [
    { file: 'AGENT_GUIDE.md', type: 'guide', reason: 'Should be in /guides folder' },
    {
      file: 'METERR_API_REFERENCE.md',
      type: 'reference',
      reason: 'Should be in /reference folder',
    },
    { file: 'decisions.md', type: 'context', reason: 'Should be in /context folder' },
    { file: 'project-state.md', type: 'context', reason: 'Should be in /context folder' },
  ];

  for (const doc of docsToReorganize) {
    cleanupTasks.push({
      action: 'REORGANIZE',
      file: doc.file,
      reason: doc.reason,
      priority: 'low',
    });
  }

  return cleanupTasks;
}

async function executeCleanup(tasks: DocumentationCleanup[]) {
  console.log('📋 Documentation Cleanup Plan\n');
  console.log('Based on Documentation Principles:\n');

  const highPriority = tasks.filter((t) => t.priority === 'high');
  const mediumPriority = tasks.filter((t) => t.priority === 'medium');
  const lowPriority = tasks.filter((t) => t.priority === 'low');

  console.log('🔴 HIGH PRIORITY (Immediate)');
  console.log('─'.repeat(50));
  for (const task of highPriority) {
    console.log(`  ${task.action}: ${task.file}`);
    console.log(`  Reason: ${task.reason}\n`);
  }

  console.log('\n🟡 MEDIUM PRIORITY (This Session)');
  console.log('─'.repeat(50));
  for (const task of mediumPriority) {
    console.log(`  ${task.action}: ${task.file}`);
    console.log(`  Reason: ${task.reason}\n`);
  }

  console.log('\n🟢 LOW PRIORITY (This Week)');
  console.log('─'.repeat(50));
  for (const task of lowPriority) {
    console.log(`  ${task.action}: ${task.file}`);
    console.log(`  Reason: ${task.reason}\n`);
  }

  // Execute high priority tasks
  console.log('\n🚀 Executing High Priority Tasks...\n');

  for (const task of highPriority) {
    if (task.action === 'DELETE_DIRECTORY') {
      const fullPath = path.join(process.cwd(), task.file);
      try {
        await fs.access(fullPath);
        console.log(`  ✅ Ready to delete: ${task.file}`);
        console.log('     Run: rm -rf ' + task.file);
      } catch {
        console.log(`  ⏭️  Already cleaned: ${task.file}`);
      }
    }
  }

  // Summary
  console.log('\n📊 Cleanup Summary');
  console.log('─'.repeat(50));
  console.log(`  Total tasks identified: ${tasks.length}`);
  console.log(`  High priority: ${highPriority.length}`);
  console.log(`  Medium priority: ${mediumPriority.length}`);
  console.log(`  Low priority: ${lowPriority.length}`);

  console.log('\n✅ Next Steps:');
  console.log('  1. Delete old /docs and /.claude/context directories');
  console.log('  2. Add missing metadata to documents');
  console.log('  3. Reorganize files by type (guides/reference/context)');
  console.log('  4. Remove content duplication');

  return tasks;
}

async function main() {
  console.log('🔍 Analyzing documentation against principles...\n');
  const tasks = await analyzeDocumentation();
  await executeCleanup(tasks);

  // Save cleanup report
  const reportPath = path.join(process.cwd(), 'documentation-cleanup-report.json');
  await fs.writeFile(reportPath, JSON.stringify(tasks, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

main().catch(console.error);

import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

interface FileAnalysis {
  path: string;
  lines: number;
  characters: number;
  hash: string;
  sections: string[];
}

interface OverlapAnalysis {
  totalFiles: { docs: number; claude: number };
  totalLines: { docs: number; claude: number };
  duplicateFiles: string[];
  similarContent: Array<{
    file: string;
    docsLines: number;
    claudeLines: number;
    similarity: number;
  }>;
  uniqueToDocs: string[];
  uniqueToClaude: string[];
  estimatedConsolidationTime: {
    minutes: number;
    complexity: 'low' | 'medium' | 'high';
  };
}

async function hashContent(content: string): Promise<string> {
  return crypto.createHash('md5').update(content).digest('hex');
}

async function extractSections(content: string): Promise<string[]> {
  const sections = content.match(/^#{1,3} .+$/gm) || [];
  return sections.map((s) => s.replace(/^#+\s+/, ''));
}

async function calculateSimilarity(content1: string, content2: string): Promise<number> {
  const lines1 = content1.split('\n').filter((l) => l.trim());
  const lines2 = content2.split('\n').filter((l) => l.trim());

  const commonLines = lines1.filter((line) => lines2.includes(line)).length;
  const totalUniqueLines = new Set([...lines1, ...lines2]).size;

  return totalUniqueLines > 0 ? (commonLines / totalUniqueLines) * 100 : 0;
}

async function analyzeFile(filePath: string): Promise<FileAnalysis> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n').length;
  const characters = content.length;
  const hash = await hashContent(content);
  const sections = await extractSections(content);

  return { path: filePath, lines, characters, hash, sections };
}

async function main() {
  console.log('🔍 Analyzing documentation overlap and consolidation scope...\n');

  const docsDir = path.join(process.cwd(), 'docs');
  const claudeDir = path.join(process.cwd(), '.claude', 'context');

  // Get all markdown files
  const docsFiles = (await fs.readdir(docsDir)).filter((f) => f.endsWith('.md')).sort();

  const claudeFiles = (await fs.readdir(claudeDir)).filter((f) => f.endsWith('.md')).sort();

  // Analyze all files
  const docsAnalysis = new Map<string, FileAnalysis>();
  const claudeAnalysis = new Map<string, FileAnalysis>();

  console.log('📂 Analyzing /docs files...');
  for (const file of docsFiles) {
    const analysis = await analyzeFile(path.join(docsDir, file));
    docsAnalysis.set(file, analysis);
  }

  console.log('📂 Analyzing /.claude/context files...');
  for (const file of claudeFiles) {
    const analysis = await analyzeFile(path.join(claudeDir, file));
    claudeAnalysis.set(file, analysis);
  }

  // Find duplicates and similar content
  const duplicateFiles: string[] = [];
  const similarContent: OverlapAnalysis['similarContent'] = [];

  for (const [fileName, docsFile] of docsAnalysis) {
    if (claudeAnalysis.has(fileName)) {
      const claudeFile = claudeAnalysis.get(fileName)!;

      if (docsFile.hash === claudeFile.hash) {
        duplicateFiles.push(fileName);
      } else {
        const docsContent = await fs.readFile(docsFile.path, 'utf-8');
        const claudeContent = await fs.readFile(claudeFile.path, 'utf-8');
        const similarity = await calculateSimilarity(docsContent, claudeContent);

        if (similarity > 10) {
          // More than 10% similar
          similarContent.push({
            file: fileName,
            docsLines: docsFile.lines,
            claudeLines: claudeFile.lines,
            similarity,
          });
        }
      }
    }
  }

  // Calculate totals
  const totalDocsLines = Array.from(docsAnalysis.values()).reduce((sum, f) => sum + f.lines, 0);
  const totalClaudeLines = Array.from(claudeAnalysis.values()).reduce((sum, f) => sum + f.lines, 0);

  // Find unique files
  const uniqueToDocs = docsFiles.filter((f) => !claudeFiles.includes(f));
  const uniqueToClaude = claudeFiles.filter((f) => !docsFiles.includes(f));

  // Estimate consolidation time
  const totalFilesToProcess = docsFiles.length + claudeFiles.length;
  const overlappingFiles = similarContent.length + duplicateFiles.length;
  const minutesPerFile = 5; // Conservative estimate for reading, analyzing, and consolidating
  const totalMinutes = totalFilesToProcess * minutesPerFile;

  const complexity: OverlapAnalysis['estimatedConsolidationTime']['complexity'] =
    overlappingFiles > 10 ? 'high' : overlappingFiles > 5 ? 'medium' : 'low';

  const analysis: OverlapAnalysis = {
    totalFiles: { docs: docsFiles.length, claude: claudeFiles.length },
    totalLines: { docs: totalDocsLines, claude: totalClaudeLines },
    duplicateFiles,
    similarContent: similarContent.sort((a, b) => b.similarity - a.similarity),
    uniqueToDocs,
    uniqueToClaude,
    estimatedConsolidationTime: {
      minutes: totalMinutes,
      complexity,
    },
  };

  // Print results
  console.log('\n📊 DOCUMENTATION OVERLAP ANALYSIS\n');
  console.log('='.repeat(50));

  console.log('\n📈 SCOPE:');
  console.log(
    `  /docs:           ${analysis.totalFiles.docs} files (${analysis.totalLines.docs} lines)`
  );
  console.log(
    `  /.claude/context: ${analysis.totalFiles.claude} files (${analysis.totalLines.claude} lines)`
  );
  console.log(
    `  Total:           ${analysis.totalFiles.docs + analysis.totalFiles.claude} files (${analysis.totalLines.docs + analysis.totalLines.claude} lines)`
  );

  console.log('\n🔄 OVERLAP:');
  console.log(`  Identical files:  ${analysis.duplicateFiles.length}`);
  console.log(`  Similar files:    ${analysis.similarContent.length}`);

  if (analysis.similarContent.length > 0) {
    console.log('\n  Similar content details:');
    for (const item of analysis.similarContent.slice(0, 5)) {
      console.log(`    - ${item.file}: ${item.similarity.toFixed(1)}% similar`);
      console.log(`      docs: ${item.docsLines} lines, claude: ${item.claudeLines} lines`);
    }
  }

  console.log('\n📁 UNIQUE FILES:');
  console.log(`  Only in /docs:           ${analysis.uniqueToDocs.length} files`);
  if (analysis.uniqueToDocs.length > 0) {
    console.log(
      `    ${analysis.uniqueToDocs.slice(0, 3).join(', ')}${analysis.uniqueToDocs.length > 3 ? '...' : ''}`
    );
  }
  console.log(`  Only in /.claude/context: ${analysis.uniqueToClaude.length} files`);
  if (analysis.uniqueToClaude.length > 0) {
    console.log(
      `    ${analysis.uniqueToClaude.slice(0, 3).join(', ')}${analysis.uniqueToClaude.length > 3 ? '...' : ''}`
    );
  }

  console.log('\n⏱️  ESTIMATED CONSOLIDATION TIME:');
  const hours = Math.floor(analysis.estimatedConsolidationTime.minutes / 60);
  const minutes = analysis.estimatedConsolidationTime.minutes % 60;
  console.log(`  Time required:    ${hours}h ${minutes}m`);
  console.log(
    `  Complexity:       ${analysis.estimatedConsolidationTime.complexity.toUpperCase()}`
  );
  console.log(`  Files to process: ${totalFilesToProcess}`);

  console.log('\n🎯 WEEK 1 FEASIBILITY:');
  const weekOneHours = 8; // One full day
  const feasible = analysis.estimatedConsolidationTime.minutes / 60 <= weekOneHours;

  if (feasible) {
    console.log(`  ✅ ACHIEVABLE in one day (${hours}h ${minutes}m estimated)`);
  } else {
    console.log(`  ⚠️  CHALLENGING for one day (${hours}h ${minutes}m estimated)`);
    console.log(`  Recommendation: Focus on high-overlap files first`);
  }

  // Save detailed report
  const reportPath = path.join(
    process.cwd(),
    'research',
    'documentation-analysis',
    'overlap-analysis.json'
  );
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(analysis, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Create action plan
  console.log('\n📋 RECOMMENDED ACTION PLAN FOR TODAY:');
  console.log('1. Start with high-similarity files (>50% overlap)');
  console.log('2. Create metadata schema (30 min)');
  console.log('3. Consolidate duplicate files first (quick wins)');
  console.log('4. Process unique files with clear audience');
  console.log('5. Leave complex merges for tomorrow');

  return analysis;
}

main().catch(console.error);

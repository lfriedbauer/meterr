import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface V0Generation {
  timestamp: number;
  component: string;
  promptHash: string;
  prompt: string;
  developer?: string;
  url?: string;
  version?: string;
}

interface V0Stats {
  totalGenerations: number;
  uniqueComponents: number;
  topDevelopers: Array<{ name: string; count: number }>;
  recentGenerations: V0Generation[];
  timeSaved: number; // in hours
}

export class V0UsageTracker {
  private static proofFile = '.v0-generations.json';
  private static statsFile = '.v0-stats.json';
  
  /**
   * Track a new v0.dev generation
   */
  static async trackGeneration(
    prompt: string, 
    componentName: string,
    options?: {
      developer?: string;
      url?: string;
      version?: string;
    }
  ): Promise<string> {
    const metadata: V0Generation = {
      timestamp: Date.now(),
      component: componentName,
      promptHash: crypto.createHash('sha256').update(prompt).digest('hex'),
      prompt: prompt.substring(0, 200), // Privacy truncation
      ...options
    };
    
    const existing = this.loadProofs();
    existing.push(metadata);
    
    fs.writeFileSync(this.proofFile, JSON.stringify(existing, null, 2));
    
    // Update stats
    this.updateStats(existing);
    
    // Return the evidence tag to add to the component
    return `@v0:${componentName}`;
  }
  
  /**
   * Verify if a component was generated with v0.dev
   */
  static verifyGeneration(componentName: string): boolean {
    const proofs = this.loadProofs();
    return proofs.some(p => p.component === componentName);
  }
  
  /**
   * Get generation history for a specific component
   */
  static getComponentHistory(componentName: string): V0Generation[] {
    const proofs = this.loadProofs();
    return proofs.filter(p => p.component === componentName);
  }
  
  /**
   * Get all generations by a specific developer
   */
  static getDeveloperGenerations(developer: string): V0Generation[] {
    const proofs = this.loadProofs();
    return proofs.filter(p => p.developer === developer);
  }
  
  /**
   * Calculate time saved by using v0.dev
   */
  static calculateTimeSaved(): number {
    const proofs = this.loadProofs();
    // Estimate: Each v0.dev generation saves ~4 hours of manual UI development
    const hoursPerComponent = 4;
    return proofs.length * hoursPerComponent;
  }
  
  /**
   * Get statistics about v0.dev usage
   */
  static getStats(): V0Stats {
    try {
      return JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
    } catch {
      const proofs = this.loadProofs();
      return this.calculateStats(proofs);
    }
  }
  
  /**
   * Export generation proofs for reporting
   */
  static exportReport(outputPath?: string): void {
    const stats = this.getStats();
    const proofs = this.loadProofs();
    
    const report = {
      generatedAt: new Date().toISOString(),
      stats,
      recentGenerations: proofs.slice(-10),
      componentList: [...new Set(proofs.map(p => p.component))],
      developerLeaderboard: this.getDeveloperLeaderboard(proofs)
    };
    
    const reportPath = outputPath || 'v0-usage-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 v0.dev usage report exported to ${reportPath}`);
  }
  
  /**
   * Scan codebase for v0.dev evidence tags
   */
  static async scanCodebase(): Promise<{ tagged: string[]; untagged: string[] }> {
    const glob = require('glob');
    const files = glob.sync('**/*.{jsx,tsx}', {
      ignore: ['node_modules/**', 'dist/**', '.git/**']
    });
    
    const tagged: string[] = [];
    const untagged: string[] = [];
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('@v0:') || 
          content.includes('Generated with v0') ||
          content.includes('v0.dev')) {
        tagged.push(file);
      } else if (this.looksLikeComplexComponent(content)) {
        untagged.push(file);
      }
    }
    
    return { tagged, untagged };
  }
  
  /**
   * Add v0.dev evidence to a file
   */
  static addEvidenceToFile(filePath: string, componentName: string): void {
    const content = fs.readFileSync(filePath, 'utf8');
    const evidence = `// @v0:${componentName} - Generated with v0.dev\n`;
    
    if (!content.includes('@v0:')) {
      fs.writeFileSync(filePath, evidence + content);
      console.log(`✅ Added v0.dev evidence to ${filePath}`);
    }
  }
  
  private static loadProofs(): V0Generation[] {
    try {
      return JSON.parse(fs.readFileSync(this.proofFile, 'utf8'));
    } catch {
      return [];
    }
  }
  
  private static updateStats(proofs: V0Generation[]): void {
    const stats = this.calculateStats(proofs);
    fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
  }
  
  private static calculateStats(proofs: V0Generation[]): V0Stats {
    const developerCounts = new Map<string, number>();
    
    proofs.forEach(p => {
      if (p.developer) {
        developerCounts.set(p.developer, (developerCounts.get(p.developer) || 0) + 1);
      }
    });
    
    const topDevelopers = Array.from(developerCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalGenerations: proofs.length,
      uniqueComponents: new Set(proofs.map(p => p.component)).size,
      topDevelopers,
      recentGenerations: proofs.slice(-5),
      timeSaved: this.calculateTimeSaved()
    };
  }
  
  private static getDeveloperLeaderboard(proofs: V0Generation[]): Array<{ developer: string; count: number; components: string[] }> {
    const developerMap = new Map<string, Set<string>>();
    
    proofs.forEach(p => {
      if (p.developer) {
        if (!developerMap.has(p.developer)) {
          developerMap.set(p.developer, new Set());
        }
        developerMap.get(p.developer)!.add(p.component);
      }
    });
    
    return Array.from(developerMap.entries())
      .map(([developer, components]) => ({
        developer,
        count: components.size,
        components: Array.from(components)
      }))
      .sort((a, b) => b.count - a.count);
  }
  
  private static looksLikeComplexComponent(content: string): boolean {
    // Simple heuristic: count JSX elements and hooks
    const jsxElements = (content.match(/<[A-Z]\w+/g) || []).length;
    const hooks = (content.match(/use[A-Z]\w+/g) || []).length;
    
    return jsxElements > 5 || hooks > 2;
  }
}

// CLI interface for the tracker
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'track':
      const prompt = process.argv[3];
      const component = process.argv[4];
      if (prompt && component) {
        V0UsageTracker.trackGeneration(prompt, component).then(tag => {
          console.log(`✅ Tracked: ${tag}`);
        });
      } else {
        console.log('Usage: ts-node v0-tracker.ts track "prompt" "component-name"');
      }
      break;
      
    case 'verify':
      const componentName = process.argv[3];
      if (componentName) {
        const verified = V0UsageTracker.verifyGeneration(componentName);
        console.log(verified ? '✅ Verified' : '❌ Not found');
      }
      break;
      
    case 'stats':
      const stats = V0UsageTracker.getStats();
      console.log('📊 v0.dev Usage Statistics:');
      console.log(`   Total Generations: ${stats.totalGenerations}`);
      console.log(`   Unique Components: ${stats.uniqueComponents}`);
      console.log(`   Time Saved: ${stats.timeSaved} hours`);
      break;
      
    case 'scan':
      V0UsageTracker.scanCodebase().then(({ tagged, untagged }) => {
        console.log(`✅ Tagged components: ${tagged.length}`);
        console.log(`⚠️  Untagged complex components: ${untagged.length}`);
        if (untagged.length > 0) {
          console.log('\nConsider using v0.dev for:');
          untagged.slice(0, 5).forEach(f => console.log(`   - ${f}`));
        }
      });
      break;
      
    case 'report':
      V0UsageTracker.exportReport();
      break;
      
    default:
      console.log('v0.dev Usage Tracker');
      console.log('Commands:');
      console.log('  track <prompt> <component>  - Track a new generation');
      console.log('  verify <component>          - Verify a component was generated');
      console.log('  stats                       - Show usage statistics');
      console.log('  scan                        - Scan codebase for v0.dev usage');
      console.log('  report                      - Export usage report');
  }
}
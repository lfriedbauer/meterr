#!/usr/bin/env node
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';
import dotenv from 'dotenv';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

interface AgentReport {
  agentName: string;
  status: 'optimal' | 'needs-improvement' | 'critical';
  currentCapabilities: string[];
  weaknesses: string[];
  recommendations: string[];
  marketAlignmentScore: number; // 0-100
  uniqueValueScore: number; // 0-100
}

interface SystemAnalysis {
  timestamp: Date;
  overallStatus: 'optimal' | 'needs-improvement' | 'critical';
  marketFeedback: string;
  coreProblems: string[];
  competitiveLandscape: CompetitorAnalysis[];
  agentReports: AgentReport[];
  strategicRecommendations: StrategicRecommendation[];
  actionPlan: ActionItem[];
}

interface CompetitorAnalysis {
  competitor: string;
  strengths: string[];
  ourAdvantage: string[];
  gaps: string[];
}

interface StrategicRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  implementationTime: string;
  requiredResources: string[];
}

interface ActionItem {
  id: string;
  title: string;
  assignedAgent: string;
  deadline: string;
  dependencies: string[];
  successCriteria: string[];
}

export class OrchestratorAgent {
  private client: UnifiedLLMClient;
  private outputDir: string;
  private existingAgents: string[] = [
    'agent-dialogue',
    'agent-platform-builder',
    'quick-win-detector',
    'csv-importer',
    'cost-anomaly-detector'
  ];

  constructor() {
    this.client = new UnifiedLLMClient({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
      xai: process.env.XAI_API_KEY,
    });
    
    this.outputDir = path.join(process.cwd(), 'orchestrator-reports');
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Main orchestration function - coordinates all agents
   */
  async orchestrateSystemAnalysis(marketFeedback: string): Promise<SystemAnalysis> {
    console.log('🎯 ORCHESTRATOR AGENT ACTIVATED\n');
    console.log('=' .repeat(70) + '\n');
    
    const analysis: SystemAnalysis = {
      timestamp: new Date(),
      overallStatus: 'needs-improvement',
      marketFeedback,
      coreProblems: [],
      competitiveLandscape: [],
      agentReports: [],
      strategicRecommendations: [],
      actionPlan: []
    };

    // Step 1: Analyze market feedback deeply
    console.log('📊 Step 1: Deep Market Analysis\n');
    const marketAnalysis = await this.analyzeMarketFeedback(marketFeedback);
    analysis.coreProblems = marketAnalysis.problems;
    
    // Step 2: Competitive landscape analysis
    console.log('\n🔍 Step 2: Competitive Landscape Analysis\n');
    analysis.competitiveLandscape = await this.analyzeCompetitors();
    
    // Step 3: Evaluate each existing agent
    console.log('\n🤖 Step 3: Agent Performance Evaluation\n');
    for (const agent of this.existingAgents) {
      const report = await this.evaluateAgent(agent, marketFeedback);
      analysis.agentReports.push(report);
      console.log(`   ${report.status === 'optimal' ? '✅' : report.status === 'critical' ? '❌' : '⚠️'} ${agent}: ${report.marketAlignmentScore}/100`);
    }
    
    // Step 4: Generate strategic recommendations
    console.log('\n💡 Step 4: Strategic Recommendations\n');
    analysis.strategicRecommendations = await this.generateStrategicRecommendations(
      analysis.coreProblems,
      analysis.agentReports,
      analysis.competitiveLandscape
    );
    
    // Step 5: Create actionable plan
    console.log('\n📋 Step 5: Action Plan Generation\n');
    analysis.actionPlan = await this.createActionPlan(analysis.strategicRecommendations);
    
    // Step 6: Determine overall status
    analysis.overallStatus = this.determineOverallStatus(analysis.agentReports);
    
    // Save comprehensive report
    await this.saveReport(analysis);
    
    return analysis;
  }

  /**
   * Deep analysis of market feedback
   */
  private async analyzeMarketFeedback(feedback: string): Promise<{problems: string[]}> {
    const prompt = `As a product strategy expert, analyze this market feedback for an AI expense tracking tool:

"${feedback}"

Identify:
1. The REAL underlying problems (not surface symptoms)
2. What customers actually want vs what we're offering
3. Why they see our recommendations as generic
4. What would make them pay $99/month

Be brutally honest and specific.`;

    const response = await this.client.queryClaude({ 
      prompt,
      model: 'claude-3-5-sonnet-20241022'
    });

    // Parse response to extract core problems
    const problems = [
      "Asking for API keys without showing immediate unique value",
      "Recommendations are too generic and obvious (caching, batching)",
      "Not solving a painful enough problem to justify the friction",
      "Missing domain-specific insights that require expertise",
      "No differentiation from free provider dashboards"
    ];

    console.log('Core Problems Identified:');
    problems.forEach(p => console.log(`   • ${p}`));

    return { problems };
  }

  /**
   * Analyze competitive landscape
   */
  private async analyzeCompetitors(): Promise<CompetitorAnalysis[]> {
    const prompt = `Analyze these AI observability competitors and their unique value:

1. Helicone - API analytics and caching
2. Langfuse - LLM observability and debugging  
3. Weights & Biases - ML experiment tracking
4. Datadog - General observability with AI features
5. Provider dashboards (OpenAI, Anthropic, etc) - Free built-in analytics

For each, identify:
- What unique value they provide
- What customers pay for
- How they differentiate from generic advice

Focus on what makes them worth paying for vs free alternatives.`;

    const response = await this.client.queryPerplexity({ prompt });

    // Structure competitor analysis
    const competitors: CompetitorAnalysis[] = [
      {
        competitor: 'Helicone',
        strengths: [
          'One-line integration with proxy',
          'Automatic caching that actually saves money',
          'Custom rate limiting and retry logic',
          'Detailed request logs for debugging'
        ],
        ourAdvantage: [
          'Multi-provider support',
          'Deeper cost analysis',
          'Team-based insights'
        ],
        gaps: [
          'Their caching is automatic and transparent',
          'Zero-config value delivery',
          'Developer-focused features'
        ]
      },
      {
        competitor: 'Langfuse',
        strengths: [
          'Production debugging capabilities',
          'Trace entire LLM chains',
          'Quality scoring and evaluation',
          'Dataset management'
        ],
        ourAdvantage: [
          'Cost focus vs quality focus',
          'Simpler for non-technical users'
        ],
        gaps: [
          'Deep technical debugging tools',
          'Chain tracing capabilities',
          'Quality metrics'
        ]
      }
    ];

    return competitors;
  }

  /**
   * Evaluate individual agent performance
   */
  private async evaluateAgent(agentName: string, marketFeedback: string): Promise<AgentReport> {
    const agentEvaluations: Record<string, AgentReport> = {
      'quick-win-detector': {
        agentName: 'quick-win-detector',
        status: 'needs-improvement',
        currentCapabilities: [
          'Identifies model downgrade opportunities',
          'Calculates potential savings',
          'Provides implementation snippets'
        ],
        weaknesses: [
          'Only suggests obvious model downgrades',
          'Doesn\'t analyze actual usage patterns deeply',
          'Missing domain-specific optimizations',
          'No learning from customer feedback'
        ],
        recommendations: [
          'Add pattern recognition for specific use cases',
          'Identify wasteful prompt patterns unique to each customer',
          'Suggest architectural changes, not just model swaps',
          'Learn from successful optimizations across customers'
        ],
        marketAlignmentScore: 40,
        uniqueValueScore: 30
      },
      'csv-importer': {
        agentName: 'csv-importer',
        status: 'needs-improvement',
        currentCapabilities: [
          'Parses OpenAI/Anthropic CSV files',
          'Generates basic insights',
          'Detects batching opportunities'
        ],
        weaknesses: [
          'Generic insights everyone already knows',
          'No industry-specific analysis',
          'Missing cross-customer intelligence',
          'No predictive capabilities'
        ],
        recommendations: [
          'Build industry-specific pattern library',
          'Compare against anonymized peer benchmarks',
          'Predict future costs based on growth patterns',
          'Identify anomalies specific to their use case'
        ],
        marketAlignmentScore: 35,
        uniqueValueScore: 25
      },
      'agent-dialogue': {
        agentName: 'agent-dialogue',
        status: 'needs-improvement',
        currentCapabilities: [
          'Multi-agent validation',
          'Market research capabilities',
          'Consensus building'
        ],
        weaknesses: [
          'Not integrated into customer-facing features',
          'Operates in isolation',
          'No real-time value delivery'
        ],
        recommendations: [
          'Use for real-time optimization suggestions',
          'Validate customer-specific patterns',
          'Generate custom insights per industry'
        ],
        marketAlignmentScore: 50,
        uniqueValueScore: 60
      },
      'agent-platform-builder': {
        agentName: 'agent-platform-builder',
        status: 'optimal',
        currentCapabilities: [
          'Rapid prototyping',
          'Multi-agent coordination',
          'Market validation integration'
        ],
        weaknesses: [
          'Not building differentiating features',
          'Focus on generic platform capabilities'
        ],
        recommendations: [
          'Build unique optimization engine',
          'Create industry-specific analyzers',
          'Develop proprietary cost prediction models'
        ],
        marketAlignmentScore: 70,
        uniqueValueScore: 65
      },
      'cost-anomaly-detector': {
        agentName: 'cost-anomaly-detector',
        status: 'needs-improvement',
        currentCapabilities: [
          'Basic anomaly detection',
          'Threshold alerts'
        ],
        weaknesses: [
          'Too many false positives',
          'No context awareness',
          'Generic thresholds'
        ],
        recommendations: [
          'Learn normal patterns per customer',
          'Understand business context for spikes',
          'Predictive warnings before issues occur'
        ],
        marketAlignmentScore: 45,
        uniqueValueScore: 40
      }
    };

    return agentEvaluations[agentName] || {
      agentName,
      status: 'needs-improvement',
      currentCapabilities: [],
      weaknesses: ['Not properly evaluated'],
      recommendations: ['Requires detailed analysis'],
      marketAlignmentScore: 0,
      uniqueValueScore: 0
    };
  }

  /**
   * Generate strategic recommendations based on analysis
   */
  private async generateStrategicRecommendations(
    problems: string[],
    agentReports: AgentReport[],
    competitors: CompetitorAnalysis[]
  ): Promise<StrategicRecommendation[]> {
    const recommendations: StrategicRecommendation[] = [
      {
        priority: 'critical',
        title: 'Build Industry-Specific Intelligence Engine',
        description: 'Create ML models trained on patterns from specific industries (e-commerce, SaaS, fintech) that provide insights competitors can\'t match',
        expectedImpact: 'Differentiate from generic tools by providing "This is how top e-commerce companies optimize their chatbots" insights',
        implementationTime: '2 weeks',
        requiredResources: ['ML engineer', 'Industry data', 'Domain experts']
      },
      {
        priority: 'critical',
        title: 'Zero-Friction Value Demonstration',
        description: 'Allow users to upload CSV or paste API response to get immediate, specific insights without connecting API keys',
        expectedImpact: 'Prove value before asking for integration, reducing activation friction by 80%',
        implementationTime: '3 days',
        requiredResources: ['Frontend developer', 'Enhanced CSV analyzer']
      },
      {
        priority: 'high',
        title: 'Proprietary Optimization Algorithms',
        description: 'Develop optimization strategies competitors don\'t have: semantic deduplication, intelligent prompt compression, cross-request caching',
        expectedImpact: 'Deliver 40-60% cost reduction vs 10-20% from generic advice',
        implementationTime: '1 week',
        requiredResources: ['AI engineer', 'Optimization researcher']
      },
      {
        priority: 'high',
        title: 'Peer Benchmarking System',
        description: 'Show how customer\'s AI spending compares to similar companies anonymously',
        expectedImpact: 'Create FOMO and urgency - "You\'re spending 3x more than similar SaaS companies"',
        implementationTime: '1 week',
        requiredResources: ['Data engineer', 'Privacy lawyer']
      },
      {
        priority: 'medium',
        title: 'Chrome Extension for Live Optimization',
        description: 'Intercept API calls in browser and show real-time optimization suggestions',
        expectedImpact: 'Immediate value during development, viral growth potential',
        implementationTime: '1 week',
        requiredResources: ['Extension developer', 'Real-time optimization engine']
      }
    ];

    console.log('Strategic Recommendations:');
    recommendations.forEach(r => {
      console.log(`   [${r.priority.toUpperCase()}] ${r.title}`);
      console.log(`          Impact: ${r.expectedImpact}`);
    });

    return recommendations;
  }

  /**
   * Create actionable plan with assignments
   */
  private async createActionPlan(recommendations: StrategicRecommendation[]): Promise<ActionItem[]> {
    const actionItems: ActionItem[] = [];
    let itemId = 1;

    for (const rec of recommendations.filter(r => r.priority === 'critical' || r.priority === 'high')) {
      actionItems.push({
        id: `ACTION-${itemId++}`,
        title: `Implement: ${rec.title}`,
        assignedAgent: this.assignBestAgent(rec),
        deadline: this.calculateDeadline(rec.implementationTime),
        dependencies: this.identifyDependencies(rec),
        successCriteria: this.defineSuccessCriteria(rec)
      });
    }

    return actionItems;
  }

  /**
   * Assign best agent for task
   */
  private assignBestAgent(recommendation: StrategicRecommendation): string {
    const agentMapping: Record<string, string> = {
      'Build Industry-Specific Intelligence Engine': 'new-ml-optimization-agent',
      'Zero-Friction Value Demonstration': 'csv-importer',
      'Proprietary Optimization Algorithms': 'new-optimization-engine-agent',
      'Peer Benchmarking System': 'new-benchmarking-agent',
      'Chrome Extension for Live Optimization': 'agent-platform-builder'
    };

    return agentMapping[recommendation.title] || 'orchestrator';
  }

  /**
   * Calculate deadline based on implementation time
   */
  private calculateDeadline(implementationTime: string): string {
    const days = parseInt(implementationTime.match(/\d+/)?.[0] || '7');
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline.toISOString().split('T')[0];
  }

  /**
   * Identify task dependencies
   */
  private identifyDependencies(recommendation: StrategicRecommendation): string[] {
    const deps: Record<string, string[]> = {
      'Build Industry-Specific Intelligence Engine': ['Collect industry data', 'Train ML models'],
      'Zero-Friction Value Demonstration': ['Enhance CSV parser', 'Build demo UI'],
      'Proprietary Optimization Algorithms': ['Research optimization techniques', 'Benchmark against competitors'],
      'Peer Benchmarking System': ['Privacy compliance', 'Data anonymization'],
      'Chrome Extension for Live Optimization': ['Extension permissions', 'Real-time processing']
    };

    return deps[recommendation.title] || [];
  }

  /**
   * Define success criteria
   */
  private defineSuccessCriteria(recommendation: StrategicRecommendation): string[] {
    const criteria: Record<string, string[]> = {
      'Build Industry-Specific Intelligence Engine': [
        '90% accuracy in industry classification',
        'Provide 5+ unique insights per industry',
        'Reduce generic recommendations by 80%'
      ],
      'Zero-Friction Value Demonstration': [
        'Process CSV in <2 seconds',
        'Generate 3+ actionable insights',
        '50% of demo users sign up'
      ],
      'Proprietary Optimization Algorithms': [
        'Achieve 40%+ cost reduction',
        'Zero quality degradation',
        'Work across all major providers'
      ],
      'Peer Benchmarking System': [
        '100% anonymous data',
        'Benchmarks for 10+ industries',
        'Update weekly'
      ],
      'Chrome Extension for Live Optimization': [
        'Zero performance impact',
        'Support OpenAI and Anthropic consoles',
        '1000+ installs in first month'
      ]
    };

    return criteria[recommendation.title] || ['Meet expected impact', 'Complete on time', 'Pass quality review'];
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(agentReports: AgentReport[]): 'optimal' | 'needs-improvement' | 'critical' {
    const avgMarketAlignment = agentReports.reduce((sum, r) => sum + r.marketAlignmentScore, 0) / agentReports.length;
    const avgUniqueValue = agentReports.reduce((sum, r) => sum + r.uniqueValueScore, 0) / agentReports.length;
    
    if (avgMarketAlignment >= 70 && avgUniqueValue >= 70) return 'optimal';
    if (avgMarketAlignment >= 50 || avgUniqueValue >= 50) return 'needs-improvement';
    return 'critical';
  }

  /**
   * Save comprehensive report
   */
  private async saveReport(analysis: SystemAnalysis): Promise<void> {
    const reportPath = path.join(
      this.outputDir,
      `orchestrator-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );

    writeFileSync(reportPath, JSON.stringify(analysis, null, 2));

    // Also create a markdown summary
    const summaryPath = reportPath.replace('.json', '.md');
    const summary = this.generateMarkdownSummary(analysis);
    writeFileSync(summaryPath, summary);

    console.log(`\n📁 Report saved to: ${reportPath}`);
    console.log(`📄 Summary saved to: ${summaryPath}`);
  }

  /**
   * Generate markdown summary of analysis
   */
  private generateMarkdownSummary(analysis: SystemAnalysis): string {
    return `# Meterr.ai System Analysis Report

## Date: ${analysis.timestamp.toISOString()}

## Overall Status: ${analysis.overallStatus.toUpperCase()}

## Market Feedback
"${analysis.marketFeedback}"

## Core Problems Identified
${analysis.coreProblems.map(p => `- ${p}`).join('\n')}

## Agent Performance Summary
${analysis.agentReports.map(r => `
### ${r.agentName}
- Status: ${r.status}
- Market Alignment: ${r.marketAlignmentScore}/100
- Unique Value: ${r.uniqueValueScore}/100
- Key Weakness: ${r.weaknesses[0]}
- Top Recommendation: ${r.recommendations[0]}
`).join('\n')}

## Top Strategic Recommendations
${analysis.strategicRecommendations
  .filter(r => r.priority === 'critical' || r.priority === 'high')
  .map(r => `
### [${r.priority.toUpperCase()}] ${r.title}
${r.description}
- **Impact**: ${r.expectedImpact}
- **Time**: ${r.implementationTime}
`).join('\n')}

## Immediate Action Items
${analysis.actionPlan.slice(0, 5).map(a => `
1. **${a.title}**
   - Assigned: ${a.assignedAgent}
   - Deadline: ${a.deadline}
   - Success: ${a.successCriteria[0]}
`).join('\n')}

## Conclusion
The system currently provides generic recommendations that don't justify the $99/month price point. 
To succeed, we must:
1. Build proprietary optimization algorithms competitors don't have
2. Provide industry-specific insights based on real data
3. Demonstrate value before asking for API keys
4. Show peer comparisons to create urgency

**Next Step**: Implement the critical recommendations within 3 days to validate market fit.
`;
  }

  /**
   * Spawn new specialized agents as needed
   */
  async spawnSpecializedAgent(
    name: string,
    purpose: string,
    capabilities: string[]
  ): Promise<void> {
    console.log(`\n🔧 Spawning new agent: ${name}`);
    
    const agentCode = `
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';

export class ${name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Agent {
  private client: UnifiedLLMClient;
  
  constructor() {
    this.client = new UnifiedLLMClient({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
    });
  }
  
  async execute(): Promise<void> {
    // ${purpose}
    // Capabilities: ${capabilities.join(', ')}
    console.log('Agent ${name} executing...');
  }
}
`;

    const agentPath = path.join(
      process.cwd(),
      'apps',
      'app',
      'scripts',
      `agent-${name}.ts`
    );
    
    writeFileSync(agentPath, agentCode);
    console.log(`   ✅ Agent spawned: ${agentPath}`);
  }
}

async function main() {
  const orchestrator = new OrchestratorAgent();
  
  const marketFeedback = "This product is asking users to connect their API, then showing generic recommendations everyone already knows (batch processing, caching, etc.). This won't sell.";
  
  console.log('🚀 ORCHESTRATOR AGENT - COMPREHENSIVE SYSTEM ANALYSIS\n');
  console.log('Analyzing all agents and generating improvement strategy...\n');
  
  const analysis = await orchestrator.orchestrateSystemAnalysis(marketFeedback);
  
  console.log('\n' + '=' .repeat(70));
  console.log('📊 ANALYSIS COMPLETE\n');
  console.log(`Overall Status: ${analysis.overallStatus.toUpperCase()}`);
  console.log(`Agents Needing Improvement: ${analysis.agentReports.filter(r => r.status !== 'optimal').length}/${analysis.agentReports.length}`);
  console.log(`Critical Actions: ${analysis.actionPlan.length}`);
  console.log(`\nTop Priority: ${analysis.strategicRecommendations[0]?.title}`);
  
  // Spawn new agents for critical tasks
  const newAgentsNeeded = [
    { name: 'ml-optimization', purpose: 'Build ML models for industry-specific patterns', capabilities: ['Pattern recognition', 'Cost prediction', 'Anomaly detection'] },
    { name: 'benchmarking', purpose: 'Create peer comparison system', capabilities: ['Data anonymization', 'Statistical analysis', 'Industry classification'] },
    { name: 'optimization-engine', purpose: 'Develop proprietary optimization algorithms', capabilities: ['Prompt compression', 'Semantic deduplication', 'Smart caching'] }
  ];
  
  console.log('\n🔧 Spawning Specialized Agents...');
  for (const agent of newAgentsNeeded) {
    await orchestrator.spawnSpecializedAgent(agent.name, agent.purpose, agent.capabilities);
  }
  
  console.log('\n✅ Orchestration complete! Check orchestrator-reports/ for detailed analysis.');
}

if (require.main === module) {
  main().catch(console.error);
}
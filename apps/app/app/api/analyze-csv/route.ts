/**
 * Zero-Friction CSV Analysis API
 * Provides immediate 40-60% cost reduction insights without API key requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import { AdvancedCSVAnalyzer } from '@/lib/services/advanced-csv-analyzer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const provider = formData.get('provider') as 'openai' | 'anthropic';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read CSV content
    const csvContent = await file.text();
    
    // Initialize analyzer (no Supabase needed for demo)
    const analyzer = new AdvancedCSVAnalyzer();
    
    // Run sophisticated analysis
    const analysis = await analyzer.analyzeCSV(csvContent, provider || 'openai');
    
    // Format response for maximum impact
    const response = {
      success: true,
      summary: {
        totalCost: formatCurrency(analysis.totalCost),
        projectedSavings: formatCurrency(analysis.projectedSavings),
        savingsPercent: analysis.savingsPercent,
        paybackTime: calculatePaybackTime(analysis.projectedSavings),
        competitorComparison: generateCompetitorComparison(analysis.savingsPercent)
      },
      immediateWins: analysis.immediateActions.map((action, index) => ({
        priority: index + 1,
        action,
        implementationTime: getImplementationTime(action),
        expectedImpact: getExpectedImpact(analysis.strategies[index])
      })),
      strategies: analysis.strategies.map(strategy => ({
        name: strategy.name,
        description: strategy.description,
        savings: formatCurrency(strategy.potentialSavings),
        confidence: `${strategy.confidence * 100}%`,
        difficulty: strategy.implementation.difficulty,
        timeToImplement: strategy.implementation.timeToImplement,
        example: formatExample(strategy.examples[0])
      })),
      insights: analysis.customInsights,
      nextSteps: generateNextSteps(analysis),
      implementation: {
        totalEffort: calculateTotalEffort(analysis.strategies),
        riskLevel: assessOverallRisk(analysis.strategies),
        successMetrics: generateSuccessMetrics(analysis)
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('CSV analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze CSV', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculate payback time for Meterr subscription
 */
function calculatePaybackTime(monthlySavings: number): string {
  const meterCost = 99; // $99/month
  if (monthlySavings <= 0) return 'N/A';
  
  const months = meterCost / monthlySavings;
  
  if (months < 1) return 'Immediate';
  if (months <= 3) return `${Math.ceil(months)} months`;
  if (months <= 12) return `${Math.ceil(months)} months`;
  
  return 'Over 1 year';
}

/**
 * Generate competitor comparison
 */
function generateCompetitorComparison(savingsPercent: number): string {
  if (savingsPercent >= 40) {
    return `${savingsPercent}% savings vs 10-15% from generic tools`;
  } else if (savingsPercent >= 30) {
    return `${savingsPercent}% savings vs 10% industry average`;
  } else if (savingsPercent >= 20) {
    return `${savingsPercent}% savings - on par with premium tools`;
  } else {
    return `${savingsPercent}% savings detected`;
  }
}

/**
 * Get implementation time from action string
 */
function getImplementationTime(action: string): string {
  if (action.includes('1-2 days')) return '1-2 days';
  if (action.includes('2-3 days')) return '2-3 days';
  if (action.includes('3-4 days')) return '3-4 days';
  if (action.includes('week')) return '1 week';
  return '2-3 days';
}

/**
 * Get expected impact from strategy
 */
function getExpectedImpact(strategy: any): string {
  if (!strategy) return 'Significant cost reduction';
  
  const savings = strategy.potentialSavings;
  if (savings > 10000) return 'Major impact - save thousands per month';
  if (savings > 5000) return 'High impact - substantial monthly savings';
  if (savings > 1000) return 'Good impact - meaningful cost reduction';
  return 'Quick win - immediate savings';
}

/**
 * Format optimization example
 */
function formatExample(example: any): any {
  if (!example) return null;
  
  return {
    before: {
      model: example.original.model,
      tokens: example.original.inputTokens + example.original.outputTokens,
      cost: formatCurrency(example.original.cost)
    },
    after: {
      model: example.optimized.model,
      tokens: example.optimized.inputTokens + example.optimized.outputTokens,
      cost: formatCurrency(example.optimized.cost)
    },
    improvement: `${example.savingsPercent}% reduction`,
    technique: example.technique
  };
}

/**
 * Generate actionable next steps
 */
function generateNextSteps(analysis: any): string[] {
  const steps: string[] = [];
  
  if (analysis.savingsPercent >= 40) {
    steps.push('Schedule a demo to implement these optimizations immediately');
    steps.push('Set up Meterr monitoring to track savings in real-time');
    steps.push('Configure automated optimization rules');
  } else if (analysis.savingsPercent >= 25) {
    steps.push('Review top 3 optimization strategies with your team');
    steps.push('Start with semantic caching for quick wins');
    steps.push('Set up A/B testing for model routing');
  } else {
    steps.push('Analyze more recent usage data for better insights');
    steps.push('Consider usage patterns across your organization');
    steps.push('Explore custom optimization strategies');
  }
  
  return steps;
}

/**
 * Calculate total implementation effort
 */
function calculateTotalEffort(strategies: any[]): string {
  const days = strategies.reduce((total, s) => {
    const time = s.implementation.timeToImplement;
    const match = time.match(/(\d+)/);
    return total + (match ? parseInt(match[1]) : 3);
  }, 0);
  
  if (days <= 7) return `${days} days total`;
  if (days <= 14) return `${Math.ceil(days/7)} weeks`;
  return `${Math.ceil(days/30)} months`;
}

/**
 * Assess overall risk level
 */
function assessOverallRisk(strategies: any[]): string {
  const highRisk = strategies.filter(s => s.implementation.difficulty === 'hard').length;
  const mediumRisk = strategies.filter(s => s.implementation.difficulty === 'medium').length;
  
  if (highRisk > 2) return 'Medium - requires careful implementation';
  if (mediumRisk > 3) return 'Low-Medium - standard optimization';
  return 'Low - proven techniques';
}

/**
 * Generate success metrics
 */
function generateSuccessMetrics(analysis: any): string[] {
  return [
    `${analysis.savingsPercent}% cost reduction target`,
    'Maintain or improve response quality',
    'Reduce average tokens per request by 30%',
    'Achieve 80% cache hit rate on common queries',
    'Cut response time by 20% through optimizations'
  ];
}
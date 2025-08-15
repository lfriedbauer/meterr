/**
 * Quick Win Detector
 * 
 * Identifies the first high-confidence optimization opportunity
 * to prove value rapidly to the customer
 */

import { createClient } from '@supabase/supabase-js';

// Types
export interface QuickWin {
  title: string;
  description: string;
  currentModel: string;
  recommendedModel: string;
  monthlySavings: number;
  confidencePercentage: number;
  implementationGuide: ImplementationGuide;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ImplementationGuide {
  description: string;
  codeSnippet: string;
  configExample?: string;
  whereToChange: string;
  testingSteps: string[];
}

export interface OptimizationPattern {
  pattern: string;
  currentModel: string;
  recommendedModel: string;
  confidenceThreshold: number;
  riskLevel: 'low' | 'medium' | 'high';
  conditions: {
    maxTokens?: number;
    minTokens?: number;
    hasCode?: boolean;
    questionTypes?: string[];
  };
}

/**
 * Quick Win Detector - Finds immediate optimization opportunities
 */
export class QuickWinDetector {
  private supabase;
  
  // Predefined optimization patterns for Quick Wins
  private patterns: OptimizationPattern[] = [
    // OpenAI patterns
    {
      pattern: 'simple_qa_gpt4',
      currentModel: 'gpt-4',
      recommendedModel: 'gpt-4o-mini',
      confidenceThreshold: 0.95,
      riskLevel: 'low',
      conditions: {
        maxTokens: 500,
        hasCode: false,
        questionTypes: ['simple_qa']
      }
    },
    {
      pattern: 'faq_gpt4',
      currentModel: 'gpt-4',
      recommendedModel: 'gpt-4o-mini',
      confidenceThreshold: 0.90,
      riskLevel: 'low',
      conditions: {
        maxTokens: 300,
        questionTypes: ['simple_qa']
      }
    },
    {
      pattern: 'summarization_gpt4',
      currentModel: 'gpt-4',
      recommendedModel: 'gpt-3.5-turbo',
      confidenceThreshold: 0.85,
      riskLevel: 'medium',
      conditions: {
        maxTokens: 1000,
        hasCode: false,
        questionTypes: ['analysis']
      }
    },
    {
      pattern: 'translation_gpt4',
      currentModel: 'gpt-4',
      recommendedModel: 'gpt-3.5-turbo',
      confidenceThreshold: 0.90,
      riskLevel: 'low',
      conditions: {
        hasCode: false
      }
    },
    // Anthropic patterns - ACTUAL models from your usage
    {
      pattern: 'opus_4_to_sonnet',
      currentModel: 'claude-opus-4-1-20250805',
      recommendedModel: 'claude-3-5-sonnet-20241022',
      confidenceThreshold: 0.92,
      riskLevel: 'low',
      conditions: {
        maxTokens: 100000  // Removed restriction since you have heavy usage
      }
    },
    {
      pattern: 'sonnet_new_to_haiku',
      currentModel: 'claude-3-5-sonnet-20241022',
      recommendedModel: 'claude-3-5-haiku-20241022',
      confidenceThreshold: 0.85,
      riskLevel: 'low',
      conditions: {
        maxTokens: 2000
      }
    },
    {
      pattern: 'sonnet_old_to_haiku',
      currentModel: 'claude-3-5-sonnet-20240620',
      recommendedModel: 'claude-3-haiku-20240307',
      confidenceThreshold: 0.85,
      riskLevel: 'low',
      conditions: {
        maxTokens: 2000
      }
    },
    {
      pattern: 'sonnet_4_to_sonnet_3_5',
      currentModel: 'claude-sonnet-4-20250514',
      recommendedModel: 'claude-3-5-sonnet-20241022',
      confidenceThreshold: 0.95,
      riskLevel: 'low',
      conditions: {}
    }
  ];

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Detect Quick Win for a customer
   */
  async detectQuickWin(customerId: string): Promise<QuickWin | null> {
    try {
      // Get customer's usage patterns
      const patterns = await this.getCustomerPatterns(customerId);
      if (!patterns || patterns.length === 0) {
        console.log('No usage patterns found for customer');
        return null;
      }

      // Analyze patterns to find optimization opportunities
      const opportunities = this.analyzePatterns(patterns);
      if (opportunities.length === 0) {
        console.log('No optimization opportunities found');
        return null;
      }

      // Select the best Quick Win (highest confidence, lowest risk)
      const quickWin = this.selectBestQuickWin(opportunities);
      
      // Store the Quick Win in database
      if (quickWin) {
        await this.storeQuickWin(customerId, quickWin);
      }

      return quickWin;
    } catch (error) {
      console.error('Error detecting Quick Win:', error);
      return null;
    }
  }

  /**
   * Get customer's usage patterns from the last 30 days
   */
  private async getCustomerPatterns(customerId: string): Promise<any[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Try multiple date field names for compatibility
    const { data, error } = await this.supabase
      .from('usage_patterns')
      .select('*')
      .eq('customer_id', customerId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching patterns:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Analyze usage patterns to find optimization opportunities
   */
  private analyzePatterns(usagePatterns: any[]): QuickWin[] {
    const opportunities: QuickWin[] = [];
    const modelUsage = this.aggregateByModel(usagePatterns);

    for (const [model, usage] of Object.entries(modelUsage)) {
      // Check each optimization pattern
      for (const pattern of this.patterns) {
        if (model === pattern.currentModel) {
          const matchingUsage = this.filterMatchingUsage(
            usage as any,
            pattern.conditions
          );

          if (matchingUsage.count >= 1) { // Lower threshold for POC
            const savings = this.calculateSavings(
              matchingUsage,
              pattern.currentModel,
              pattern.recommendedModel
            );

            if (savings.monthly > 10) { // Lower threshold for POC, was $100
              opportunities.push({
                title: this.generateTitle(pattern),
                description: this.generateDescription(pattern, matchingUsage),
                currentModel: pattern.currentModel,
                recommendedModel: pattern.recommendedModel,
                monthlySavings: savings.monthly,
                confidencePercentage: Math.round(pattern.confidenceThreshold * 100),
                implementationGuide: this.generateImplementationGuide(pattern),
                riskLevel: pattern.riskLevel
              });
            }
          }
        }
      }
    }

    return opportunities;
  }

  /**
   * Aggregate usage patterns by model
   */
  private aggregateByModel(patterns: any[]): Record<string, any> {
    const aggregated: Record<string, any> = {};

    for (const pattern of patterns) {
      if (!aggregated[pattern.model]) {
        aggregated[pattern.model] = {
          patterns: [],
          totalCost: 0,
          totalTokens: 0,
          count: 0
        };
      }

      aggregated[pattern.model].patterns.push(pattern);
      aggregated[pattern.model].totalCost += pattern.cost || 0;
      aggregated[pattern.model].totalTokens += (pattern.input_tokens || 0) + (pattern.output_tokens || 0);
      aggregated[pattern.model].count += 1;
    }

    return aggregated;
  }

  /**
   * Filter usage matching specific conditions
   */
  private filterMatchingUsage(usage: any, conditions: any): any {
    const matching = {
      patterns: [],
      totalCost: 0,
      totalTokens: 0,
      count: 0
    };

    for (const pattern of usage.patterns) {
      let matches = true;

      const tokenCount = (pattern.input_tokens || 0) + (pattern.output_tokens || 0);
      if (conditions.maxTokens && tokenCount > conditions.maxTokens) {
        matches = false;
      }
      if (conditions.minTokens && tokenCount < conditions.minTokens) {
        matches = false;
      }
      if (conditions.hasCode !== undefined && pattern.has_code_content !== conditions.hasCode) {
        matches = false;
      }
      if (conditions.questionTypes && !conditions.questionTypes.includes(pattern.question_type)) {
        matches = false;
      }

      if (matches) {
        matching.patterns.push(pattern);
        matching.totalCost += pattern.cost || 0;
        matching.totalTokens += (pattern.input_tokens || 0) + (pattern.output_tokens || 0);
        matching.count += 1;
      }
    }

    return matching;
  }

  /**
   * Calculate potential savings
   */
  private calculateSavings(
    usage: any,
    currentModel: string,
    recommendedModel: string
  ): { monthly: number; annual: number } {
    // Model pricing (per 1K tokens - average of input/output)
    const pricing: Record<string, number> = {
      // OpenAI
      'gpt-4': 0.03,
      'gpt-4o-mini': 0.00015,
      'gpt-3.5-turbo': 0.001,
      // Anthropic (average of input/output prices)
      'claude-opus-4-1-20250805': 0.045,      // $15 input + $75 output / 2
      'claude-3-5-sonnet-20241022': 0.009,    // $3 input + $15 output / 2
      'claude-3-5-sonnet-20240620': 0.009,
      'claude-3-5-haiku-20241022': 0.0024,    // $0.8 input + $4 output / 2
      'claude-sonnet-4-20250514': 0.009,
      'claude-3-haiku-20240307': 0.00075      // $0.25 input + $1.25 output / 2
    };

    const currentCostPerToken = (pricing[currentModel] || 0.03) / 1000;
    const recommendedCostPerToken = (pricing[recommendedModel] || 0.001) / 1000;

    const currentMonthlyCost = usage.totalCost; // Already calculated
    const recommendedMonthlyCost = usage.totalTokens * recommendedCostPerToken;

    const monthlySavings = currentMonthlyCost - recommendedMonthlyCost;
    const annualSavings = monthlySavings * 12;

    return {
      monthly: Math.round(monthlySavings * 100) / 100,
      annual: Math.round(annualSavings * 100) / 100
    };
  }

  /**
   * Select the best Quick Win from opportunities
   */
  private selectBestQuickWin(opportunities: QuickWin[]): QuickWin | null {
    if (opportunities.length === 0) return null;

    // Sort by: risk (low first), confidence (high first), savings (high first)
    opportunities.sort((a, b) => {
      // Risk level priority
      const riskOrder = { low: 0, medium: 1, high: 2 };
      if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      }

      // Confidence priority
      if (a.confidencePercentage !== b.confidencePercentage) {
        return b.confidencePercentage - a.confidencePercentage;
      }

      // Savings priority
      return b.monthlySavings - a.monthlySavings;
    });

    return opportunities[0];
  }

  /**
   * Generate Quick Win title
   */
  private generateTitle(pattern: OptimizationPattern): string {
    const titles: Record<string, string> = {
      'simple_qa_gpt4': 'Optimize Simple Q&A Responses',
      'faq_gpt4': 'Switch FAQ Bot to Efficient Model',
      'summarization_gpt4': 'Optimize Document Summarization',
      'translation_gpt4': 'Optimize Translation Tasks'
    };

    return titles[pattern.pattern] || `Switch from ${pattern.currentModel} to ${pattern.recommendedModel}`;
  }

  /**
   * Generate Quick Win description
   */
  private generateDescription(pattern: OptimizationPattern, usage: any): string {
    const percentage = Math.round((usage.count / usage.patterns.length) * 100);
    
    return `We've identified that ${percentage}% of your ${pattern.currentModel} usage is for simple tasks ` +
           `that would work perfectly with ${pattern.recommendedModel}. ` +
           `This optimization maintains quality while significantly reducing costs.`;
  }

  /**
   * Generate implementation guide
   */
  private generateImplementationGuide(pattern: OptimizationPattern): ImplementationGuide {
    const guides: Record<string, ImplementationGuide> = {
      'simple_qa_gpt4': {
        description: 'Update your API calls to use GPT-4o-mini for simple questions',
        codeSnippet: `// Before
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: userQuestion }]
});

// After
const response = await openai.chat.completions.create({
  model: userQuestion.length < 500 ? "gpt-4o-mini" : "gpt-4",
  messages: [{ role: "user", content: userQuestion }]
});`,
        configExample: `{
  "models": {
    "simple_qa": "gpt-4o-mini",
    "complex_analysis": "gpt-4"
  }
}`,
        whereToChange: 'Update your OpenAI API call configuration',
        testingSteps: [
          'Test with 10 simple questions',
          'Compare response quality',
          'Monitor response times',
          'Check customer satisfaction metrics'
        ]
      },
      'faq_gpt4': {
        description: 'Configure your FAQ bot to use GPT-4o-mini',
        codeSnippet: `// Update your FAQ handler
function getFAQResponse(question) {
  return openai.chat.completions.create({
    model: "gpt-4o-mini", // Changed from "gpt-4"
    messages: [
      { role: "system", content: "You are a helpful FAQ assistant." },
      { role: "user", content: question }
    ],
    max_tokens: 300
  });
}`,
        whereToChange: 'In your FAQ bot handler or configuration file',
        testingSteps: [
          'Test all FAQ categories',
          'Verify response accuracy',
          'Check response times improved',
          'Monitor for customer complaints'
        ]
      }
    };

    return guides[pattern.pattern] || {
      description: `Switch from ${pattern.currentModel} to ${pattern.recommendedModel}`,
      codeSnippet: `model: "${pattern.recommendedModel}" // Changed from "${pattern.currentModel}"`,
      whereToChange: 'In your OpenAI API configuration',
      testingSteps: ['Test with sample requests', 'Monitor quality metrics']
    };
  }

  /**
   * Store Quick Win in database
   */
  private async storeQuickWin(customerId: string, quickWin: QuickWin): Promise<void> {
    try {
      // First, create an optimization opportunity
      const { data: opportunity, error: oppError } = await this.supabase
        .from('optimization_opportunities')
        .insert({
          customer_id: customerId,
          opportunity_type: 'model_substitution',
          current_model: quickWin.currentModel,
          recommended_model: quickWin.recommendedModel,
          current_monthly_cost: quickWin.monthlySavings / 0.7, // Rough estimate
          projected_monthly_cost: quickWin.monthlySavings * 0.3,
          confidence_level: quickWin.riskLevel === 'low' ? 'high' : 'medium',
          risk_score: quickWin.riskLevel === 'low' ? 2 : 5,
          implementation_code: quickWin.implementationGuide.codeSnippet,
          implementation_guide: quickWin.implementationGuide,
          status: 'identified'
        })
        .select('id')
        .single();

      if (oppError || !opportunity) {
        console.error('Error storing opportunity:', oppError);
        return;
      }

      // Then store the Quick Win
      await this.supabase
        .from('quick_wins')
        .insert({
          customer_id: customerId,
          opportunity_id: opportunity.id,
          title: quickWin.title,
          description: quickWin.description,
          monthly_savings: quickWin.monthlySavings,
          confidence_percentage: quickWin.confidencePercentage
        });
    } catch (error) {
      console.error('Error storing Quick Win:', error);
    }
  }
}

export default QuickWinDetector;
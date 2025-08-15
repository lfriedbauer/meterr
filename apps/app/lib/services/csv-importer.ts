/**
 * CSV Importer for OpenAI and Anthropic Usage Data
 * Provides real analysis beyond simple model downgrades
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface UsageRow {
  date: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost: number;
  request_type?: string;
  latency_ms?: number;
  context_length?: number;
  completion_length?: number;
}

interface OptimizationInsight {
  type:
    | 'model_optimization'
    | 'batch_processing'
    | 'caching'
    | 'prompt_engineering'
    | 'token_reduction';
  title: string;
  description: string;
  impact: string;
  savings_potential: number;
  implementation_effort: 'low' | 'medium' | 'high';
  roi_days: number;
  specific_recommendations: string[];
}

export class CSVImporter {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Import OpenAI CSV data
   */
  async importOpenAICSV(
    customerId: string,
    csvContent: string
  ): Promise<{
    success: boolean;
    rowsImported: number;
    insights: OptimizationInsight[];
  }> {
    try {
      const rows = this.parseOpenAICSV(csvContent);

      // Store usage patterns
      for (const row of rows) {
        await this.storeUsagePattern(customerId, row, 'openai');
      }

      // Generate sophisticated insights
      const insights = await this.generateInsights(customerId, rows);

      return {
        success: true,
        rowsImported: rows.length,
        insights,
      };
    } catch (error) {
      console.error('Error importing CSV:', error);
      return {
        success: false,
        rowsImported: 0,
        insights: [],
      };
    }
  }

  /**
   * Parse OpenAI CSV format
   */
  private parseOpenAICSV(csvContent: string): UsageRow[] {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    const rows: UsageRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',');
      const row: any = {};

      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim();
      });

      // Map OpenAI CSV columns to our format
      rows.push({
        date: row.date || row.timestamp || new Date().toISOString(),
        model: row.model || row.model_name || 'unknown',
        input_tokens: parseInt(row.n_prompt_tokens || row.prompt_tokens || '0'),
        output_tokens: parseInt(row.n_completion_tokens || row.completion_tokens || '0'),
        cost: parseFloat(row.cost || row.total_cost || '0'),
        request_type: row.request_type || 'completion',
        context_length: parseInt(row.n_context_tokens || row.context_tokens || '0'),
        completion_length: parseInt(row.n_generated_tokens || '0'),
      });
    }

    return rows;
  }

  /**
   * Generate sophisticated insights beyond simple downgrades
   */
  private async generateInsights(
    customerId: string,
    usage: UsageRow[]
  ): Promise<OptimizationInsight[]> {
    const insights: OptimizationInsight[] = [];

    // 1. Analyze token efficiency
    const tokenAnalysis = this.analyzeTokenEfficiency(usage);
    if (tokenAnalysis) insights.push(tokenAnalysis);

    // 2. Detect batch processing opportunities
    const batchingOpportunity = this.detectBatchingOpportunities(usage);
    if (batchingOpportunity) insights.push(batchingOpportunity);

    // 3. Find caching opportunities
    const cachingOpportunity = this.detectCachingOpportunities(usage);
    if (cachingOpportunity) insights.push(cachingOpportunity);

    // 4. Prompt optimization opportunities
    const promptOptimization = this.analyzePromptOptimization(usage);
    if (promptOptimization) insights.push(promptOptimization);

    // 5. Smart model routing based on patterns
    const smartRouting = this.analyzeSmartRouting(usage);
    if (smartRouting) insights.push(smartRouting);

    return insights;
  }

  /**
   * Analyze token efficiency patterns
   */
  private analyzeTokenEfficiency(usage: UsageRow[]): OptimizationInsight | null {
    const avgInputTokens = usage.reduce((sum, u) => sum + u.input_tokens, 0) / usage.length;
    const avgOutputTokens = usage.reduce((sum, u) => sum + u.output_tokens, 0) / usage.length;

    // High input-to-output ratio suggests verbose prompts
    if (avgInputTokens > avgOutputTokens * 2) {
      const potentialSavings = usage.reduce((sum, u) => sum + u.cost, 0) * 0.3;

      return {
        type: 'token_reduction',
        title: 'Reduce Prompt Verbosity',
        description: `Your prompts average ${Math.round(avgInputTokens)} tokens but generate only ${Math.round(avgOutputTokens)} tokens.`,
        impact: 'Reduce costs by 30% through prompt optimization',
        savings_potential: potentialSavings,
        implementation_effort: 'low',
        roi_days: 1,
        specific_recommendations: [
          'Use prompt templates with placeholders instead of repeating context',
          'Move static instructions to system prompts',
          'Implement prompt compression techniques',
          'Cache and reuse common prompt prefixes',
        ],
      };
    }

    return null;
  }

  /**
   * Detect batching opportunities
   */
  private detectBatchingOpportunities(usage: UsageRow[]): OptimizationInsight | null {
    // Group by hour to find burst patterns
    const hourlyUsage = new Map<string, number>();

    usage.forEach((row) => {
      const hour = new Date(row.date).toISOString().slice(0, 13);
      hourlyUsage.set(hour, (hourlyUsage.get(hour) || 0) + 1);
    });

    // Find hours with high request counts
    const highVolumeHours = Array.from(hourlyUsage.entries()).filter(([_, count]) => count > 10);

    if (highVolumeHours.length > 0) {
      const batchableCost = usage.reduce((sum, u) => sum + u.cost, 0) * 0.25;

      return {
        type: 'batch_processing',
        title: 'Implement Batch Processing',
        description: `Detected ${highVolumeHours.length} time periods with burst traffic that could benefit from batching.`,
        impact: 'Reduce API overhead by 25% through batch processing',
        savings_potential: batchableCost,
        implementation_effort: 'medium',
        roi_days: 7,
        specific_recommendations: [
          'Use OpenAI Batch API for 50% discount on completions',
          'Group similar requests and process together',
          'Implement request queuing during peak hours',
          'Use async processing for non-urgent requests',
        ],
      };
    }

    return null;
  }

  /**
   * Detect caching opportunities
   */
  private detectCachingOpportunities(usage: UsageRow[]): OptimizationInsight | null {
    // Simplified pattern detection - in production, would use embeddings
    const patterns = new Map<string, number>();

    usage.forEach((row) => {
      const pattern = `${row.model}-${Math.round(row.input_tokens / 100)}`;
      patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    });

    const repeatPatterns = Array.from(patterns.entries()).filter(([_, count]) => count > 5);

    if (repeatPatterns.length > 0) {
      const cachableCost = usage.reduce((sum, u) => sum + u.cost, 0) * 0.4;

      return {
        type: 'caching',
        title: 'Implement Semantic Caching',
        description: `Found ${repeatPatterns.length} repeating patterns that could be cached.`,
        impact: 'Eliminate 40% of API calls through intelligent caching',
        savings_potential: cachableCost,
        implementation_effort: 'medium',
        roi_days: 14,
        specific_recommendations: [
          'Implement embedding-based semantic cache',
          'Cache frequent Q&A pairs',
          'Use Redis with TTL for dynamic content',
          'Implement cache warming for predictable queries',
        ],
      };
    }

    return null;
  }

  /**
   * Analyze prompt optimization opportunities
   */
  private analyzePromptOptimization(usage: UsageRow[]): OptimizationInsight | null {
    const gpt4Usage = usage.filter((u) => u.model.includes('gpt-4'));
    const totalCost = usage.reduce((sum, u) => sum + u.cost, 0);
    const gpt4Cost = gpt4Usage.reduce((sum, u) => sum + u.cost, 0);

    if (gpt4Cost > totalCost * 0.7) {
      return {
        type: 'prompt_engineering',
        title: 'Optimize Prompts for Smaller Models',
        description: `${Math.round((gpt4Cost / totalCost) * 100)}% of costs come from GPT-4. Many tasks could work with optimized prompts on smaller models.`,
        impact: 'Reduce costs by 60% with better prompt engineering',
        savings_potential: gpt4Cost * 0.6,
        implementation_effort: 'low',
        roi_days: 3,
        specific_recommendations: [
          'Use few-shot examples to improve smaller model performance',
          'Implement chain-of-thought prompting for complex reasoning',
          'Break complex tasks into simpler sub-tasks',
          'Use GPT-4 only for tasks requiring advanced reasoning',
        ],
      };
    }

    return null;
  }

  /**
   * Analyze smart routing opportunities
   */
  private analyzeSmartRouting(usage: UsageRow[]): OptimizationInsight | null {
    // Analyze token length distribution
    const shortRequests = usage.filter((u) => u.output_tokens < 100).length;
    const mediumRequests = usage.filter(
      (u) => u.output_tokens >= 100 && u.output_tokens < 500
    ).length;
    const longRequests = usage.filter((u) => u.output_tokens >= 500).length;

    if (shortRequests > usage.length * 0.3) {
      const routingCost = usage.reduce((sum, u) => sum + u.cost, 0) * 0.35;

      return {
        type: 'model_optimization',
        title: 'Implement Intelligent Model Routing',
        description: `${Math.round((shortRequests / usage.length) * 100)}% of requests are short. Route by complexity, not uniformly.`,
        impact: 'Smart routing can reduce costs by 35%',
        savings_potential: routingCost,
        implementation_effort: 'high',
        roi_days: 21,
        specific_recommendations: [
          'Route simple queries to GPT-3.5-turbo or Claude Haiku',
          'Use GPT-4 only for complex analysis and reasoning',
          'Implement complexity scoring before routing',
          'A/B test model performance for your use cases',
          'Monitor quality metrics to ensure no degradation',
        ],
      };
    }

    return null;
  }

  /**
   * Store usage pattern in database
   */
  private async storeUsagePattern(
    customerId: string,
    usage: UsageRow,
    provider: string
  ): Promise<void> {
    try {
      await this.supabase.from('usage_patterns').upsert({
        customer_id: customerId,
        pattern_hash: this.generateHash(usage),
        model: usage.model,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cost: usage.cost,
        request_type: usage.request_type,
        timestamp: usage.date,
        metadata: {
          provider,
          context_length: usage.context_length,
          completion_length: usage.completion_length,
        },
      });
    } catch (error) {
      console.error('Error storing usage pattern:', error);
    }
  }

  private generateHash(usage: UsageRow): string {
    return Buffer.from(`${usage.date}-${usage.model}-${usage.input_tokens}`)
      .toString('base64')
      .substring(0, 16);
  }
}

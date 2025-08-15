/**
 * OpenAI Usage Fetcher
 * 
 * Fetches usage data from customer's OpenAI account
 * Stores only metadata - never actual prompts
 */

import { createClient } from '@supabase/supabase-js';
import { ApiKeyManager } from './api-key-manager';

// Types
export interface UsageMetadata {
  tokenCount: number;
  costUsd: number;
  model: string;
  hasCodeContent: boolean;
  questionType: 'simple_qa' | 'analysis' | 'creative' | 'code' | 'unknown';
  responseTimeMs?: number;
  timestamp: Date;
}

export interface UsageSummary {
  totalCost: number;
  totalTokens: number;
  modelBreakdown: {
    [model: string]: {
      cost: number;
      tokens: number;
      count: number;
    };
  };
  potentialSavings: number;
}

/**
 * OpenAI Usage Fetcher - Gets usage data from customer's account
 */
export class OpenAIUsageFetcher {
  private supabase;
  private apiKeyManager: ApiKeyManager;
  
  constructor(
    supabaseUrl: string, 
    supabaseKey: string,
    apiKeyManager: ApiKeyManager
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.apiKeyManager = apiKeyManager;
  }

  /**
   * Fetch usage data from OpenAI for a customer
   * This would typically be called hourly via a cron job
   */
  async fetchUsageData(
    customerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ success: boolean; error?: string; summary?: UsageSummary }> {
    try {
      // Get customer's OpenAI API key
      const apiKey = await this.apiKeyManager.getApiKey(customerId, 'openai');
      if (!apiKey) {
        return { success: false, error: 'OpenAI API key not found' };
      }

      // Set date range (default: last 30 days)
      const end = endDate || new Date();
      const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch usage from OpenAI
      const usage = await this.fetchFromOpenAI(apiKey, start, end);
      if (!usage) {
        return { success: false, error: 'Failed to fetch usage data' };
      }

      // Process and store metadata only
      const metadata = await this.processUsageData(customerId, usage);

      // Calculate summary
      const summary = this.calculateSummary(metadata);

      return { success: true, summary };
    } catch (error) {
      console.error('Error fetching usage data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Fetch usage data from OpenAI API
   * Note: OpenAI's usage API is limited, so this is a simplified version
   * In production, you might need to use their billing/usage endpoints
   */
  private async fetchFromOpenAI(
    apiKey: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      // OpenAI doesn't provide detailed usage via API yet
      // This is a placeholder for when they do
      // For now, we'll simulate with their available endpoints
      
      // In production, you would:
      // 1. Use OpenAI's usage dashboard API when available
      // 2. Or ask customers to export and upload usage data
      // 3. Or use a webhook integration if OpenAI provides it
      
      // Simulated data structure for development
      const mockUsage = [
        {
          model: 'gpt-4',
          tokens: 1500,
          cost: 0.045,
          timestamp: new Date(),
          metadata: {
            hasCode: false,
            avgResponseTime: 2500
          }
        },
        {
          model: 'gpt-4',
          tokens: 500,
          cost: 0.015,
          timestamp: new Date(),
          metadata: {
            hasCode: false,
            avgResponseTime: 1200
          }
        },
        {
          model: 'gpt-4o-mini',
          tokens: 800,
          cost: 0.0012,
          timestamp: new Date(),
          metadata: {
            hasCode: true,
            avgResponseTime: 800
          }
        }
      ];

      return mockUsage;
    } catch (error) {
      console.error('Error fetching from OpenAI:', error);
      return [];
    }
  }

  /**
   * Process usage data and store metadata only
   */
  private async processUsageData(
    customerId: string,
    usageData: any[]
  ): Promise<UsageMetadata[]> {
    const metadata: UsageMetadata[] = [];

    for (const usage of usageData) {
      // Determine question type based on patterns (without storing prompt)
      const questionType = this.detectQuestionType(usage);

      const metadataItem: UsageMetadata = {
        tokenCount: usage.tokens,
        costUsd: usage.cost,
        model: usage.model,
        hasCodeContent: usage.metadata?.hasCode || false,
        questionType,
        responseTimeMs: usage.metadata?.avgResponseTime,
        timestamp: usage.timestamp
      };

      metadata.push(metadataItem);

      // Store in database (metadata only)
      await this.storeUsagePattern(customerId, metadataItem);
    }

    return metadata;
  }

  /**
   * Detect question type without storing the actual prompt
   */
  private detectQuestionType(usage: any): UsageMetadata['questionType'] {
    // Based on token count and patterns
    if (usage.tokens < 100) {
      return 'simple_qa';
    } else if (usage.metadata?.hasCode) {
      return 'code';
    } else if (usage.tokens > 2000) {
      return 'creative';
    } else if (usage.tokens > 500) {
      return 'analysis';
    }
    return 'unknown';
  }

  /**
   * Store usage pattern in database
   */
  private async storeUsagePattern(
    customerId: string,
    metadata: UsageMetadata
  ): Promise<void> {
    try {
      // Generate embedding for pattern detection
      // This would be done with text-embedding-3-small
      // For now, we'll store without embedding
      
      await this.supabase
        .from('usage_patterns')
        .insert({
          customer_id: customerId,
          provider: 'openai',
          model: metadata.model,
          token_count: metadata.tokenCount,
          cost_usd: metadata.costUsd,
          has_code_content: metadata.hasCodeContent,
          question_type: metadata.questionType,
          response_time_ms: metadata.responseTimeMs,
          usage_timestamp: metadata.timestamp.toISOString()
        });
    } catch (error) {
      console.error('Error storing usage pattern:', error);
      // Continue processing even if storage fails
    }
  }

  /**
   * Calculate usage summary
   */
  private calculateSummary(metadata: UsageMetadata[]): UsageSummary {
    const summary: UsageSummary = {
      totalCost: 0,
      totalTokens: 0,
      modelBreakdown: {},
      potentialSavings: 0
    };

    for (const item of metadata) {
      summary.totalCost += item.costUsd;
      summary.totalTokens += item.tokenCount;

      if (!summary.modelBreakdown[item.model]) {
        summary.modelBreakdown[item.model] = {
          cost: 0,
          tokens: 0,
          count: 0
        };
      }

      summary.modelBreakdown[item.model].cost += item.costUsd;
      summary.modelBreakdown[item.model].tokens += item.tokenCount;
      summary.modelBreakdown[item.model].count += 1;
    }

    // Calculate potential savings
    summary.potentialSavings = this.calculatePotentialSavings(summary);

    return summary;
  }

  /**
   * Calculate potential savings by identifying optimization opportunities
   */
  private calculatePotentialSavings(summary: UsageSummary): number {
    let savings = 0;

    // Check if GPT-4 is being used for simple tasks
    if (summary.modelBreakdown['gpt-4']) {
      const gpt4Usage = summary.modelBreakdown['gpt-4'];
      
      // Estimate that 70% of GPT-4 usage could use GPT-4o-mini
      const potentialMiniUsage = gpt4Usage.tokens * 0.7;
      
      // GPT-4 costs ~$0.03/1K tokens, GPT-4o-mini costs ~$0.00015/1K tokens
      const currentCost = (potentialMiniUsage / 1000) * 0.03;
      const optimizedCost = (potentialMiniUsage / 1000) * 0.00015;
      
      savings += currentCost - optimizedCost;
    }

    return savings;
  }

  /**
   * Get historical usage patterns for analysis
   */
  async getUsagePatterns(
    customerId: string,
    days: number = 30
  ): Promise<UsageMetadata[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('usage_patterns')
        .select('*')
        .eq('customer_id', customerId)
        .gte('usage_timestamp', startDate.toISOString())
        .order('usage_timestamp', { ascending: false });

      if (error || !data) {
        console.error('Error fetching usage patterns:', error);
        return [];
      }

      return data.map(item => ({
        tokenCount: item.token_count,
        costUsd: item.cost_usd,
        model: item.model,
        hasCodeContent: item.has_code_content,
        questionType: item.question_type,
        responseTimeMs: item.response_time_ms,
        timestamp: new Date(item.usage_timestamp)
      }));
    } catch (error) {
      console.error('Error in getUsagePatterns:', error);
      return [];
    }
  }
}

export default OpenAIUsageFetcher;
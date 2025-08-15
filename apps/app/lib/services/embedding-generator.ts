/**
 * Embedding Generator
 *
 * Generates embeddings for usage patterns using OpenAI text-embedding-3-small
 * Privacy-first: Only generates embeddings from metadata, never from actual prompts
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Types
export interface PatternMetadata {
  model: string;
  tokenCount: number;
  hasCode: boolean;
  questionType: string;
  responseTime?: number;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Embedding Generator - Creates vectors for pattern detection
 */
export class EmbeddingGenerator {
  private openai: OpenAI;
  private supabase;

  constructor(openaiApiKey: string, supabaseUrl: string, supabaseKey: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Generate embedding for usage pattern metadata
   * NEVER pass actual prompt content here
   */
  async generateEmbedding(metadata: PatternMetadata): Promise<EmbeddingResult | null> {
    try {
      // Create a privacy-safe text representation of the pattern
      const patternText = this.createPatternText(metadata);

      // Generate embedding using text-embedding-3-small
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: patternText,
      });

      if (!response.data || response.data.length === 0) {
        console.error('No embedding returned from OpenAI');
        return null;
      }

      return {
        embedding: response.data[0].embedding,
        model: response.model,
        usage: response.usage,
      };
    } catch (error) {
      console.error('Error generating embedding:', error);
      return null;
    }
  }

  /**
   * Create privacy-safe text representation of pattern
   * This is what gets embedded - metadata only
   */
  private createPatternText(metadata: PatternMetadata): string {
    const components = [
      `model:${metadata.model}`,
      `tokens:${this.categorizeTokenCount(metadata.tokenCount)}`,
      `type:${metadata.questionType}`,
      metadata.hasCode ? 'has_code' : 'no_code',
      metadata.responseTime ? `speed:${this.categorizeResponseTime(metadata.responseTime)}` : '',
    ].filter(Boolean);

    return components.join(' ');
  }

  /**
   * Categorize token count into buckets
   */
  private categorizeTokenCount(tokens: number): string {
    if (tokens < 100) return 'tiny';
    if (tokens < 500) return 'small';
    if (tokens < 1000) return 'medium';
    if (tokens < 2000) return 'large';
    return 'xlarge';
  }

  /**
   * Categorize response time
   */
  private categorizeResponseTime(ms: number): string {
    if (ms < 500) return 'fast';
    if (ms < 1500) return 'normal';
    if (ms < 3000) return 'slow';
    return 'very_slow';
  }

  /**
   * Process batch of usage patterns and generate embeddings
   */
  async processUsagePatterns(
    customerId: string,
    patterns: any[]
  ): Promise<{ processed: number; errors: number }> {
    let processed = 0;
    let errors = 0;

    for (const pattern of patterns) {
      try {
        // Skip if already has embedding
        if (pattern.embedding) {
          processed++;
          continue;
        }

        // Create metadata from pattern
        const metadata: PatternMetadata = {
          model: pattern.model,
          tokenCount: pattern.token_count,
          hasCode: pattern.has_code_content,
          questionType: pattern.question_type || 'unknown',
          responseTime: pattern.response_time_ms,
        };

        // Generate embedding
        const result = await this.generateEmbedding(metadata);
        if (!result) {
          errors++;
          continue;
        }

        // Update pattern with embedding
        const { error } = await this.supabase
          .from('usage_patterns')
          .update({
            embedding: result.embedding,
            confidence_score: this.calculateConfidenceScore(metadata),
          })
          .eq('id', pattern.id);

        if (error) {
          console.error('Error updating pattern:', error);
          errors++;
        } else {
          processed++;
        }

        // Rate limiting - OpenAI allows 3000 RPM for embeddings
        await this.sleep(20); // ~3000 per minute
      } catch (error) {
        console.error('Error processing pattern:', error);
        errors++;
      }
    }

    return { processed, errors };
  }

  /**
   * Find similar patterns using cosine similarity
   */
  async findSimilarPatterns(
    customerId: string,
    embedding: number[],
    threshold: number = 0.85,
    limit: number = 10
  ): Promise<any[]> {
    try {
      // Use Supabase's vector similarity search
      // This uses pgvector's <=> operator for cosine distance
      const { data, error } = await this.supabase.rpc('match_usage_patterns', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit,
        customer_id: customerId,
      });

      if (error) {
        console.error('Error finding similar patterns:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findSimilarPatterns:', error);
      return [];
    }
  }

  /**
   * Cluster patterns by similarity
   */
  async clusterPatterns(
    customerId: string,
    minClusterSize: number = 5
  ): Promise<Map<number, any[]>> {
    const clusters = new Map<number, any[]>();
    let nextClusterId = 1;

    try {
      // Get all patterns with embeddings
      const { data: patterns, error } = await this.supabase
        .from('usage_patterns')
        .select('*')
        .eq('customer_id', customerId)
        .not('embedding', 'is', null)
        .order('created_at', { ascending: false });

      if (error || !patterns) {
        console.error('Error fetching patterns:', error);
        return clusters;
      }

      // Simple clustering algorithm
      for (const pattern of patterns) {
        if (pattern.cluster_id) {
          // Already clustered
          if (!clusters.has(pattern.cluster_id)) {
            clusters.set(pattern.cluster_id, []);
          }
          clusters.get(pattern.cluster_id)!.push(pattern);
          continue;
        }

        // Find similar patterns
        const similar = await this.findSimilarPatterns(customerId, pattern.embedding, 0.85, 20);

        if (similar.length >= minClusterSize) {
          // Create new cluster
          const clusterId = nextClusterId++;
          clusters.set(clusterId, similar);

          // Update patterns with cluster ID
          const patternIds = similar.map((p) => p.id);
          await this.supabase
            .from('usage_patterns')
            .update({ cluster_id: clusterId })
            .in('id', patternIds);
        }
      }

      return clusters;
    } catch (error) {
      console.error('Error clustering patterns:', error);
      return clusters;
    }
  }

  /**
   * Calculate confidence score for pattern
   */
  private calculateConfidenceScore(metadata: PatternMetadata): number {
    let score = 0.5; // Base score

    // Simple patterns have higher confidence
    if (metadata.tokenCount < 500) score += 0.2;
    if (metadata.questionType === 'simple_qa') score += 0.2;
    if (!metadata.hasCode) score += 0.1;

    // Fast responses indicate simple tasks
    if (metadata.responseTime && metadata.responseTime < 1000) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default EmbeddingGenerator;

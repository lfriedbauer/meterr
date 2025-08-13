import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export interface LLMConfig {
  openai?: string;
  anthropic?: string;
  google?: string;
  perplexity?: string;
  xai?: string; // Grok
}

export interface ResearchQuery {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ResearchResponse {
  service: string;
  model: string;
  response: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
  };
  timestamp: Date;
}

export class UnifiedLLMClient {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private gemini?: GoogleGenerativeAI;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    
    if (config.openai) {
      this.openai = new OpenAI({ apiKey: config.openai });
    }
    
    if (config.anthropic) {
      this.anthropic = new Anthropic({ apiKey: config.anthropic });
    }
    
    if (config.google) {
      this.gemini = new GoogleGenerativeAI(config.google);
    }
  }

  async queryOpenAI(query: ResearchQuery): Promise<ResearchResponse> {
    if (!this.openai) throw new Error('OpenAI API key not configured');
    
    const completion = await this.openai.chat.completions.create({
      model: query.model || 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: query.prompt }],
      temperature: query.temperature || 0.7,
      max_tokens: query.maxTokens || 2000,
    });

    const usage = completion.usage;
    const cost = this.calculateOpenAICost(
      usage?.prompt_tokens || 0,
      usage?.completion_tokens || 0,
      query.model || 'gpt-4-turbo-preview'
    );

    return {
      service: 'OpenAI',
      model: query.model || 'gpt-4-turbo-preview',
      response: completion.choices[0].message.content || '',
      usage: usage ? {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalCost: cost
      } : undefined,
      timestamp: new Date()
    };
  }

  async queryClaude(query: ResearchQuery): Promise<ResearchResponse> {
    if (!this.anthropic) throw new Error('Anthropic API key not configured');
    
    const message = await this.anthropic.messages.create({
      model: query.model || 'claude-opus-4-1-20250805',
      messages: [{ role: 'user', content: query.prompt }],
      max_tokens: query.maxTokens || 2000,
      temperature: query.temperature || 0.7,
    });

    const inputTokens = message.usage?.input_tokens || 0;
    const outputTokens = message.usage?.output_tokens || 0;
    const cost = this.calculateClaudeCost(
      inputTokens,
      outputTokens,
      query.model || 'claude-3-opus-20240229'
    );

    return {
      service: 'Anthropic',
      model: query.model || 'claude-3-opus-20240229',
      response: message.content[0].type === 'text' ? message.content[0].text : '',
      usage: {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalCost: cost
      },
      timestamp: new Date()
    };
  }

  async queryGemini(query: ResearchQuery): Promise<ResearchResponse> {
    if (!this.gemini) throw new Error('Google API key not configured');
    
    const model = this.gemini.getGenerativeModel({ 
      model: query.model || 'gemini-1.5-pro' 
    });
    
    const result = await model.generateContent(query.prompt);
    const response = await result.response;
    const text = response.text();

    return {
      service: 'Google',
      model: query.model || 'gemini-1.5-pro',
      response: text,
      timestamp: new Date()
    };
  }

  async queryPerplexity(query: ResearchQuery): Promise<ResearchResponse> {
    if (!this.config.perplexity) throw new Error('Perplexity API key not configured');
    
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: query.model || 'sonar',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: query.prompt }
        ],
        temperature: query.temperature || 0.7,
        max_tokens: query.maxTokens || 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.perplexity}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      service: 'Perplexity',
      model: response.data.model || query.model || 'sonar',
      response: response.data.choices[0].message.content,
      usage: response.data.usage ? {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalCost: this.calculatePerplexityCost(
          response.data.usage.prompt_tokens,
          response.data.usage.completion_tokens
        )
      } : undefined,
      timestamp: new Date()
    };
  }

  async queryGrok(query: ResearchQuery): Promise<ResearchResponse> {
    if (!this.config.xai) throw new Error('X.AI API key not configured');
    
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: query.model || 'grok-4-latest',
        messages: [
          { role: 'system', content: 'You are a helpful research assistant.' },
          { role: 'user', content: query.prompt }
        ],
        temperature: query.temperature || 0.7,
        max_tokens: query.maxTokens || 2000,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.xai}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const usage = response.data.usage;
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;
    // Grok pricing estimate (adjust when official pricing is available)
    const cost = (inputTokens / 1000) * 0.01 + (outputTokens / 1000) * 0.03;

    return {
      service: 'Grok',
      model: response.data.model || 'grok-4-latest',
      response: response.data.choices[0].message.content,
      usage: {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalCost: cost
      },
      timestamp: new Date()
    };
  }

  async queryAll(query: ResearchQuery): Promise<ResearchResponse[]> {
    const results: ResearchResponse[] = [];
    const errors: string[] = [];

    // Query all configured services in parallel
    const promises = [];
    
    if (this.config.openai) {
      promises.push(
        this.queryOpenAI(query)
          .catch(err => {
            errors.push(`OpenAI: ${err.message}`);
            return undefined as any;
          })
      );
    }
    
    if (this.config.anthropic) {
      promises.push(
        this.queryClaude(query)
          .catch(err => {
            errors.push(`Claude: ${err.message}`);
            return undefined as any;
          })
      );
    }
    
    if (this.config.google) {
      promises.push(
        this.queryGemini(query)
          .catch(err => {
            errors.push(`Gemini: ${err.message}`);
            return undefined as any;
          })
      );
    }
    
    if (this.config.perplexity) {
      promises.push(
        this.queryPerplexity(query)
          .catch(err => {
            errors.push(`Perplexity: ${err.message}`);
            return undefined as any;
          })
      );
    }
    
    if (this.config.xai) {
      promises.push(
        this.queryGrok(query)
          .catch(err => {
            errors.push(`Grok: ${err.message}`);
            return undefined as any;
          })
      );
    }

    const responses = await Promise.allSettled(promises);
    
    responses.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    });

    if (errors.length > 0) {
      console.error('Errors during batch query:', errors);
    }

    return results;
  }

  private calculateOpenAICost(inputTokens: number, outputTokens: number, model: string): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    };
    
    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview'];
    return (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output;
  }

  private calculateClaudeCost(inputTokens: number, outputTokens: number, model: string): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-opus-4-1-20250805': { input: 0.015, output: 0.075 },
      'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
      'claude-3-5-haiku-20241022': { input: 0.0008, output: 0.004 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    };
    
    const modelPricing = pricing[model] || pricing['claude-opus-4-1-20250805'];
    return (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output;
  }

  private calculatePerplexityCost(inputTokens: number, outputTokens: number): number {
    // Perplexity pricing (estimated)
    return (inputTokens / 1000) * 0.001 + (outputTokens / 1000) * 0.001;
  }
}

// Export research executor
export class ResearchExecutor {
  private client: UnifiedLLMClient;
  private results: Map<string, ResearchResponse[]> = new Map();

  constructor(config: LLMConfig) {
    this.client = new UnifiedLLMClient(config);
  }

  async executeResearchPlan(prompts: ResearchQuery[]): Promise<Map<string, ResearchResponse[]>> {
    for (const prompt of prompts) {
      console.log(`Executing research query: ${prompt.prompt.substring(0, 100)}...`);
      
      try {
        const responses = await this.client.queryAll(prompt);
        this.results.set(prompt.prompt, responses);
        
        // Rate limiting - wait 2 seconds between queries
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to execute query: ${error}`);
      }
    }
    
    return this.results;
  }

  async saveResults(filepath: string): Promise<void> {
    const fs = await import('fs/promises');
    const output = {
      timestamp: new Date().toISOString(),
      queries: Array.from(this.results.entries()).map(([prompt, responses]) => ({
        prompt,
        responses: responses.map(r => ({
          service: r.service,
          model: r.model,
          response: r.response,
          usage: r.usage,
          timestamp: r.timestamp
        }))
      }))
    };
    
    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
  }

  getTotalCost(): number {
    let total = 0;
    this.results.forEach(responses => {
      responses.forEach(response => {
        if (response.usage?.totalCost) {
          total += response.usage.totalCost;
        }
      });
    });
    return total;
  }
}
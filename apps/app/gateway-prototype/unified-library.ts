// Unified interface for all LLM providers
class MeterrUnified {
  private providers: Map<string, any> = new Map();
  private meterrKey: string;
  
  constructor(config: {
    meterrKey: string;
    providers: {
      openai?: string;
      anthropic?: string;
      google?: string;
      cohere?: string;
    }
  }) {
    this.meterrKey = config.meterrKey;
    
    // Initialize providers
    if (config.providers.openai) {
      this.providers.set('openai', { key: config.providers.openai });
    }
    if (config.providers.anthropic) {
      this.providers.set('anthropic', { key: config.providers.anthropic });
    }
    // ... etc
  }
  
  // Unified interface - works with ANY provider
  async chat(params: {
    provider?: string;
    model: string;
    messages: any[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    tags?: Record<string, string>;
  }) {
    // Auto-detect provider from model if not specified
    const provider = params.provider || this.detectProvider(params.model);
    
    // Route to appropriate provider
    let response;
    switch (provider) {
      case 'openai':
        response = await this.callOpenAI(params);
        break;
      case 'anthropic':
        response = await this.callAnthropic(params);
        break;
      case 'google':
        response = await this.callGoogle(params);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    // Track usage
    await this.trackUsage(provider, params.model, response, params.tags);
    
    // Return unified response format
    return this.normalizeResponse(response, provider);
  }
  
  private detectProvider(model: string): string {
    if (model.startsWith('gpt')) return 'openai';
    if (model.startsWith('claude')) return 'anthropic';
    if (model.startsWith('gemini')) return 'google';
    if (model.startsWith('command')) return 'cohere';
    throw new Error(`Cannot detect provider for model: ${model}`);
  }
  
  private async callOpenAI(params: any) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.providers.get('openai').key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        stream: params.stream
      })
    });
    
    return response.json();
  }
  
  private async callAnthropic(params: any) {
    // Convert messages to Anthropic format
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.providers.get('anthropic').key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        max_tokens: params.max_tokens || 1024
      })
    });
    
    return response.json();
  }
  
  private async callGoogle(params: any) {
    // Google Gemini implementation
    // ... similar pattern
  }
  
  private normalizeResponse(response: any, provider: string) {
    // Normalize to common format
    switch (provider) {
      case 'openai':
        return {
          content: response.choices[0].message.content,
          usage: response.usage,
          model: response.model,
          provider
        };
      case 'anthropic':
        return {
          content: response.content[0].text,
          usage: {
            prompt_tokens: response.usage.input_tokens,
            completion_tokens: response.usage.output_tokens,
            total_tokens: response.usage.input_tokens + response.usage.output_tokens
          },
          model: response.model,
          provider
        };
      // ... etc
    }
  }
  
  private async trackUsage(provider: string, model: string, response: any, tags?: any) {
    // Send telemetry
    await fetch('https://api.meterr.ai/v1/track', {
      method: 'POST',
      headers: {
        'X-Meterr-Key': this.meterrKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider,
        model,
        usage: response.usage,
        cost: this.calculateCost(provider, model, response.usage),
        tags,
        timestamp: Date.now()
      })
    });
  }
}

// Usage - one interface for all providers
const meterr = new MeterrUnified({
  meterrKey: 'meterr-xxx',
  providers: {
    openai: process.env.OPENAI_KEY,
    anthropic: process.env.ANTHROPIC_KEY,
    google: process.env.GOOGLE_KEY
  }
});

// Same code works with ANY provider
const response = await meterr.chat({
  model: 'gpt-4',  // or 'claude-3' or 'gemini-pro'
  messages: [{ role: 'user', content: 'Hello' }],
  tags: { team: 'engineering' }
});
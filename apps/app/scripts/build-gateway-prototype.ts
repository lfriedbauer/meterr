#!/usr/bin/env node
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';
import dotenv from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

interface GatewayComponent {
  name: string;
  description: string;
  implementation: string;
  pros: string[];
  cons: string[];
  complexity: 'simple' | 'medium' | 'complex';
}

class GatewayPrototypeBuilder {
  private client: UnifiedLLMClient;
  private components: GatewayComponent[] = [];
  private outputDir: string;
  
  constructor() {
    this.client = new UnifiedLLMClient({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
      grok: process.env.XAI_API_KEY,
    });
    
    this.outputDir = path.join(process.cwd(), 'gateway-prototype');
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async buildPrototypes() {
    console.log('🔨 R&D TEAM: Building Multiple Integration Approaches\n');
    console.log('=' .repeat(60) + '\n');
    console.log('Based on market research, building 4 different approaches...\n');
    
    // Build all 4 approaches based on research
    await this.buildGatewayProxy();
    await this.buildDirectAPI();
    await this.buildWebhookIngestion();
    await this.buildUnifiedLibrary();
    
    // Create comparison matrix
    await this.createComparisonMatrix();
    
    return this.components;
  }

  async buildGatewayProxy() {
    console.log('🔀 Building Gateway/Proxy Approach (Like Helicone)...\n');
    
    const prompt = `Design a gateway proxy for Meterr that works like Helicone:

    Requirements:
    1. Customer changes base URL from api.openai.com to proxy.meterr.ai
    2. Zero code changes needed (just URL swap)
    3. Works with ANY HTTP client or SDK
    4. Adds near-zero latency (<10ms)
    5. Handles streaming responses
    6. Automatic retry and fallback
    
    Create the implementation with:
    - Edge function architecture (Cloudflare Workers)
    - Request interception and forwarding
    - Cost calculation before response
    - Async logging to not block response
    
    Show actual working code, not pseudocode.`;
    
    const response = await this.client.queryClaude({
      prompt,
      model: 'claude-opus-4-1-20250805'
    });
    
    const implementation = `// Cloudflare Worker - Edge Proxy
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Extract provider from path: proxy.meterr.ai/openai/v1/...
    const pathParts = url.pathname.split('/');
    const provider = pathParts[1]; // 'openai', 'anthropic', etc.
    
    // Map to actual provider URL
    const providerUrls = {
      'openai': 'https://api.openai.com',
      'anthropic': 'https://api.anthropic.com',
      'google': 'https://generativelanguage.googleapis.com'
    };
    
    // Forward request to provider
    const targetUrl = providerUrls[provider] + url.pathname.replace(/^\\/[^/]+/, '');
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    // Track request start time
    const startTime = Date.now();
    
    // Forward to actual provider
    const response = await fetch(modifiedRequest);
    const responseTime = Date.now() - startTime;
    
    // Clone response for processing
    const responseClone = response.clone();
    
    // Async: Log without blocking response
    request.ctx.waitUntil(
      logUsage(request, responseClone, responseTime, env)
    );
    
    // Return response immediately (no added latency)
    return response;
  }
};

async function logUsage(req: Request, res: Response, time: number, env: Env) {
  const body = await res.json();
  
  // Calculate cost based on usage
  const usage = body.usage || {};
  const model = body.model || 'unknown';
  const cost = calculateCost(model, usage);
  
  // Extract customer ID from headers
  const customerId = req.headers.get('X-Meterr-Key');
  
  // Send to analytics (async)
  await env.ANALYTICS.writeDataPoint({
    timestamp: Date.now(),
    customerId,
    provider: 'openai',
    model,
    tokens: usage.total_tokens,
    cost,
    responseTime: time
  });
}`;
    
    this.components.push({
      name: 'Gateway Proxy',
      description: 'URL-based proxy like Helicone - just change endpoint',
      implementation,
      pros: [
        'Zero code changes required',
        'Works with any SDK or HTTP client',
        'No version compatibility issues',
        'Sub-10ms latency on edge',
        'Provider-agnostic'
      ],
      cons: [
        'Requires proxy infrastructure',
        'Customer must trust proxy with API keys',
        'Potential point of failure'
      ],
      complexity: 'medium'
    });
    
    writeFileSync(
      path.join(this.outputDir, 'gateway-proxy.ts'),
      implementation
    );
    
    console.log('✅ Gateway proxy approach built\n');
  }

  async buildDirectAPI() {
    console.log('📡 Building Direct API Approach (Like Cursor)...\n');
    
    const implementation = `// Direct API calls - no SDK dependencies
import axios from 'axios';

class MeterrDirectAPI {
  private apiKey: string;
  private meterrKey: string;
  
  constructor(apiKey: string, meterrKey: string) {
    this.apiKey = apiKey;
    this.meterrKey = meterrKey;
  }
  
  async chatCompletion(params: any) {
    const startTime = Date.now();
    
    // Direct API call - no SDK needed
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      params,
      {
        headers: {
          'Authorization': \`Bearer \${this.apiKey}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Calculate cost
    const cost = this.calculateCost(response.data);
    
    // Send telemetry (async, non-blocking)
    this.sendTelemetry({
      model: params.model,
      usage: response.data.usage,
      cost,
      latency: Date.now() - startTime
    }).catch(console.error); // Don't block on telemetry
    
    return response.data;
  }
  
  private calculateCost(response: any): number {
    const pricing = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
    };
    
    const model = response.model;
    const usage = response.usage;
    
    if (!pricing[model] || !usage) return 0;
    
    const inputCost = (usage.prompt_tokens / 1000) * pricing[model].input;
    const outputCost = (usage.completion_tokens / 1000) * pricing[model].output;
    
    return inputCost + outputCost;
  }
  
  private async sendTelemetry(data: any) {
    // Fire and forget
    await fetch('https://api.meterr.ai/v1/telemetry', {
      method: 'POST',
      headers: {
        'X-Meterr-Key': this.meterrKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }
}

// Usage - customer uses our API instead of OpenAI SDK
const meterr = new MeterrDirectAPI(openaiKey, meterrKey);
const response = await meterr.chatCompletion({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello' }]
});`;
    
    this.components.push({
      name: 'Direct API',
      description: 'HTTP client approach - no SDK dependencies',
      implementation,
      pros: [
        'No SDK version compatibility issues',
        'Full control over implementation',
        'Lightweight and fast',
        'Can support all providers easily'
      ],
      cons: [
        'Customer must use our client',
        'More integration work',
        'Not drop-in compatible'
      ],
      complexity: 'simple'
    });
    
    writeFileSync(
      path.join(this.outputDir, 'direct-api.ts'),
      implementation
    );
    
    console.log('✅ Direct API approach built\n');
  }

  async buildWebhookIngestion() {
    console.log('🪝 Building Webhook/Events Approach (Like Segment)...\n');
    
    const implementation = `// Event-based tracking - customer sends us events
class MeterrEvents {
  private meterrKey: string;
  private queue: any[] = [];
  private batchSize = 100;
  private flushInterval = 5000; // 5 seconds
  
  constructor(meterrKey: string) {
    this.meterrKey = meterrKey;
    
    // Auto-flush every 5 seconds
    setInterval(() => this.flush(), this.flushInterval);
  }
  
  // Customer calls this after each LLM request
  track(event: {
    provider: string;
    model: string;
    tokens?: number;
    cost?: number;
    duration?: number;
    tags?: Record<string, string>;
  }) {
    this.queue.push({
      ...event,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    });
    
    // Flush if batch is full
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }
  
  // Simple helper for OpenAI responses
  trackOpenAI(response: any, tags?: Record<string, string>) {
    this.track({
      provider: 'openai',
      model: response.model,
      tokens: response.usage?.total_tokens,
      cost: this.calculateOpenAICost(response),
      tags
    });
  }
  
  private async flush() {
    if (this.queue.length === 0) return;
    
    const events = [...this.queue];
    this.queue = [];
    
    try {
      await fetch('https://api.meterr.ai/v1/events', {
        method: 'POST',
        headers: {
          'X-Meterr-Key': this.meterrKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      // Re-queue on failure
      this.queue.unshift(...events);
    }
  }
  
  private calculateOpenAICost(response: any): number {
    // Cost calculation logic
    const pricing = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
    };
    
    const model = response.model;
    const usage = response.usage;
    
    if (!pricing[model] || !usage) return 0;
    
    return (usage.prompt_tokens / 1000) * pricing[model].input +
           (usage.completion_tokens / 1000) * pricing[model].output;
  }
  
  private getSessionId(): string {
    // Simple session tracking
    return globalThis.__meterrSessionId || 
           (globalThis.__meterrSessionId = Math.random().toString(36));
  }
}

// Usage - customer adds one line after their API calls
const meterr = new MeterrEvents('meterr-key-xxx');

// They keep using their preferred SDK
const response = await openai.chat.completions.create(...);

// Just add tracking
meterr.trackOpenAI(response, { team: 'engineering' });`;
    
    this.components.push({
      name: 'Webhook/Events',
      description: 'Event tracking like Segment - send us your usage',
      implementation,
      pros: [
        'Works with any SDK or library',
        'No proxy or middleware needed',
        'Customer keeps their existing code',
        'Batched for efficiency',
        'Can work offline'
      ],
      cons: [
        'Customer must add tracking calls',
        'Could miss events if not instrumented',
        'Requires discipline to track everything'
      ],
      complexity: 'simple'
    });
    
    writeFileSync(
      path.join(this.outputDir, 'webhook-events.ts'),
      implementation
    );
    
    console.log('✅ Webhook/events approach built\n');
  }

  async buildUnifiedLibrary() {
    console.log('📚 Building Unified Library Approach (Like LiteLLM)...\n');
    
    const implementation = `// Unified interface for all LLM providers
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
        throw new Error(\`Unsupported provider: \${provider}\`);
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
    throw new Error(\`Cannot detect provider for model: \${model}\`);
  }
  
  private async callOpenAI(params: any) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.providers.get('openai').key}\`,
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
});`;
    
    this.components.push({
      name: 'Unified Library',
      description: 'Single interface for all providers like LiteLLM',
      implementation,
      pros: [
        'One API for all providers',
        'No SDK dependencies',
        'Automatic provider detection',
        'Normalized responses',
        'Built-in tracking'
      ],
      cons: [
        'Customer must migrate to our library',
        'We maintain provider integrations',
        'Not drop-in compatible'
      ],
      complexity: 'complex'
    });
    
    writeFileSync(
      path.join(this.outputDir, 'unified-library.ts'),
      implementation
    );
    
    console.log('✅ Unified library approach built\n');
  }

  async createComparisonMatrix() {
    console.log('📊 Creating Comparison Matrix...\n');
    
    const matrix = `# Meterr Integration Approaches - Comparison Matrix

| Approach | Integration Effort | Maintenance Burden | Customer Trust | Latency | Works With |
|----------|-------------------|-------------------|----------------|---------|------------|
| **Gateway Proxy** | ⭐⭐⭐⭐⭐ (URL change) | Low (our infra) | Medium (proxy keys) | <10ms | Everything |
| **Direct API** | ⭐⭐⭐ (new client) | Low (no SDKs) | High (direct) | 0ms | Our client only |
| **Webhook/Events** | ⭐⭐⭐⭐ (add tracking) | Low (customer side) | High (they control) | 0ms | Everything |
| **Unified Library** | ⭐⭐ (migrate code) | High (all providers) | High (direct) | 0ms | Our library only |

## Recommendations by Customer Type:

### Enterprise (>$50K/month AI spend)
**Recommended:** Gateway Proxy + Webhook backup
- They want zero code changes
- Have dedicated DevOps teams
- Care about vendor lock-in

### Scale-up ($5K-50K/month)
**Recommended:** Webhook/Events
- Flexible integration
- Keep existing code
- Add tracking gradually

### Startup (<$5K/month)
**Recommended:** Unified Library
- Simplest to understand
- One tool for everything
- Don't have legacy code

### Individual Developers
**Recommended:** Direct API or Unified Library
- Want simple, clean API
- Don't mind switching libraries
- Value simplicity over compatibility`;
    
    writeFileSync(
      path.join(this.outputDir, 'comparison-matrix.md'),
      matrix
    );
    
    console.log('✅ Comparison matrix created\n');
  }
}

async function sendToResearchTeam(components: GatewayComponent[]) {
  console.log('\n' + '=' .repeat(60));
  console.log('📤 SENDING ALL APPROACHES TO RESEARCH TEAM\n');
  
  const client = new UnifiedLLMClient({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    grok: process.env.XAI_API_KEY,
  });
  
  const approaches = components.map(c => 
    `${c.name}: ${c.description}\nPros: ${c.pros.join(', ')}\nCons: ${c.cons.join(', ')}`
  ).join('\n\n');
  
  console.log('🔬 Getting Multi-Perspective Validation...\n');
  
  // CTO Perspective
  const ctoPrompt = `As a CTO, which integration approach would you choose for Meterr?

${approaches}

Consider:
1. Engineering effort to integrate
2. Maintenance burden
3. Vendor lock-in concerns
4. Trust and security
5. Our $142/month pricing

Which would you pick and why? Be specific.`;
  
  const ctoResponse = await client.queryClaude({
    prompt: ctoPrompt,
    model: 'claude-opus-4-1-20250805'
  });
  
  console.log('💼 CTO Perspective:');
  console.log(ctoResponse.response.substring(0, 800) + '...\n');
  
  // Developer Perspective
  const devPrompt = `As a senior developer, rank these Meterr integration approaches:

${approaches}

What would you actually use? What would annoy you? Be honest.`;
  
  const devResponse = await client.queryGemini({ prompt: devPrompt });
  
  console.log('👨‍💻 Developer Perspective:');
  console.log(devResponse.response.substring(0, 800) + '...\n');
  
  // Market Research
  const marketPrompt = `Research which approach successful monitoring companies use:

${approaches}

Look at Datadog, New Relic, Helicone, Segment. What actually works in the market?`;
  
  const marketResponse = await client.queryPerplexity({ prompt: marketPrompt });
  
  console.log('📊 Market Research:');
  console.log(marketResponse.response.substring(0, 800) + '...\n');
  
  // Final verdict
  const verdictPrompt = `Based on all perspectives, which approach should Meterr prioritize?

CTO wants: ${ctoResponse.response.substring(0, 200)}
Developer wants: ${devResponse.response.substring(0, 200)}
Market shows: ${marketResponse.response.substring(0, 200)}

Give a clear recommendation with reasoning.`;
  
  const verdict = await client.queryClaude({
    prompt: verdictPrompt,
    model: 'claude-opus-4-1-20250805'
  });
  
  console.log('🎯 FINAL VERDICT:');
  console.log(verdict.response);
  
  // Save results
  const validation = {
    timestamp: new Date().toISOString(),
    approaches: components,
    feedback: {
      cto: ctoResponse.response,
      developer: devResponse.response,
      market: marketResponse.response
    },
    verdict: verdict.response
  };
  
  writeFileSync(
    path.join(process.cwd(), 'research-results', 'integration-validation.json'),
    JSON.stringify(validation, null, 2)
  );
  
  return validation;
}

async function main() {
  console.log('🚀 INTEGRATION APPROACHES PROTOTYPE CYCLE\n');
  console.log('Building 4 different approaches based on market research...\n');
  
  const builder = new GatewayPrototypeBuilder();
  
  // R&D builds all approaches
  const components = await builder.buildPrototypes();
  
  // Research team validates
  const validation = await sendToResearchTeam(components);
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ VALIDATION COMPLETE\n');
  console.log('Research team has evaluated all approaches.');
  console.log('Check research-results/integration-validation.json for details.\n');
}

if (require.main === module) {
  main().catch(console.error);
}

export { GatewayPrototypeBuilder };
// Direct API calls - no SDK dependencies
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
          'Authorization': `Bearer ${this.apiKey}`,
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
    
    const model = response.model as keyof typeof pricing;
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

// Usage example - customer uses our API instead of OpenAI SDK
// const meterr = new MeterrDirectAPI(openaiKey, meterrKey);
// const response = await meterr.chatCompletion({
//   model: 'gpt-4',
//   messages: [{ role: 'user', content: 'Hello' }]
// });
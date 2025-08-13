// Event-based tracking - customer sends us events
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
meterr.trackOpenAI(response, { team: 'engineering' });
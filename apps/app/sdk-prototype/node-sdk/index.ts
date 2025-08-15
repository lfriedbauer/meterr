// index.ts

import type { NextFunction, Request, Response } from 'express';
import fetch, { RequestInfo, RequestInit } from 'node-fetch';
import { Configuration, OpenAIApi } from 'openai';
import os from 'os';

if (typeof window === 'undefined') {
  globalThis.fetch = fetch as any; // Provide fetch for Node.js
}

interface MeterrEvent {
  timestamp: string;
  event: string;
  properties: {
    [key: string]: any;
  };
}

interface TrackCostsOptions {
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  // Add other relevant properties as needed
}

class MeterrClient {
  private apiKey: string;
  private openai: OpenAIApi;
  private events: MeterrEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(apiKey: string, openaiApiKey?: string, apiUrl?: string) {
    this.apiKey = apiKey;
    if (openaiApiKey) {
      this.openai = new OpenAIApi(
        new Configuration({
          apiKey: openaiApiKey,
          basePath: apiUrl,
        })
      );
    } else {
      this.openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    }

    this.startFlushInterval();
  }

  private startFlushInterval() {
    if (!this.flushInterval) {
      this.flushInterval = setInterval(() => this.flush(), 60000); // Flush every minute
    }
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) {
      return;
    }

    const eventsToFlush = this.events.splice(0, this.events.length);

    try {
      const response = await fetch('https://api.meterr.ai/sdk/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ events: eventsToFlush }),
      });

      if (!response.ok) {
        console.error('Failed to send telemetry:', await response.text());
        // Optionally retry failed requests
      }
    } catch (error) {
      console.error('Failed to send telemetry:', error);
      this.events.push(...eventsToFlush); // Add back failed events
    }
  }

  public track(event: string, properties?: { [key: string]: any }): void {
    this.events.push({
      timestamp: new Date().toISOString(),
      event,
      properties: properties || {},
    });
  }

  public async trackCosts(options: TrackCostsOptions): Promise<void> {
    const price = await this.calculateCost(options);

    this.track('openai_cost', { ...options, cost: price, hostname: os.hostname() });
  }

  public expressMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    res.on('finish', () => {
      this.track('request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: Date.now() - start,
      });
    });
    next();
  };

  private async calculateCost(options: TrackCostsOptions): Promise<number> {
    // Implement cost calculation logic here based on OpenAI's pricing
    // This is a simplified example and should be updated for your specific use case
    // Use OpenAI's pricing API if available, otherwise use best estimates.
    // Example cost calculation (replace with actual values):
    const { model = 'gpt-3.5-turbo', promptTokens = 0, completionTokens = 0 } = options;

    let prompt_price_per_1k_tokens, completion_price_per_1k_tokens;

    if (model === 'gpt-3.5-turbo') {
      prompt_price_per_1k_tokens = 0.0015;
      completion_price_per_1k_tokens = 0.002;
    } else if (model === 'gpt-4') {
      prompt_price_per_1k_tokens = 0.03;
      completion_price_per_1k_tokens = 0.06;
    } else {
      prompt_price_per_1k_tokens = 0;
      completion_price_per_1k_tokens = 0;
    }

    const promptCost = (promptTokens / 1000) * prompt_price_per_1k_tokens;
    const completionCost = (completionTokens / 1000) * completion_price_per_1k_tokens;
    return promptCost + completionCost;
  }
}

export default MeterrClient;

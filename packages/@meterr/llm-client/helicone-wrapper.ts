import Anthropic from '@anthropic-ai/sdk';
import { Helicone } from 'helicone';
import OpenAI from 'openai';

// Initialize Helicone (will use HELICONE_API_KEY from env)
const helicone = new Helicone({
  apiKey: process.env.HELICONE_API_KEY || 'sk-helicone-default',
});

// Wrap OpenAI client
export function wrapOpenAI(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: 'https://oai.helicone.ai/v1',
    defaultHeaders: {
      'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
      'Helicone-Cache-Enabled': 'true',
      'Helicone-Property-App': 'meterr',
    },
  });
}

// Wrap Anthropic client
export function wrapAnthropic(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    baseURL: 'https://anthropic.helicone.ai',
    defaultHeaders: {
      'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
      'Helicone-Cache-Enabled': 'true',
      'Helicone-Property-App': 'meterr',
    },
  });
}

// Track custom event
export async function trackResearch(
  model: string,
  promptTokens: number,
  completionTokens: number,
  cost: number,
  metadata?: Record<string, any>
) {
  try {
    await helicone.log({
      event: 'research_query',
      properties: {
        model,
        promptTokens,
        completionTokens,
        cost,
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track research in Helicone:', error);
  }
}

// Get usage analytics
export async function getUsageAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalCost: number;
  totalTokens: number;
  byModel: Record<string, { cost: number; tokens: number }>;
}> {
  try {
    const analytics = await helicone.analytics.get({
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate || new Date(),
      groupBy: ['model'],
    });

    return {
      totalCost: analytics.totalCost,
      totalTokens: analytics.totalTokens,
      byModel: analytics.byModel,
    };
  } catch (error) {
    console.error('Failed to get analytics from Helicone:', error);
    return {
      totalCost: 0,
      totalTokens: 0,
      byModel: {},
    };
  }
}

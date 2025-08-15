import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor, ConsoleSpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as openai from '@traceloop/instrumentation-openai';
import * as anthropic from '@traceloop/instrumentation-anthropic';
// import { db } from '@/lib/db'; // TODO: Enable when DB is configured
import { BigNumber } from 'bignumber.js';

class CostProcessor extends SimpleSpanProcessor {
  async onEnd(span: ReadableSpan): Promise<void> {
    const attributes = span.attributes;
    
    if (attributes['llm.model'] && attributes['llm.usage.total_tokens']) {
      const model = String(attributes['llm.model']);
      const totalTokens = Number(attributes['llm.usage.total_tokens']);
      const promptTokens = Number(attributes['llm.usage.prompt_tokens'] || 0);
      const completionTokens = Number(attributes['llm.usage.completion_tokens'] || 0);
      
      const cost = this.calculateCost(model, promptTokens, completionTokens);
      
      // TODO: Enable database saving when configured
      // try {
      //   await db.llm_usage.create({
      //     data: {
      //       model,
      //       provider: attributes['llm.provider'] as string || 'unknown',
      //       prompt_tokens: promptTokens,
      //       completion_tokens: completionTokens,
      //       total_tokens: totalTokens,
      //       cost: cost.toFixed(6),
      //       user_id: attributes['user.id'] as string || 'system',
      //       request_id: span.spanContext().traceId,
      //       timestamp: new Date(span.endTime[0] * 1000 + span.endTime[1] / 1000000),
      //       metadata: {
      //         temperature: attributes['llm.temperature'],
      //         max_tokens: attributes['llm.max_tokens'],
      //         function_name: attributes['llm.function_name']
      //       }
      //     }
      //   });
      // } catch (error) {
      //   console.error('[LLM Monitoring] Failed to save usage:', error);
      // }
      
      console.info(`[LLM Cost] ${model}: ${totalTokens} tokens = $${cost.toFixed(6)}`);
      console.info(`[LLM Details] Prompt: ${promptTokens} tokens, Completion: ${completionTokens} tokens`);
    }
    
    await super.onEnd(span);
  }
  
  private calculateCost(model: string, promptTokens: number, completionTokens: number): BigNumber {
    const rates: Record<string, { prompt: number; completion: number }> = {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
      'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
      'claude-3-opus': { prompt: 0.015, completion: 0.075 },
      'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
      'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 }
    };
    
    const rate = rates[model] || { prompt: 0.001, completion: 0.002 };
    
    const promptCost = new BigNumber(promptTokens)
      .dividedBy(1000)
      .multipliedBy(rate.prompt);
    
    const completionCost = new BigNumber(completionTokens)
      .dividedBy(1000)
      .multipliedBy(rate.completion);
    
    return promptCost.plus(completionCost);
  }
}

let sdk: NodeSDK | null = null;

export function setupLLMMonitoring() {
  if (sdk) {
    console.warn('[LLM Monitoring] Already initialized');
    return;
  }
  
  const traceExporter = process.env.NODE_ENV === 'production'
    ? new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      })
    : new ConsoleSpanExporter();
  
  sdk = new NodeSDK({
    serviceName: 'meterr',
    spanProcessors: [
      new CostProcessor(traceExporter)
    ],
    instrumentations: [
      new openai.OpenAIInstrumentation(),
      new anthropic.AnthropicInstrumentation()
    ],
  });
  
  try {
    sdk.start();
    console.log('[LLM Monitoring] OpenTelemetry initialized');
  } catch (error) {
    console.error('[LLM Monitoring] Failed to initialize:', error);
  }
}

export async function shutdownLLMMonitoring() {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
    console.log('[LLM Monitoring] Shutdown complete');
  }
}
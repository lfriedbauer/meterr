import { setupLLMMonitoring } from './llm-monitoring';

export function initializeTelemetry() {
  if (process.env.ENABLE_LLM_MONITORING !== 'false') {
    setupLLMMonitoring();
  }
}
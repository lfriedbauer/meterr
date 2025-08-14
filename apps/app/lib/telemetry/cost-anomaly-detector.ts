/**
 * OpenTelemetry-based Anomaly Detection for AI Cost Patterns
 * Monitors unusual spikes and suspicious usage patterns
 */

import { trace, metrics, SpanStatusCode } from '@opentelemetry/api'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

// Initialize OpenTelemetry
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'meterr-cost-monitor',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
})

const tracerProvider = new NodeTracerProvider({ resource })
const meterProvider = new MeterProvider({ resource })

const tracer = trace.getTracer('cost-anomaly-detector')
const meter = metrics.getMeter('cost-metrics')

// Metrics
const costMetric = meter.createHistogram('ai_cost_per_request', {
  description: 'Cost of AI API requests in USD',
  unit: 'USD',
})

const tokenMetric = meter.createHistogram('token_usage', {
  description: 'Token usage per request',
  unit: 'tokens',
})

const anomalyCounter = meter.createCounter('anomalies_detected', {
  description: 'Number of cost anomalies detected',
})

// Anomaly detection configuration
export const ANOMALY_CONFIG = {
  // Baseline thresholds (will be dynamically adjusted)
  thresholds: {
    costSpike: 3.0,        // 3x normal cost
    tokenSpike: 3.0,       // 3x normal tokens
    frequencySpike: 5.0,   // 5x normal request rate
    minimumDataPoints: 100 // Minimum data for baseline
  },
  
  // Time windows for analysis
  windows: {
    immediate: 60,         // 1 minute
    short: 300,           // 5 minutes
    medium: 3600,         // 1 hour
    long: 86400          // 24 hours
  },
  
  // Alert severity levels
  severity: {
    low: { multiplier: 2, action: 'log' },
    medium: { multiplier: 3, action: 'alert' },
    high: { multiplier: 5, action: 'block' },
    critical: { multiplier: 10, action: 'immediate_block' }
  }
}

// Baseline statistics (would be stored in database)
interface BaselineStats {
  userId: string
  avgCost: number
  stdDevCost: number
  avgTokens: number
  stdDevTokens: number
  avgRequestsPerHour: number
  lastUpdated: Date
}

export class CostAnomalyDetector {
  private baselines: Map<string, BaselineStats> = new Map()
  private recentRequests: Map<string, RequestData[]> = new Map()

  async analyzeRequest(request: {
    userId: string
    endpoint: string
    model: string
    cost: number
    inputTokens: number
    outputTokens: number
    timestamp: Date
  }): Promise<AnomalyResult> {
    const span = tracer.startSpan('analyze_cost_anomaly')
    
    try {
      // Record metrics
      costMetric.record(request.cost, {
        user_id: request.userId,
        model: request.model,
        endpoint: request.endpoint
      })
      
      tokenMetric.record(request.inputTokens + request.outputTokens, {
        user_id: request.userId,
        model: request.model
      })

      // Get or initialize baseline for user
      let baseline = this.baselines.get(request.userId)
      if (!baseline) {
        baseline = await this.initializeBaseline(request.userId)
      }

      // Store recent request
      this.storeRecentRequest(request.userId, {
        cost: request.cost,
        tokens: request.inputTokens + request.outputTokens,
        timestamp: request.timestamp,
        model: request.model
      })

      // Check for anomalies
      const anomalies: Anomaly[] = []

      // Cost spike detection
      const costAnomaly = this.detectCostSpike(request.cost, baseline)
      if (costAnomaly) anomalies.push(costAnomaly)

      // Token usage anomaly
      const tokenAnomaly = this.detectTokenAnomaly(
        request.inputTokens + request.outputTokens, 
        baseline
      )
      if (tokenAnomaly) anomalies.push(tokenAnomaly)

      // Frequency anomaly
      const frequencyAnomaly = await this.detectFrequencyAnomaly(
        request.userId,
        request.timestamp
      )
      if (frequencyAnomaly) anomalies.push(frequencyAnomaly)

      // Pattern anomaly (unusual model usage)
      const patternAnomaly = this.detectPatternAnomaly(
        request.userId,
        request.model
      )
      if (patternAnomaly) anomalies.push(patternAnomaly)

      // Update baseline with exponential moving average
      this.updateBaseline(request.userId, request)

      // Record anomalies
      if (anomalies.length > 0) {
        anomalyCounter.add(anomalies.length, {
          user_id: request.userId,
          severity: this.getMaxSeverity(anomalies)
        })
        
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `${anomalies.length} anomalies detected`
        })
      } else {
        span.setStatus({ code: SpanStatusCode.OK })
      }

      return {
        isAnomalous: anomalies.length > 0,
        anomalies,
        recommendation: this.getRecommendation(anomalies),
        baseline: baseline
      }
    } finally {
      span.end()
    }
  }

  private detectCostSpike(cost: number, baseline: BaselineStats): Anomaly | null {
    const zScore = (cost - baseline.avgCost) / baseline.stdDevCost
    
    if (zScore > ANOMALY_CONFIG.thresholds.costSpike) {
      return {
        type: 'cost_spike',
        severity: this.getSeverityFromZScore(zScore),
        description: `Cost ${cost.toFixed(4)} is ${zScore.toFixed(1)}σ above normal`,
        value: cost,
        expected: baseline.avgCost,
        deviation: zScore
      }
    }
    
    return null
  }

  private detectTokenAnomaly(tokens: number, baseline: BaselineStats): Anomaly | null {
    const zScore = (tokens - baseline.avgTokens) / baseline.stdDevTokens
    
    if (zScore > ANOMALY_CONFIG.thresholds.tokenSpike) {
      return {
        type: 'token_spike',
        severity: this.getSeverityFromZScore(zScore),
        description: `Token usage ${tokens} is ${zScore.toFixed(1)}σ above normal`,
        value: tokens,
        expected: baseline.avgTokens,
        deviation: zScore
      }
    }
    
    return null
  }

  private async detectFrequencyAnomaly(
    userId: string, 
    timestamp: Date
  ): Promise<Anomaly | null> {
    const recent = this.recentRequests.get(userId) || []
    const hourAgo = new Date(timestamp.getTime() - 3600000)
    const recentCount = recent.filter(r => r.timestamp > hourAgo).length
    
    const baseline = this.baselines.get(userId)
    if (!baseline) return null
    
    if (recentCount > baseline.avgRequestsPerHour * ANOMALY_CONFIG.thresholds.frequencySpike) {
      return {
        type: 'frequency_spike',
        severity: 'high',
        description: `${recentCount} requests in past hour, expected ${baseline.avgRequestsPerHour}`,
        value: recentCount,
        expected: baseline.avgRequestsPerHour,
        deviation: recentCount / baseline.avgRequestsPerHour
      }
    }
    
    return null
  }

  private detectPatternAnomaly(userId: string, model: string): Anomaly | null {
    const recent = this.recentRequests.get(userId) || []
    const modelUsage = recent.filter(r => r.model === model).length / recent.length
    
    // Detect if user suddenly switches to expensive models
    if (model.includes('gpt-4') && modelUsage < 0.1 && recent.length > 10) {
      return {
        type: 'pattern_change',
        severity: 'medium',
        description: `Unusual usage of expensive model ${model}`,
        value: modelUsage,
        expected: 0,
        deviation: 0
      }
    }
    
    return null
  }

  private async initializeBaseline(userId: string): Promise<BaselineStats> {
    // In production, this would load from database
    // For now, return default baseline
    return {
      userId,
      avgCost: 0.01,
      stdDevCost: 0.005,
      avgTokens: 500,
      stdDevTokens: 200,
      avgRequestsPerHour: 10,
      lastUpdated: new Date()
    }
  }

  private updateBaseline(userId: string, request: any) {
    const baseline = this.baselines.get(userId)
    if (!baseline) return
    
    // Exponential moving average with α = 0.1
    const alpha = 0.1
    baseline.avgCost = baseline.avgCost * (1 - alpha) + request.cost * alpha
    baseline.avgTokens = baseline.avgTokens * (1 - alpha) + 
      (request.inputTokens + request.outputTokens) * alpha
    baseline.lastUpdated = new Date()
    
    this.baselines.set(userId, baseline)
  }

  private storeRecentRequest(userId: string, data: RequestData) {
    const requests = this.recentRequests.get(userId) || []
    requests.push(data)
    
    // Keep only last 1000 requests
    if (requests.length > 1000) {
      requests.shift()
    }
    
    this.recentRequests.set(userId, requests)
  }

  private getSeverityFromZScore(zScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (zScore > 10) return 'critical'
    if (zScore > 5) return 'high'
    if (zScore > 3) return 'medium'
    return 'low'
  }

  private getMaxSeverity(anomalies: Anomaly[]): string {
    const severityOrder = ['low', 'medium', 'high', 'critical']
    let maxSeverity = 'low'
    
    for (const anomaly of anomalies) {
      if (severityOrder.indexOf(anomaly.severity) > severityOrder.indexOf(maxSeverity)) {
        maxSeverity = anomaly.severity
      }
    }
    
    return maxSeverity
  }

  private getRecommendation(anomalies: Anomaly[]): string {
    if (anomalies.length === 0) return 'Normal usage pattern'
    
    const severity = this.getMaxSeverity(anomalies)
    const types = anomalies.map(a => a.type)
    
    if (severity === 'critical') {
      return 'IMMEDIATE ACTION: Temporarily block requests and investigate'
    }
    
    if (severity === 'high') {
      if (types.includes('cost_spike')) {
        return 'Alert user about unusual costs and consider rate limiting'
      }
      if (types.includes('frequency_spike')) {
        return 'Possible automation detected - implement CAPTCHA'
      }
    }
    
    if (severity === 'medium') {
      return 'Monitor closely and alert if pattern continues'
    }
    
    return 'Log for analysis and update baseline'
  }
}

// Types
interface RequestData {
  cost: number
  tokens: number
  timestamp: Date
  model: string
}

interface Anomaly {
  type: 'cost_spike' | 'token_spike' | 'frequency_spike' | 'pattern_change'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  value: number
  expected: number
  deviation: number
}

interface AnomalyResult {
  isAnomalous: boolean
  anomalies: Anomaly[]
  recommendation: string
  baseline: BaselineStats
}

// Export singleton instance
export const anomalyDetector = new CostAnomalyDetector()
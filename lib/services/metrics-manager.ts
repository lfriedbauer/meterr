/**
 * Metrics Manager - "Bring Your Own Metrics" Framework
 * 
 * Allows customers to define and track their own success metrics
 * to validate that AI optimizations don't hurt quality
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleAnalyticsIntegration } from '../integrations/google-analytics';
import { StripeIntegration } from '../integrations/stripe';
import { CustomEndpointIntegration } from '../integrations/custom-endpoint';

// Types
export interface MetricDefinition {
  name: string;
  source: 'google_analytics' | 'stripe' | 'mixpanel' | 'custom' | 'amplitude' | 'intercom';
  endpointUrl?: string;
  apiKey?: string;
  baselineValue?: number;
  acceptableRangeMin?: number;
  acceptableRangeMax?: number;
  description: string;
}

export interface MetricValue {
  value: number;
  timestamp: Date;
  metadata?: any;
}

export interface MetricValidation {
  metricName: string;
  currentValue: number;
  baselineValue: number;
  acceptableRange: [number, number];
  isWithinRange: boolean;
  percentageChange: number;
  status: 'passed' | 'warning' | 'failed';
}

export interface MetricIntegration {
  source: string;
  name: string;
  description: string;
  requiredCredentials: string[];
  sampleEndpoint?: string;
}

/**
 * Metrics Manager - Handles customer-defined success metrics
 */
export class MetricsManager {
  private supabase;
  
  // Available metric integrations
  private integrations: MetricIntegration[] = [
    {
      source: 'google_analytics',
      name: 'Google Analytics',
      description: 'Website traffic, conversions, engagement metrics',
      requiredCredentials: ['google_analytics_api_key', 'property_id'],
      sampleEndpoint: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet'
    },
    {
      source: 'stripe',
      name: 'Stripe Revenue',
      description: 'Revenue, conversion rates, customer metrics',
      requiredCredentials: ['stripe_restricted_key'],
      sampleEndpoint: 'https://api.stripe.com/v1/charges'
    },
    {
      source: 'mixpanel',
      name: 'Mixpanel Analytics',
      description: 'User engagement, feature adoption, conversion funnels',
      requiredCredentials: ['mixpanel_api_key', 'project_id']
    },
    {
      source: 'amplitude',
      name: 'Amplitude Analytics',
      description: 'User behavior, retention, product analytics',
      requiredCredentials: ['amplitude_api_key', 'amplitude_secret']
    },
    {
      source: 'intercom',
      name: 'Intercom Support',
      description: 'Customer satisfaction, response times, resolution rates',
      requiredCredentials: ['intercom_access_token']
    },
    {
      source: 'custom',
      name: 'Custom Endpoint',
      description: 'Your own API endpoint returning metric values',
      requiredCredentials: ['endpoint_url', 'api_key']
    }
  ];

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get available metric integrations
   */
  getAvailableIntegrations(): MetricIntegration[] {
    return this.integrations;
  }

  /**
   * Add a metric for a customer
   */
  async addMetric(
    customerId: string,
    metric: MetricDefinition
  ): Promise<{ success: boolean; error?: string; metricId?: string }> {
    try {
      // Validate the metric first
      const validation = await this.validateMetric(metric);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Store the metric definition
      const { data, error } = await this.supabase
        .from('customer_metrics')
        .insert({
          customer_id: customerId,
          metric_name: metric.name,
          metric_source: metric.source,
          endpoint_url: metric.endpointUrl,
          baseline_value: metric.baselineValue,
          acceptable_range_min: metric.acceptableRangeMin,
          acceptable_range_max: metric.acceptableRangeMax,
          is_active: true
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error storing metric:', error);
        return { success: false, error: error.message };
      }

      // Store API key separately (encrypted)
      if (metric.apiKey) {
        await this.storeMetricCredentials(customerId, metric.name, metric.apiKey);
      }

      // Log the action
      await this.logAudit(customerId, 'metric_added', {
        metricName: metric.name,
        source: metric.source
      });

      return { success: true, metricId: data.id };
    } catch (error) {
      console.error('Error adding metric:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get all metrics for a customer
   */
  async getCustomerMetrics(customerId: string): Promise<MetricDefinition[]> {
    try {
      const { data, error } = await this.supabase
        .from('customer_metrics')
        .select('*')
        .eq('customer_id', customerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching metrics:', error);
        return [];
      }

      return data.map(metric => ({
        name: metric.metric_name,
        source: metric.metric_source,
        endpointUrl: metric.endpoint_url,
        baselineValue: metric.baseline_value,
        acceptableRangeMin: metric.acceptable_range_min,
        acceptableRangeMax: metric.acceptable_range_max,
        description: this.getIntegrationDescription(metric.metric_source)
      }));
    } catch (error) {
      console.error('Error in getCustomerMetrics:', error);
      return [];
    }
  }

  /**
   * Fetch current value for a metric
   */
  async fetchMetricValue(
    customerId: string,
    metricName: string
  ): Promise<MetricValue | null> {
    try {
      // Get metric definition
      const { data: metric, error } = await this.supabase
        .from('customer_metrics')
        .select('*')
        .eq('customer_id', customerId)
        .eq('metric_name', metricName)
        .eq('is_active', true)
        .single();

      if (error || !metric) {
        console.error('Metric not found:', error);
        return null;
      }

      // Get API credentials if needed
      const credentials = await this.getMetricCredentials(customerId, metricName);

      // Fetch value based on source
      switch (metric.metric_source) {
        case 'google_analytics':
          return await this.fetchGoogleAnalyticsValue(metric, credentials);
        
        case 'stripe':
          return await this.fetchStripeValue(metric, credentials);
        
        case 'mixpanel':
          return await this.fetchMixpanelValue(metric, credentials);
        
        case 'custom':
          return await this.fetchCustomValue(metric, credentials);
        
        default:
          console.error('Unknown metric source:', metric.metric_source);
          return null;
      }
    } catch (error) {
      console.error('Error fetching metric value:', error);
      return null;
    }
  }

  /**
   * Validate all metrics for a customer (used after optimization)
   */
  async validateAllMetrics(customerId: string): Promise<MetricValidation[]> {
    const validations: MetricValidation[] = [];

    try {
      const metrics = await this.getCustomerMetrics(customerId);

      for (const metric of metrics) {
        const currentValue = await this.fetchMetricValue(customerId, metric.name);
        
        if (currentValue && metric.baselineValue) {
          const validation = this.validateMetricValue(metric, currentValue.value);
          validations.push(validation);
        }
      }

      return validations;
    } catch (error) {
      console.error('Error validating metrics:', error);
      return [];
    }
  }

  /**
   * Validate a single metric value against baseline
   */
  private validateMetricValue(
    metric: MetricDefinition,
    currentValue: number
  ): MetricValidation {
    const baselineValue = metric.baselineValue || 0;
    const minRange = metric.acceptableRangeMin || baselineValue * 0.95; // Default 5% tolerance
    const maxRange = metric.acceptableRangeMax || baselineValue * 1.05;
    
    const isWithinRange = currentValue >= minRange && currentValue <= maxRange;
    const percentageChange = ((currentValue - baselineValue) / baselineValue) * 100;
    
    let status: 'passed' | 'warning' | 'failed';
    if (isWithinRange) {
      status = 'passed';
    } else if (Math.abs(percentageChange) <= 10) {
      status = 'warning';
    } else {
      status = 'failed';
    }

    return {
      metricName: metric.name,
      currentValue,
      baselineValue,
      acceptableRange: [minRange, maxRange],
      isWithinRange,
      percentageChange,
      status
    };
  }

  /**
   * Validate metric configuration
   */
  private async validateMetric(metric: MetricDefinition): Promise<{ isValid: boolean; error?: string }> {
    // Basic validation
    if (!metric.name || !metric.source) {
      return { isValid: false, error: 'Metric name and source are required' };
    }

    // Source-specific validation
    const integration = this.integrations.find(i => i.source === metric.source);
    if (!integration) {
      return { isValid: false, error: 'Invalid metric source' };
    }

    // Custom endpoint validation
    if (metric.source === 'custom' && !metric.endpointUrl) {
      return { isValid: false, error: 'Endpoint URL required for custom metrics' };
    }

    return { isValid: true };
  }

  /**
   * Store metric API credentials (encrypted)
   */
  private async storeMetricCredentials(
    customerId: string,
    metricName: string,
    apiKey: string
  ): Promise<void> {
    // Use the same API key storage system
    // This would integrate with the existing ApiKeyManager
    // For now, simplified implementation
  }

  /**
   * Get metric API credentials
   */
  private async getMetricCredentials(
    customerId: string,
    metricName: string
  ): Promise<string | null> {
    // Retrieve encrypted credentials
    // This would integrate with the existing ApiKeyManager
    return null;
  }

  /**
   * Fetch Google Analytics metric value
   */
  private async fetchGoogleAnalyticsValue(
    metric: any,
    credentials: string | null
  ): Promise<MetricValue | null> {
    try {
      if (!credentials) {
        console.error('No Google Analytics credentials found');
        return null;
      }

      // Parse credentials (should contain apiKey and propertyId)
      const creds = JSON.parse(credentials);
      const gaIntegration = new GoogleAnalyticsIntegration({
        apiKey: creds.apiKey,
        propertyId: creds.propertyId
      });

      return await gaIntegration.fetchMetric(metric.metric_name);
    } catch (error) {
      console.error('Error fetching Google Analytics metric:', error);
      return null;
    }
  }

  /**
   * Fetch Stripe metric value
   */
  private async fetchStripeValue(
    metric: any,
    credentials: string | null
  ): Promise<MetricValue | null> {
    try {
      if (!credentials) {
        console.error('No Stripe credentials found');
        return null;
      }

      const stripeIntegration = new StripeIntegration({
        restrictedApiKey: credentials
      });

      return await stripeIntegration.fetchMetric(metric.metric_name);
    } catch (error) {
      console.error('Error fetching Stripe metric:', error);
      return null;
    }
  }

  /**
   * Fetch Mixpanel metric value
   */
  private async fetchMixpanelValue(
    metric: any,
    credentials: string | null
  ): Promise<MetricValue | null> {
    // Implementation for Mixpanel API
    return {
      value: 67.8, // Mock engagement score
      timestamp: new Date(),
      metadata: { source: 'mixpanel' }
    };
  }

  /**
   * Fetch custom endpoint metric value
   */
  private async fetchCustomValue(
    metric: any,
    credentials: string | null
  ): Promise<MetricValue | null> {
    try {
      if (!metric.endpoint_url) {
        console.error('No endpoint URL provided for custom metric');
        return null;
      }

      // Parse credentials for custom endpoint
      let config;
      try {
        config = credentials ? JSON.parse(credentials) : {};
      } catch {
        config = { authValue: credentials };
      }

      const customIntegration = new CustomEndpointIntegration({
        endpointUrl: metric.endpoint_url,
        authMethod: config.authMethod || 'bearer',
        authValue: config.authValue || credentials,
        headers: config.headers,
        method: config.method || 'GET',
        requestBody: config.requestBody
      });

      // Use a default metric definition
      const metricDefinition = {
        name: metric.metric_name,
        displayName: metric.metric_name,
        description: `Custom metric: ${metric.metric_name}`,
        jsonPath: config.jsonPath || '$.value',
        expectedType: 'number' as const
      };

      return await customIntegration.fetchMetric(metricDefinition);
    } catch (error) {
      console.error('Error fetching custom metric:', error);
      return null;
    }
  }

  /**
   * Get integration description
   */
  private getIntegrationDescription(source: string): string {
    const integration = this.integrations.find(i => i.source === source);
    return integration?.description || 'Custom metric';
  }

  /**
   * Log audit event
   */
  private async logAudit(
    customerId: string,
    action: string,
    metadata: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          customer_id: customerId,
          action,
          metadata,
          entity_type: 'metric'
        });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }
}

export default MetricsManager;
/**
 * Custom Endpoint Integration
 *
 * Allows customers to connect their own API endpoints for metrics
 * Supports various authentication methods and response formats
 */

import type { MetricValue } from '../services/metrics-manager';

// Types
export interface CustomEndpointConfig {
  endpointUrl: string;
  authMethod: 'bearer' | 'api_key' | 'basic' | 'none';
  authValue?: string;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST';
  requestBody?: any;
}

export interface CustomMetricDefinition {
  name: string;
  displayName: string;
  description: string;
  jsonPath: string; // JSONPath to extract value from response
  expectedType: 'number' | 'string' | 'boolean';
  unit?: string;
}

export interface EndpointResponse {
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
}

/**
 * Custom Endpoint Integration for Customer APIs
 */
export class CustomEndpointIntegration {
  private config: CustomEndpointConfig;

  constructor(config: CustomEndpointConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Test the endpoint connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    const startTime = Date.now();

    try {
      const response = await this.makeRequest();
      const responseTime = Date.now() - startTime;

      if (response.success) {
        return {
          success: true,
          responseTime,
        };
      } else {
        return {
          success: false,
          error: response.error,
          responseTime,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        responseTime,
      };
    }
  }

  /**
   * Fetch a metric value from the custom endpoint
   */
  async fetchMetric(
    metricDefinition: CustomMetricDefinition,
    context?: any
  ): Promise<MetricValue | null> {
    try {
      const response = await this.makeRequest(context);

      if (!response.success || !response.data) {
        console.error('Failed to fetch from custom endpoint:', response.error);
        return null;
      }

      // Extract value using JSONPath
      const value = this.extractValueFromResponse(
        response.data,
        metricDefinition.jsonPath,
        metricDefinition.expectedType
      );

      if (value === null) {
        console.error(
          'Could not extract value from response using path:',
          metricDefinition.jsonPath
        );
        return null;
      }

      return {
        value: typeof value === 'number' ? value : this.convertToNumber(value),
        timestamp: new Date(),
        metadata: {
          source: 'custom_endpoint',
          endpoint: this.config.endpointUrl,
          metricName: metricDefinition.name,
          unit: metricDefinition.unit,
          responseTime: response.responseTime,
        },
      };
    } catch (error) {
      console.error('Error fetching custom metric:', error);
      return null;
    }
  }

  /**
   * Fetch multiple metrics from the endpoint
   */
  async fetchMultipleMetrics(
    metricDefinitions: CustomMetricDefinition[],
    context?: any
  ): Promise<{ [metricName: string]: MetricValue | null }> {
    const results: { [metricName: string]: MetricValue | null } = {};

    try {
      // Make a single request and extract multiple values
      const response = await this.makeRequest(context);

      if (!response.success || !response.data) {
        // Return null for all metrics
        metricDefinitions.forEach((metric) => {
          results[metric.name] = null;
        });
        return results;
      }

      // Extract each metric from the response
      for (const metricDef of metricDefinitions) {
        const value = this.extractValueFromResponse(
          response.data,
          metricDef.jsonPath,
          metricDef.expectedType
        );

        if (value !== null) {
          results[metricDef.name] = {
            value: typeof value === 'number' ? value : this.convertToNumber(value),
            timestamp: new Date(),
            metadata: {
              source: 'custom_endpoint',
              endpoint: this.config.endpointUrl,
              metricName: metricDef.name,
              unit: metricDef.unit,
              responseTime: response.responseTime,
            },
          };
        } else {
          results[metricDef.name] = null;
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching custom metrics:', error);

      // Return null for all metrics on error
      metricDefinitions.forEach((metric) => {
        results[metric.name] = null;
      });

      return results;
    }
  }

  /**
   * Get available metrics by inspecting the endpoint response
   */
  async discoverMetrics(): Promise<CustomMetricDefinition[]> {
    try {
      const response = await this.makeRequest();

      if (!response.success || !response.data) {
        return [];
      }

      // Auto-discover numeric fields in the response
      const metrics: CustomMetricDefinition[] = [];
      const paths = this.findNumericPaths(response.data);

      paths.forEach((path, index) => {
        metrics.push({
          name: `metric_${index + 1}`,
          displayName: this.pathToDisplayName(path),
          description: `Auto-discovered metric from ${path}`,
          jsonPath: path,
          expectedType: 'number',
        });
      });

      return metrics;
    } catch (error) {
      console.error('Error discovering metrics:', error);
      return [];
    }
  }

  /**
   * Validate endpoint configuration
   */
  private validateConfig(): void {
    if (!this.config.endpointUrl) {
      throw new Error('Endpoint URL is required');
    }

    try {
      new URL(this.config.endpointUrl);
    } catch {
      throw new Error('Invalid endpoint URL format');
    }

    if (this.config.authMethod !== 'none' && !this.config.authValue) {
      throw new Error('Auth value is required when auth method is not "none"');
    }
  }

  /**
   * Make HTTP request to the endpoint
   */
  private async makeRequest(context?: any): Promise<EndpointResponse> {
    const startTime = Date.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'meterr-metrics/1.0',
        ...(this.config.headers || {}),
      };

      // Add authentication
      switch (this.config.authMethod) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${this.config.authValue}`;
          break;
        case 'api_key':
          headers['X-API-Key'] = this.config.authValue!;
          break;
        case 'basic':
          headers['Authorization'] = `Basic ${btoa(this.config.authValue!)}`;
          break;
      }

      const requestOptions: RequestInit = {
        method: this.config.method || 'GET',
        headers,
        timeout: 30000, // 30 second timeout
      };

      // Add request body for POST requests
      if (this.config.method === 'POST' && this.config.requestBody) {
        requestOptions.body = JSON.stringify({
          ...this.config.requestBody,
          ...context,
        });
      }

      const response = await fetch(this.config.endpointUrl, requestOptions);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
        };
      }

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Try to parse as JSON anyway
        try {
          data = JSON.parse(text);
        } catch {
          data = { value: text };
        }
      }

      return {
        success: true,
        data,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
        responseTime,
      };
    }
  }

  /**
   * Extract value from response using JSONPath-like syntax
   */
  private extractValueFromResponse(data: any, jsonPath: string, expectedType: string): any {
    try {
      // Simple JSONPath implementation
      const paths = jsonPath.split('.');
      let current = data;

      for (const path of paths) {
        if (path === '$') continue; // Root indicator

        if (current === null || current === undefined) {
          return null;
        }

        // Handle array access like "items[0]"
        if (path.includes('[') && path.includes(']')) {
          const [key, indexStr] = path.split('[');
          const index = parseInt(indexStr.replace(']', ''));

          if (key) {
            current = current[key];
          }

          if (Array.isArray(current) && !isNaN(index)) {
            current = current[index];
          }
        } else {
          current = current[path];
        }
      }

      // Type conversion
      if (expectedType === 'number' && typeof current !== 'number') {
        return this.convertToNumber(current);
      }

      return current;
    } catch (error) {
      console.error('Error extracting value from response:', error);
      return null;
    }
  }

  /**
   * Convert value to number
   */
  private convertToNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove common formatting
      const cleaned = value.replace(/[$,%]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
    return 0;
  }

  /**
   * Find numeric paths in object for auto-discovery
   */
  private findNumericPaths(obj: any, currentPath = '$', maxDepth = 3): string[] {
    const paths: string[] = [];

    if (maxDepth <= 0) return paths;

    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const newPath = currentPath === '$' ? `$.${key}` : `${currentPath}.${key}`;

        if (typeof value === 'number') {
          paths.push(newPath);
        } else if (Array.isArray(value) && value.length > 0) {
          // Check first array element
          if (typeof value[0] === 'number') {
            paths.push(`${newPath}[0]`);
          } else if (typeof value[0] === 'object') {
            paths.push(...this.findNumericPaths(value[0], `${newPath}[0]`, maxDepth - 1));
          }
        } else if (typeof value === 'object' && value !== null) {
          paths.push(...this.findNumericPaths(value, newPath, maxDepth - 1));
        }
      }
    }

    return paths;
  }

  /**
   * Convert JSONPath to display name
   */
  private pathToDisplayName(path: string): string {
    return path
      .replace(/^\$\./, '')
      .replace(/\[0\]/g, '')
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  /**
   * Get example metric definitions for common business metrics
   */
  static getExampleMetrics(): CustomMetricDefinition[] {
    return [
      {
        name: 'total_users',
        displayName: 'Total Users',
        description: 'Total number of registered users',
        jsonPath: '$.data.users.total',
        expectedType: 'number',
      },
      {
        name: 'active_users',
        displayName: 'Active Users',
        description: 'Number of active users in the last 30 days',
        jsonPath: '$.data.users.active',
        expectedType: 'number',
      },
      {
        name: 'monthly_revenue',
        displayName: 'Monthly Revenue',
        description: 'Total revenue for the current month',
        jsonPath: '$.data.revenue.monthly',
        expectedType: 'number',
        unit: 'USD',
      },
      {
        name: 'conversion_rate',
        displayName: 'Conversion Rate',
        description: 'Percentage of visitors who convert',
        jsonPath: '$.data.conversion.rate',
        expectedType: 'number',
        unit: '%',
      },
      {
        name: 'customer_satisfaction',
        displayName: 'Customer Satisfaction',
        description: 'Average customer satisfaction score',
        jsonPath: '$.data.satisfaction.average',
        expectedType: 'number',
        unit: 'score',
      },
    ];
  }
}

export default CustomEndpointIntegration;

/**
 * Google Analytics Integration
 * 
 * Integrates with Google Analytics 4 to fetch customer metrics
 * Uses customer's own API credentials
 */

import { MetricValue } from '../services/metrics-manager';

// Types
export interface GoogleAnalyticsConfig {
  apiKey: string;
  propertyId: string;
  clientEmail?: string;
  privateKey?: string;
}

export interface GAMetric {
  name: string;
  displayName: string;
  description: string;
  category: 'conversion' | 'engagement' | 'traffic' | 'revenue';
}

export interface GADimension {
  name: string;
  displayName: string;
}

export interface GARequest {
  metrics: string[];
  dimensions?: string[];
  startDate: string;
  endDate: string;
  filters?: any[];
}

/**
 * Google Analytics Integration
 */
export class GoogleAnalyticsIntegration {
  private config: GoogleAnalyticsConfig;
  
  // Available metrics
  private availableMetrics: GAMetric[] = [
    {
      name: 'sessions',
      displayName: 'Sessions',
      description: 'Total number of sessions',
      category: 'traffic'
    },
    {
      name: 'conversions',
      displayName: 'Conversions',
      description: 'Total conversions',
      category: 'conversion'
    },
    {
      name: 'conversionRate',
      displayName: 'Conversion Rate',
      description: 'Percentage of sessions that converted',
      category: 'conversion'
    },
    {
      name: 'averageSessionDuration',
      displayName: 'Average Session Duration',
      description: 'Average time users spend on site',
      category: 'engagement'
    },
    {
      name: 'bounceRate',
      displayName: 'Bounce Rate',
      description: 'Percentage of single-page sessions',
      category: 'engagement'
    },
    {
      name: 'totalRevenue',
      displayName: 'Total Revenue',
      description: 'Total revenue from e-commerce',
      category: 'revenue'
    },
    {
      name: 'revenuePerUser',
      displayName: 'Revenue Per User',
      description: 'Average revenue per user',
      category: 'revenue'
    }
  ];

  constructor(config: GoogleAnalyticsConfig) {
    this.config = config;
  }

  /**
   * Get available metrics
   */
  getAvailableMetrics(): GAMetric[] {
    return this.availableMetrics;
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Simple test to fetch basic data
      const result = await this.fetchMetric('sessions', 7);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  /**
   * Fetch a specific metric
   */
  async fetchMetric(
    metricName: string,
    days: number = 30
  ): Promise<MetricValue | null> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      const request: GARequest = {
        metrics: [metricName],
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate)
      };

      const data = await this.runReport(request);
      
      if (!data || !data.rows || data.rows.length === 0) {
        return null;
      }

      // Extract metric value
      const value = this.parseMetricValue(data.rows[0].metricValues[0]);

      return {
        value,
        timestamp: new Date(),
        metadata: {
          source: 'google_analytics',
          propertyId: this.config.propertyId,
          period: `${days} days`,
          metricName
        }
      };
    } catch (error) {
      console.error('Error fetching GA metric:', error);
      return null;
    }
  }

  /**
   * Fetch multiple metrics at once
   */
  async fetchMultipleMetrics(
    metricNames: string[],
    days: number = 30
  ): Promise<{ [key: string]: MetricValue | null }> {
    const results: { [key: string]: MetricValue | null } = {};

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      const request: GARequest = {
        metrics: metricNames,
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate)
      };

      const data = await this.runReport(request);
      
      if (data && data.rows && data.rows.length > 0) {
        const row = data.rows[0];
        
        metricNames.forEach((metricName, index) => {
          if (row.metricValues && row.metricValues[index]) {
            const value = this.parseMetricValue(row.metricValues[index]);
            results[metricName] = {
              value,
              timestamp: new Date(),
              metadata: {
                source: 'google_analytics',
                propertyId: this.config.propertyId,
                period: `${days} days`,
                metricName
              }
            };
          } else {
            results[metricName] = null;
          }
        });
      } else {
        // No data found
        metricNames.forEach(metricName => {
          results[metricName] = null;
        });
      }
    } catch (error) {
      console.error('Error fetching GA metrics:', error);
      metricNames.forEach(metricName => {
        results[metricName] = null;
      });
    }

    return results;
  }

  /**
   * Get conversion funnel data
   */
  async getFunnelData(
    funnelSteps: string[],
    days: number = 30
  ): Promise<{ [step: string]: number }> {
    try {
      const results = await this.fetchMultipleMetrics(funnelSteps, days);
      
      const funnelData: { [step: string]: number } = {};
      funnelSteps.forEach(step => {
        funnelData[step] = results[step]?.value || 0;
      });

      return funnelData;
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      return {};
    }
  }

  /**
   * Run a report using Google Analytics Data API
   */
  private async runReport(request: GARequest): Promise<any> {
    try {
      // Build the API request
      const requestBody = {
        property: `properties/${this.config.propertyId}`,
        dateRanges: [{
          startDate: request.startDate,
          endDate: request.endDate
        }],
        metrics: request.metrics.map(metric => ({ name: metric })),
        dimensions: request.dimensions?.map(dimension => ({ name: dimension })) || []
      };

      // Use Google Analytics Data API
      const response = await fetch(
        'https://analyticsdata.googleapis.com/v1beta/properties/' + 
        this.config.propertyId + ':runReport',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`GA API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error running GA report:', error);
      throw error;
    }
  }

  /**
   * Get access token for Google Analytics API
   */
  private async getAccessToken(): Promise<string> {
    // If using API key (simplified approach)
    if (this.config.apiKey) {
      return this.config.apiKey;
    }

    // If using service account (more secure)
    if (this.config.clientEmail && this.config.privateKey) {
      return await this.getServiceAccountToken();
    }

    throw new Error('No valid authentication method configured');
  }

  /**
   * Get service account token using JWT
   */
  private async getServiceAccountToken(): Promise<string> {
    // This would implement JWT-based service account authentication
    // For now, simplified implementation
    throw new Error('Service account authentication not implemented yet');
  }

  /**
   * Parse metric value from GA response
   */
  private parseMetricValue(metricValue: any): number {
    if (!metricValue || metricValue.value === undefined) {
      return 0;
    }

    const value = parseFloat(metricValue.value);
    return isNaN(value) ? 0 : value;
  }

  /**
   * Format date for GA API
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Get suggested metrics based on customer type
   */
  static getSuggestedMetrics(customerType: 'ecommerce' | 'saas' | 'content' | 'lead_gen'): string[] {
    switch (customerType) {
      case 'ecommerce':
        return ['conversions', 'conversionRate', 'totalRevenue', 'revenuePerUser'];
      
      case 'saas':
        return ['sessions', 'conversionRate', 'averageSessionDuration', 'bounceRate'];
      
      case 'content':
        return ['sessions', 'averageSessionDuration', 'bounceRate'];
      
      case 'lead_gen':
        return ['conversions', 'conversionRate', 'sessions'];
      
      default:
        return ['sessions', 'conversionRate', 'averageSessionDuration'];
    }
  }
}

export default GoogleAnalyticsIntegration;
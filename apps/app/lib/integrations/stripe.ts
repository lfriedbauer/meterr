/**
 * Stripe Integration
 *
 * Integrates with Stripe to fetch revenue and conversion metrics
 * Uses customer's restricted read-only API key
 */

import type { MetricValue } from '../services/metrics-manager';

// Types
export interface StripeConfig {
  restrictedApiKey: string; // Must be a restricted key starting with 'rk_'
}

export interface StripeMetric {
  name: string;
  displayName: string;
  description: string;
  category: 'revenue' | 'conversion' | 'customer' | 'subscription';
}

export interface StripeTimeframe {
  startDate: Date;
  endDate: Date;
}

/**
 * Stripe Integration for Revenue Metrics
 */
export class StripeIntegration {
  private config: StripeConfig;
  private baseUrl = 'https://api.stripe.com/v1';

  // Available metrics
  private availableMetrics: StripeMetric[] = [
    {
      name: 'total_revenue',
      displayName: 'Total Revenue',
      description: 'Total revenue from successful charges',
      category: 'revenue',
    },
    {
      name: 'monthly_recurring_revenue',
      displayName: 'Monthly Recurring Revenue',
      description: 'MRR from active subscriptions',
      category: 'subscription',
    },
    {
      name: 'conversion_rate',
      displayName: 'Payment Conversion Rate',
      description: 'Successful payments / total payment attempts',
      category: 'conversion',
    },
    {
      name: 'average_order_value',
      displayName: 'Average Order Value',
      description: 'Average value per successful transaction',
      category: 'revenue',
    },
    {
      name: 'customer_count',
      displayName: 'Total Customers',
      description: 'Number of unique customers',
      category: 'customer',
    },
    {
      name: 'new_customers',
      displayName: 'New Customers',
      description: 'New customers in the period',
      category: 'customer',
    },
    {
      name: 'churn_rate',
      displayName: 'Churn Rate',
      description: 'Percentage of customers who cancelled',
      category: 'subscription',
    },
    {
      name: 'failed_payment_rate',
      displayName: 'Failed Payment Rate',
      description: 'Percentage of failed payment attempts',
      category: 'conversion',
    },
  ];

  constructor(config: StripeConfig) {
    this.config = config;

    // Validate that it's a restricted key
    if (!config.restrictedApiKey.startsWith('rk_')) {
      throw new Error('Stripe API key must be a restricted key (starts with rk_)');
    }
  }

  /**
   * Get available metrics
   */
  getAvailableMetrics(): StripeMetric[] {
    return this.availableMetrics;
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test with a simple balance request
      const response = await this.makeRequest('/balance');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Fetch a specific metric
   */
  async fetchMetric(metricName: string, days: number = 30): Promise<MetricValue | null> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const timeframe = { startDate, endDate };

      switch (metricName) {
        case 'total_revenue':
          return await this.getTotalRevenue(timeframe);

        case 'monthly_recurring_revenue':
          return await this.getMRR(timeframe);

        case 'conversion_rate':
          return await this.getConversionRate(timeframe);

        case 'average_order_value':
          return await this.getAverageOrderValue(timeframe);

        case 'customer_count':
          return await this.getCustomerCount(timeframe);

        case 'new_customers':
          return await this.getNewCustomers(timeframe);

        case 'churn_rate':
          return await this.getChurnRate(timeframe);

        case 'failed_payment_rate':
          return await this.getFailedPaymentRate(timeframe);

        default:
          console.error('Unknown Stripe metric:', metricName);
          return null;
      }
    } catch (error) {
      console.error('Error fetching Stripe metric:', error);
      return null;
    }
  }

  /**
   * Get total revenue
   */
  private async getTotalRevenue(timeframe: StripeTimeframe): Promise<MetricValue> {
    const charges = await this.makeRequest('/charges', {
      created: {
        gte: Math.floor(timeframe.startDate.getTime() / 1000),
        lte: Math.floor(timeframe.endDate.getTime() / 1000),
      },
      limit: 100,
    });

    let totalRevenue = 0;
    if (charges.data) {
      for (const charge of charges.data) {
        if (charge.status === 'succeeded') {
          totalRevenue += charge.amount;
        }
      }
    }

    // Convert from cents to dollars
    const revenueInDollars = totalRevenue / 100;

    return {
      value: revenueInDollars,
      timestamp: new Date(),
      metadata: {
        source: 'stripe',
        metric: 'total_revenue',
        currency: 'usd',
        period: `${Math.floor((timeframe.endDate.getTime() - timeframe.startDate.getTime()) / (24 * 60 * 60 * 1000))} days`,
      },
    };
  }

  /**
   * Get Monthly Recurring Revenue
   */
  private async getMRR(timeframe: StripeTimeframe): Promise<MetricValue> {
    const subscriptions = await this.makeRequest('/subscriptions', {
      status: 'active',
      limit: 100,
    });

    let mrr = 0;
    if (subscriptions.data) {
      for (const subscription of subscriptions.data) {
        if (subscription.items && subscription.items.data) {
          for (const item of subscription.items.data) {
            if (item.price) {
              // Convert to monthly amount
              const amount = item.price.unit_amount || 0;
              const interval = item.price.recurring?.interval || 'month';

              let monthlyAmount = amount;
              if (interval === 'year') {
                monthlyAmount = amount / 12;
              } else if (interval === 'week') {
                monthlyAmount = amount * 4.33; // Average weeks per month
              } else if (interval === 'day') {
                monthlyAmount = amount * 30;
              }

              mrr += monthlyAmount * (item.quantity || 1);
            }
          }
        }
      }
    }

    // Convert from cents to dollars
    const mrrInDollars = mrr / 100;

    return {
      value: mrrInDollars,
      timestamp: new Date(),
      metadata: {
        source: 'stripe',
        metric: 'monthly_recurring_revenue',
        currency: 'usd',
        subscriptionCount: subscriptions.data?.length || 0,
      },
    };
  }

  /**
   * Get conversion rate (successful payments / total attempts)
   */
  private async getConversionRate(timeframe: StripeTimeframe): Promise<MetricValue> {
    const charges = await this.makeRequest('/charges', {
      created: {
        gte: Math.floor(timeframe.startDate.getTime() / 1000),
        lte: Math.floor(timeframe.endDate.getTime() / 1000),
      },
      limit: 100,
    });

    let totalAttempts = 0;
    let successfulPayments = 0;

    if (charges.data) {
      totalAttempts = charges.data.length;
      successfulPayments = charges.data.filter((charge) => charge.status === 'succeeded').length;
    }

    const conversionRate = totalAttempts > 0 ? (successfulPayments / totalAttempts) * 100 : 0;

    return {
      value: conversionRate,
      timestamp: new Date(),
      metadata: {
        source: 'stripe',
        metric: 'conversion_rate',
        totalAttempts,
        successfulPayments,
      },
    };
  }

  /**
   * Get average order value
   */
  private async getAverageOrderValue(timeframe: StripeTimeframe): Promise<MetricValue> {
    const charges = await this.makeRequest('/charges', {
      created: {
        gte: Math.floor(timeframe.startDate.getTime() / 1000),
        lte: Math.floor(timeframe.endDate.getTime() / 1000),
      },
      limit: 100,
    });

    let totalAmount = 0;
    let successfulCharges = 0;

    if (charges.data) {
      for (const charge of charges.data) {
        if (charge.status === 'succeeded') {
          totalAmount += charge.amount;
          successfulCharges++;
        }
      }
    }

    const averageOrderValue = successfulCharges > 0 ? totalAmount / successfulCharges / 100 : 0;

    return {
      value: averageOrderValue,
      timestamp: new Date(),
      metadata: {
        source: 'stripe',
        metric: 'average_order_value',
        currency: 'usd',
        orderCount: successfulCharges,
      },
    };
  }

  /**
   * Get customer count
   */
  private async getCustomerCount(timeframe: StripeTimeframe): Promise<MetricValue> {
    const customers = await this.makeRequest('/customers', {
      created: {
        lte: Math.floor(timeframe.endDate.getTime() / 1000),
      },
      limit: 100,
    });

    const customerCount = customers.data?.length || 0;

    return {
      value: customerCount,
      timestamp: new Date(),
      metadata: {
        source: 'stripe',
        metric: 'customer_count',
      },
    };
  }

  /**
   * Get new customers in period
   */
  private async getNewCustomers(timeframe: StripeTimeframe): Promise<MetricValue> {
    const customers = await this.makeRequest('/customers', {
      created: {
        gte: Math.floor(timeframe.startDate.getTime() / 1000),
        lte: Math.floor(timeframe.endDate.getTime() / 1000),
      },
      limit: 100,
    });

    const newCustomerCount = customers.data?.length || 0;

    return {
      value: newCustomerCount,
      timestamp: new Date(),
      metadata: {
        source: 'stripe',
        metric: 'new_customers',
        period: `${Math.floor((timeframe.endDate.getTime() - timeframe.startDate.getTime()) / (24 * 60 * 60 * 1000))} days`,
      },
    };
  }

  /**
   * Get churn rate
   */
  private async getChurnRate(timeframe: StripeTimeframe): Promise<MetricValue> {
    // Get cancelled subscriptions in the period
    const cancelledSubs = await this.makeRequest('/subscriptions', {
      status: 'canceled',
      canceled_at: {
        gte: Math.floor(timeframe.startDate.getTime() / 1000),
        lte: Math.floor(timeframe.endDate.getTime() / 1000),
      },
      limit: 100,
    });

    // Get all subscriptions that were active at start of period
    const activeSubs = await this.makeRequest('/subscriptions', {
      created: {
        lte: Math.floor(timeframe.startDate.getTime() / 1000),
      },
      limit: 100,
    });

    const cancelledCount = cancelledSubs.data?.length || 0;
    const activeCount = activeSubs.data?.length || 0;

    const churnRate = activeCount > 0 ? (cancelledCount / activeCount) * 100 : 0;

    return {
      value: churnRate,
      timestamp: new Date(),
      metadata: {
        source: 'stripe',
        metric: 'churn_rate',
        cancelledCount,
        activeCount,
      },
    };
  }

  /**
   * Get failed payment rate
   */
  private async getFailedPaymentRate(timeframe: StripeTimeframe): Promise<MetricValue> {
    const charges = await this.makeRequest('/charges', {
      created: {
        gte: Math.floor(timeframe.startDate.getTime() / 1000),
        lte: Math.floor(timeframe.endDate.getTime() / 1000),
      },
      limit: 100,
    });

    let totalCharges = 0;
    let failedCharges = 0;

    if (charges.data) {
      totalCharges = charges.data.length;
      failedCharges = charges.data.filter((charge) => charge.status === 'failed').length;
    }

    const failedPaymentRate = totalCharges > 0 ? (failedCharges / totalCharges) * 100 : 0;

    return {
      value: failedPaymentRate,
      timestamp: new Date(),
      metadata: {
        source: 'stripe',
        metric: 'failed_payment_rate',
        totalCharges,
        failedCharges,
      },
    };
  }

  /**
   * Make request to Stripe API
   */
  private async makeRequest(endpoint: string, params: any = {}): Promise<any> {
    try {
      const url = new URL(this.baseUrl + endpoint);

      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle nested objects (like created: { gte: ..., lte: ... })
          Object.entries(value).forEach(([subKey, subValue]) => {
            url.searchParams.append(`${key}[${subKey}]`, String(subValue));
          });
        } else {
          url.searchParams.append(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.config.restrictedApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Stripe API error: ${response.status} ${response.statusText}` +
            (errorData?.error?.message ? ` - ${errorData.error.message}` : '')
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Stripe API request failed:', error);
      throw error;
    }
  }

  /**
   * Get suggested metrics based on business type
   */
  static getSuggestedMetrics(businessType: 'ecommerce' | 'saas' | 'marketplace'): string[] {
    switch (businessType) {
      case 'ecommerce':
        return ['total_revenue', 'average_order_value', 'conversion_rate', 'new_customers'];

      case 'saas':
        return ['monthly_recurring_revenue', 'churn_rate', 'new_customers', 'failed_payment_rate'];

      case 'marketplace':
        return ['total_revenue', 'customer_count', 'conversion_rate', 'average_order_value'];

      default:
        return ['total_revenue', 'conversion_rate', 'customer_count'];
    }
  }
}

export default StripeIntegration;

/**
 * Customer Metrics Management API
 * Handles "Bring Your Own Metrics" functionality
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleAnalyticsIntegration } from '@/lib/integrations/google-analytics';
import { StripeIntegration } from '@/lib/integrations/stripe';
import { MetricsManager } from '@/lib/services/metrics-manager';

// Lazy initialization
let metricsManager: MetricsManager | null = null;

function getMetricsManager() {
  if (!metricsManager) {
    metricsManager = new MetricsManager(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return metricsManager;
}

// Validation schemas
const addMetricSchema = z.object({
  name: z.string().min(1),
  source: z.enum(['google_analytics', 'stripe', 'mixpanel', 'custom', 'amplitude', 'intercom']),
  endpointUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  baselineValue: z.number().optional(),
  acceptableRangeMin: z.number().optional(),
  acceptableRangeMax: z.number().optional(),
  description: z.string().optional(),
});

const testIntegrationSchema = z.object({
  source: z.enum(['google_analytics', 'stripe', 'mixpanel', 'custom']),
  credentials: z.record(z.string()),
});

/**
 * GET /api/customers/[id]/metrics - List customer metrics
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;

    // Get available integrations
    const availableIntegrations = getMetricsManager().getAvailableIntegrations();

    // Get customer's configured metrics
    const customerMetrics = await getMetricsManager().getCustomerMetrics(customerId);

    return NextResponse.json({
      success: true,
      availableIntegrations,
      customerMetrics,
      suggestedMetrics: {
        ecommerce: {
          google_analytics: ['conversions', 'conversionRate', 'sessions'],
          stripe: ['total_revenue', 'average_order_value', 'conversion_rate'],
        },
        saas: {
          google_analytics: ['sessions', 'conversionRate', 'averageSessionDuration'],
          stripe: ['monthly_recurring_revenue', 'churn_rate', 'new_customers'],
        },
        content: {
          google_analytics: ['sessions', 'averageSessionDuration', 'bounceRate'],
        },
      },
    });
  } catch (error) {
    console.error('Error listing metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/customers/[id]/metrics - Add a metric
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;
    const body = await request.json();
    const metricData = addMetricSchema.parse(body);

    const result = await getMetricsManager().addMetric(customerId, {
      name: metricData.name,
      source: metricData.source,
      endpointUrl: metricData.endpointUrl,
      apiKey: metricData.apiKey,
      baselineValue: metricData.baselineValue,
      acceptableRangeMin: metricData.acceptableRangeMin,
      acceptableRangeMax: metricData.acceptableRangeMax,
      description: metricData.description || `${metricData.source} metric`,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      metricId: result.metricId,
      message: `${metricData.name} metric added successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding metric:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle test endpoint within POST
 */
async function handleTestIntegration(request: NextRequest, customerId: string) {
  try {
    const body = await request.json();
    const { source, credentials } = testIntegrationSchema.parse(body);

    let testResult: { success: boolean; error?: string };

    switch (source) {
      case 'google_analytics': {
        const gaIntegration = new GoogleAnalyticsIntegration({
          apiKey: credentials.apiKey,
          propertyId: credentials.propertyId,
        });
        testResult = await gaIntegration.testConnection();
        break;
      }

      case 'stripe': {
        const stripeIntegration = new StripeIntegration({
          restrictedApiKey: credentials.restrictedApiKey,
        });
        testResult = await stripeIntegration.testConnection();
        break;
      }

      case 'custom':
        // Test custom endpoint
        try {
          const response = await fetch(credentials.endpointUrl, {
            headers: credentials.apiKey
              ? {
                  Authorization: `Bearer ${credentials.apiKey}`,
                }
              : {},
          });
          testResult = { success: response.ok };
          if (!response.ok) {
            testResult.error = `HTTP ${response.status}`;
          }
        } catch (error) {
          testResult = {
            success: false,
            error: error instanceof Error ? error.message : 'Connection failed',
          };
        }
        break;

      default:
        testResult = { success: false, error: 'Integration not implemented yet' };
    }

    return NextResponse.json({
      success: testResult.success,
      message: testResult.success
        ? `${source} integration test successful`
        : `${source} integration test failed: ${testResult.error}`,
      testResult,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error testing integration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

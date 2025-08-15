/**
 * Metrics Validation API
 * Validates all customer metrics after AI optimizations are applied
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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

const validateMetricsSchema = z.object({
  optimizationId: z.string().optional(),
  testPeriodDays: z.number().min(1).max(90).default(7),
});

/**
 * POST /api/customers/[id]/metrics/validate - Validate all metrics
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;
    const body = await request.json();
    const { optimizationId, testPeriodDays } = validateMetricsSchema.parse(body);

    console.log(`Starting metrics validation for customer ${customerId}`);

    // Get all customer metrics
    const customerMetrics = await getMetricsManager().getCustomerMetrics(customerId);

    if (customerMetrics.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No metrics configured for validation',
          suggestion: 'Add metrics first using POST /api/customers/{id}/metrics',
        },
        { status: 400 }
      );
    }

    // Validate all metrics
    const validationResults = await getMetricsManager().validateAllMetrics(customerId);

    // Calculate overall validation status
    const passedCount = validationResults.filter((v) => v.status === 'passed').length;
    const warningCount = validationResults.filter((v) => v.status === 'warning').length;
    const failedCount = validationResults.filter((v) => v.status === 'failed').length;

    const overallStatus = failedCount > 0 ? 'failed' : warningCount > 0 ? 'warning' : 'passed';

    // Generate recommendations based on results
    const recommendations = generateRecommendations(validationResults);

    // Store validation results
    await storeValidationResults(customerId, {
      optimizationId,
      testPeriodDays,
      validationResults,
      overallStatus,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      validation: {
        customerId,
        overallStatus,
        summary: {
          totalMetrics: validationResults.length,
          passed: passedCount,
          warnings: warningCount,
          failed: failedCount,
          successRate: `${Math.round((passedCount / validationResults.length) * 100)}%`,
        },
        results: validationResults,
        recommendations,
        testPeriod: `${testPeriodDays} days`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error validating metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/customers/[id]/metrics/validate - Get validation history
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get validation history from database
    const validationHistory = await getValidationHistory(customerId, limit);

    return NextResponse.json({
      success: true,
      validationHistory,
      totalCount: validationHistory.length,
    });
  } catch (error) {
    console.error('Error fetching validation history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(validationResults: any[]): string[] {
  const recommendations: string[] = [];

  const failedMetrics = validationResults.filter((v) => v.status === 'failed');
  const warningMetrics = validationResults.filter((v) => v.status === 'warning');

  if (failedMetrics.length > 0) {
    recommendations.push(
      `⚠️ ${failedMetrics.length} metrics failed validation. Quality may have been impacted by the optimization.`
    );

    failedMetrics.forEach((metric) => {
      recommendations.push(
        `• ${metric.metricName}: ${metric.percentageChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(metric.percentageChange).toFixed(1)}% (baseline: ${metric.baselineValue})`
      );
    });

    recommendations.push(
      '💡 Consider reverting the optimization or adjusting the AI model parameters.'
    );
  }

  if (warningMetrics.length > 0) {
    recommendations.push(
      `⚡ ${warningMetrics.length} metrics show minor changes. Monitor closely.`
    );
  }

  if (failedMetrics.length === 0 && warningMetrics.length === 0) {
    recommendations.push(
      '✅ All metrics passed validation. The optimization maintains quality while reducing costs.'
    );
    recommendations.push(
      '💰 You can proceed with confidence that savings are real and sustainable.'
    );
  }

  // Add specific guidance
  const conversionMetrics = validationResults.filter(
    (v) =>
      v.metricName.toLowerCase().includes('conversion') ||
      v.metricName.toLowerCase().includes('revenue')
  );

  if (conversionMetrics.some((m) => m.status === 'failed')) {
    recommendations.push(
      '🎯 Revenue/conversion metrics are critical. Consider A/B testing the optimization on a small portion of traffic first.'
    );
  }

  return recommendations;
}

/**
 * Store validation results in database
 */
async function storeValidationResults(customerId: string, validationData: any): Promise<void> {
  try {
    // This would store the validation results in the savings_validations table
    // For now, we'll use the metrics manager's audit logging
    console.log('Storing validation results:', {
      customerId,
      results: validationData.validationResults.length,
      status: validationData.overallStatus,
    });
  } catch (error) {
    console.error('Error storing validation results:', error);
  }
}

/**
 * Get validation history from database
 */
async function getValidationHistory(customerId: string, limit: number): Promise<any[]> {
  try {
    // This would fetch from the savings_validations table
    // For now, return mock data
    return [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        overallStatus: 'passed',
        totalMetrics: 3,
        passed: 3,
        warnings: 0,
        failed: 0,
        optimizationId: 'opt_123',
      },
    ];
  } catch (error) {
    console.error('Error fetching validation history:', error);
    return [];
  }
}

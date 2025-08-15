/**
 * Quick Win Detection API
 * Discovers optimization opportunities for customers
 */

import { type NextRequest, NextResponse } from 'next/server';
import { AnthropicUsageFetcher } from '@/lib/services/anthropic-usage-fetcher';
import { ApiKeyManager } from '@/lib/services/api-key-manager';
import { EmbeddingGenerator } from '@/lib/services/embedding-generator';
import { OpenAIUsageFetcher } from '@/lib/services/openai-usage-fetcher';
import { QuickWinDetector } from '@/lib/services/quick-win-detector';

// Lazy initialization
let apiKeyManager: ApiKeyManager | null = null;
let openAIUsageFetcher: OpenAIUsageFetcher | null = null;
let anthropicUsageFetcher: AnthropicUsageFetcher | null = null;
let quickWinDetector: QuickWinDetector | null = null;
let embeddingGenerator: EmbeddingGenerator | null = null;

function getServices() {
  if (!apiKeyManager) {
    apiKeyManager = new ApiKeyManager(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    openAIUsageFetcher = new OpenAIUsageFetcher(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      apiKeyManager
    );
    anthropicUsageFetcher = new AnthropicUsageFetcher(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      apiKeyManager
    );
    quickWinDetector = new QuickWinDetector(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    embeddingGenerator = new EmbeddingGenerator(
      process.env.OPENAI_API_KEY!,
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return {
    apiKeyManager,
    openAIUsageFetcher,
    anthropicUsageFetcher,
    quickWinDetector,
    embeddingGenerator,
  };
}

/**
 * POST /api/customers/[id]/quick-win - Generate Quick Win
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;

    // Step 1: Determine which provider to use
    console.log('Fetching usage data for customer:', customerId);
    const { apiKeyManager, openAIUsageFetcher, anthropicUsageFetcher } = getServices();

    // Get customer's API keys to determine provider
    const apiKeys = await apiKeyManager.getCustomerApiKeys(customerId);
    const hasAnthropic = apiKeys.some((k) => k.provider === 'anthropic');
    const hasOpenAI = apiKeys.some((k) => k.provider === 'openai');

    let usageResult;
    if (hasAnthropic) {
      console.log('Using Anthropic usage fetcher');
      usageResult = await anthropicUsageFetcher.fetchUsageData(customerId);
    } else if (hasOpenAI) {
      console.log('Using OpenAI usage fetcher');
      usageResult = await openAIUsageFetcher.fetchUsageData(customerId);
    } else {
      return NextResponse.json({ error: 'No API keys found for customer' }, { status: 400 });
    }

    if (!usageResult.success) {
      return NextResponse.json(
        { error: usageResult.error || 'Failed to fetch usage data' },
        { status: 400 }
      );
    }

    // Step 2: Generate embeddings for new patterns
    console.log('Processing usage patterns...');
    // This would normally fetch patterns without embeddings and process them
    // For MVP, we'll work with the data we have

    // Step 3: Detect Quick Win
    console.log('Detecting Quick Win opportunity...');
    const { quickWinDetector } = getServices();
    const quickWin = await quickWinDetector.detectQuickWin(customerId);

    if (!quickWin) {
      return NextResponse.json({
        success: true,
        message: 'No Quick Win opportunities found at this time',
        suggestion:
          "Continue using your AI as normal. We'll analyze more data and find opportunities soon.",
        usageSummary: usageResult.summary,
      });
    }

    return NextResponse.json({
      success: true,
      quickWin: {
        title: quickWin.title,
        description: quickWin.description,
        currentModel: quickWin.currentModel,
        recommendedModel: quickWin.recommendedModel,
        monthlySavings: quickWin.monthlySavings,
        annualSavings: quickWin.monthlySavings * 12,
        confidencePercentage: quickWin.confidencePercentage,
        riskLevel: quickWin.riskLevel,
        implementation: {
          description: quickWin.implementationGuide.description,
          codeSnippet: quickWin.implementationGuide.codeSnippet,
          whereToChange: quickWin.implementationGuide.whereToChange,
          testingSteps: quickWin.implementationGuide.testingSteps,
        },
      },
      usageSummary: usageResult.summary,
    });
  } catch (error) {
    console.error('Error generating Quick Win:', error);
    return NextResponse.json({ error: 'Failed to generate Quick Win' }, { status: 500 });
  }
}

/**
 * GET /api/customers/[id]/quick-win - Get existing Quick Win
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;

    // Get existing Quick Win from database
    const supabase = require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: quickWin, error } = await supabase
      .from('quick_wins')
      .select(`
        *,
        optimization_opportunities (*)
      `)
      .eq('customer_id', customerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Not found is OK
      console.error('Error fetching Quick Win:', error);
      return NextResponse.json({ error: 'Failed to fetch Quick Win' }, { status: 500 });
    }

    if (!quickWin) {
      return NextResponse.json({
        success: true,
        message: 'No Quick Win found. Generate one by analyzing your usage.',
        hasQuickWin: false,
      });
    }

    return NextResponse.json({
      success: true,
      hasQuickWin: true,
      quickWin: {
        id: quickWin.id,
        title: quickWin.title,
        description: quickWin.description,
        monthlySavings: quickWin.monthly_savings,
        confidencePercentage: quickWin.confidence_percentage,
        shownAt: quickWin.shown_at,
        clickedAt: quickWin.clicked_at,
        implementedAt: quickWin.implemented_at,
        qualityMaintained: quickWin.quality_maintained,
        actualSavings: quickWin.actual_savings,
        opportunity: quickWin.optimization_opportunities,
      },
    });
  } catch (error) {
    console.error('Error getting Quick Win:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/customers/[id]/quick-win - Update Quick Win status
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id;
    const body = await request.json();
    const { action, actualSavings, qualityMaintained } = body;

    const supabase = require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const updateData: any = {};

    switch (action) {
      case 'clicked':
        updateData.clicked_at = new Date().toISOString();
        break;
      case 'implemented':
        updateData.implemented_at = new Date().toISOString();
        if (actualSavings !== undefined) {
          updateData.actual_savings = actualSavings;
        }
        if (qualityMaintained !== undefined) {
          updateData.quality_maintained = qualityMaintained;
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error } = await supabase
      .from('quick_wins')
      .update(updateData)
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error updating Quick Win:', error);
      return NextResponse.json({ error: 'Failed to update Quick Win' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Quick Win ${action} recorded successfully`,
    });
  } catch (error) {
    console.error('Error updating Quick Win:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

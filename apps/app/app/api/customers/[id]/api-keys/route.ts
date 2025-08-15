/**
 * Customer API Keys Management
 * Handles storing and managing customer's API keys
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiKeyManager } from '@/lib/services/api-key-manager';

// Lazy initialization to avoid build-time errors
let apiKeyManager: ApiKeyManager | null = null;

function getApiKeyManager() {
  if (!apiKeyManager) {
    apiKeyManager = new ApiKeyManager(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return apiKeyManager;
}

// Validation schemas
const addApiKeySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google', 'stripe', 'analytics']),
  keyName: z.string().min(1),
  apiKey: z.string().min(1),
});

/**
 * POST /api/customers/[id]/api-keys - Add API key
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;
    const body = await request.json();
    const { provider, keyName, apiKey } = addApiKeySchema.parse(body);

    const result = await getApiKeyManager().storeApiKey(customerId, {
      provider,
      keyName,
      apiKey,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      keyId: result.keyId,
      message: `${provider} API key stored successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding API key:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/customers/[id]/api-keys - List API keys
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;
    const apiKeys = await getApiKeyManager().listApiKeys(customerId);

    return NextResponse.json({
      success: true,
      apiKeys: apiKeys.map((key) => ({
        id: key.id,
        provider: key.provider,
        keyName: key.keyName,
        keyHint: key.keyHint,
        isActive: key.isActive,
        lastUsedAt: key.lastUsedAt,
      })),
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/customers/[id]/api-keys - Revoke API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json({ error: 'keyId parameter is required' }, { status: 400 });
    }

    const result = await getApiKeyManager().revokeApiKey(customerId, keyId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

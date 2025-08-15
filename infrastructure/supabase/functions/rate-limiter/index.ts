import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Rate limiting configuration
const RATE_LIMITS = {
  free: { requests: 100, window: 3600 }, // 100 requests per hour
  pro: { requests: 1000, window: 3600 }, // 1000 requests per hour
  enterprise: { requests: 10000, window: 3600 }, // 10000 requests per hour
};

// TLS enforcement
const TLS_CONFIG = {
  minVersion: 'TLSv1.3',
  ciphers: ['TLS_AES_256_GCM_SHA384', 'TLS_AES_128_GCM_SHA256'],
};

serve(async (req) => {
  // Enforce HTTPS/TLS
  if (req.headers.get('x-forwarded-proto') !== 'https') {
    return new Response('HTTPS required', { status: 403 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Extract API key from request
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    return new Response('API key required', { status: 401 });
  }

  // Get user tier and check rate limits
  const { data: keyData } = await supabase
    .from('api_keys')
    .select('user_id, tier, request_count, window_start')
    .eq('key_hash', await hashApiKey(apiKey))
    .single();

  if (!keyData) {
    return new Response('Invalid API key', { status: 401 });
  }

  // Check rate limit
  const limit = RATE_LIMITS[keyData.tier] || RATE_LIMITS.free;
  const now = Date.now();
  const windowStart = keyData.window_start || now;

  if (now - windowStart > limit.window * 1000) {
    // Reset window
    await supabase
      .from('api_keys')
      .update({ request_count: 1, window_start: now })
      .eq('key_hash', await hashApiKey(apiKey));
  } else if (keyData.request_count >= limit.requests) {
    // Rate limit exceeded
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.requests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(windowStart + limit.window * 1000).toISOString(),
      },
    });
  } else {
    // Increment counter
    await supabase
      .from('api_keys')
      .update({ request_count: keyData.request_count + 1 })
      .eq('key_hash', await hashApiKey(apiKey));
  }

  // Forward request to actual endpoint
  const url = new URL(req.url);
  url.pathname = url.pathname.replace('/rate-limited', '');

  return fetch(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });
});

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

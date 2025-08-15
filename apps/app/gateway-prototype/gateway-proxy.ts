// Cloudflare Worker - Edge Proxy
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Extract provider from path: proxy.meterr.ai/openai/v1/...
    const pathParts = url.pathname.split('/');
    const provider = pathParts[1]; // 'openai', 'anthropic', etc.

    // Map to actual provider URL
    const providerUrls = {
      openai: 'https://api.openai.com',
      anthropic: 'https://api.anthropic.com',
      google: 'https://generativelanguage.googleapis.com',
    };

    // Forward request to provider
    const targetUrl = providerUrls[provider] + url.pathname.replace(/^\/[^/]+/, '');
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    // Track request start time
    const startTime = Date.now();

    // Forward to actual provider
    const response = await fetch(modifiedRequest);
    const responseTime = Date.now() - startTime;

    // Clone response for processing
    const responseClone = response.clone();

    // Async: Log without blocking response
    request.ctx.waitUntil(logUsage(request, responseClone, responseTime, env));

    // Return response immediately (no added latency)
    return response;
  },
};

async function logUsage(req: Request, res: Response, time: number, env: Env) {
  const body = await res.json();

  // Calculate cost based on usage
  const usage = body.usage || {};
  const model = body.model || 'unknown';
  const cost = calculateCost(model, usage);

  // Extract customer ID from headers
  const customerId = req.headers.get('X-Meterr-Key');

  // Send to analytics (async)
  await env.ANALYTICS.writeDataPoint({
    timestamp: Date.now(),
    customerId,
    provider: 'openai',
    model,
    tokens: usage.total_tokens,
    cost,
    responseTime: time,
  });
}

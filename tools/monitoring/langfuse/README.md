# Langfuse - Self-Hosted LLM Observability

## What is Langfuse?
Open-source LLM observability platform that replaces Helicone with self-hosted solution.

## Features
- ✅ Complete LLM tracking (OpenAI, Anthropic, etc.)
- ✅ Self-hosted (own your data)
- ✅ Real-time cost tracking
- ✅ Trace analysis
- ✅ User analytics
- ✅ No proxy required

## Quick Start

```bash
# Start Langfuse
cd tools/monitoring/langfuse
docker-compose up -d

# Access UI
open http://localhost:3002
```

## Integration with Meterr

```typescript
// apps/app/lib/telemetry/langfuse-client.ts
import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: 'http://localhost:3002'
});

// Track LLM calls
const trace = langfuse.trace({
  name: 'chat-completion',
  userId: customerId,
  metadata: { feature: 'chat' }
});

// Automatic cost calculation
trace.generation({
  name: 'openai-chat',
  model: 'gpt-4',
  modelParameters: { temperature: 0.7 },
  input: messages,
  output: response,
  usage: { promptTokens, completionTokens }
});
```

## Environment Variables

```env
LANGFUSE_PUBLIC_KEY=your-public-key
LANGFUSE_SECRET_KEY=your-secret-key
LANGFUSE_BASE_URL=http://localhost:3002
```

## Advantages over Helicone

| Feature | Helicone | Langfuse |
|---------|----------|----------|
| Self-hosted | ❌ | ✅ |
| Data ownership | ❌ | ✅ |
| Cost | $100/mo | Free |
| Proxy required | ✅ | ❌ |
| Open source | ❌ | ✅ |

## Production Setup

1. Update secrets in docker-compose.yml
2. Use external PostgreSQL for scale
3. Add SSL/TLS with reverse proxy
4. Configure backups

## Monitoring

Access Langfuse dashboard: http://localhost:3002
- View traces
- Analyze costs
- Track users
- Debug issues
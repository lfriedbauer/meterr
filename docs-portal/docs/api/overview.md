---
id: overview
title: API Overview
sidebar_label: Overview
sidebar_position: 1
description: Complete API reference for Meterr.ai
keywords: [api, rest, endpoints, authentication, sdk]
---

# API Overview

The Meterr.ai API provides programmatic access to all platform features, enabling you to integrate AI cost tracking directly into your applications.

## Base URL

```
https://api.meterr.ai/v1
```

## Authentication

All API requests require authentication using an API key:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.meterr.ai/v1/usage
```

## Quick Start

### 1. Get Your API Key

Navigate to your [dashboard settings](https://app.meterr.ai/settings/api) to generate an API key.

### 2. Make Your First Request

```javascript
const response = await fetch('https://api.meterr.ai/v1/usage', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

## Multi-Provider Token Tracking

Meterr supports token tracking across all major AI providers with unified API endpoints:

### OpenAI Integration
```javascript
// Track OpenAI GPT-4 usage
const trackOpenAI = await fetch('https://api.meterr.ai/v1/track', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'openai',
    model: 'gpt-4',
    input_tokens: 1500,
    output_tokens: 500,
    endpoint: '/v1/chat/completions',
    metadata: { user_id: 'user_123', session: 'chat_456' }
  })
});
```

### Anthropic Integration
```javascript
// Track Anthropic Claude usage
const trackAnthropic = await fetch('https://api.meterr.ai/v1/track', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'anthropic',
    model: 'claude-3-opus',
    input_tokens: 2000,
    output_tokens: 800,
    endpoint: '/v1/messages',
    metadata: { user_id: 'user_123', purpose: 'analysis' }
  })
});
```

### Google AI Integration
```javascript
// Track Google Gemini usage
const trackGoogle = await fetch('https://api.meterr.ai/v1/track', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'google',
    model: 'gemini-pro',
    input_tokens: 1200,
    output_tokens: 600,
    endpoint: '/v1beta/models/gemini-pro:generateContent',
    metadata: { user_id: 'user_123', project: 'research' }
  })
});
```

### Azure OpenAI Integration
```python
# Track Azure OpenAI usage with Python SDK
import requests

response = requests.post(
    'https://api.meterr.ai/v1/track',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'provider': 'azure',
        'model': 'gpt-4-turbo',
        'input_tokens': 1800,
        'output_tokens': 700,
        'endpoint': '/openai/deployments/gpt4/chat/completions',
        'metadata': {
            'deployment': 'production',
            'region': 'eastus'
        }
    }
)
```

### Mistral Integration
```typescript
// Track Mistral AI usage with TypeScript
interface TokenUsage {
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  endpoint: string;
  metadata?: Record<string, any>;
}

const trackMistral = async (): Promise<void> => {
  const usage: TokenUsage = {
    provider: 'mistral',
    model: 'mistral-large',
    input_tokens: 900,
    output_tokens: 400,
    endpoint: '/v1/chat/completions',
    metadata: { team: 'engineering' }
  };

  await fetch('https://api.meterr.ai/v1/track', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(usage)
  });
};
```

### Cohere Integration
```python
# Track Cohere usage
import meterr  # pip install meterr

client = meterr.Client(api_key="YOUR_API_KEY")

client.track_usage(
    provider="cohere",
    model="command-r-plus",
    input_tokens=1100,
    output_tokens=550,
    endpoint="/v1/generate",
    metadata={
        "task": "summarization",
        "language": "en"
    }
)
```

## Unified Cost Analysis

Get aggregated costs across all providers:

```javascript
// Fetch cost analysis for all providers
const getCosts = await fetch('https://api.meterr.ai/v1/costs', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  params: {
    start_date: '2025-08-01',
    end_date: '2025-08-14',
    group_by: 'provider'
  }
});

const costs = await getCosts.json();
// Returns:
// {
//   "openai": { "total": 145.23, "tokens": 1500000 },
//   "anthropic": { "total": 89.45, "tokens": 890000 },
//   "google": { "total": 67.89, "tokens": 750000 },
//   "azure": { "total": 134.56, "tokens": 1400000 },
//   "mistral": { "total": 45.67, "tokens": 650000 },
//   "cohere": { "total": 34.12, "tokens": 450000 }
// }
```

## Core Endpoints

### Usage Tracking
- `GET /usage` - Get usage statistics
- `POST /usage` - Record token usage
- `GET /usage/history` - Historical data

### Cost Management
- `GET /costs` - Current costs
- `GET /costs/forecast` - Cost predictions
- `POST /budgets` - Set budget alerts

### Teams
- `GET /teams` - List teams
- `POST /teams` - Create team
- `POST /teams/{id}/invite` - Invite member

### Integrations
- `GET /providers` - List AI providers
- `POST /providers/connect` - Connect provider
- `DELETE /providers/{id}` - Disconnect

## Rate Limits

- **Free tier**: 100 requests/hour
- **Pro tier**: 1,000 requests/hour
- **Enterprise**: Unlimited

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1628680800
```

## Error Handling

API errors follow standard HTTP status codes:

```json
{
  "error": {
    "code": "insufficient_credits",
    "message": "Your account has insufficient credits",
    "details": {
      "required": 100,
      "available": 50
    }
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

## SDKs

Official SDKs available for:

- [JavaScript/TypeScript](./sdks/javascript)
- [Python](./sdks/python)
- [Go](./sdks/go)
- [Ruby](./sdks/ruby)

## Webhooks

Configure webhooks to receive real-time events:

```json
{
  "event": "usage.exceeded",
  "data": {
    "team_id": "team_123",
    "limit": 10000,
    "current": 10500
  }
}
```

## API Versioning

The API is versioned via the URL path. Current version: `v1`

Breaking changes will result in a new version. Non-breaking changes are added to the current version.

## Support

- 📚 [Full API Reference](./endpoints)
- 💬 [Discord Community](https://discord.gg/meterr)
- 📧 [Email Support](mailto:api@meterr.ai)

---

*Last updated: August 2024*
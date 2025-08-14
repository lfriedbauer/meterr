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
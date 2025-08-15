---
title: Authentication
sidebar_position: 1
---

# API Authentication

## Overview

The meterr API uses API keys to authenticate requests. You can view and manage your API keys in the [meterr dashboard](https://app.meterr.ai/settings/api-keys).

## Authentication Methods

### API Key Authentication

Include your API key in the `Authorization` header:

```bash
curl https://api.meterr.ai/v1/usage \
  -H "Authorization: Bearer mtr_your_api_key_here"
```

### SDK Authentication

#### JavaScript/TypeScript

```javascript
import { Meterr } from '@meterr/sdk';

const meterr = new Meterr({
  apiKey: 'mtr_your_api_key_here'
});
```

#### Python

```python
from meterr import Meterr

meterr = Meterr(api_key='mtr_your_api_key_here')
```

## API Key Management

### Creating API Keys

1. Navigate to [Settings → API Keys](https://app.meterr.ai/settings/api-keys)
2. Click "Create New Key"
3. Name your key (e.g., "Production", "Development")
4. Copy the key immediately - it won't be shown again

### Key Permissions

API keys can have different permission levels:

| Permission | Description |
|------------|-------------|
| `read` | View usage data and recommendations |
| `write` | Track usage and update metrics |
| `admin` | Full access including billing |

### Rotating Keys

Best practice is to rotate keys every 90 days:

```javascript
// Old key
const oldMeterr = new Meterr({ apiKey: 'mtr_old_key' });

// Create new key in dashboard, then update
const newMeterr = new Meterr({ apiKey: 'mtr_new_key' });

// Graceful transition period (keep both active briefly)
```

## Security Best Practices

### Environment Variables

Never hardcode API keys. Use environment variables:

```javascript
// ❌ Bad
const meterr = new Meterr({
  apiKey: 'mtr_sk_live_abc123'
});

// ✅ Good
const meterr = new Meterr({
  apiKey: process.env.METERR_API_KEY
});
```

### Key Restrictions

Restrict keys by:

- **IP Address**: Whitelist specific IPs
- **Domain**: Limit to your domains
- **Environment**: Separate dev/staging/prod keys

### Rate Limiting

API keys are rate limited to prevent abuse:

- **Standard**: 1,000 requests/hour
- **Pro**: 10,000 requests/hour  
- **Enterprise**: Unlimited

## OAuth 2.0 (Coming Soon)

OAuth support for user-authorized access:

```javascript
// Future implementation
const auth = await meterr.oauth.authorize({
  client_id: 'your_client_id',
  redirect_uri: 'https://yourapp.com/callback',
  scope: 'read:usage write:metrics'
});
```

## Webhook Signatures

Verify webhook authenticity:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-meterr-signature'];
  
  if (!verifyWebhook(req.body, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
});
```

## Error Responses

Authentication failures return:

```json
{
  "error": {
    "type": "authentication_error",
    "message": "Invalid API key provided",
    "code": "invalid_api_key"
  }
}
```

Common error codes:

| Code | Description |
|------|-------------|
| `invalid_api_key` | Key doesn't exist or is malformed |
| `expired_api_key` | Key has expired |
| `insufficient_permissions` | Key lacks required permissions |
| `rate_limit_exceeded` | Too many requests |

## Testing Authentication

Test your API key:

```bash
curl https://api.meterr.ai/v1/auth/verify \
  -H "Authorization: Bearer mtr_your_api_key_here"
```

Expected response:

```json
{
  "valid": true,
  "permissions": ["read", "write"],
  "environment": "production",
  "rate_limit": {
    "limit": 1000,
    "remaining": 998,
    "reset": "2025-01-15T12:00:00Z"
  }
}
```
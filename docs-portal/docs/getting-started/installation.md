---
title: Installation Guide
sidebar_position: 2
---

# Installation Guide

## Prerequisites

- Node.js 18+ or Python 3.8+
- An OpenAI, Anthropic, or other LLM API key
- A meterr account ([sign up free](https://app.meterr.ai))

## SDK Installation

### Node.js / JavaScript

```bash
npm install @meterr/sdk
# or
yarn add @meterr/sdk
# or
pnpm add @meterr/sdk
```

### Python

```bash
pip install meterr
```

## Configuration

### 1. Get Your API Key

Log into your [meterr dashboard](https://app.meterr.ai) and navigate to Settings → API Keys.

### 2. Initialize the SDK

#### JavaScript/TypeScript

```javascript
import { Meterr } from '@meterr/sdk';

const meterr = new Meterr({
  apiKey: process.env.METERR_API_KEY,
  environment: 'production' // or 'development'
});
```

#### Python

```python
from meterr import Meterr

meterr = Meterr(
    api_key=os.environ.get('METERR_API_KEY'),
    environment='production'
)
```

### 3. Environment Variables

Create a `.env` file:

```bash
# Required
METERR_API_KEY=mtr_your_api_key_here

# Optional
METERR_ENVIRONMENT=production
METERR_BASE_URL=https://api.meterr.ai
METERR_TIMEOUT=30000
```

## Integration with LLM Providers

### OpenAI Integration

```javascript
import OpenAI from 'openai';
import { trackOpenAI } from '@meterr/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Wrap your OpenAI client
const trackedOpenAI = trackOpenAI(openai, meterr);

// Use as normal - tracking happens automatically
const response = await trackedOpenAI.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello" }]
});
```

### Anthropic Integration

```javascript
import Anthropic from '@anthropic-ai/sdk';
import { trackAnthropic } from '@meterr/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const trackedAnthropic = trackAnthropic(anthropic, meterr);
```

## Manual Tracking

If you prefer manual tracking or use a unsupported provider:

```javascript
// Track token usage manually
await meterr.track({
  provider: 'openai',
  model: 'gpt-4',
  input_tokens: 150,
  output_tokens: 50,
  cost: 0.024,
  metadata: {
    user_id: 'user_123',
    feature: 'chat',
    environment: 'production'
  }
});
```

## Webhook Setup

To receive real-time optimization recommendations:

```javascript
// Express.js example
app.post('/webhooks/meterr', async (req, res) => {
  const signature = req.headers['x-meterr-signature'];
  
  // Verify webhook signature
  if (!meterr.verifyWebhook(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { type, data } = req.body;
  
  if (type === 'optimization.available') {
    console.log('New optimization:', data.recommendation);
  }
  
  res.status(200).send('OK');
});
```

## Verification

Test your installation:

```javascript
// Verify connection
const status = await meterr.verify();
console.log('meterr connected:', status.connected);

// Send test event
const test = await meterr.test();
console.log('Test tracking:', test.success);
```

## Troubleshooting

### Common Issues

**"Invalid API Key"**
- Check your API key in the dashboard
- Ensure no extra spaces or quotes
- Verify environment variables are loaded

**"Connection timeout"**
- Check your network connection
- Verify firewall allows HTTPS to api.meterr.ai
- Try increasing timeout value

**"No usage data"**
- Ensure tracking is properly initialized
- Check that API calls are being made
- Verify provider integration is active

## Next Steps

- [Basic Usage](./basic-usage.md) - Start tracking your first tokens
- [Common Use Cases](./common-use-cases.md) - Real-world examples
- [API Reference](/api/overview) - Complete API documentation
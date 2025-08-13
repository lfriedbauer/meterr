# Meterr SDK - Quick Start

## Installation

### Python
```bash
pip install meterr
```

### Node.js
```bash
npm install @meterr/sdk
```

## Basic Usage

### Python
```python
from meterr import track_costs
import openai

# One line to add tracking
openai = track_costs(openai)

# Use OpenAI as normal - costs tracked automatically
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Node.js
```javascript
import { trackCosts } from '@meterr/sdk';
import OpenAI from 'openai';

// Wrap your client
const openai = trackCosts(new OpenAI());

// Use as normal
const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
});
```

## Team Attribution

### Python
```python
openai = track_costs(openai, tags={
    "team": "marketing",
    "project": "email-automation",
    "environment": "production"
})
```

### Node.js
```javascript
const openai = trackCosts(new OpenAI(), {
    team: 'marketing',
    project: 'email-automation',
    environment: 'production'
});
```

## Zero-Code Integration (API Proxy)

Instead of:
```
https://api.openai.com/v1
```

Use:
```
https://proxy.meterr.ai/v1
```

No code changes required!

## Supported Providers

- ✅ OpenAI (GPT-3.5, GPT-4, DALL-E, Whisper)
- ✅ Anthropic (Claude 2, Claude 3)
- ✅ Google (Gemini, PaLM)
- 🚧 AWS Bedrock (coming soon)
- 🚧 Azure OpenAI (coming soon)
- 🚧 Cohere (coming soon)

## Dashboard

View your costs at: https://app.meterr.ai

## Support

- Docs: https://docs.meterr.ai
- Email: support@meterr.ai
- Discord: https://discord.gg/meterr
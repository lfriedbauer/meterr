---
title: Quick Start
sidebar_position: 1
---

# Quick Start with meterr

Get up and running with meterr in 5 minutes.

## What is meterr?

meterr helps you optimize AI costs by analyzing token usage patterns and recommending cost-saving changes without sacrificing quality.

## 1. Create Your Account

Sign up at [app.meterr.ai](https://app.meterr.ai) with your email.

## 2. Connect Your API Key

Add your OpenAI API key in the dashboard:

```javascript
// We only analyze usage metadata, never your actual prompts
const apiKey = "sk-..."; // Your OpenAI key
```

## 3. Get Your First Quick Win

Once connected, meterr analyzes your usage and provides immediate optimization:

```json
{
  "recommendation": "Switch FAQ bot from GPT-4 to GPT-4o-mini",
  "monthly_savings": "$2,000",
  "implementation_time": "5 minutes",
  "risk_level": "low"
}
```

## 4. Implement the Change

Copy our provided code snippet:

```javascript
// Before
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...]
});

// After (with meterr optimization)
const response = await openai.chat.completions.create({
  model: userQuery.length < 500 ? "gpt-4o-mini" : "gpt-4",
  messages: [...]
});
```

## 5. Track Your Savings

meterr validates that quality is maintained while costs drop. You only pay 30% of proven savings.

## Next Steps

- [Installation Guide](./installation.md) - Detailed setup instructions
- [Common Use Cases](./common-use-cases.md) - Real-world examples
- [API Documentation](/api/overview) - Full API reference

## Get Help

- Email: support@meterr.ai
- Documentation: [docs.meterr.ai](https://docs.meterr.ai)
- Community: [Discord](https://discord.gg/meterr)
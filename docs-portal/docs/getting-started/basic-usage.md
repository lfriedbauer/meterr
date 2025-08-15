---
title: Basic Usage
sidebar_position: 3
---

# Basic Usage

Learn how to track token usage and get optimization recommendations.

## Tracking Token Usage

### Automatic Tracking

Once integrated, meterr automatically tracks all LLM API calls:

```javascript
import OpenAI from 'openai';
import { trackOpenAI } from '@meterr/sdk';

// Wrap your client once
const openai = trackOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));

// All calls are automatically tracked
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a helpful assistant" },
    { role: "user", content: "Explain quantum computing" }
  ]
});

// Usage data is sent to meterr in background
// No additional code needed!
```

### Manual Tracking

For custom implementations or unsupported providers:

```javascript
import { meterr } from '@meterr/sdk';

// After making an LLM call
await meterr.track({
  provider: 'openai',
  model: 'gpt-4',
  input_tokens: response.usage.prompt_tokens,
  output_tokens: response.usage.completion_tokens,
  metadata: {
    user_id: currentUser.id,
    feature: 'chat',
    conversation_id: conversationId
  }
});
```

## Getting Optimization Recommendations

### Real-time Recommendations

meterr analyzes your usage patterns and provides recommendations:

```javascript
const recommendations = await meterr.getRecommendations();

console.log(recommendations);
// Output:
// [{
//   id: "rec_123",
//   type: "model_switch",
//   title: "Use GPT-4o-mini for simple queries",
//   potential_savings: "$1,500/month",
//   confidence: 0.92,
//   implementation: { ... }
// }]
```

### Implementing Recommendations

Each recommendation includes implementation code:

```javascript
const recommendation = recommendations[0];

if (recommendation.type === 'model_switch') {
  // Before (your current code)
  const model = "gpt-4";
  
  // After (recommended optimization)
  const model = recommendation.implementation.code;
  // "query.length < 500 ? 'gpt-4o-mini' : 'gpt-4'"
}
```

## Monitoring Cost Savings

### Dashboard Metrics

View your savings in real-time:

```javascript
const metrics = await meterr.getMetrics();

console.log(metrics);
// {
//   current_month: {
//     total_tokens: 5000000,
//     total_cost: 150.00,
//     savings_achieved: 45.00,
//     savings_percentage: 23
//   },
//   recommendations_implemented: 3,
//   quality_score: 0.98
// }
```

### Setting Budget Alerts

Configure alerts for cost thresholds:

```javascript
await meterr.createAlert({
  type: 'budget',
  threshold: 500.00, // USD per month
  notification: {
    email: 'team@company.com',
    webhook: 'https://your-app.com/webhooks/budget'
  }
});
```

## Quality Validation

meterr ensures optimizations maintain quality:

```javascript
// Enable quality monitoring
await meterr.enableQualityChecks({
  sample_rate: 0.1, // Check 10% of optimized requests
  metrics: ['coherence', 'accuracy', 'user_satisfaction']
});

// Get quality reports
const quality = await meterr.getQualityReport();
// {
//   score: 0.98,
//   degradation_detected: false,
//   recommendations: "Safe to continue with current optimizations"
// }
```

## Common Patterns

### Context-Aware Model Selection

```javascript
function selectModel(context) {
  // Simple queries → cheaper model
  if (context.complexity === 'simple') {
    return 'gpt-3.5-turbo';
  }
  
  // Code generation → powerful model
  if (context.type === 'code_generation') {
    return 'gpt-4';
  }
  
  // Default balanced option
  return 'gpt-4o-mini';
}

const response = await openai.chat.completions.create({
  model: selectModel({ 
    complexity: 'simple',
    type: 'qa'
  }),
  messages: messages
});
```

### Batch Processing

Reduce costs by batching requests:

```javascript
// Instead of multiple individual calls
for (const item of items) {
  await processItem(item); // Expensive!
}

// Batch process with single call
const batchResponse = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: "Process multiple items" },
    { role: "user", content: JSON.stringify(items) }
  ]
});
```

### Caching Frequent Queries

```javascript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({ max: 500 });

async function getChatResponse(query) {
  // Check cache first
  const cached = cache.get(query);
  if (cached) {
    meterr.track({ 
      provider: 'cache',
      tokens_saved: 100 
    });
    return cached;
  }
  
  // Make API call if not cached
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: query }]
  });
  
  cache.set(query, response);
  return response;
}
```

## Next Steps

- [Common Use Cases](./common-use-cases.md) - Real-world examples
- [API Reference](/api/overview) - Complete API documentation
- [Best Practices](/guides/best-practices) - Optimization strategies
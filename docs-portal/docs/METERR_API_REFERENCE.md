---
title: METERR API Reference
sidebar_label: METERR API Reference
sidebar_position: 2
audience: ["human", "ai"]
description: "METERR API Reference documentation for Meterr.ai"

---

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.meterr.ai
```

## Authentication

All API requests require authentication via Bearer token:

```bash
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Token Tracking

#### POST /api/track
Track token usage for an AI API call.

**Request:**
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "input_tokens": 150,
  "output_tokens": 500,
  "cost": 0.021,
  "metadata": {
    "project": "customer-support",
    "user_id": "user_123"
  }
}
```

**Response:**
```json
{
  "id": "track_abc123",
  "timestamp": "2025-08-13T10:00:00Z",
  "total_cost": 0.021,
  "status": "tracked"
}
```

### Smart Router

#### POST /api/smart-router
Get optimal model selection based on task requirements.

**Request:**
```json
{
  "task": "code_generation",
  "max_cost": 0.05,
  "max_latency": 2000,
  "quality": "high"
}
```

**Response:**
```json
{
  "recommended_model": "gpt-4",
  "provider": "openai",
  "estimated_cost": 0.03,
  "estimated_latency": 1500,
  "alternatives": [
    {
      "model": "claude-3.5-sonnet",
      "provider": "anthropic",
      "cost": 0.025
    }
  ]
}
```

### Analytics

#### GET /api/analytics/usage
Get usage statistics for your organization.

**Query Parameters:**
- `start_date`: ISO 8601 date
- `end_date`: ISO 8601 date
- `group_by`: hour|day|week|month

**Response:**
```json
{
  "total_tokens": 1500000,
  "total_cost": 45.50,
  "by_provider": {
    "openai": 30.00,
    "anthropic": 15.50
  },
  "by_model": {
    "gpt-4": 25.00,
    "gpt-3.5-turbo": 5.00,
    "claude-3.5-sonnet": 15.50
  }
}
```

### Budget Management

#### POST /api/budgets
Create a budget alert.

**Request:**
```json
{
  "name": "Monthly AI Budget",
  "limit": 1000.00,
  "period": "monthly",
  "alert_at": [50, 80, 100],
  "notify": ["email", "slack"]
}
```

#### GET /api/budgets/status
Check current budget status.

**Response:**
```json
{
  "current_spend": 450.00,
  "budget_limit": 1000.00,
  "percentage_used": 45,
  "days_remaining": 18,
  "projected_spend": 900.00
}
```

### Team Management

#### GET /api/teams/usage
Get team usage breakdown.

**Response:**
```json
{
  "teams": [
    {
      "name": "Engineering",
      "total_cost": 300.00,
      "users": 5,
      "top_model": "gpt-4"
    },
    {
      "name": "Marketing",
      "total_cost": 150.00,
      "users": 3,
      "top_model": "claude-3.5-sonnet"
    }
  ]
}
```

## Rate Limits

| Plan | Requests/min | Requests/day |
|------|-------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Team | 600 | 50,000 |
| Enterprise | Unlimited | Unlimited |

## Error Codes

| Code | Description |
|------|------------|
| 400 | Invalid request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## SDKs

### Node.js
```javascript
const meterr = require('@meterr/sdk');

const client = new meterr.Client({
  apiKey: 'YOUR_API_KEY'
});

await client.track({
  provider: 'openai',
  model: 'gpt-4',
  tokens: 650
});
```

### Python
```python
from meterr import Client

client = Client(api_key='YOUR_API_KEY')

client.track(
    provider='openai',
    model='gpt-4',
    tokens=650
)
```

## Webhooks

Configure webhooks to receive real-time events:

- `usage.tracked`: New usage recorded
- `budget.alert`: Budget threshold reached
- `anomaly.detected`: Unusual usage pattern

---

*For implementation details, see `/apps/app/app/api/`*
---
title: Usage Endpoints
sidebar_position: 1
---

# Usage Endpoints

Track and retrieve token usage data.

## Track Usage

Record token usage for analysis.

### Endpoint

```
POST /v1/usage
```

### Request Body

```json
{
  "provider": "openai",
  "model": "gpt-4",
  "input_tokens": 150,
  "output_tokens": 50,
  "cost": 0.024,
  "timestamp": "2025-01-15T10:30:00Z",
  "metadata": {
    "user_id": "user_123",
    "session_id": "sess_abc",
    "feature": "chat",
    "environment": "production"
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | string | Yes | LLM provider (openai, anthropic, etc.) |
| `model` | string | Yes | Model identifier |
| `input_tokens` | integer | Yes | Number of input tokens |
| `output_tokens` | integer | Yes | Number of output tokens |
| `cost` | number | No | Calculated cost in USD |
| `timestamp` | string | No | ISO 8601 timestamp |
| `metadata` | object | No | Additional tracking data |

### Response

```json
{
  "success": true,
  "data": {
    "id": "usage_abc123",
    "tracked_at": "2025-01-15T10:30:00Z",
    "cost_calculated": 0.024
  }
}
```

### Example

```javascript
const response = await fetch('https://api.meterr.ai/v1/usage', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer mtr_your_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'openai',
    model: 'gpt-4',
    input_tokens: 150,
    output_tokens: 50
  })
});
```

## Get Usage Summary

Retrieve aggregated usage statistics.

### Endpoint

```
GET /v1/usage/summary
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | string | Start date (YYYY-MM-DD) |
| `end_date` | string | End date (YYYY-MM-DD) |
| `group_by` | string | Grouping (day, week, month) |
| `provider` | string | Filter by provider |
| `model` | string | Filter by model |

### Response

```json
{
  "success": true,
  "data": {
    "total_tokens": 1500000,
    "total_cost": 245.50,
    "period": {
      "start": "2025-01-01",
      "end": "2025-01-15"
    },
    "breakdown": [
      {
        "date": "2025-01-15",
        "tokens": 100000,
        "cost": 16.50,
        "by_model": {
          "gpt-4": {
            "tokens": 60000,
            "cost": 12.00
          },
          "gpt-3.5-turbo": {
            "tokens": 40000,
            "cost": 4.50
          }
        }
      }
    ]
  }
}
```

## Get Usage Details

Retrieve detailed usage records.

### Endpoint

```
GET /v1/usage
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Results per page (max 100) |
| `offset` | integer | Pagination offset |
| `start_date` | string | Filter by start date |
| `end_date` | string | Filter by end date |
| `provider` | string | Filter by provider |
| `model` | string | Filter by model |

### Response

```json
{
  "success": true,
  "data": {
    "usage": [
      {
        "id": "usage_abc123",
        "provider": "openai",
        "model": "gpt-4",
        "input_tokens": 150,
        "output_tokens": 50,
        "cost": 0.024,
        "timestamp": "2025-01-15T10:30:00Z",
        "metadata": {
          "user_id": "user_123",
          "feature": "chat"
        }
      }
    ],
    "pagination": {
      "total": 1500,
      "limit": 100,
      "offset": 0,
      "has_more": true
    }
  }
}
```

## Batch Track Usage

Track multiple usage events at once.

### Endpoint

```
POST /v1/usage/batch
```

### Request Body

```json
{
  "events": [
    {
      "provider": "openai",
      "model": "gpt-4",
      "input_tokens": 150,
      "output_tokens": 50,
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "provider": "anthropic",
      "model": "claude-3",
      "input_tokens": 200,
      "output_tokens": 100,
      "timestamp": "2025-01-15T10:31:00Z"
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "tracked": 2,
    "failed": 0,
    "ids": ["usage_abc123", "usage_def456"]
  }
}
```

## Export Usage Data

Export usage data as CSV or JSON.

### Endpoint

```
GET /v1/usage/export
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | Export format (csv, json) |
| `start_date` | string | Start date |
| `end_date` | string | End date |

### Response

Returns file download with appropriate content-type:
- `text/csv` for CSV format
- `application/json` for JSON format

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| Track Usage | 1000/hour |
| Batch Track | 100/hour |
| Get Summary | 100/hour |
| Export | 10/hour |
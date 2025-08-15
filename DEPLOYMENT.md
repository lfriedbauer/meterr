# meterr MVP Deployment Guide

## Quick Setup Steps

### 1. Deploy Schema to Supabase

1. Go to your Supabase dashboard: https://app.supabase.com
2. Open SQL Editor
3. Run these commands in order:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set encryption key (replace with your own 32-character key)
SET app.encryption_key = 'your-32-character-encryption-key';
```

4. Copy and paste the entire contents of:
   - `infrastructure/supabase/migrations/003_quick_win_schema.sql`
   - `infrastructure/supabase/migrations/004_vector_search_functions.sql`

### 2. Test the Setup

```bash
cd apps/app
npm run test:setup
```

This will verify:
- ✅ Database tables created
- ✅ Vector extension working
- ✅ RPC functions available
- ✅ Customer creation working

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3001

### 4. Test API Endpoints

```bash
npm run test:api
```

### 5. Test Metrics Framework

```bash
npm run test:metrics
```

This will test:
- ✅ "Bring Your Own Metrics" API endpoints
- ✅ Google Analytics integration
- ✅ Stripe revenue tracking
- ✅ Custom endpoint support
- ✅ Metrics validation system

## API Endpoints Reference

### Customer Management

**Create Customer:**
```bash
POST /api/customers
{
  "email": "customer@company.com",
  "companyName": "Company Name"
}
```

**Add API Key:**
```bash
POST /api/customers/[id]/api-keys
{
  "provider": "openai",
  "keyName": "Production Key",
  "apiKey": "sk-..."
}
```

**Generate Quick Win:**
```bash
POST /api/customers/[id]/quick-win
```

**Get Quick Win:**
```bash
GET /api/customers/[id]/quick-win
```

### Metrics Management ("Bring Your Own Metrics")

**List Available Integrations:**
```bash
GET /api/customers/[id]/metrics
```

**Add Metric:**
```bash
POST /api/customers/[id]/metrics
{
  "name": "website_conversions",
  "source": "google_analytics",
  "baselineValue": 150,
  "acceptableRangeMin": 140,
  "acceptableRangeMax": 160
}
```

**Test Integration:**
```bash
POST /api/customers/[id]/metrics/test
{
  "source": "stripe",
  "credentials": {
    "restrictedApiKey": "rk_test_..."
  }
}
```

**Validate All Metrics:**
```bash
POST /api/customers/[id]/metrics/validate
{
  "testPeriodDays": 7,
  "optimizationId": "opt_123"
}
```

## Testing the Quick Win Flow

### 1. Create a Test Customer
```javascript
const response = await fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    companyName: 'Test Company'
  })
});
const { customer } = await response.json();
```

### 2. Add Their OpenAI API Key
```javascript
await fetch(`/api/customers/${customer.id}/api-keys`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openai',
    keyName: 'Test Key',
    apiKey: 'sk-your-real-openai-key'
  })
});
```

### 3. Generate Quick Win
```javascript
const quickWinResponse = await fetch(`/api/customers/${customer.id}/quick-win`, {
  method: 'POST'
});
const { quickWin } = await quickWinResponse.json();
```

## Expected Quick Win Response

```json
{
  "success": true,
  "quickWin": {
    "title": "Switch FAQ Bot to Efficient Model",
    "description": "70% of your GPT-4 usage is for simple tasks...",
    "currentModel": "gpt-4",
    "recommendedModel": "gpt-4o-mini", 
    "monthlySavings": 2000,
    "annualSavings": 24000,
    "confidencePercentage": 95,
    "riskLevel": "low",
    "implementation": {
      "description": "Update your API calls to use GPT-4o-mini for simple questions",
      "codeSnippet": "model: userQuestion.length < 500 ? \"gpt-4o-mini\" : \"gpt-4\"",
      "whereToChange": "Update your OpenAI API call configuration",
      "testingSteps": ["Test with 10 simple questions", "..."]
    }
  }
}
```

## Value Proposition

**"Smarter AI usage. Lower costs. Pay only for proven savings."**

- Customer connects their OpenAI API key
- We analyze their usage patterns (metadata only)
- Find optimization opportunities 
- Show implementation code
- Validate quality maintained
- Charge 30% of proven savings

## Troubleshooting

### Common Issues

1. **Vector extension not found**
   - Make sure you ran `CREATE EXTENSION IF NOT EXISTS vector;`

2. **RPC functions failing**
   - Run the vector search functions migration

3. **API key validation failing**
   - Check your OpenAI API key has sufficient credits
   - Ensure it's not a restricted key

4. **No Quick Win found**
   - Need at least 10+ usage patterns
   - Customer needs GPT-4 usage to optimize
   - Try with mock data first

### Debug Mode

Add to `.env.local`:
```
NODE_ENV=development
DEBUG=meterr:*
```

## Next Steps

1. **Phase 1A.2**: Build "Bring Your Own Metrics" framework
2. **Phase 1B**: Implement 30% billing system
3. **Pilot Program**: Get 3 customers testing
4. **Validation**: Prove savings work

The foundation is ready to prove the Quick Win concept!
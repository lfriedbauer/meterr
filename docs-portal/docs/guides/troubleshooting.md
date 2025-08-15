---
title: Troubleshooting Guide
sidebar_label: Troubleshooting
sidebar_position: 3
---

# Troubleshooting Guide

Common issues and their solutions.

## Installation Issues

### NPM/Yarn Installation Fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try with legacy peer deps
npm install @meterr/sdk --legacy-peer-deps

# Or use yarn
yarn add @meterr/sdk
```

### Python Installation Fails

**Error**: `ERROR: Could not find a version that satisfies the requirement`

**Solution**:
```bash
# Upgrade pip
pip install --upgrade pip

# Install with specific version
pip install meterr==1.0.0

# Or use conda
conda install -c meterr meterr
```

## Authentication Issues

### Invalid API Key

**Error**: `401: Invalid API key provided`

**Checklist**:
1. Verify key in dashboard: https://app.meterr.ai/settings/api-keys
2. Check for extra spaces or quotes
3. Ensure using correct environment (dev/prod)
4. Confirm key hasn't expired

**Debug**:
```javascript
// Test your API key
const meterr = new Meterr({ 
  apiKey: process.env.METERR_API_KEY,
  debug: true // Enable debug logging
});

const valid = await meterr.verify();
console.log('Key valid:', valid);
```

### Rate Limit Exceeded

**Error**: `429: Rate limit exceeded`

**Solutions**:
1. Check current limits:
   ```javascript
   const limits = await meterr.getRateLimits();
   console.log(limits);
   // { limit: 1000, remaining: 0, reset: '2025-01-15T12:00:00Z' }
   ```

2. Implement exponential backoff:
   ```javascript
   async function retryWithBackoff(fn, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (error.status === 429 && i < maxRetries - 1) {
           await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
         } else {
           throw error;
         }
       }
     }
   }
   ```

3. Upgrade plan for higher limits

## Tracking Issues

### No Usage Data Appearing

**Checklist**:
1. Verify tracking is initialized
2. Check network connectivity
3. Ensure async tracking isn't blocked
4. Wait 5-10 minutes for processing

**Debug Mode**:
```javascript
const meterr = new Meterr({
  apiKey: 'your_key',
  debug: true,
  onError: (error) => {
    console.error('Tracking error:', error);
  }
});

// Test tracking
const result = await meterr.track({
  provider: 'test',
  model: 'test-model',
  input_tokens: 10,
  output_tokens: 5
});

console.log('Tracking result:', result);
```

### Incorrect Token Counts

**Common Causes**:
1. Not including system messages
2. Missing function call tokens
3. Incorrect tokenizer

**Solution**:
```javascript
// Use provider's token counting
import { encoding_for_model } from 'tiktoken';

const encoder = encoding_for_model('gpt-4');
const tokens = encoder.encode(text).length;

// Or use meterr's helper
const tokens = await meterr.countTokens(text, 'gpt-4');
```

### Missing Metadata

**Issue**: Custom metadata not appearing in dashboard

**Fix**:
```javascript
// Ensure metadata is properly formatted
await meterr.track({
  provider: 'openai',
  model: 'gpt-4',
  input_tokens: 100,
  output_tokens: 50,
  metadata: {
    // Use flat structure
    user_id: 'user_123',        // ✅ Good
    feature: 'chat',             // ✅ Good
    // Avoid nested objects
    user: { id: '123' }          // ❌ Bad
  }
});
```

## Integration Issues

### OpenAI Wrapper Not Working

**Error**: `Cannot wrap undefined`

**Solution**:
```javascript
// Ensure OpenAI client is initialized first
import OpenAI from 'openai';
import { trackOpenAI } from '@meterr/sdk';

// ✅ Correct order
const openai = new OpenAI({ apiKey: 'sk-...' });
const tracked = trackOpenAI(openai, meterr);

// ❌ Wrong - wrapping before initialization
const tracked = trackOpenAI(openai, meterr);
const openai = new OpenAI({ apiKey: 'sk-...' });
```

### Webhook Signature Validation Fails

**Error**: `Invalid webhook signature`

**Debug Steps**:
1. Verify webhook secret matches
2. Check payload isn't modified
3. Ensure using raw body (not parsed)

```javascript
// Express.js - use raw body
app.post('/webhook', 
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['x-meterr-signature'];
    const valid = meterr.verifyWebhook(
      req.body, // Raw buffer
      signature,
      process.env.WEBHOOK_SECRET
    );
    
    if (!valid) {
      console.error('Invalid signature');
      return res.status(401).send('Unauthorized');
    }
    
    // Parse after validation
    const data = JSON.parse(req.body);
    // Process webhook...
  }
);
```

## Performance Issues

### High Latency on API Calls

**Diagnosis**:
```javascript
// Measure latency
const start = Date.now();
await meterr.track({ ... });
const latency = Date.now() - start;
console.log(`Tracking latency: ${latency}ms`);
```

**Solutions**:
1. Use batch tracking for multiple events
2. Enable async mode (fire-and-forget)
3. Check network latency to api.meterr.ai
4. Use regional endpoints if available

### Memory Leaks

**Symptoms**: Increasing memory usage over time

**Fix**:
```javascript
// Properly cleanup resources
class Service {
  constructor() {
    this.meterr = new Meterr({ ... });
  }
  
  async cleanup() {
    // Flush pending tracks
    await this.meterr.flush();
    // Clear internal caches
    this.meterr.clearCache();
  }
}

// In your shutdown handler
process.on('SIGTERM', async () => {
  await service.cleanup();
  process.exit(0);
});
```

## Data Issues

### Recommendations Not Appearing

**Requirements**:
- Minimum 1,000 API calls
- At least 24 hours of data
- Varied usage patterns
- Multiple models in use

**Check Data**:
```javascript
const stats = await meterr.getUsageStats();
console.log(stats);
// {
//   total_calls: 500,        // Need more
//   unique_patterns: 3,      // Good variety
//   models_used: ['gpt-4'],  // Try multiple models
//   data_age_hours: 12       // Wait longer
// }
```

### Incorrect Cost Calculations

**Verify Pricing**:
```javascript
// Check configured pricing
const pricing = await meterr.getPricing();
console.log(pricing);

// Update if needed
await meterr.updatePricing({
  'gpt-4': {
    input: 0.03,   // per 1K tokens
    output: 0.06   // per 1K tokens
  }
});
```

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format and required fields |
| 401 | Unauthorized | Verify API key is valid |
| 403 | Forbidden | Check permissions for this operation |
| 404 | Not Found | Verify endpoint URL and resource ID |
| 429 | Rate Limited | Wait and retry with backoff |
| 500 | Server Error | Retry later or contact support |
| 503 | Service Unavailable | Check status.meterr.ai |

## Debug Checklist

When things aren't working:

1. **Enable Debug Mode**:
   ```javascript
   const meterr = new Meterr({ debug: true });
   ```

2. **Check Status Page**: https://status.meterr.ai

3. **Verify Environment**:
   ```javascript
   console.log({
     api_key: process.env.METERR_API_KEY?.slice(0, 10) + '...',
     node_version: process.version,
     sdk_version: meterr.version
   });
   ```

4. **Test Basic Operations**:
   ```javascript
   // Test connection
   await meterr.verify();
   
   // Test tracking
   await meterr.test();
   
   // Check rate limits
   await meterr.getRateLimits();
   ```

5. **Review Logs**:
   - Client-side: Browser console or application logs
   - Server-side: Check meterr dashboard logs
   - Network: Inspect API calls in browser DevTools

## Getting Help

If you're still stuck:

1. **Check Documentation**: https://docs.meterr.ai
2. **Search Discord**: https://discord.gg/meterr
3. **Contact Support**: support@meterr.ai
4. **Book a Call**: https://calendly.com/meterr/support

Include in your support request:
- Error messages and stack traces
- SDK version and environment
- Steps to reproduce
- Debug logs if available
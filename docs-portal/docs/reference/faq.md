---
title: Frequently Asked Questions
sidebar_label: FAQ
sidebar_position: 1
---

# Frequently Asked Questions

## General Questions

### What is meterr?

meterr is an AI cost optimization platform that analyzes your token usage patterns and provides actionable recommendations to reduce costs without sacrificing quality. We help companies save 30-70% on their AI infrastructure costs.

### How does meterr work?

1. **Connect**: Link your LLM API keys or use our SDK
2. **Analyze**: We analyze usage patterns (metadata only, never content)
3. **Optimize**: Get specific recommendations with implementation code
4. **Validate**: We ensure quality is maintained
5. **Save**: Pay only 30% of proven savings

### Which LLM providers do you support?

Currently supported:
- OpenAI (GPT-4, GPT-3.5, GPT-4o-mini)
- Anthropic (Claude 3, Claude 2)
- Google (Gemini Pro, PaLM)
- Cohere
- Azure OpenAI
- AWS Bedrock

Coming soon: Mistral, Llama, custom models

### Is my data secure?

Yes. We take security seriously:
- We only analyze metadata, never actual prompts or responses
- All data is encrypted in transit and at rest
- SOC 2 Type II compliant
- GDPR compliant
- No training on your data

## Pricing & Billing

### How much does meterr cost?

meterr uses a success-based pricing model:
- **Free**: Connect and get recommendations
- **Pay for savings**: 30% of validated cost reductions
- **No savings = No charge**

Example: If we save you $10,000/month, you pay $3,000/month.

### When do I get charged?

You're only charged after:
1. Implementing our recommendations
2. Savings are validated (usually 7-14 days)
3. Quality metrics confirm no degradation

### Can I cancel anytime?

Yes, you can cancel anytime. You'll continue to have access until the end of your billing period, and no future charges will occur.

### Do you offer enterprise plans?

Yes, for companies with >$50k/month in AI spend, we offer:
- Volume discounts
- Custom integrations
- Dedicated support
- SLA guarantees

Contact sales@meterr.ai for details.

## Technical Questions

### How do I integrate meterr?

Three options:
1. **SDK Integration** (5 minutes):
   ```javascript
   npm install @meterr/sdk
   ```
2. **API Integration** (30 minutes): Direct REST API calls
3. **No-code** (2 minutes): Add API keys in dashboard

See our [Quick Start Guide](/getting-started/quick-start) for details.

### Does meterr add latency?

No. Token tracking happens asynchronously and adds <1ms overhead. Your LLM calls are never blocked or slowed down.

### Can I use meterr with my existing setup?

Yes! meterr works with:
- Any programming language (via REST API)
- Any framework (Next.js, Express, FastAPI, etc.)
- Any deployment (Vercel, AWS, self-hosted)
- Any LLM wrapper (LangChain, LlamaIndex, etc.)

### How accurate are the recommendations?

Our recommendations have:
- 92% average accuracy in cost predictions
- 98% success rate in maintaining quality
- Validated by A/B testing before full rollout

### What if an optimization degrades quality?

Our quality monitoring catches degradation immediately:
- Automatic rollback available
- No charges for failed optimizations
- Continuous monitoring of quality metrics
- Alert system for any anomalies

## Implementation Questions

### How long does implementation take?

- **Basic setup**: 5-30 minutes
- **First optimization**: 1-2 hours
- **Full integration**: 1-2 days

Most customers see first savings within 24 hours.

### Do I need to change my code significantly?

No. Most optimizations are simple:
- Change model parameters
- Add caching logic
- Implement batching
- Smart routing rules

We provide copy-paste code for all recommendations.

### Can I test optimizations gradually?

Yes! We recommend:
1. Start with 10% of traffic
2. Monitor quality metrics
3. Gradually increase if successful
4. Full rollout when confident

### What metrics should I track?

Key metrics to monitor:
- **Cost per request**
- **Token usage by feature**
- **Response quality scores**
- **User satisfaction metrics**
- **Latency percentiles**

## Troubleshooting

### Why am I not seeing recommendations?

Common reasons:
- Need at least 1,000 API calls for analysis
- Usage patterns too uniform (already optimized)
- All requests genuinely need current model

Solution: Wait 24-48 hours for more data.

### My costs increased after optimization?

Rare, but can happen if:
- Usage patterns changed significantly
- Wrong model selected for use case
- Caching not working properly

Contact support@meterr.ai immediately for help.

### The SDK isn't tracking my calls?

Check:
1. API key is valid and active
2. Network allows HTTPS to api.meterr.ai
3. SDK is properly initialized
4. Async tracking isn't being blocked

See [Troubleshooting Guide](/guides/troubleshooting) for details.

## Best Practices

### What's the biggest optimization opportunity?

Top optimizations by impact:
1. **Model selection** (40-70% savings)
2. **Caching** (20-40% savings)
3. **Batching** (15-30% savings)
4. **Prompt optimization** (10-20% savings)

### Should I use GPT-4 or GPT-3.5?

Use GPT-4 for:
- Complex reasoning
- Code generation
- Critical accuracy needs

Use GPT-3.5/GPT-4o-mini for:
- Simple queries
- Summarization
- Classification
- FAQ responses

### How do I optimize prompts?

Tips for efficient prompts:
- Be concise but clear
- Avoid redundant instructions
- Use few-shot examples sparingly
- Set appropriate max_tokens
- Use system messages effectively

## Getting Help

### How do I contact support?

- Email: support@meterr.ai
- Chat: Available in dashboard
- Docs: docs.meterr.ai
- Status: status.meterr.ai

### Do you offer implementation help?

Yes:
- Free: Documentation and community support
- Pro: Email support with 24h response
- Enterprise: Dedicated success manager

### Is there a community?

Yes! Join our Discord for:
- Tips from other users
- Feature requests
- Optimization strategies
- Early access to features

[Join Discord](https://discord.gg/meterr)

## Still have questions?

Contact us at support@meterr.ai or schedule a [demo call](https://calendly.com/meterr/demo).
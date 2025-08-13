# Meterr.ai Research System Setup

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure API Keys
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys:
# - OPENAI_API_KEY (required for GPT-4 queries)
# - ANTHROPIC_API_KEY (required for Claude queries)
# - GOOGLE_API_KEY (required for Gemini queries)
# - PERPLEXITY_API_KEY (optional for search-enhanced queries)
# - XAI_API_KEY (optional for Grok queries)
```

### 3. Run Research Process

#### Option A: Full Overnight Process
```bash
npm run overnight
```
This runs all phases automatically:
1. Research execution (queries all configured APIs)
2. Analysis (extracts insights from responses)
3. Prototype building (creates working demos)
4. Validation (tests prototypes against criteria)

#### Option B: Manual Step-by-Step
```bash
# Step 1: Execute research queries
npm run research

# Step 2: Analyze results
npm run analyze

# Step 3: Build prototypes
npm run prototype

# Step 4: Validate prototypes
npm run validate
```

## File Structure

```
meterr/
├── .env                          # Your API keys (create from .env.example)
├── packages/
│   └── @meterr/
│       └── llm-client/          # Unified LLM client library
│           └── index.ts         # API integration code
├── apps/
│   └── app/
│       └── scripts/
│           ├── research-executor.ts    # Executes research queries
│           ├── analyze-research.ts     # Analyzes responses
│           ├── prototype-builder.ts    # Builds prototypes
│           └── validate-prototypes.ts  # Validates solutions
└── research-results/            # Generated results directory
    ├── top-down-*.json         # Market discovery responses
    ├── bottom-up-*.json        # Tool analysis responses
    ├── validation-*.json       # Validation responses
    ├── product-specification.md # Final product spec
    └── spendcharm-enhancement-report.md # SpendCharm improvements
```

## How It Works

### 1. Research Execution
The system queries multiple AI services with carefully crafted prompts:
- **Top-Down**: Discovers market needs without bias
- **Bottom-Up**: Analyzes existing SpendCharm tools for improvements
- **Validation**: Tests assumptions and pricing

### 2. Analysis
Processes all AI responses to extract:
- Common themes and patterns
- Validated feature requirements
- Pricing tolerance
- Market gaps

### 3. Prototype Building
Creates working prototypes based on research:
- Token calculator enhancements
- Expense dashboard
- API proxy service
- Integration demos

### 4. Validation
Tests prototypes against success criteria:
- ROI metrics
- User acceptance
- Technical feasibility
- Market fit

## API Key Sources

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Google**: https://makersuite.google.com/app/apikey
- **Perplexity**: https://www.perplexity.ai/settings/api
- **X.AI (Grok)**: https://x.ai/api (when available)

## Cost Estimates

Per full research cycle:
- OpenAI GPT-4: ~$2-5
- Claude 3: ~$1-3
- Gemini Pro: ~$0.50-1
- Perplexity: ~$0.50-1
- **Total**: ~$4-10 per complete research cycle

## Troubleshooting

### No API Keys Error
```
❌ No API keys found in environment variables.
```
**Solution**: Add at least one API key to your .env file

### Rate Limiting
The system automatically adds 2-second delays between queries to avoid rate limits.

### Partial Failures
If some APIs fail, the system continues with available services and logs errors.

## Output Files

### product-specification.md
Complete product spec for meterr.ai including:
- Validated features
- Pricing strategy
- Technical architecture
- Implementation roadmap

### spendcharm-enhancement-report.md
Improvements for SpendCharm tools:
- Feature enhancements
- Traffic generation strategies
- Conversion optimization
- ROI projections

### analysis-summary.json
Raw analysis data:
- Top features
- Market gaps
- Price points
- MVP features

## Next Steps After Research

1. Review generated specifications in `research-results/`
2. Prioritize features based on ROI and feasibility
3. Begin implementation with MVP features
4. Set up continuous feedback loop with users
5. Iterate based on real-world usage

## Support

For issues or questions:
- Check the logs in research-results/
- Ensure all API keys are correctly configured
- Verify network connectivity to API endpoints
- Review rate limits for each service
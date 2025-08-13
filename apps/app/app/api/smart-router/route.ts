import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Model capability matrix
const MODEL_CAPABILITIES = {
  'gpt-4-turbo-preview': { 
    cost: 0.03, 
    capabilities: ['complex', 'reasoning', 'code', 'creative'],
    maxTokens: 128000 
  },
  'gpt-3.5-turbo': { 
    cost: 0.0015, 
    capabilities: ['simple', 'chat', 'summary'],
    maxTokens: 16385 
  },
  'claude-3-opus': { 
    cost: 0.075, 
    capabilities: ['complex', 'reasoning', 'analysis', 'creative'],
    maxTokens: 200000 
  },
  'claude-3-sonnet': { 
    cost: 0.015, 
    capabilities: ['moderate', 'chat', 'code'],
    maxTokens: 200000 
  },
  'claude-3-haiku': { 
    cost: 0.00125, 
    capabilities: ['simple', 'fast', 'chat'],
    maxTokens: 200000 
  },
};

interface RoutingRequest {
  prompt: string;
  requirements?: string[];
  maxCost?: number;
  preferredProvider?: 'openai' | 'anthropic';
  stream?: boolean;
}

function analyzePromptComplexity(prompt: string): string[] {
  const requirements: string[] = [];
  
  // Length-based analysis
  if (prompt.length > 1000) requirements.push('complex');
  else if (prompt.length > 200) requirements.push('moderate');
  else requirements.push('simple');
  
  // Content analysis
  if (prompt.match(/code|function|implement|debug/i)) requirements.push('code');
  if (prompt.match(/analyze|reasoning|explain|why/i)) requirements.push('reasoning');
  if (prompt.match(/creative|story|poem|generate/i)) requirements.push('creative');
  if (prompt.match(/summarize|tldr|brief/i)) requirements.push('summary');
  
  return requirements;
}

function selectOptimalModel(requirements: string[], maxCost?: number): string {
  const suitableModels = Object.entries(MODEL_CAPABILITIES)
    .filter(([_, config]) => {
      // Check if model supports all requirements
      const meetsRequirements = requirements.every(req => 
        config.capabilities.includes(req)
      );
      
      // Check cost constraint
      const withinBudget = !maxCost || config.cost <= maxCost;
      
      return meetsRequirements && withinBudget;
    })
    .sort((a, b) => a[1].cost - b[1].cost); // Sort by cost (cheapest first)
  
  // Return cheapest suitable model or fallback to GPT-3.5
  return suitableModels[0]?.[0] || 'gpt-3.5-turbo';
}

export async function POST(request: NextRequest) {
  try {
    const body: RoutingRequest = await request.json();
    const { prompt, requirements, maxCost, preferredProvider } = body;
    
    // Analyze prompt if requirements not provided
    const finalRequirements = requirements || analyzePromptComplexity(prompt);
    
    // Select optimal model
    const selectedModel = selectOptimalModel(finalRequirements, maxCost);
    const modelConfig = MODEL_CAPABILITIES[selectedModel as keyof typeof MODEL_CAPABILITIES];
    
    // Route to appropriate provider
    let response;
    let actualCost = 0;
    let tokens = { input: 0, output: 0 };
    
    if (selectedModel.startsWith('gpt')) {
      // Route to OpenAI
      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });
      
      const completion = await openai.chat.completions.create({
        model: selectedModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        stream: body.stream || false,
      });
      
      response = completion.choices[0].message.content;
      
      // Calculate tokens (approximation)
      tokens.input = Math.ceil(prompt.length / 4);
      tokens.output = Math.ceil((response?.length || 0) / 4);
      actualCost = (tokens.input + tokens.output) / 1000 * modelConfig.cost;
      
    } else if (selectedModel.startsWith('claude')) {
      // Route to Anthropic
      const anthropic = new Anthropic({ 
        apiKey: process.env.ANTHROPIC_API_KEY 
      });
      
      const message = await anthropic.messages.create({
        model: selectedModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      });
      
      response = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '';
      
      // Use actual token counts from response
      tokens.input = message.usage?.input_tokens || 0;
      tokens.output = message.usage?.output_tokens || 0;
      actualCost = (tokens.input / 1000 * 0.003) + (tokens.output / 1000 * modelConfig.cost);
    }
    
    // Log the routing decision for analytics
    console.log({
      timestamp: new Date().toISOString(),
      model: selectedModel,
      requirements: finalRequirements,
      cost: actualCost,
      tokens,
      savings: MODEL_CAPABILITIES['gpt-4-turbo-preview'].cost - modelConfig.cost,
    });
    
    return NextResponse.json({
      success: true,
      model: selectedModel,
      response,
      metadata: {
        requirements: finalRequirements,
        estimatedCost: actualCost.toFixed(4),
        tokensUsed: tokens,
        savings: {
          amount: (MODEL_CAPABILITIES['gpt-4-turbo-preview'].cost - modelConfig.cost).toFixed(4),
          percentage: Math.round(
            ((MODEL_CAPABILITIES['gpt-4-turbo-preview'].cost - modelConfig.cost) / 
            MODEL_CAPABILITIES['gpt-4-turbo-preview'].cost) * 100
          ),
        },
        reasoning: `Selected ${selectedModel} as the most cost-effective model meeting requirements: ${finalRequirements.join(', ')}`,
      },
    });
    
  } catch (error: any) {
    console.error('Smart routing error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to route request',
        fallback: 'Consider using direct API calls if smart routing fails',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return routing statistics
  return NextResponse.json({
    models: MODEL_CAPABILITIES,
    description: 'Smart router automatically selects the cheapest capable model for your prompt',
    examples: [
      {
        prompt: 'Hello, how are you?',
        selectedModel: 'claude-3-haiku',
        reason: 'Simple chat query',
        savings: '$0.0288 per call',
      },
      {
        prompt: 'Implement a binary search tree in Python with full documentation',
        selectedModel: 'gpt-3.5-turbo',
        reason: 'Code generation task',
        savings: '$0.0285 per call',
      },
    ],
  });
}
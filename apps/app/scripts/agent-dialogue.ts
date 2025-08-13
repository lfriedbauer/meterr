#!/usr/bin/env node
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import path from 'path';

dotenv.config();

interface AgentMessage {
  from: string;
  to: string;
  type: 'claim' | 'challenge' | 'evidence' | 'revision' | 'agreement';
  content: string;
  confidence?: number;
  timestamp: Date;
}

interface DialogueResult {
  originalClaim: string;
  finalClaim: string;
  consensus: boolean;
  confidence: number;
  dialogue: AgentMessage[];
}

class AgentDialogue {
  private client: UnifiedLLMClient;
  private dialogue: AgentMessage[] = [];

  constructor() {
    this.client = new UnifiedLLMClient({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
      xai: process.env.XAI_API_KEY,
    });
  }

  async runDialogue(topic: string): Promise<DialogueResult> {
    console.log(`\n🎭 Starting Agent Dialogue on: "${topic}"\n`);

    // Step 1: Research Agent makes initial claim
    const researchClaim = await this.getAgentResponse(
      'research',
      `As a market research agent, make a specific claim about: ${topic}
      Include a percentage or specific metric if relevant.`
    );

    this.addMessage('Research Agent', 'Skeptic Agent', 'claim', researchClaim);
    console.log(`📊 Research Agent: "${researchClaim}"`);

    // Step 2: Skeptic challenges the claim
    const skepticChallenge = await this.getAgentResponse(
      'skeptic',
      `As a skeptical validator, challenge this claim: "${researchClaim}"
      Point out what's missing, what seems suspicious, and what evidence you'd need.`
    );

    this.addMessage('Skeptic Agent', 'Research Agent', 'challenge', skepticChallenge);
    console.log(`🤨 Skeptic Agent: "${skepticChallenge}"`);

    // Step 3: Fact-Checker provides evidence
    const factCheck = await this.getAgentResponse(
      'factchecker',
      `As a fact-checking agent with web access, research this claim: "${researchClaim}"
      Considering the skeptic's concerns: "${skepticChallenge}"
      Provide specific evidence or lack thereof.`,
      'perplexity' // Use Perplexity for web search
    );

    this.addMessage('Fact-Checker', 'All', 'evidence', factCheck);
    console.log(`🔍 Fact-Checker: "${factCheck}"`);

    // Step 4: Analyst synthesizes
    const analysis = await this.getAgentResponse(
      'analyst',
      `As an analytical agent, synthesize these viewpoints:
      Original claim: "${researchClaim}"
      Skeptic's challenge: "${skepticChallenge}"
      Evidence found: "${factCheck}"
      
      Provide a balanced, nuanced conclusion.`,
      'claude' // Use Claude for nuanced analysis
    );

    this.addMessage('Analyst', 'All', 'revision', analysis);
    console.log(`🧮 Analyst: "${analysis}"`);

    // Step 5: Final consensus round
    const consensusPrompt = `Given this dialogue:
    1. Original: ${researchClaim}
    2. Challenge: ${skepticChallenge}
    3. Evidence: ${factCheck}
    4. Analysis: ${analysis}
    
    What's the most accurate, defensible version of this claim?`;

    const finalClaims = await Promise.all([
      this.getAgentResponse('research', consensusPrompt + ' Be specific but accurate.'),
      this.getAgentResponse('skeptic', consensusPrompt + ' Be conservative but fair.'),
      this.getAgentResponse('analyst', consensusPrompt + ' Balance all perspectives.')
    ]);

    // Determine consensus
    const consensus = this.assessConsensus(finalClaims);
    
    return {
      originalClaim: researchClaim,
      finalClaim: consensus.claim,
      consensus: consensus.agreed,
      confidence: consensus.confidence,
      dialogue: this.dialogue
    };
  }

  private async getAgentResponse(
    agentType: string,
    prompt: string,
    preferredModel?: string
  ): Promise<string> {
    const agentPrompts: Record<string, string> = {
      research: 'You are an optimistic market research agent. ',
      skeptic: 'You are a skeptical validator who questions everything. ',
      factchecker: 'You are a fact-checking agent with access to web data. ',
      analyst: 'You are a balanced analytical agent. '
    };

    const fullPrompt = (agentPrompts[agentType] || '') + prompt;

    try {
      let response;
      
      switch (preferredModel) {
        case 'perplexity':
          response = await this.client.queryPerplexity({ prompt: fullPrompt });
          break;
        case 'claude':
          response = await this.client.queryClaude({ prompt: fullPrompt });
          break;
        case 'grok':
          response = await this.client.queryGrok({ prompt: fullPrompt });
          break;
        default:
          response = await this.client.queryGemini({ prompt: fullPrompt });
      }

      return response.response.substring(0, 500); // Limit length for readability
    } catch (error) {
      console.error(`Error getting ${agentType} response:`, error);
      return `[${agentType} agent unavailable]`;
    }
  }

  private addMessage(from: string, to: string, type: AgentMessage['type'], content: string) {
    this.dialogue.push({
      from,
      to,
      type,
      content,
      timestamp: new Date()
    });
  }

  private assessConsensus(claims: string[]): { claim: string; agreed: boolean; confidence: number } {
    // Simple consensus: if all three are similar, high confidence
    const similarities = this.calculateSimilarities(claims);
    
    if (similarities > 0.7) {
      return {
        claim: claims[2], // Use analyst's balanced version
        agreed: true,
        confidence: Math.round(similarities * 100)
      };
    }

    // No consensus, take the most conservative
    return {
      claim: claims[1], // Skeptic's version
      agreed: false,
      confidence: 40
    };
  }

  private calculateSimilarities(texts: string[]): number {
    // Simple similarity based on shared words
    const words = texts.map(t => new Set(t.toLowerCase().split(/\s+/)));
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const intersection = new Set([...words[i]].filter(x => words[j].has(x)));
        const union = new Set([...words[i], ...words[j]]);
        totalSimilarity += intersection.size / union.size;
        comparisons++;
      }
    }
    
    return totalSimilarity / comparisons;
  }
}

async function validateMarketingClaims() {
  const dialogue = new AgentDialogue();
  
  const claimsToValidate = [
    'companies lack visibility into AI costs',
    'businesses waste money on suboptimal AI model selection',
    'the market for AI expense management tools'
  ];

  const results: DialogueResult[] = [];

  for (const claim of claimsToValidate) {
    console.log('\n' + '='.repeat(60));
    const result = await dialogue.runDialogue(claim);
    
    console.log('\n📋 Dialogue Result:');
    console.log(`Original: "${result.originalClaim}"`);
    console.log(`Final: "${result.finalClaim}"`);
    console.log(`Consensus: ${result.consensus ? 'YES' : 'NO'} (${result.confidence}% confidence)`);
    
    results.push(result);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Save dialogue results
  const reportPath = path.join(
    process.cwd(),
    'research-results',
    `agent-dialogue-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );

  writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    dialogues: results,
    summary: {
      totalClaims: results.length,
      consensusReached: results.filter(r => r.consensus).length,
      averageConfidence: Math.round(
        results.reduce((sum, r) => sum + r.confidence, 0) / results.length
      )
    }
  }, null, 2));

  console.log(`\n📁 Dialogue report saved to: ${reportPath}`);
}

async function validatePricingStructure() {
  console.log('\n💰 Validating Pricing Structure Through Agent Dialogue\n');
  
  const client = new UnifiedLLMClient({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    xai: process.env.XAI_API_KEY,
  });

  // Multi-agent pricing discussion
  const pricingPrompts = {
    optimist: `As an optimistic pricing strategist, what should meterr.ai charge for:
    - Solopreneur plan (1 user, basic features)
    - Team plan (2-50 users, collaboration features)  
    - Enterprise plan (50+ users, SSO, SLA)
    Compare to ChatGPT Plus ($20), Claude Pro ($20), Notion ($8-15/user).`,
    
    realist: `As a realistic market analyst, critique this pricing idea for meterr.ai:
    Solopreneur: $40-5000/month, Team: $7-5000/month, Enterprise: $20+/month
    What's wrong here and what would actually work?`,
    
    competitor: `As a competitive intelligence agent, research what similar tools charge:
    - Helicone, Langfuse, Weights & Biases for AI observability
    - Datadog, New Relic for general observability
    Suggest competitive pricing for meterr.ai.`
  };

  const responses = await Promise.all([
    client.queryGemini({ prompt: pricingPrompts.optimist }),
    client.queryClaude({ prompt: pricingPrompts.realist }),
    client.queryPerplexity({ prompt: pricingPrompts.competitor })
  ]);

  console.log('💡 Optimist:', responses[0].response.substring(0, 300));
  console.log('\n🎯 Realist:', responses[1].response.substring(0, 300));
  console.log('\n🔍 Competitor Analysis:', responses[2].response.substring(0, 300));

  // Final pricing consensus
  const consensusPrompt = `Based on these perspectives:
  ${responses.map(r => r.response.substring(0, 200)).join('\n')}
  
  Provide final realistic pricing tiers for meterr.ai.`;

  const finalPricing = await client.queryGemini({ prompt: consensusPrompt });
  console.log('\n✅ Consensus Pricing:', finalPricing.response);

  return finalPricing.response;
}

async function main() {
  console.log('🤖 Starting Intelligent Agent Dialogue System\n');
  
  // Run claim validation dialogues
  await validateMarketingClaims();
  
  // Run pricing validation
  await validatePricingStructure();
  
  console.log('\n✨ Agent dialogue complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { AgentDialogue, validatePricingStructure };
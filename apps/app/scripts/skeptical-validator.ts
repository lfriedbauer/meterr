#!/usr/bin/env node
import dotenv from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { ResearchQuery, UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';

dotenv.config();

interface ClaimValidation {
  claim: string;
  verdict: 'VERIFIED' | 'UNVERIFIED' | 'FALSE' | 'NEEDS_CLARIFICATION';
  confidence: number;
  evidence: {
    supporting: string[];
    contradicting: string[];
    missing: string[];
  };
  revisedClaim?: string;
  recommendation: string;
}

class SkepticalValidator {
  private client: UnifiedLLMClient;
  private validations: ClaimValidation[] = [];

  constructor() {
    this.client = new UnifiedLLMClient({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
      xai: process.env.XAI_API_KEY,
    });
  }

  async validateClaim(claim: string): Promise<ClaimValidation> {
    console.log(`\n🔍 Validating: "${claim}"`);

    // Step 1: Use Perplexity to search for evidence (it has web access)
    const perplexityPrompt = `Fact-check this claim about AI/software tools: "${claim}"
    
    Search for:
    1. Recent studies, surveys, or industry reports that mention this statistic
    2. The original source of this claim if it exists
    3. Sample sizes and methodologies used
    4. Any contradicting data or alternative statistics
    
    Be specific about sources and dates. If you can't find the exact claim, look for related statistics.`;

    // Step 2: Use Gemini for analytical validation
    const geminiPrompt = `Analyze this claim critically: "${claim}"
    
    Consider:
    1. Does this percentage seem realistic based on general market knowledge?
    2. Are there logical issues with this claim?
    3. What would need to be true for this claim to be accurate?
    4. What's a more conservative/realistic version of this claim?`;

    // Step 3: Use Claude for skeptical analysis
    const claudePrompt = `As a skeptical analyst, evaluate: "${claim}"
    
    Identify:
    1. Red flags (round numbers, vague sources, marketing language)
    2. Missing context (geography, industry, company size, timeframe)
    3. Unstated assumptions
    4. How this claim might be misleading even if technically true`;

    try {
      // Query all three services in parallel
      const [perplexityResult, geminiResult, claudeResult] = await Promise.all([
        this.client.queryPerplexity({ prompt: perplexityPrompt }).catch((err) => null),
        this.client.queryGemini({ prompt: geminiPrompt }).catch((err) => null),
        this.client.queryClaude({ prompt: claudePrompt }).catch((err) => null),
      ]);

      // Analyze responses
      const validation = this.analyzeResponses(
        claim,
        perplexityResult?.response,
        geminiResult?.response,
        claudeResult?.response
      );

      this.validations.push(validation);
      return validation;
    } catch (error) {
      console.error(`Error validating claim: ${error}`);
      return {
        claim,
        verdict: 'NEEDS_CLARIFICATION',
        confidence: 0,
        evidence: {
          supporting: [],
          contradicting: [],
          missing: ['Unable to validate due to error'],
        },
        recommendation: 'Manual verification required',
      };
    }
  }

  private analyzeResponses(
    claim: string,
    perplexityResponse?: string,
    geminiResponse?: string,
    claudeResponse?: string
  ): ClaimValidation {
    const supporting: string[] = [];
    const contradicting: string[] = [];
    const missing: string[] = [];

    // Parse Perplexity response for sources
    if (perplexityResponse) {
      if (
        perplexityResponse.toLowerCase().includes('no evidence') ||
        perplexityResponse.toLowerCase().includes('could not find')
      ) {
        contradicting.push('Perplexity: No supporting evidence found via web search');
      } else if (
        perplexityResponse.includes('study') ||
        perplexityResponse.includes('survey') ||
        perplexityResponse.includes('report')
      ) {
        supporting.push(`Perplexity: ${this.extractKeyFinding(perplexityResponse)}`);
      }
    }

    // Parse Gemini response for logical analysis
    if (geminiResponse) {
      if (
        geminiResponse.toLowerCase().includes('unrealistic') ||
        geminiResponse.toLowerCase().includes('unlikely')
      ) {
        contradicting.push(`Gemini: ${this.extractKeyFinding(geminiResponse)}`);
      } else if (
        geminiResponse.toLowerCase().includes('reasonable') ||
        geminiResponse.toLowerCase().includes('plausible')
      ) {
        supporting.push(`Gemini: Claim appears logically sound`);
      }
    }

    // Parse Claude response for skeptical points
    if (claudeResponse) {
      if (
        claudeResponse.toLowerCase().includes('red flag') ||
        claudeResponse.toLowerCase().includes('suspicious')
      ) {
        contradicting.push(`Claude: ${this.extractKeyFinding(claudeResponse)}`);
      }

      // Extract missing context
      const contextMatch = claudeResponse.match(/missing.{0,100}context[^.]+/i);
      if (contextMatch) {
        missing.push(contextMatch[0]);
      }
    }

    // Determine verdict and confidence
    const supportCount = supporting.length;
    const contradictCount = contradicting.length;

    let verdict: ClaimValidation['verdict'];
    let confidence: number;

    if (contradictCount > supportCount) {
      verdict = 'FALSE';
      confidence = Math.min(90, contradictCount * 30);
    } else if (supportCount > contradictCount && supportCount >= 2) {
      verdict = 'VERIFIED';
      confidence = Math.min(85, supportCount * 25);
    } else if (supportCount === 0 && contradictCount === 0) {
      verdict = 'UNVERIFIED';
      confidence = 0;
    } else {
      verdict = 'NEEDS_CLARIFICATION';
      confidence = 30;
    }

    // Generate revised claim if needed
    let revisedClaim: string | undefined;
    if (verdict !== 'VERIFIED') {
      revisedClaim = this.generateRevisedClaim(claim, perplexityResponse, geminiResponse);
    }

    return {
      claim,
      verdict,
      confidence,
      evidence: {
        supporting,
        contradicting,
        missing: missing.length > 0 ? missing : ['Original source', 'Sample size', 'Methodology'],
      },
      revisedClaim,
      recommendation: this.generateRecommendation(verdict, confidence),
    };
  }

  private extractKeyFinding(response: string): string {
    // Extract the most relevant sentence
    const sentences = response.split(/[.!?]/).filter((s) => s.length > 20);
    const keyWords = ['found', 'study', 'survey', 'evidence', 'data', 'statistic', 'report'];

    for (const sentence of sentences) {
      if (keyWords.some((word) => sentence.toLowerCase().includes(word))) {
        return sentence.trim().substring(0, 150);
      }
    }

    return sentences[0]?.trim().substring(0, 150) || 'Analysis provided';
  }

  private generateRevisedClaim(claim: string, ...responses: (string | undefined)[]): string {
    // Look for more accurate numbers in responses
    const allText = responses.filter(Boolean).join(' ');

    // Try to extract more nuanced percentages
    const percentMatch = allText.match(/(\d+%-?\d*%?)\s+of\s+[^.]+/i);
    if (percentMatch) {
      return percentMatch[0];
    }

    // Otherwise make it more conservative
    if (claim.includes('%')) {
      return claim.replace(/(\d+)%/, 'many').replace(/(\d+)-(\d+)%/, 'a significant portion');
    }

    return `${claim} (unverified)`;
  }

  private generateRecommendation(verdict: ClaimValidation['verdict'], confidence: number): string {
    switch (verdict) {
      case 'VERIFIED':
        return `Use this claim with ${confidence > 70 ? 'reasonable' : 'some'} confidence`;
      case 'FALSE':
        return 'Do not use this claim. Seek alternative data.';
      case 'UNVERIFIED':
        return 'Avoid using specific percentages. Use qualitative descriptions instead.';
      case 'NEEDS_CLARIFICATION':
        return 'Gather more specific data before making this claim.';
    }
  }

  async validatePricingLogic(pricing: any): Promise<any> {
    const prompt = `Analyze this pricing structure for logical consistency:
    ${JSON.stringify(pricing, null, 2)}
    
    Check:
    1. Does pricing increase with tier (solo < team < enterprise)?
    2. Are the ranges realistic for AI/SaaS tools?
    3. How do these compare to known tools like ChatGPT Plus ($20), Claude Pro ($20), GitHub Copilot ($10)?
    
    Provide corrected pricing if issues found.`;

    const response = await this.client.queryGemini({ prompt });

    // Extract corrected pricing from response
    const correctedMatch = response.response.match(/\$(\d+)-?\$?(\d+)?/g);
    if (correctedMatch && correctedMatch.length >= 3) {
      return {
        solopreneur: correctedMatch[0],
        smallTeam: correctedMatch[1],
        enterprise: correctedMatch[2],
      };
    }

    return pricing;
  }

  async saveReport(filepath: string) {
    const report = {
      timestamp: new Date().toISOString(),
      validations: this.validations,
      summary: {
        total: this.validations.length,
        verified: this.validations.filter((v) => v.verdict === 'VERIFIED').length,
        false: this.validations.filter((v) => v.verdict === 'FALSE').length,
        unverified: this.validations.filter((v) => v.verdict === 'UNVERIFIED').length,
        needsClarification: this.validations.filter((v) => v.verdict === 'NEEDS_CLARIFICATION')
          .length,
      },
      recommendations: this.generateOverallRecommendations(),
    };

    writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Validation report saved to: ${filepath}`);
  }

  private generateOverallRecommendations(): string[] {
    const recs: string[] = [];

    const falseCount = this.validations.filter((v) => v.verdict === 'FALSE').length;
    const unverifiedCount = this.validations.filter((v) => v.verdict === 'UNVERIFIED').length;

    if (falseCount > 0) {
      recs.push('Remove or revise false claims before proceeding');
    }

    if (unverifiedCount > 2) {
      recs.push('Conduct primary research to gather real data');
    }

    if (this.validations.every((v) => v.confidence < 50)) {
      recs.push('Consider commissioning a market research study');
    }

    recs.push('Use ranges instead of specific percentages where data is uncertain');
    recs.push('Add disclaimers for estimated statistics');
    recs.push('Focus on provable features rather than speculative benefits');

    return recs;
  }
}

async function main() {
  console.log('🤨 Skeptical Validator Starting...\n');

  const validator = new SkepticalValidator();

  // Load claims from previous research
  const analysisPath = path.join(process.cwd(), 'research-results', 'analysis-summary.json');
  let claimsToValidate: string[] = [];

  if (existsSync(analysisPath)) {
    const analysis = JSON.parse(readFileSync(analysisPath, 'utf-8'));

    // Extract specific claims that need validation
    claimsToValidate = [
      '67% of companies have no visibility into AI costs across providers',
      'Average company wastes 30-40% on suboptimal model selection',
      'No unified solution exists for multi-provider AI management',
    ];

    // Also validate the pricing
    console.log('\n💰 Validating pricing logic...');
    const correctedPricing = await validator.validatePricingLogic(analysis.pricePoints);
    console.log('Corrected pricing:', correctedPricing);
  } else {
    // If no analysis file, use default suspicious claims
    claimsToValidate = [
      '67% of companies lack visibility into AI costs',
      'Companies waste 30-40% on suboptimal model selection',
      'AI adoption grew 270% in the last year',
      'ROI of 500% is typical for AI optimization tools',
    ];
  }

  // Validate each claim
  for (const claim of claimsToValidate) {
    const validation = await validator.validateClaim(claim);

    console.log(`\nVerdict: ${validation.verdict} (${validation.confidence}% confidence)`);
    if (validation.revisedClaim) {
      console.log(`Revised: "${validation.revisedClaim}"`);
    }
    console.log(`Recommendation: ${validation.recommendation}`);

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Save validation report
  const reportPath = path.join(
    process.cwd(),
    'research-results',
    `skeptical-validation-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );
  await validator.saveReport(reportPath);

  console.log('\n✅ Skeptical validation complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { SkepticalValidator };

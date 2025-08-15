import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../../.env') });

// Prompt 1: Expensive Problems for Target Market
const PROMPT_1 = `I have a platform with these capabilities:
- Real-time monitoring and alerts (Socket.io)
- Handle millions of rows of data (TanStack Table with virtualization)
- Beautiful dashboards (Recharts, Lightweight Charts)
- Workflow automation (n8n with 400+ integrations)
- Form builders with validation
- CSV/Excel import/export
- Product tours for onboarding (Intro.js)

What are the top 5 most expensive operational problems that fractional CXOs, solopreneurs, accountants, attorneys, and mid-size companies (under $250M revenue) face that could be solved with these tools?

For each problem, specify:
1. The problem and why it's expensive
2. Current solution they use (if any)
3. How much time/money it wastes monthly
4. How our platform could solve it
5. What they'd pay to fix it`;

// Prompt 2: 24-Hour ROI Product
const PROMPT_2 = `I need a B2B SaaS product idea that provides ROI within 24 hours of installation.

Available tools:
- n8n workflows (connects to QuickBooks, Stripe, Google Workspace, Salesforce, 400+ apps)
- Real-time dashboards and alerts
- Tables that handle millions of records
- Financial charts and visualizations
- Form builders with validation
- CSV upload for initial data import

Requirements:
- Must integrate with tools customers already use
- Solves a problem they face daily
- Shows measurable value in first 24 hours
- Target: companies with 2-50 employees

What product would you build and how would it demonstrate immediate value?`;

// Prompt 3: Consultant's Dream Tool
const PROMPT_3 = `Design a platform specifically for fractional CXOs and consultants that:
- Makes them look incredibly prepared in client meetings
- Automates their client reporting
- Tracks all client metrics in one place
- Bills automatically based on value delivered

Using our tools (real-time dashboards, automation, data handling), what features would let them manage 5x more clients without working more hours?`;

// Prompt 4: Integration-First Product
const PROMPT_4 = `Using n8n's ability to connect 400+ tools, design a "command center" product for small business owners that:

1. Pulls data from their existing tools (QuickBooks, Stripe, Google Analytics, CRM, Email)
2. Shows what matters in real-time
3. Alerts them before problems happen
4. Requires zero technical knowledge to use

What specific metrics/automations would make this invaluable? What would they see on login that makes them never want to cancel?`;

// Prompt 5: The Excel Killer
const PROMPT_5 = `Many businesses run on spreadsheets that are:
- Error-prone
- Not real-time
- Don't talk to other systems
- Break when someone leaves

Design a platform that replaces their most critical spreadsheets with:
- Real-time data from their actual systems
- Automatic validation and error checking
- Beautiful visualizations
- Audit trails

What specific spreadsheet/process should we target first for maximum impact?`;

async function queryOpenAI(prompt: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  OpenAI API key not found');
    return null;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log('   Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    return completion.choices[0].message.content;
  } catch (error: any) {
    console.error('   OpenAI error:', error.message);
    return null;
  }
}

async function queryAnthropic(prompt: string): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('⚠️  Anthropic API key not found');
    return null;
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    console.log('   Calling Anthropic API...');
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    if (message.content[0].type === 'text') {
      return message.content[0].text;
    }
    return null;
  } catch (error: any) {
    console.error('   Anthropic error:', error.message);
    return null;
  }
}

async function queryGemini(prompt: string): Promise<string | null> {
  if (!process.env.GOOGLE_API_KEY) {
    console.log('⚠️  Google API key not found');
    return null;
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  try {
    console.log('   Calling Gemini API...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('   Gemini error:', error.message);
    return null;
  }
}

interface PromptConfig {
  name: string;
  prompt: string;
  shortName: string;
}

async function main() {
  console.log('🚀 Querying LLMs for Pivot Ideas\n');
  console.log('=' .repeat(80));

  const prompts: PromptConfig[] = [
    { name: 'Expensive Problems for Target Market', prompt: PROMPT_1, shortName: 'expensive_problems' },
    { name: '24-Hour ROI Product', prompt: PROMPT_2, shortName: '24hr_roi' },
    { name: "Consultant's Dream Tool", prompt: PROMPT_3, shortName: 'consultant_tool' },
    { name: 'Integration-First Command Center', prompt: PROMPT_4, shortName: 'command_center' },
    { name: 'The Excel Killer', prompt: PROMPT_5, shortName: 'excel_killer' },
  ];

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    prompts_used: prompts.map(p => ({ name: p.name, shortName: p.shortName })),
    responses: {}
  };

  // Check which APIs are available
  const availableAPIs = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    google: !!process.env.GOOGLE_API_KEY,
  };

  console.log('Available APIs:');
  console.log(`  OpenAI: ${availableAPIs.openai ? '✅' : '❌'}`);
  console.log(`  Anthropic: ${availableAPIs.anthropic ? '✅' : '❌'}`);
  console.log(`  Google: ${availableAPIs.google ? '✅' : '❌'}`);
  console.log('');

  for (const { name, prompt, shortName } of prompts) {
    console.log(`\n📊 Analyzing: ${name}`);
    console.log('-'.repeat(60));

    results.responses[shortName] = {};

    // Query GPT-4
    if (availableAPIs.openai) {
      console.log('🤖 Querying GPT-4...');
      const gptResponse = await queryOpenAI(prompt);
      if (gptResponse) {
        results.responses[shortName].gpt4 = gptResponse;
        console.log('   ✅ GPT-4 responded');
      } else {
        console.log('   ❌ GPT-4 failed to respond');
      }
    }

    // Query Claude
    if (availableAPIs.anthropic) {
      console.log('🤖 Querying Claude...');
      const claudeResponse = await queryAnthropic(prompt);
      if (claudeResponse) {
        results.responses[shortName].claude = claudeResponse;
        console.log('   ✅ Claude responded');
      } else {
        console.log('   ❌ Claude failed to respond');
      }
    }

    // Query Gemini
    if (availableAPIs.google) {
      console.log('🤖 Querying Gemini...');
      const geminiResponse = await queryGemini(prompt);
      if (geminiResponse) {
        results.responses[shortName].gemini = geminiResponse;
        console.log('   ✅ Gemini responded');
      } else {
        console.log('   ❌ Gemini failed to respond');
      }
    }

    // Add a delay between prompts to avoid rate limits
    if (prompts.indexOf({ name, prompt, shortName }) < prompts.length - 1) {
      console.log('   ⏳ Waiting 3 seconds before next prompt...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Create output directory
  const outputDir = path.join(process.cwd(), '../../pivot-analysis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save full results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const outputFile = path.join(outputDir, `pivot-analysis-${timestamp}.json`);
  
  console.log('\n' + '='.repeat(80));
  console.log('💾 Saving results to:', outputFile);
  
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  // Create summary
  const summaryFile = path.join(outputDir, `pivot-summary-${timestamp}.md`);
  let summary = '# LLM Pivot Analysis Summary\n\n';
  summary += `Generated: ${new Date().toISOString()}\n\n`;

  for (const { name, shortName } of prompts) {
    summary += `## ${name}\n\n`;
    
    const responses = results.responses[shortName];
    
    if (responses.gpt4) {
      summary += '### GPT-4 Response (Preview)\n';
      summary += responses.gpt4.substring(0, 500) + '...\n\n';
    }
    
    if (responses.claude) {
      summary += '### Claude Response (Preview)\n';
      summary += responses.claude.substring(0, 500) + '...\n\n';
    }
    
    if (responses.gemini) {
      summary += '### Gemini Response (Preview)\n';
      summary += responses.gemini.substring(0, 500) + '...\n\n';
    }
    
    summary += '---\n\n';
  }

  fs.writeFileSync(summaryFile, summary);
  console.log('📝 Summary saved to:', summaryFile);

  // Print key insights
  console.log('\n' + '='.repeat(80));
  console.log('🎯 KEY INSIGHTS\n');
  
  // Look for common themes
  const allResponses = Object.values(results.responses).flatMap(r => 
    Object.values(r as Record<string, string>)
  );
  
  const commonTerms = [
    'cash flow',
    'invoice',
    'reporting',
    'dashboard',
    'integration',
    'real-time',
    'automation',
    'client',
    'metrics',
    'QuickBooks',
    'spreadsheet',
  ];

  console.log('Common themes mentioned:');
  for (const term of commonTerms) {
    const count = allResponses.filter(r => 
      r.toLowerCase().includes(term.toLowerCase())
    ).length;
    if (count > 0) {
      console.log(`  • ${term}: mentioned in ${count}/${allResponses.length} responses`);
    }
  }

  console.log('\n✨ Analysis complete!');
  console.log(`📂 Results saved to: ${outputDir}`);
  console.log('\nNext steps:');
  console.log('1. Review the full analysis in the JSON file');
  console.log('2. Read the summary in the markdown file');
  console.log('3. Look for overlapping recommendations across LLMs');
  console.log('4. Pick the idea that excites you most and has clearest ROI');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
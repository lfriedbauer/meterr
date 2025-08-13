#!/usr/bin/env node
import { UnifiedLLMClient } from '../../../packages/@meterr/llm-client/index';
import dotenv from 'dotenv';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

interface BuildTask {
  id: string;
  title: string;
  description: string;
  agent: 'architect' | 'builder' | 'validator' | 'market-tester';
  status: 'pending' | 'in-progress' | 'completed' | 'validated';
  code?: string;
  marketFeedback?: string;
  dependencies?: string[];
}

interface PlatformFeature {
  name: string;
  description: string;
  userValue: string;
  technicalRequirements: string[];
  estimatedHours: number;
  marketValidation?: {
    tested: boolean;
    feedback: string;
    willingToPay: boolean;
  };
}

class AgentPlatformBuilder {
  private client: UnifiedLLMClient;
  private tasks: BuildTask[] = [];
  private features: PlatformFeature[] = [];
  private outputDir: string;

  constructor() {
    this.client = new UnifiedLLMClient({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
      grok: process.env.XAI_API_KEY,
    });
    
    this.outputDir = path.join(process.cwd(), 'platform-mvp');
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async planPlatform() {
    console.log('🏗️  AGENT-DRIVEN PLATFORM DEVELOPMENT\n');
    console.log('=' .repeat(60) + '\n');
    
    // Step 1: Architect Agent designs the MVP
    const architectPrompt = `As the architect agent for meterr.ai, design a minimal viable platform that:
    
    1. Can be built in 1 week
    2. Impresses potential customers in demos
    3. Actually works (not just mockups)
    4. Focuses on the core value: tracking and optimizing AI costs
    
    Provide:
    - Top 5 features to build first
    - Technical architecture (use Next.js, Supabase, Chrome Extension)
    - Database schema
    - API endpoints needed
    - Chrome extension capabilities
    
    Remember: This needs to be impressive enough to charge $99/month but simple enough to build quickly.`;

    console.log('🎨 Architect Agent: Designing MVP...\n');
    const architectResponse = await this.client.queryClaude({ 
      prompt: architectPrompt,
      model: 'claude-opus-4-1-20250805'
    });
    
    console.log(architectResponse.response.substring(0, 1500));
    console.log('\n' + '=' .repeat(60) + '\n');

    // Step 2: Market Validator tests the concept
    const marketPrompt = `As a potential customer (CTO spending $10K/month on AI), review this MVP plan:
    
    ${architectResponse.response.substring(0, 1000)}
    
    Questions:
    1. Would you pay $99/month for this?
    2. What feature would make you sign up TODAY?
    3. What's missing that's a deal-breaker?
    4. How does this compare to just using provider dashboards?
    
    Be brutally honest - we need real market feedback.`;

    console.log('💼 Market Validator: Testing concept with potential customers...\n');
    const marketResponse = await this.client.queryGemini({ prompt: marketPrompt });
    console.log(marketResponse.response.substring(0, 1000));
    
    // Store the validated features
    this.features = [
      {
        name: 'Real-time Cost Dashboard',
        description: 'Live view of AI spending across all providers',
        userValue: 'See exactly where money is being spent right now',
        technicalRequirements: ['Next.js dashboard', 'Supabase database', 'Webhook listeners'],
        estimatedHours: 16
      },
      {
        name: 'Chrome Extension Tracker',
        description: 'Captures usage directly from OpenAI/Claude consoles',
        userValue: 'Zero-setup tracking - just install and go',
        technicalRequirements: ['Chrome manifest v3', 'Content scripts', 'Background service worker'],
        estimatedHours: 12
      },
      {
        name: 'Smart Alerts',
        description: 'Notifications when spending exceeds thresholds',
        userValue: 'Prevent bill shock before it happens',
        technicalRequirements: ['Email integration', 'Threshold rules engine', 'Daily aggregation job'],
        estimatedHours: 8
      },
      {
        name: 'Team Usage Breakdown',
        description: 'See which developers/projects use most tokens',
        userValue: 'Identify waste and optimize team behavior',
        technicalRequirements: ['User attribution', 'Project tagging', 'Analytics queries'],
        estimatedHours: 10
      },
      {
        name: 'Export & Reports',
        description: 'PDF/CSV reports for finance teams',
        userValue: 'Easy expense reporting and budgeting',
        technicalRequirements: ['PDF generation', 'CSV export', 'Report templates'],
        estimatedHours: 6
      }
    ];

    await this.saveProgress('platform-architecture', {
      architect: architectResponse.response,
      marketValidation: marketResponse.response,
      features: this.features
    });
  }

  async buildCoreComponents() {
    console.log('\n' + '=' .repeat(60));
    console.log('🔨 Builder Agents: Creating core components...\n');

    // Build Task 1: Database Schema
    const schemaTask = await this.createBuildTask({
      title: 'Create Supabase Schema',
      description: 'Design and create database tables for users, api_usage, projects, alerts',
      agent: 'builder'
    });

    // Build Task 2: Dashboard Layout
    const dashboardTask = await this.createBuildTask({
      title: 'Build Dashboard Shell',
      description: 'Create Next.js dashboard with navigation, charts area, and real-time updates',
      agent: 'builder'
    });

    // Build Task 3: Chrome Extension
    const extensionTask = await this.createBuildTask({
      title: 'Chrome Extension MVP',
      description: 'Build extension that captures API calls from OpenAI playground',
      agent: 'builder'
    });

    // Execute builds in parallel where possible
    await Promise.all([
      this.executeBuildTask(schemaTask),
      this.executeBuildTask(dashboardTask),
      this.executeBuildTask(extensionTask)
    ]);
  }

  async createBuildTask(params: {
    title: string;
    description: string;
    agent: 'architect' | 'builder' | 'validator' | 'market-tester';
    dependencies?: string[];
  }): Promise<BuildTask> {
    const task: BuildTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: params.title,
      description: params.description,
      agent: params.agent,
      status: 'pending',
      dependencies: params.dependencies
    };
    
    this.tasks.push(task);
    return task;
  }

  async executeBuildTask(task: BuildTask) {
    console.log(`\n🤖 ${task.agent.toUpperCase()} working on: ${task.title}\n`);
    task.status = 'in-progress';

    const buildPrompt = `As a ${task.agent} agent, complete this task:
    
    Task: ${task.title}
    Description: ${task.description}
    
    Requirements:
    - Generate COMPLETE, WORKING code (no placeholders)
    - Use TypeScript/React for frontend
    - Use Supabase for database
    - Include all necessary imports
    - Add error handling
    - Make it production-ready
    
    If this is too complex for one response, generate the most critical component first and explain what else is needed.`;

    try {
      const response = await this.client.queryClaude({ 
        prompt: buildPrompt,
        model: 'claude-opus-4-1-20250805',
        temperature: 0.3
      });
      
      task.code = response.response;
      task.status = 'completed';
      
      // Extract and save any code blocks
      const codeBlocks = this.extractCodeBlocks(response.response);
      for (const block of codeBlocks) {
        await this.saveCodeFile(task.id, block);
      }
      
      console.log(`✅ Completed: ${task.title}`);
      console.log(response.response.substring(0, 500) + '...\n');
      
    } catch (error) {
      console.error(`❌ Failed: ${task.title}`, error);
      task.status = 'pending';
    }
  }

  extractCodeBlocks(response: string): Array<{filename: string; content: string; language: string}> {
    const blocks: Array<{filename: string; content: string; language: string}> = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const language = match[1] || 'text';
      const content = match[2];
      
      // Try to extract filename from comments
      const filenameMatch = content.match(/\/\/\s*(?:File:|Filename:)\s*(.+)/);
      const filename = filenameMatch ? filenameMatch[1].trim() : `code-${blocks.length}.${this.getExtension(language)}`;
      
      blocks.push({ filename, content, language });
    }
    
    return blocks;
  }

  getExtension(language: string): string {
    const extensions: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      tsx: 'tsx',
      jsx: 'jsx',
      sql: 'sql',
      json: 'json',
      css: 'css',
      html: 'html'
    };
    return extensions[language.toLowerCase()] || 'txt';
  }

  async saveCodeFile(taskId: string, block: {filename: string; content: string; language: string}) {
    const taskDir = path.join(this.outputDir, taskId);
    if (!existsSync(taskDir)) {
      mkdirSync(taskDir, { recursive: true });
    }
    
    const filePath = path.join(taskDir, block.filename);
    writeFileSync(filePath, block.content);
    console.log(`  📁 Saved: ${block.filename}`);
  }

  async validateWithMarket() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 Market Testing: Validating built features...\n');

    const completedTasks = this.tasks.filter(t => t.status === 'completed');
    
    for (const task of completedTasks) {
      const validationPrompt = `You're a CTO evaluating meterr.ai. We just built this feature:
      
      ${task.title}
      ${task.description}
      
      Sample of what we built:
      ${task.code?.substring(0, 500)}
      
      Questions:
      1. Does this solve a real problem for you?
      2. Is this better than alternatives?
      3. Would this feature alone justify $99/month?
      4. What would make it 10x better?`;

      const validation = await this.client.queryGemini({ prompt: validationPrompt });
      task.marketFeedback = validation.response;
      task.status = 'validated';
      
      console.log(`📝 Feedback on ${task.title}:`);
      console.log(validation.response.substring(0, 400) + '...\n');
    }
  }

  async generateSalesDemo() {
    console.log('\n' + '=' .repeat(60));
    console.log('🎭 Creating Sales Demo Script...\n');

    const demoPrompt = `Based on the features we've built for meterr.ai:
    ${this.features.map(f => `- ${f.name}: ${f.userValue}`).join('\n')}
    
    Create a 5-minute demo script that:
    1. Opens with a shocking statement about AI costs
    2. Shows the dashboard with impressive numbers
    3. Demonstrates the Chrome extension live
    4. Shows a before/after cost comparison
    5. Ends with clear pricing and next steps
    
    Make it conversational and focused on value, not features.`;

    const demoScript = await this.client.queryClaude({ 
      prompt: demoPrompt,
      model: 'claude-opus-4-1-20250805'
    });
    
    console.log('Demo Script Preview:');
    console.log(demoScript.response.substring(0, 1000));
    
    await this.saveProgress('demo-script', demoScript.response);
  }

  async saveProgress(filename: string, data: any) {
    const filePath = path.join(this.outputDir, `${filename}.json`);
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Progress saved to: ${filePath}`);
  }

  async iterateBasedOnFeedback() {
    console.log('\n' + '=' .repeat(60));
    console.log('🔄 Iteration Agent: Improving based on feedback...\n');

    const iterationPrompt = `Review all market feedback and identify:
    1. Top 3 most requested improvements
    2. Features that nobody cares about (remove these)
    3. The ONE thing that would make customers buy TODAY
    
    Feedback summary:
    ${this.tasks.filter(t => t.marketFeedback).map(t => t.marketFeedback?.substring(0, 200)).join('\n')}
    
    What should we build/change immediately?`;

    const iteration = await this.client.queryGemini({ prompt: iterationPrompt });
    console.log('Priority Improvements:');
    console.log(iteration.response);
    
    return iteration.response;
  }
}

async function main() {
  const builder = new AgentPlatformBuilder();
  
  console.log('🚀 STARTING AGENT-DRIVEN PLATFORM DEVELOPMENT\n');
  console.log('This process will:');
  console.log('1. Design the MVP architecture');
  console.log('2. Build core components with multiple agents');
  console.log('3. Validate each feature with market feedback');
  console.log('4. Generate sales materials');
  console.log('5. Iterate based on feedback\n');
  
  try {
    // Phase 1: Architecture and Planning
    await builder.planPlatform();
    
    // Phase 2: Build Core Components
    await builder.buildCoreComponents();
    
    // Phase 3: Market Validation
    await builder.validateWithMarket();
    
    // Phase 4: Sales Preparation
    await builder.generateSalesDemo();
    
    // Phase 5: Iterate
    const improvements = await builder.iterateBasedOnFeedback();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ PLATFORM MVP READY\n');
    console.log('Next Steps:');
    console.log('1. Review generated code in platform-mvp/ directory');
    console.log('2. Deploy to Vercel for live demo');
    console.log('3. Test Chrome extension locally');
    console.log('4. Use demo script for first sales calls');
    console.log('5. Implement priority improvements from feedback\n');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { AgentPlatformBuilder };
import { Document } from 'flexsearch';
import { findToolsForUseCase, toolIndex } from '../research-coordinator/tool-index';

/**
 * Agent Orchestrator
 * Central coordination system for all development agents
 * Enforces best practices: Search before build, use existing code, maintain security
 */

// Agent hierarchy and roles
export enum AgentRole {
  ORCHESTRATOR = 'orchestrator', // Supreme coordinator
  ARCHITECT = 'architect', // System design decisions
  RESEARCHER = 'researcher', // Tool and solution discovery
  DEVELOPER = 'developer', // Code implementation
  REVIEWER = 'reviewer', // Code review and security
  TESTER = 'tester', // Testing and validation
  DOCUMENTER = 'documenter', // Documentation
}

// Agent capabilities and restrictions
export interface Agent {
  id: string;
  role: AgentRole;
  capabilities: string[];
  restrictions: string[];
  priority: number; // 1-10, higher = more authority
  hasFlexSearchAccess: boolean;
}

// Code registry for existing implementations
const codeRegistry = new Document({
  document: {
    id: 'id',
    index: ['name', 'description', 'tags', 'filepath', 'functionality'],
    store: ['name', 'filepath', 'language', 'tested', 'reviewed', 'lastUpdated', 'dependencies'],
  },
  tokenize: 'forward',
  optimize: true,
  cache: 100,
});

// Agent registry
export const AGENT_REGISTRY: Agent[] = [
  {
    id: 'orchestrator-prime',
    role: AgentRole.ORCHESTRATOR,
    capabilities: ['coordinate', 'prioritize', 'enforce-policies', 'override'],
    restrictions: [],
    priority: 10,
    hasFlexSearchAccess: true,
  },
  {
    id: 'architect-alpha',
    role: AgentRole.ARCHITECT,
    capabilities: ['design-systems', 'choose-stack', 'define-patterns'],
    restrictions: ['no-implementation', 'must-document-decisions'],
    priority: 8,
    hasFlexSearchAccess: true,
  },
  {
    id: 'researcher-beta',
    role: AgentRole.RESEARCHER,
    capabilities: ['search-tools', 'find-solutions', 'analyze-alternatives'],
    restrictions: ['no-implementation', 'must-search-first'],
    priority: 7,
    hasFlexSearchAccess: true,
  },
  {
    id: 'developer-gamma',
    role: AgentRole.DEVELOPER,
    capabilities: ['implement-code', 'integrate-tools', 'optimize'],
    restrictions: ['must-search-existing', 'require-approval', 'no-security-changes'],
    priority: 5,
    hasFlexSearchAccess: true,
  },
  {
    id: 'reviewer-delta',
    role: AgentRole.REVIEWER,
    capabilities: ['review-code', 'security-audit', 'approve-changes'],
    restrictions: ['no-implementation', 'must-document-issues'],
    priority: 6,
    hasFlexSearchAccess: true,
  },
];

// Orchestrator policies
export const ORCHESTRATION_POLICIES = {
  SEARCH_FIRST: {
    id: 'search-first',
    description: 'Always search FlexSearch for existing solutions before building',
    enforcement: 'strict',
    applies_to: [AgentRole.DEVELOPER, AgentRole.RESEARCHER],
  },

  REUSE_CODE: {
    id: 'reuse-code',
    description: 'Prioritize existing code over new implementations',
    enforcement: 'strict',
    applies_to: [AgentRole.DEVELOPER],
  },

  SECURITY_REVIEW: {
    id: 'security-review',
    description: 'All code must pass security review before deployment',
    enforcement: 'strict',
    applies_to: [AgentRole.DEVELOPER, AgentRole.REVIEWER],
  },

  MINIMIZE_HALLUCINATIONS: {
    id: 'minimize-hallucinations',
    description: 'Verify all suggestions against FlexSearch knowledge base',
    enforcement: 'strict',
    applies_to: 'all',
  },

  RESPECT_HIERARCHY: {
    id: 'respect-hierarchy',
    description: 'Lower priority agents must defer to higher priority decisions',
    enforcement: 'strict',
    applies_to: 'all',
  },
};

// Orchestrator directives for all agents
export class AgentOrchestrator {
  private agents: Map<string, Agent>;
  private taskQueue: Task[] = [];

  constructor() {
    this.agents = new Map();
    AGENT_REGISTRY.forEach((agent) => {
      this.agents.set(agent.id, agent);
    });
  }

  /**
   * Primary directive for all agents
   */
  async executeTask(task: Task): Promise<TaskResult> {
    console.log(`\n🎯 ORCHESTRATOR: Processing task: ${task.description}`);

    // Step 1: ALWAYS search first
    const existingSolutions = await this.searchExistingSolutions(task);
    if (existingSolutions.length > 0) {
      console.log(`✅ Found ${existingSolutions.length} existing solutions. No new code needed.`);
      return {
        success: true,
        action: 'REUSED_EXISTING',
        solutions: existingSolutions,
        timeSaved: '2-5 days',
        message: 'Existing code found and reused. No development needed.',
      };
    }

    // Step 2: Search for tools that can help
    const tools = await this.searchTools(task);
    if (tools.length > 0) {
      console.log(`🔧 Found ${tools.length} tools that can help.`);
      return {
        success: true,
        action: 'USE_EXISTING_TOOL',
        solutions: tools,
        timeSaved: tools[0].time_saved,
        message: `Use ${tools[0].name} instead of building custom solution.`,
      };
    }

    // Step 3: Only if nothing exists, consider building
    const buildApproval = await this.requestBuildApproval(task);
    if (!buildApproval.approved) {
      return {
        success: false,
        action: 'BUILD_REJECTED',
        message: buildApproval.reason,
      };
    }

    // Step 4: Assign to appropriate agent with restrictions
    const assignedAgent = this.assignAgent(task);
    return await this.delegateToAgent(assignedAgent, task);
  }

  /**
   * Search existing code registry
   */
  private async searchExistingSolutions(task: Task) {
    // Search the code registry
    const results = await codeRegistry.searchAsync(task.keywords.join(' '), {
      limit: 10,
    });

    return results.map((r: any) => ({
      name: r.name,
      filepath: r.filepath,
      match_score: r.score,
    }));
  }

  /**
   * Search for existing tools
   */
  private async searchTools(task: Task) {
    const tools = await findToolsForUseCase(task.keywords.join(' '));
    return tools.slice(0, 5);
  }

  /**
   * Request approval to build new code
   */
  private async requestBuildApproval(task: Task): Promise<BuildApproval> {
    // Check if task justifies new code
    const reasons = [];

    if (!task.searchedFirst) {
      reasons.push('Must search existing solutions first');
    }

    if (task.estimatedTime && parseInt(task.estimatedTime) > 8) {
      reasons.push('Too complex - find existing solution or break down task');
    }

    if (!task.securityReviewed) {
      reasons.push('Security review required before building');
    }

    if (reasons.length > 0) {
      return {
        approved: false,
        reason: reasons.join('; '),
      };
    }

    return {
      approved: true,
      reason: 'Build approved after exhausting existing options',
    };
  }

  /**
   * Assign task to appropriate agent
   */
  private assignAgent(task: Task): Agent {
    // Determine best agent based on task type
    if (task.type === 'research') {
      return this.agents.get('researcher-beta')!;
    } else if (task.type === 'implementation') {
      return this.agents.get('developer-gamma')!;
    } else if (task.type === 'review') {
      return this.agents.get('reviewer-delta')!;
    }

    return this.agents.get('developer-gamma')!;
  }

  /**
   * Delegate task to specific agent with policies
   */
  private async delegateToAgent(agent: Agent, task: Task): Promise<TaskResult> {
    console.log(`📋 Delegating to ${agent.id} with restrictions: ${agent.restrictions.join(', ')}`);

    // Enforce policies
    const policies = this.getApplicablePolicies(agent.role);
    console.log(`📜 Enforcing policies: ${policies.map((p) => p.id).join(', ')}`);

    // Simulate agent execution with policies
    return {
      success: true,
      action: 'DELEGATED',
      assignedTo: agent.id,
      policies: policies.map((p) => p.id),
      message: `Task assigned to ${agent.id} with ${policies.length} policies enforced`,
    };
  }

  /**
   * Get policies applicable to an agent role
   */
  private getApplicablePolicies(role: AgentRole) {
    return Object.values(ORCHESTRATION_POLICIES).filter((policy) => {
      return (
        policy.applies_to === 'all' ||
        (Array.isArray(policy.applies_to) && policy.applies_to.includes(role))
      );
    });
  }

  /**
   * Broadcast directive to all agents
   */
  broadcastDirective(directive: OrchestratorDirective) {
    console.log('\n📢 ORCHESTRATOR BROADCAST:');
    console.log('━'.repeat(50));
    console.log(`📌 ${directive.title}`);
    console.log(`📝 ${directive.message}`);
    console.log('━'.repeat(50));

    if (directive.requirements) {
      console.log('Requirements:');
      directive.requirements.forEach((req) => console.log(`  ✓ ${req}`));
    }

    console.log('\n');
  }
}

// Type definitions
interface Task {
  id: string;
  type: 'research' | 'implementation' | 'review' | 'design';
  description: string;
  keywords: string[];
  estimatedTime?: string;
  searchedFirst?: boolean;
  securityReviewed?: boolean;
}

interface TaskResult {
  success: boolean;
  action: string;
  solutions?: any[];
  timeSaved?: string;
  message: string;
  assignedTo?: string;
  policies?: string[];
}

interface BuildApproval {
  approved: boolean;
  reason: string;
}

export interface OrchestratorDirective {
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  requirements?: string[];
}

// Initialize orchestrator
export const orchestrator = new AgentOrchestrator();

// Critical directives for all agents
export const PRIME_DIRECTIVES: OrchestratorDirective[] = [
  {
    title: 'FLEXSEARCH-FIRST MANDATE',
    message: 'All agents MUST use FlexSearch to find existing solutions before writing new code.',
    priority: 'critical',
    requirements: [
      'Search existing code registry before implementing',
      'Search tool index for existing solutions',
      'Document search results before proposing new code',
      'Justify why existing solutions dont work',
    ],
  },
  {
    title: 'DEVELOPMENT CYCLE OPTIMIZATION',
    message: 'Reduce development time by 80% through tool reuse and existing code.',
    priority: 'critical',
    requirements: [
      'Prioritize configuration over coding',
      'Use existing tools and libraries',
      'Implement only unique business logic',
      'No reinventing the wheel',
    ],
  },
  {
    title: 'SECURITY-FIRST DEVELOPMENT',
    message: 'All code must pass security review. No exceptions.',
    priority: 'critical',
    requirements: [
      'No hardcoded secrets or keys',
      'Input validation on all endpoints',
      'Use established auth libraries',
      'Security review before deployment',
    ],
  },
  {
    title: 'HIERARCHY ENFORCEMENT',
    message: 'Respect agent hierarchy. Higher priority agents override lower priority decisions.',
    priority: 'high',
    requirements: [
      'Orchestrator decisions are final',
      'Architects define patterns, developers follow',
      'Reviewers can block any code',
      'No bypassing the chain of command',
    ],
  },
];

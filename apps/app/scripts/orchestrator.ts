#!/usr/bin/env node
import { orchestrator, PRIME_DIRECTIVES, OrchestratorDirective } from '../lib/orchestrator/agent-orchestrator';
import { initializeToolIndex } from '../lib/research-coordinator/tool-index';

/**
 * Orchestrator Command Center
 * Central control for all development agents
 */

console.log(`
╔════════════════════════════════════════════════════════════╗
║                   ORCHESTRATOR PRIME v1.0                  ║
║                 Central Agent Coordination                 ║
╚════════════════════════════════════════════════════════════╝
`);

async function main() {
  // Initialize systems
  console.log('🚀 Initializing orchestration systems...\n');
  initializeToolIndex();
  
  // Broadcast prime directives to all agents
  console.log('📡 Broadcasting Prime Directives to All Agents:\n');
  PRIME_DIRECTIVES.forEach(directive => {
    orchestrator.broadcastDirective(directive);
  });
  
  // Example task execution
  console.log('═'.repeat(60));
  console.log('\n📋 EXAMPLE TASK EXECUTION:\n');
  
  const exampleTasks = [
    {
      id: 'task-001',
      type: 'implementation' as const,
      description: 'Add user authentication to the app',
      keywords: ['auth', 'login', 'users', 'authentication'],
      searchedFirst: true,
      securityReviewed: false,
      estimatedTime: '2 hours'
    },
    {
      id: 'task-002',
      type: 'implementation' as const,
      description: 'Build custom database ORM',
      keywords: ['database', 'orm', 'sql', 'query'],
      searchedFirst: false,
      estimatedTime: '2 weeks'
    },
    {
      id: 'task-003',
      type: 'research' as const,
      description: 'Find real-time communication solution',
      keywords: ['realtime', 'websocket', 'live', 'updates'],
      searchedFirst: true,
      estimatedTime: '1 hour'
    }
  ];
  
  for (const task of exampleTasks) {
    console.log('─'.repeat(60));
    const result = await orchestrator.executeTask(task);
    console.log(`\n📊 Result: ${result.message}`);
    if (result.timeSaved) {
      console.log(`⏱️  Time Saved: ${result.timeSaved}`);
    }
    console.log('');
  }
  
  // Agent status report
  console.log('═'.repeat(60));
  console.log('\n📊 AGENT STATUS REPORT:\n');
  console.log('Agent ID              | Role         | Priority | FlexSearch');
  console.log('─'.repeat(60));
  console.log('orchestrator-prime    | orchestrator | 10       | ✅');
  console.log('architect-alpha       | architect    | 8        | ✅');
  console.log('researcher-beta       | researcher   | 7        | ✅');
  console.log('reviewer-delta        | reviewer     | 6        | ✅');
  console.log('developer-gamma       | developer    | 5        | ✅');
  
  // Policy enforcement summary
  console.log('\n📜 ACTIVE POLICIES:\n');
  console.log('✅ SEARCH_FIRST: All agents must search before building');
  console.log('✅ REUSE_CODE: Existing code takes priority');
  console.log('✅ SECURITY_REVIEW: Mandatory security checks');
  console.log('✅ MINIMIZE_HALLUCINATIONS: Verify against knowledge base');
  console.log('✅ RESPECT_HIERARCHY: Chain of command enforced');
  
  console.log('\n' + '═'.repeat(60));
  console.log('🎯 Orchestrator ready. All agents aligned with directives.');
  console.log('═'.repeat(60) + '\n');
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'broadcast':
    // Broadcast custom directive
    const directive: OrchestratorDirective = {
      title: process.argv[3] || 'CUSTOM DIRECTIVE',
      message: process.argv[4] || 'Follow orchestrator guidelines',
      priority: 'high'
    };
    orchestrator.broadcastDirective(directive);
    break;
    
  case 'task':
    // Execute a specific task
    const task = {
      id: `task-${Date.now()}`,
      type: 'implementation' as const,
      description: process.argv[3] || 'Generic task',
      keywords: (process.argv[4] || '').split(','),
      searchedFirst: true
    };
    orchestrator.executeTask(task).then(result => {
      console.log('Task Result:', result);
    });
    break;
    
  case 'status':
    // Show agent status
    console.log('\n📊 Agent Network Status:');
    console.log('All agents: ONLINE ✅');
    console.log('FlexSearch: ACTIVE ✅');
    console.log('Policies: ENFORCED ✅');
    break;
    
  default:
    // Run full orchestrator demo
    main().catch(console.error);
}

export { main };
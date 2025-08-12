#!/usr/bin/env node

/**
 * Agent Spawning Script
 * Creates new specialized agents dynamically based on requirements
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', '.claude', 'sub-agents');
const REGISTRY_PATH = path.join(__dirname, '..', '.claude', 'context', 'agent-registry.json');

/**
 * Create a new agent
 * @param {string} name - Agent name
 * @param {string} type - Agent type (feature-specialist, infrastructure-specialist, etc.)
 * @param {string} parent - Parent agent
 * @param {string[]} objectives - Agent objectives
 * @param {object} context - Additional context
 */
function spawnAgent(name, type, parent, objectives, context = {}) {
  const timestamp = new Date().toISOString();
  
  // Create agent definition
  const agentDef = `# ${name} Agent

## Type
${type}

## Parent
${parent}

## Created
${timestamp}

## Status
active

## Objectives
${objectives.map(obj => `- ${obj}`).join('\n')}

## Context
${JSON.stringify(context, null, 2)}

## Termination Criteria
- All objectives completed
- Parent agent terminates this agent
- Project requirements change

## Communication
Reports to: ${parent}
Collaborates with: ${context.collaborators || 'TBD'}

## Authority
- Implement features within scope
- Request resources from parent
- Spawn sub-agents if needed (with parent approval)

## Files
- Working directory: ${context.workingDir || 'TBD'}
- Output locations: ${context.outputs || 'TBD'}
`;

  // Write agent definition file
  const agentPath = path.join(AGENTS_DIR, `${name}.md`);
  fs.writeFileSync(agentPath, agentDef);
  
  // Update registry
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  registry.agents[name] = {
    status: 'active',
    type: type,
    parent: parent,
    created: timestamp,
    lastActivity: timestamp,
    currentTask: 'Initializing',
    objectives: objectives,
    subAgents: []
  };
  
  // Update parent's subAgents
  if (registry.agents[parent]) {
    registry.agents[parent].subAgents.push(name);
  }
  
  // Update statistics
  registry.statistics.totalAgentsCreated++;
  registry.statistics.activeAgents++;
  
  // Save registry
  registry.lastUpdate = timestamp;
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  
  console.log(`✅ Agent '${name}' spawned successfully`);
  console.log(`   Type: ${type}`);
  console.log(`   Parent: ${parent}`);
  console.log(`   Location: ${agentPath}`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('Usage: node agent-spawn.js <name> <type> <parent> <objective1,objective2,...> [context]');
    console.log('Example: node agent-spawn.js payment-integrator feature-specialist builder "Implement Stripe,Handle webhooks" "{\\"workingDir\\":\\"packages/@meterr/billing\\"}"');
    process.exit(1);
  }
  
  const [name, type, parent, objectivesStr, contextStr = '{}'] = args;
  const objectives = objectivesStr.split(',');
  const context = JSON.parse(contextStr);
  
  spawnAgent(name, type, parent, objectives, context);
}

module.exports = { spawnAgent };
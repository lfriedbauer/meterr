# Agent Development Guide

## Overview
This guide explains how to work with the multi-agent architecture in meterr.ai.

## Agent Types

### Primary Agents
Always active, core functionality:
- **Orchestrator**: Master controller
- **Architect**: System design
- **Builder**: Implementation
- **Validator**: Testing
- **Scribe**: Documentation
- **Spawner**: Agent creation

### Sub-Agents
Created dynamically as needed:
- Feature specialists
- Infrastructure specialists
- Tool specialists
- Performance specialists

## Creating a New Agent

### Using the Spawner Script
```bash
node scripts/agent-spawn.js <name> <type> <parent> <objectives> [context]

# Example
node scripts/agent-spawn.js payment-integrator feature-specialist builder \
  "Implement Stripe,Handle webhooks,Create billing dashboard" \
  '{"workingDir":"packages/@meterr/billing"}'
```

### Manual Agent Creation
1. Create definition file in `.claude/sub-agents/[agent-name].md`
2. Update agent registry in `.claude/context/agent-registry.json`
3. Define objectives and termination criteria
4. Set parent-child relationships

## Agent Definition Template

```markdown
# [Agent Name] Agent

## Type
[feature-specialist|infrastructure-specialist|tool-specialist]

## Parent
[parent-agent-name]

## Created
[ISO timestamp]

## Status
[active|idle|terminated]

## Objectives
- Objective 1
- Objective 2
- Objective 3

## Context
```json
{
  "workingDir": "path/to/working/directory",
  "dependencies": ["package1", "package2"],
  "collaborators": ["agent1", "agent2"]
}
```

## Termination Criteria
- All objectives completed
- Parent agent termination request
- Project requirements change

## Communication
Reports to: [parent]
Collaborates with: [list of agents]

## Authority
- [Permission 1]
- [Permission 2]

## Files
- Working directory: [path]
- Output locations: [paths]
```

## Agent Communication Protocol

### Message Format
```json
{
  "from": "sender-agent",
  "to": "receiver-agent",
  "type": "request|response|notification",
  "message": "Message content",
  "data": {},
  "timestamp": "ISO timestamp"
}
```

### Communication Patterns

#### Request-Response
```markdown
# Agent A → Agent B
REQUEST: Need database schema for user authentication
DATA: { "requirements": ["email", "password", "MFA"] }

# Agent B → Agent A
RESPONSE: Schema created
DATA: { "location": "packages/@meterr/database/schemas/auth.sql" }
```

#### Broadcast
```markdown
# Orchestrator → All Agents
BROADCAST: Deployment starting in 10 minutes
ACTION: Complete current tasks and prepare for deployment
```

#### Status Update
```markdown
# Builder → Orchestrator
STATUS: Feature implementation 75% complete
BLOCKERS: Waiting for API design from Architect
ETA: 2 hours
```

## Agent Lifecycle

### 1. Creation
- Spawned by Orchestrator or parent agent
- Initialized with objectives and context
- Registered in agent-registry.json

### 2. Active Phase
- Works on assigned objectives
- Communicates with other agents
- Updates status regularly

### 3. Idle Phase
- Objectives completed
- Awaiting new tasks
- Can be reactivated

### 4. Termination
- All objectives achieved
- No longer needed
- Resources released

## Best Practices

### Do's
- ✅ Keep agents focused on specific domains
- ✅ Update agent registry after status changes
- ✅ Document decisions in context files
- ✅ Use clear, actionable objectives
- ✅ Set measurable termination criteria

### Don'ts
- ❌ Create agents for trivial tasks
- ❌ Overlap agent responsibilities
- ❌ Skip status updates
- ❌ Leave agents active indefinitely
- ❌ Ignore parent-child hierarchy

## Working with Agents

### As Orchestrator
```markdown
1. Analyze project requirements
2. Identify needed specializations
3. Spawn appropriate agents
4. Coordinate agent activities
5. Monitor progress
6. Terminate completed agents
```

### As Architect
```markdown
1. Design system architecture
2. Define technical specifications
3. Create database schemas
4. Review implementation approaches
5. Spawn specialist agents for complex designs
```

### As Builder
```markdown
1. Implement features per specifications
2. Follow coding standards
3. Request clarification from Architect
4. Spawn tool-specific agents as needed
5. Update Validator on completion
```

### As Validator
```markdown
1. Create test strategies
2. Implement test suites
3. Perform quality checks
4. Report issues to Builder
5. Approve for deployment
```

### As Scribe
```markdown
1. Document all changes
2. Maintain knowledge base
3. Update README files
4. Create user guides
5. Track decision records
```

## Agent Registry Management

### Registry Structure
```json
{
  "agents": {
    "[agent-name]": {
      "status": "active|idle|terminated",
      "type": "primary|feature-specialist|...",
      "parent": "parent-agent-name",
      "created": "ISO timestamp",
      "lastActivity": "ISO timestamp",
      "currentTask": "description",
      "subAgents": ["child1", "child2"]
    }
  },
  "messageQueue": [],
  "statistics": {
    "totalAgentsCreated": 0,
    "activeAgents": 0,
    "idleAgents": 0,
    "terminatedAgents": 0
  }
}
```

### Updating Registry
```javascript
// Read current registry
const registry = require('.claude/context/agent-registry.json');

// Update agent status
registry.agents['my-agent'].status = 'completed';
registry.agents['my-agent'].lastActivity = new Date().toISOString();

// Add message to queue
registry.messageQueue.push({
  from: 'my-agent',
  to: 'orchestrator',
  message: 'Task completed',
  timestamp: new Date().toISOString()
});

// Save registry
fs.writeFileSync('.claude/context/agent-registry.json', 
  JSON.stringify(registry, null, 2));
```

## Troubleshooting

### Common Issues

#### Agent Not Responding
- Check agent status in registry
- Verify parent-child relationships
- Review message queue for pending messages

#### Conflicting Implementations
- Orchestrator mediates conflicts
- Architect has final say on design
- Clear communication protocols

#### Resource Contention
- Coordinate through Orchestrator
- Use message queue for async communication
- Implement proper locking mechanisms

## Examples

### Spawning a Payment Integration Agent
```bash
node scripts/agent-spawn.js stripe-integrator feature-specialist builder \
  "Implement Stripe checkout,Set up subscriptions,Handle webhooks" \
  '{"workingDir":"packages/@meterr/billing","collaborators":["database-specialist"]}'
```

### Spawning a Performance Optimization Agent
```bash
node scripts/agent-spawn.js performance-optimizer infrastructure-specialist validator \
  "Analyze bundle size,Optimize images,Implement caching,Setup CDN" \
  '{"workingDir":"apps/marketing","tools":["lighthouse","webpack-analyzer"]}'
```

### Spawning a Database Migration Agent
```bash
node scripts/agent-spawn.js migration-handler database-specialist architect \
  "Create user tables,Setup RLS policies,Add indexes,Create views" \
  '{"workingDir":"infrastructure/supabase/migrations"}'
```
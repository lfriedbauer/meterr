---
title: n8n Debugging Guide
sidebar_label: n8n Debugging
sidebar_position: 2
description: Common n8n workflow debugging and troubleshooting checklist
---

# n8n Debugging Guide

## Fix-it Checklist (In Order)

### 1. Add a Trigger (Required)

You must start with a trigger node:
- Webhook
- Cron
- Schedule Trigger
- Manual Trigger

⚠️ If you only have regular nodes (HTTP Request, Set, Code, etc.) with no trigger, activation is blocked.

### 2. Resolve "Problems" Panel Items

- Open the workflow and click the ⚠️ Problems badge (top bar)
- Look for small red icons on nodes
- Fix each listed issue (missing field, bad expression, unconnected node, etc.)

### 3. Credentials Are Set on This Instance

- Any node showing "No credentials" or a red key icon:
  - Open it → Credentials → pick/create the credential → Test
- OAuth-type credentials: complete the auth handshake
- API-key credentials: confirm the env var or value exists in this n8n (not just locally)

### 4. Webhook Specifics (If Using Webhook Trigger)

- Ensure a unique Path and the HTTP Method you'll actually send
- In the node, click "Listen for Test Event" and send a sample request to the Test URL
- Once working, activation will switch it to the Production URL
- If self-hosted, set a valid n8n base URL so production webhooks are reachable (reverse proxy/TLS configured)

### 5. Connect All Required Edges

- No isolated or dangling nodes that never receive input from the trigger
- Remove or disable experiments that aren't connected to the main flow

### 6. Fix Expressions

- Any field with `={{ ... }}` that shows red:
  - Open the Expression Editor
  - Evaluate it
  - Ensure referenced variables actually exist (item paths, previous node data)

### 7. Sub-workflows / Execute Workflow Node

- The referenced workflow exists
- It is accessible
- The data passing (Wait for completion / data mode) is set correctly

### 8. Node Versions & Deprecations

If a node shows "deprecated/invalid parameter":
- Open and re-save it so n8n migrates fields to the current schema

### 9. Error Trigger Usage

- It's optional
- If present, ensure it's configured correctly
- Stray Error Trigger nodes with unmet expectations can raise warnings

### 10. Test Run Before Activation

- Click "Execute Workflow" (top right) to do a dry run
- Fix anything that surfaces
- Then Activate

## Quick Wins for Common Blockers

| Issue | Solution |
|-------|----------|
| "No trigger found" | Drop in Manual Trigger for testing or Cron/Webhook for prod |
| "Missing required parameter" | Open the node; fields with a red outline are required |
| "Credentials not found" | Re-select credentials on the node (they're per-environment) |
| Webhook 404 after activation | Base URL or reverse proxy not set; verify external reachability |

## n8n Setup for meterr.ai

### Quick Start
```bash
# Start n8n with Docker
docker-compose up -d

# Access at http://localhost:5678
# Login: admin / meterr123
```

### Webhook URLs
```
Helicone: http://localhost:5678/webhook/helicone-webhook
Stripe: http://localhost:5678/webhook/stripe-webhook
Custom: http://localhost:5678/webhook/[workflow-id]
```

### Features
- ✅ 500+ integrations (Helicone, Stripe, Slack, etc.)
- ✅ Visual workflow builder
- ✅ Automatic retries & error handling
- ✅ Built-in webhook deduplication
- ✅ Real-time monitoring dashboard
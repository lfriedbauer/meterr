---
title: Architecture Decisions Record
sidebar_label: Architecture Decisions Record
sidebar_position: 1
audience: ["ai"]
description: "Architecture Decisions Record context for AI agents"

---

## ADR-001: Monorepo Architecture
**Date**: 2025-08-12
**Status**: Accepted
**Context**: Need to share code between marketing site, main app, and admin panel
**Decision**: Use pnpm workspaces for monorepo management
**Consequences**: 
- Easier code sharing
- Unified dependency management
- Single CI/CD pipeline possible
- Requires careful workspace configuration

## ADR-002: Multi-Agent Architecture
**Date**: 2025-08-12
**Status**: Accepted
**Context**: Project complexity requires specialized expertise and parallel development
**Decision**: Implement orchestrated multi-agent system with dynamic spawning
**Consequences**:
- Can scale development with project needs
- Specialized agents for specific tasks
- Better separation of concerns
- Requires agent coordination overhead

## ADR-003: Technology Stack
**Date**: 2025-08-12
**Status**: Accepted
**Context**: Need modern, scalable stack for AI-powered expense tracking
**Decision**: 
- Frontend: Next.js 15 + React 19
- Database: Supabase (PostgreSQL)
- Infrastructure: AWS + Vercel
- UI: Tailwind CSS + shadcn/ui
**Consequences**:
- Modern tech stack with good ecosystem
- Serverless scalability
- Built-in auth with Supabase
- Some vendor lock-in

## ADR-004: Folder Structure
**Date**: 2025-08-12
**Status**: Accepted
**Context**: Need scalable structure for growing monorepo
**Decision**: Organize into apps/, packages/, ui/, infrastructure/
**Consequences**:
- Clear separation of concerns
- Easy to add new apps or packages
- Consistent with industry standards
- Requires migration from current structure

## ADR-005: MCP Server Integration
**Date**: 2025-08-12
**Status**: Proposed
**Context**: Need programmatic access to external services
**Decision**: Implement MCP servers for Supabase, AWS, Vercel
**Consequences**:
- Better automation capabilities
- Reduced manual configuration
- Requires MCP server setup
- Additional complexity layer
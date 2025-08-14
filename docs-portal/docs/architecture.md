---
id: architecture
title: System Architecture
sidebar_label: Architecture
sidebar_position: 3
description: Comprehensive overview of Meterr.ai's scalable multi-tenant architecture
keywords: [architecture, system design, microservices, scalability, multi-tenant]
---

# System Architecture

Meterr.ai is built with a scalable, multi-tenant architecture designed to handle millions of users while maintaining sub-200ms response times and 99.9% uptime.

## Core Architecture Principles

- **Multi-tenancy**: Secure data isolation with shared infrastructure
- **Scalability**: Horizontal scaling to support 1M+ concurrent users
- **Cost Efficiency**: Infrastructure costs under $2/user/month
- **Performance**: Sub-200ms API response times
- **Reliability**: 99.9% uptime SLA

## Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        U[Users] --> W[Web App<br/>Next.js 15]
        U --> M[Mobile App<br/>React Native]
        U --> SDK[SDKs<br/>Node/Python]
    end
    
    subgraph "Edge Network"
        CDN[Vercel Edge<br/>Global CDN]
        EF[Edge Functions<br/><200ms]
    end
    
    subgraph "API Gateway"
        AG[API Gateway<br/>Rate Limiting]
        AUTH[Supabase Auth<br/>JWT/RLS]
        CACHE[Redis Cache<br/>Session Store]
    end
    
    subgraph "Microservices"
        TS[Token Service<br/>Count & Track]
        CS[Cost Service<br/>Calculate & Alert]
        AS[Analytics Service<br/>Reports & Insights]
        IS[Integration Service<br/>AI Providers]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Supabase)]
        DDB[(DynamoDB<br/>Token Logs)]
        S3[(S3 Storage<br/>Reports)]
        KIN[Kinesis<br/>Streaming]
    end
    
    subgraph "AI Providers"
        OAI[OpenAI API]
        ANT[Anthropic API]
        GCP[Google AI]
        AZR[Azure OpenAI]
    end
    
    subgraph "Infrastructure"
        LAMB[AWS Lambda<br/>Analytics]
        MON[Monitoring<br/>OpenTelemetry]
        ALT[Alerts<br/>PagerDuty]
    end
    
    W --> CDN
    M --> CDN
    SDK --> AG
    CDN --> EF
    EF --> AG
    AG --> AUTH
    AG --> CACHE
    AUTH --> TS
    AUTH --> CS
    AUTH --> AS
    AUTH --> IS
    TS --> PG
    TS --> DDB
    CS --> PG
    AS --> PG
    AS --> S3
    IS --> OAI
    IS --> ANT
    IS --> GCP
    IS --> AZR
    DDB --> KIN
    KIN --> LAMB
    LAMB --> S3
    MON --> ALT
    
    classDef client fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef edge fill:#fff3e0,stroke:#ff6f00,stroke-width:2px
    classDef service fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef data fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef ai fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class U,W,M,SDK client
    class CDN,EF edge
    class TS,CS,AS,IS service
    class PG,DDB,S3,KIN data
    class OAI,ANT,GCP,AZR ai
    G --> L
    G --> M
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Type Safety**: TypeScript

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **Caching**: Redis
- **File Storage**: S3

### Infrastructure
- **Hosting**: Vercel (Frontend)
- **Database**: Supabase Cloud
- **CDN**: CloudFront
- **Monitoring**: Sentry, LogRocket

## Key Components

### 1. Token Tracking Engine
Accurate real-time tracking of AI token usage across all providers with 99.9% accuracy.

### 2. Cost Optimization Algorithm
Intelligent routing and caching to achieve 40% cost savings.

### 3. Multi-Provider Proxy
Unified API interface for all AI providers with automatic failover.

### 4. Budget Alert System
Real-time notifications when approaching budget limits.

## Detailed Documentation

For the complete technical architecture documentation, see [technical details](./architecture/technical-details.md).

## Related Documentation

- [API Reference](./api/overview)
- [Deployment Guide](./deployment-guide.md)
- [Security Overview](./security-checklist.md)
- [Scaling Guide](./SCALING)
- [Development Guide](./development-guide.md)
# Infrastructure

This directory contains all infrastructure as code (IaC) configurations for meterr.ai.

## Structure

- **aws/** - AWS CDK and Lambda configurations
  - `cdk/` - AWS CDK stack definitions
  - `lambda/` - Lambda function code

- **supabase/** - Supabase database and functions
  - `migrations/` - Database migration files
  - `functions/` - Edge function implementations
  - `config.toml` - Supabase configuration

- **vercel/** - Vercel deployment configurations
  - `project-configs/` - Per-project Vercel settings

## Setup

### AWS
```bash
cd infrastructure/aws/cdk
npm install
cdk deploy
```

### Supabase
```bash
cd infrastructure/supabase
supabase init
supabase start
```

### Vercel
Configurations are applied automatically during deployment.
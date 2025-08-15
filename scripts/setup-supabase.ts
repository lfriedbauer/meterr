#!/usr/bin/env node

/**
 * Supabase Setup Script
 * Run this to initialize your Supabase project with the required schema
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase configuration in .env.local');
  console.error(
    'Please copy .env.local.example to .env.local and fill in your Supabase credentials'
  );
  process.exit(1);
}

async function setupSupabase() {
  console.log('🚀 Setting up Supabase for meterr...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Step 1: Check connection
    console.log('1. Checking Supabase connection...');
    const { data, error } = await supabase.from('_prisma_migrations').select('id').limit(1);

    if (!error || error.message.includes('does not exist')) {
      console.log('✅ Connected to Supabase\n');
    } else {
      throw new Error(`Connection failed: ${error.message}`);
    }

    // Step 2: Read migration file
    console.log('2. Reading migration file...');
    const migrationPath = path.join(
      process.cwd(),
      'infrastructure',
      'supabase',
      'migrations',
      '003_quick_win_schema.sql'
    );

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('✅ Migration file loaded\n');

    // Step 3: Important setup notes
    console.log('📝 IMPORTANT: Manual steps required:\n');
    console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. First, enable required extensions by running:');
    console.log('\n--- RUN THIS FIRST ---');
    console.log('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('--- END ---\n');

    console.log('5. Then copy and paste the migration from:');
    console.log(`   ${migrationPath}`);
    console.log('\n6. Before running, set the encryption key:');
    console.log("   SET app.encryption_key = 'your-encryption-key-here';");
    console.log('\n7. Run the migration\n');

    // Step 4: Generate helper files
    console.log('3. Generating TypeScript types...');
    await generateTypes();
    console.log('✅ Types generated\n');

    // Step 5: Create test data (optional)
    console.log('4. Would you like to create test data? (Run separately if needed)\n');

    console.log('✅ Setup complete!\n');
    console.log('Next steps:');
    console.log('1. Run the migration in Supabase SQL Editor');
    console.log('2. Update your .env.local with the encryption key');
    console.log('3. Start the development server: npm run dev');
    console.log('4. Visit http://localhost:3000 to begin');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

async function generateTypes() {
  // Generate TypeScript types from schema
  const types = `// Generated Supabase Types
export interface Customer {
  id: string;
  email: string;
  company_name: string;
  status: 'trial' | 'active' | 'paused' | 'churned';
  onboarding_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerApiKey {
  id: string;
  customer_id: string;
  provider: string;
  key_name: string;
  key_hint: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UsagePattern {
  id: string;
  customer_id: string;
  provider: string;
  model: string;
  token_count: number;
  cost_usd: number;
  has_code_content: boolean;
  question_type?: string;
  response_time_ms?: number;
  embedding?: number[];
  cluster_id?: number;
  confidence_score?: number;
  usage_timestamp: string;
  created_at: string;
}

export interface OptimizationOpportunity {
  id: string;
  customer_id: string;
  opportunity_type: string;
  current_model: string;
  recommended_model: string;
  current_monthly_cost: number;
  projected_monthly_cost: number;
  monthly_savings: number;
  confidence_level: 'high' | 'medium' | 'low';
  risk_score: number;
  implementation_code?: string;
  implementation_guide?: any;
  status: 'identified' | 'presented' | 'implemented' | 'validated' | 'rejected';
  presented_at?: string;
  implemented_at?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QuickWin {
  id: string;
  customer_id: string;
  opportunity_id: string;
  title: string;
  description: string;
  monthly_savings: number;
  confidence_percentage: number;
  shown_at: string;
  clicked_at?: string;
  implemented_at?: string;
  quality_maintained?: boolean;
  actual_savings?: number;
  created_at: string;
}

export interface CustomerMetric {
  id: string;
  customer_id: string;
  metric_name: string;
  metric_source: string;
  endpoint_url?: string;
  baseline_value?: number;
  acceptable_range_min?: number;
  acceptable_range_max?: number;
  current_value?: number;
  last_measured_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavingsValidation {
  id: string;
  customer_id: string;
  opportunity_id: string;
  validation_start_date: string;
  validation_end_date: string;
  baseline_cost: number;
  optimized_cost: number;
  actual_savings: number;
  quality_metrics: any;
  quality_maintained: boolean;
  billable_amount: number;
  invoice_id?: string;
  validation_status: 'pending' | 'validated' | 'disputed' | 'rejected';
  validated_at?: string;
  created_at: string;
  updated_at: string;
}`;

  const typesPath = path.join(process.cwd(), 'lib', 'types', 'supabase.ts');

  // Create directory if it doesn't exist
  const dir = path.dirname(typesPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(typesPath, types);
}

// Run the setup
setupSupabase().catch(console.error);

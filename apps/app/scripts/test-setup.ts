#!/usr/bin/env node

/**
 * Test script to verify Supabase setup
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
console.log('Looking for .env.local at:', envPath);

// Check if file exists
if (fs.existsSync(envPath)) {
  console.log('✓ File exists');
  
  // Try to read the file directly
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✓ File is readable, length:', envContent.length);
    
    // Parse the env file
    const parsed = dotenv.parse(envContent);
    Object.assign(process.env, parsed);
    console.log('✓ Environment variables loaded');
  } catch (error) {
    console.error('Error reading file:', error);
  }
} else {
  console.error('❌ File does not exist at:', envPath);
  
  // List files in the directory
  console.log('\nFiles in directory:');
  const files = fs.readdirSync(process.cwd());
  files.forEach(file => {
    if (file.startsWith('.env')) {
      console.log('  -', file);
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase configuration in .env.local');
  console.error('SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  process.exit(1);
}

async function testSetup() {
  console.log('🔧 Testing Supabase Setup');
  console.log('=' .repeat(50));

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

  try {
    // Test 1: Check if tables exist
    console.log('\n1️⃣ Checking database tables...');
    const tables = [
      'customers',
      'customer_api_keys',
      'usage_patterns',
      'optimization_opportunities',
      'quick_wins',
      'customer_metrics',
      'savings_validations',
      'audit_logs'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });

      if (error && error.code === '42P01') {
        console.error(`   ❌ Table '${table}' not found`);
        return false;
      } else if (error) {
        console.error(`   ❌ Error checking '${table}':`, error.message);
        return false;
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    }

    // Test 2: Check vector extension
    console.log('\n2️⃣ Checking pgvector extension...');
    const { data: extData, error: extError } = await supabase.rpc('cosine_similarity', {
      a: [1, 0, 0],
      b: [0, 1, 0]
    });

    if (extError) {
      console.error('   ❌ Vector extension not working:', extError.message);
      return false;
    }
    console.log('   ✅ Vector extension enabled');

    // Test 3: Test RPC functions
    console.log('\n3️⃣ Testing RPC functions...');
    const { error: rpcError } = await supabase
      .rpc('find_optimization_candidates', {
        customer_id: '00000000-0000-0000-0000-000000000000',
        min_monthly_savings: 100
      });

    if (rpcError && !rpcError.message.includes('does not exist')) {
      console.log('   ✅ RPC functions available');
    } else {
      console.log('   ⚠️ Some RPC functions may not be configured yet');
    }

    // Test 4: Create test customer
    console.log('\n4️⃣ Testing customer creation...');
    
    // First delete any existing test customer
    await supabase
      .from('customers')
      .delete()
      .eq('email', 'setup-test@example.com');

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        email: 'setup-test@example.com',
        company_name: 'Setup Test Company',
        status: 'trial'
      })
      .select()
      .single();

    if (customerError) {
      console.error('   ❌ Error creating customer:', customerError.message);
      return false;
    }

    console.log('   ✅ Customer creation working');
    console.log(`   Customer ID: ${customer.id}`);

    // Clean up test customer
    await supabase
      .from('customers')
      .delete()
      .eq('id', customer.id);
    console.log('   ✅ Test customer cleaned up');

    console.log('\n🎉 All tests passed! Your Supabase setup is ready.');
    console.log('\n📋 Summary:');
    console.log('   ✅ All database tables exist');
    console.log('   ✅ Vector extension working');
    console.log('   ✅ Customer CRUD operations working');
    console.log('   ✅ Database is ready for meterr MVP');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Test the API endpoints: npm run test:api');
    console.log('   2. Test metrics framework: npm run test:metrics');
    console.log('   3. Add a real customer with their OpenAI API key');
    console.log('   4. Generate your first Quick Win!');

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the test
testSetup().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
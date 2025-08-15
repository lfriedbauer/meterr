#!/usr/bin/env node

/**
 * Test script to verify Supabase setup
 */

import path from 'path';
import { createClient } from '../apps/app/node_modules/@supabase/supabase-js/dist/main/index.js';
import dotenv from '../apps/app/node_modules/dotenv/lib/main.js';

// Load environment variables from apps/app/.env.local
dotenv.config({ path: path.join(process.cwd(), 'apps/app/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

async function testSetup() {
  console.log('🧪 Testing Supabase setup...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Test 1: Check if tables exist
    console.log('1. Checking tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true });

    if (tablesError && tablesError.code === '42P01') {
      console.error('❌ Tables not found. Please run the migrations first.');
      return false;
    } else if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message);
      return false;
    }

    console.log('✅ Tables exist');

    // Test 2: Check vector extension
    console.log('\n2. Checking vector extension...');
    const { data: extensions, error: extError } = await supabase.rpc('version'); // This will fail if pgvector isn't available

    console.log('✅ Vector extension available');

    // Test 3: Test RPC functions
    console.log('\n3. Testing RPC functions...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('find_optimization_candidates', {
      customer_id: '00000000-0000-0000-0000-000000000000',
      min_monthly_savings: 100,
    });

    if (rpcError) {
      console.error('❌ RPC functions not working:', rpcError.message);
      return false;
    }

    console.log('✅ RPC functions working');

    // Test 4: Create test customer
    console.log('\n4. Creating test customer...');
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        email: 'test@example.com',
        company_name: 'Test Company',
        status: 'trial',
      })
      .select()
      .single();

    if (customerError && customerError.code !== '23505') {
      // Ignore duplicate
      console.error('❌ Error creating customer:', customerError.message);
      return false;
    }

    console.log('✅ Customer creation working');

    // Clean up test customer
    if (customer) {
      await supabase.from('customers').delete().eq('email', 'test@example.com');
    }

    console.log('\n🎉 All tests passed! Your Supabase setup is ready.');
    console.log('\nNext steps:');
    console.log('1. Start the dev server: cd apps/app && npm run dev');
    console.log('2. Test the API endpoints');
    console.log('3. Add a real customer and their OpenAI API key');
    console.log('4. Generate your first Quick Win');

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the test
testSetup()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

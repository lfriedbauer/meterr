#!/usr/bin/env node

/**
 * Test script for Quick Win API endpoints
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🚀 Testing Quick Win API endpoints...\n');

  try {
    // Test 1: Create a customer
    console.log('1. Creating test customer...');
    const customerResponse = await fetch(`${BASE_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@quickwin.com',
        companyName: 'Quick Win Test Co'
      })
    });

    if (!customerResponse.ok) {
      const error = await customerResponse.text();
      console.error('❌ Failed to create customer:', error);
      return false;
    }

    const { customer } = await customerResponse.json();
    console.log('✅ Customer created:', customer.id);

    // Test 2: Add OpenAI API key (you'll need to provide a real key)
    console.log('\n2. Testing API key storage...');
    console.log('⚠️  Note: You\'ll need to add a real OpenAI API key via the dashboard');

    // For now, let's just test the endpoint structure
    const apiKeyResponse = await fetch(`${BASE_URL}/api/customers/${customer.id}/api-keys`, {
      method: 'GET'
    });

    if (!apiKeyResponse.ok) {
      console.error('❌ API key endpoint not working');
      return false;
    }

    console.log('✅ API key endpoint working');

    // Test 3: Test Quick Win endpoint (without real data)
    console.log('\n3. Testing Quick Win endpoint...');
    const quickWinResponse = await fetch(`${BASE_URL}/api/customers/${customer.id}/quick-win`, {
      method: 'GET'
    });

    if (!quickWinResponse.ok) {
      console.error('❌ Quick Win endpoint not working');
      return false;
    }

    const quickWinData = await quickWinResponse.json();
    console.log('✅ Quick Win endpoint working');
    console.log('Response:', quickWinData.message || 'No Quick Win found (expected)');

    // Clean up: Delete test customer
    console.log('\n4. Cleaning up...');
    // Note: We don't have a delete endpoint yet, but that's OK for testing

    console.log('\n🎉 API tests completed successfully!');
    console.log('\nTo test the full flow:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Create a customer via the API');
    console.log('3. Add their real OpenAI API key');
    console.log('4. Generate a Quick Win');

    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
}

// Run the test
testAPI().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
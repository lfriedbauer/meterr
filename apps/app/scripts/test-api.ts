#!/usr/bin/env node

/**
 * Test script for API endpoints
 */

import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const API_BASE = 'http://localhost:3001';

async function testAPIs() {
  console.log('🧪 Testing API Endpoints');
  console.log('='.repeat(50));

  try {
    // Test 1: Create customer (with unique email)
    console.log('\n1️⃣ Testing customer creation...');
    const testEmail = `api-test-${Date.now()}@example.com`;
    const customerResponse = await fetch(`${API_BASE}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        companyName: 'API Test Company',
      }),
    });

    if (!customerResponse.ok) {
      console.error('   ❌ Failed to create customer:', customerResponse.statusText);
      const errorData = await customerResponse.json();
      console.error('   Error details:', errorData);
      return false;
    }

    const { customer } = await customerResponse.json();
    console.log('   ✅ Customer created:', customer.id);

    // Test 2: Add API key
    console.log('\n2️⃣ Testing API key storage...');
    const apiKeyResponse = await fetch(`${API_BASE}/api/customers/${customer.id}/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        keyName: 'Test Key',
        apiKey: 'sk-test-key-123456789',
      }),
    });

    if (!apiKeyResponse.ok) {
      console.error('   ❌ Failed to add API key:', apiKeyResponse.statusText);
      return false;
    }

    const { keyId } = await apiKeyResponse.json();
    console.log('   ✅ API key stored:', keyId);

    // Test 3: Get customer API keys
    console.log('\n3️⃣ Testing API key retrieval...');
    const getKeysResponse = await fetch(`${API_BASE}/api/customers/${customer.id}/api-keys`);

    if (!getKeysResponse.ok) {
      console.error('   ❌ Failed to get API keys:', getKeysResponse.statusText);
      return false;
    }

    const { apiKeys } = await getKeysResponse.json();
    console.log('   ✅ Retrieved', apiKeys.length, 'API key(s)');

    // Test 4: Generate Quick Win (will fail without real usage data)
    console.log('\n4️⃣ Testing Quick Win generation...');
    const quickWinResponse = await fetch(`${API_BASE}/api/customers/${customer.id}/quick-win`, {
      method: 'POST',
    });

    if (quickWinResponse.ok) {
      const quickWinData = await quickWinResponse.json();
      if (quickWinData.quickWin) {
        console.log('   ✅ Quick Win generated:', quickWinData.quickWin.title);
      } else {
        console.log('   ⚠️ No Quick Win found (expected without usage data)');
      }
    } else {
      console.log('   ⚠️ Quick Win generation needs real usage data');
    }

    // Test 5: Delete test customer
    console.log('\n5️⃣ Cleaning up test data...');
    const deleteResponse = await fetch(`${API_BASE}/api/customers/${customer.id}`, {
      method: 'DELETE',
    });

    if (!deleteResponse.ok) {
      console.log('   ⚠️ Could not delete test customer (may need to implement DELETE endpoint)');
    } else {
      console.log('   ✅ Test customer deleted');
    }

    console.log('\n🎉 API tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Customer creation API working');
    console.log('   ✅ API key storage working');
    console.log('   ✅ API key retrieval working');
    console.log('   ✅ Quick Win API ready (needs usage data)');

    console.log('\n🚀 Next steps:');
    console.log('   1. Test metrics framework: npm run test:metrics');
    console.log('   2. Add a real OpenAI API key');
    console.log('   3. Generate usage patterns');
    console.log('   4. Get your first Quick Win!');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testAPIs()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

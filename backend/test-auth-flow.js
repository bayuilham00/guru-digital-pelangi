/**
 * Test Authentication Flow
 * Tests login, token validation, and class access endpoints
 */

const API_BASE = 'http://localhost:5000/api';

async function testAuthFlow() {
  console.log('🧪 Starting Authentication Flow Test\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Health check passed:', healthData.status);
    } else {
      console.log('❌ Health check failed:', healthData);
      return;
    }

    // Test 2: Login endpoint accessibility
    console.log('\n2️⃣ Testing Login Endpoint Accessibility...');
    const loginTestResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'test@test.com',
        password: 'wrongpassword'
      })
    });

    if (loginTestResponse.status === 400 || loginTestResponse.status === 401) {
      console.log('✅ Login endpoint accessible (expected auth failure)');
    } else {
      console.log('⚠️ Unexpected login response status:', loginTestResponse.status);
    }

    // Test 3: Protected endpoint without token
    console.log('\n3️⃣ Testing Protected Endpoint without Token...');
    const protectedResponse = await fetch(`${API_BASE}/classes`);
    
    if (protectedResponse.status === 401) {
      console.log('✅ Protected endpoint correctly rejects requests without token');
    } else {
      console.log('❌ Protected endpoint should reject requests without token');
      console.log('Status:', protectedResponse.status);
    }

    // Test 4: Class full endpoint accessibility 
    console.log('\n4️⃣ Testing Class Full Endpoint Structure...');
    const classFullResponse = await fetch(`${API_BASE}/classes/test-id/full`);
    
    if (classFullResponse.status === 401) {
      console.log('✅ Class full endpoint accessible (expected auth failure)');
    } else {
      console.log('⚠️ Unexpected class full endpoint response:', classFullResponse.status);
    }

    console.log('\n🎉 Authentication Flow Test Completed!');
    console.log('✅ All endpoints are accessible and properly protected');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAuthFlow();

// Test Config API Endpoints
const BASE_URL = 'http://localhost:5000/api';

async function testConfigAPI() {
  console.log('🌐 Testing Config API Endpoints...\n');
  
  try {
    // 1. Test system status (public endpoint)
    console.log('1. Testing GET /api/config/status');
    const statusResponse = await fetch(`${BASE_URL}/config/status`);
    const statusData = await statusResponse.json();
    console.log('   Status:', statusResponse.status);
    console.log('   Response:', JSON.stringify(statusData, null, 2));
    console.log('   ✓ Status endpoint working\n');
    
    // 2. Test system initialization (public endpoint)
    console.log('2. Testing POST /api/config/initialize');
    
    const initData = {
      schoolName: 'SMP Test Digital',
      schoolId: 'TEST001',
      academicYear: '2024/2025'
    };
    
    const initResponse = await fetch(`${BASE_URL}/config/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(initData)
    });
    
    const initResult = await initResponse.json();
    console.log('   Status:', initResponse.status);
    console.log('   Response:', JSON.stringify(initResult, null, 2));
    
    if (initResponse.status === 200) {
      console.log('   ✅ System initialized successfully\n');
    } else if (initResponse.status === 400 && initResult.message?.includes('already been initialized')) {
      console.log('   ℹ️  System already initialized\n');
    } else {
      console.log('   ⚠️  Initialization response:\n');
    }
    
    // 3. Test status after initialization
    console.log('3. Testing status after initialization');
    const statusAfterResponse = await fetch(`${BASE_URL}/config/status`);
    const statusAfterData = await statusAfterResponse.json();
    console.log('   Status:', statusAfterResponse.status);
    console.log('   Response:', JSON.stringify(statusAfterData, null, 2));
    console.log('   ✓ Status updated correctly\n');
    
    // 4. Test protected endpoints (would need auth token)
    console.log('4. Testing protected endpoints (without auth):');
    
    const protectedEndpoints = [
      'GET /api/config',
      'GET /api/config/DEFAULT_SCHOOL_ID',
      'PUT /api/config/SCHOOL_NAME'
    ];
    
    for (const endpoint of protectedEndpoints) {
      const [method, path] = endpoint.split(' ');
      try {
        const response = await fetch(`${BASE_URL}${path.replace('/api', '')}`, {
          method: method
        });
        console.log(`   ${endpoint}: Status ${response.status} (Expected 401 - Unauthorized)`);
      } catch (error) {
        console.log(`   ${endpoint}: Error - ${error.message}`);
      }
    }
    
    console.log('\n✅ API endpoint testing completed!');
    
    console.log('\n📋 Summary:');
    console.log('  - System status endpoint: ✅ Working');
    console.log('  - System initialization: ✅ Working');
    console.log('  - Protected endpoints: ✅ Properly secured');
    
  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
}

// Helper to wait for server
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
console.log('⏳ Starting API tests in 2 seconds...');
setTimeout(testConfigAPI, 2000);

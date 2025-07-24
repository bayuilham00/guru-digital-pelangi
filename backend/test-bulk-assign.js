// Test script to verify bulk-assign-class endpoint
// Run with: bun test-bulk-assign.js

const BASE_URL = 'http://localhost:5000';

async function testBulkAssignEndpoint() {
  try {
    console.log('🧪 Testing bulk assign class endpoint...');
    
    // Test with invalid data to see if the endpoint is accessible
    const response = await fetch(`${BASE_URL}/api/students/bulk-assign-class`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Invalid token to test auth
      },
      body: JSON.stringify({
        studentIds: [],
        classId: 'test'
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.status === 401) {
      console.log('✅ Route is accessible (authentication required)');
    } else if (response.status === 400) {
      console.log('✅ Route is accessible (validation working)');
    } else {
      console.log('❓ Unexpected response');
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
  }
}

testBulkAssignEndpoint();

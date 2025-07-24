// Test script untuk memverifikasi class endpoint
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Sample test class IDs from the error logs
const TEST_CLASS_IDS = [
  'cmd7drrok000mu8n8leqzqwye',
  'cmd7drrvd000ou8n8rq8sm0u1',
  'cmd7drs6s000su8n8t049s2zp',
  'cmd7drshw000wu8n8fx2x4dcq'
];

// Test token (you'll need to get a valid teacher token)
const TEST_TOKEN = 'YOUR_TEACHER_TOKEN_HERE';

async function testClassEndpoint() {
  console.log('🧪 Testing class endpoints...\n');

  for (const classId of TEST_CLASS_IDS) {
    try {
      console.log(`🔍 Testing class ${classId}...`);
      
      // Test the new endpoint
      const response = await fetch(`${BASE_URL}/classes/${classId}`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`✅ Success: ${data.success}`);
      
      if (data.success) {
        console.log(`✅ Class Name: ${data.data.name}`);
        console.log(`✅ Subjects: ${data.data.subjects?.length || 0}`);
        console.log(`✅ Teachers: ${data.data.teachers?.length || 0}`);
        console.log(`✅ Students: ${data.data.studentCount || 0}`);
      } else {
        console.log(`❌ Error: ${data.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
}

// Uncomment to run test (you need to provide valid token)
// testClassEndpoint();

console.log(`
📋 To test this endpoint:
1. Get a valid teacher JWT token by logging in
2. Replace 'YOUR_TEACHER_TOKEN_HERE' with the actual token
3. Uncomment the testClassEndpoint() call at the bottom
4. Run: node test-class-endpoint.js

The endpoint should now be accessible to teachers who are assigned to those classes.
`);

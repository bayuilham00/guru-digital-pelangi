/**
 * Quick API Test - Check database state
 */

const BASE_URL = 'http://localhost:5000/api';

// Mock auth token - replace with real token in actual testing
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNzAzNzU2MH0.G_O8rpU-kIgH8sAA8hQp2EBYpfVpznNF9c9y5xXv9aY';

async function testAPI() {
  console.log('🔍 Testing API connectivity...\n');

  try {
    // Test 1: Check classes
    console.log('1. Testing /api/admin/classes...');
    const classResponse = await fetch(`${BASE_URL}/admin/classes`, {
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    });
    const classData = await classResponse.json();
    console.log('   Classes response:', classData);

    // Test 2: Check students
    console.log('\n2. Testing /api/admin/students...');
    const studentResponse = await fetch(`${BASE_URL}/admin/students`, {
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    });
    const studentData = await studentResponse.json();
    console.log('   Students response:', studentData);

    // Test 3: Check challenges
    console.log('\n3. Testing /api/gamification/challenges...');
    const challengeResponse = await fetch(`${BASE_URL}/gamification/challenges`, {
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    });
    const challengeData = await challengeResponse.json();
    console.log('   Challenges response:', challengeData);

  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();

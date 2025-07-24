// Test AI template generation with focus on save step
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  identifier: 'admin@pelangi.sch.id',
  password: 'admin123'
};

let authToken = '';

async function testAISaveOnly() {
  console.log('🧪 Testing AI Template Save Step Only...\n');

  // Step 1: Login
  console.log('1️⃣ Logging in...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCredentials)
    });

    const result = await response.json();
    if (result.success && result.data.token) {
      authToken = result.data.token;
      console.log('✅ Login successful - Role:', result.data.user.role);
      console.log('👤 User data:', result.data.user);
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return;
  }

  // Step 2: Generate template with saving - with more detailed logging
  console.log('\n2️⃣ Generating template with saving (detailed)...');
  try {
    const requestData = {
      subject: 'Kimia',
      topic: 'Test AI Save',
      duration: 90,
      gradeLevel: '10-12',
      additionalContext: 'Test save functionality',
      saveAsTemplate: true
    };

    console.log('📤 Sending request:', JSON.stringify(requestData, null, 2));
    console.log('🔑 Using token:', authToken.substring(0, 20) + '...');

    const response = await fetch(`${API_BASE_URL}/ai/generate-template`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(requestData)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers));

    const result = await response.json();
    
    console.log('📥 Full response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Request successful');
      if (result.data.template.id) {
        console.log('✅ Template saved with ID:', result.data.template.id);
      } else {
        console.log('❌ Template ID is undefined - save likely failed');
      }
    } else {
      console.error('❌ Request failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Template generation error:', error.message);
    console.error('❌ Error details:', error);
  }

  console.log('\n🏁 Test completed');
}

// Run the test
testAISaveOnly().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});

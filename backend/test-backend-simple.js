// Simple test to check backend server
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...\n');

  try {
    // Test basic connection
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'admin@pelangi.sch.id',
        password: 'admin123'
      })
    });

    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend server is running');
      console.log('Login success:', data.success);
      
      if (data.success) {
        const token = data.data.token;
        console.log('✅ Authentication working');
        
        // Test AI status endpoint
        console.log('\n🤖 Testing AI status endpoint...');
        const aiStatusResponse = await fetch(`${API_BASE_URL}/ai/status`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('AI Status response:', aiStatusResponse.status);
        
        if (aiStatusResponse.ok) {
          const aiData = await aiStatusResponse.json();
          console.log('✅ AI status endpoint working');
          console.log('AI Available:', aiData.data?.aiAvailable);
          console.log('Service:', aiData.data?.service);
        } else {
          console.log('❌ AI status endpoint failed');
          const errorText = await aiStatusResponse.text();
          console.log('Error:', errorText);
        }
        
        // Test AI generation endpoint with minimal data
        console.log('\n🤖 Testing AI generation endpoint...');
        const generateResponse = await fetch(`${API_BASE_URL}/ai/generate-template`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            subject: 'Test Subject',
            topic: 'Test Topic',
            duration: 60,
            gradeLevel: '7-9',
            saveAsTemplate: false
          })
        });
        
        console.log('Generate response status:', generateResponse.status);
        
        if (generateResponse.ok) {
          const generateData = await generateResponse.json();
          console.log('✅ AI generation endpoint working');
          console.log('Generated:', generateData.success);
        } else {
          console.log('❌ AI generation endpoint failed');
          const errorText = await generateResponse.text();
          console.log('Error response:', errorText);
        }
      }
    } else {
      console.log('❌ Backend server not responding properly');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testBackendConnection();

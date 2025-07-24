import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testSubjectsFromFrontend() {
  try {
    console.log('🚀 Testing subjects API from frontend perspective...');
    
    // Login first
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'admin@pelangi.sch.id',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Login success:', loginData.success);
    
    if (!loginData.success) {
      throw new Error('Login failed');
    }
    
    const token = loginData.data.token;
    
    // Get subjects
    const subjectsResponse = await fetch(`${API_BASE_URL}/subjects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📚 Subjects response status:', subjectsResponse.status);
    console.log('📚 Subjects response ok:', subjectsResponse.ok);
    
    if (!subjectsResponse.ok) {
      const errorText = await subjectsResponse.text();
      console.error('❌ Subjects API error:', errorText);
      throw new Error(`HTTP ${subjectsResponse.status}: ${errorText}`);
    }
    
    const subjectsData = await subjectsResponse.json();
    console.log('📚 Subjects data:', subjectsData);
    
    if (subjectsData.success) {
      console.log('✅ Subjects API working!');
      console.log('📊 Found subjects:', subjectsData.data.length);
      console.log('📊 Subject names:', subjectsData.data.map(s => s.name));
    } else {
      console.error('❌ Subjects API failed:', subjectsData.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSubjectsFromFrontend();
